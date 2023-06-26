/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  desktopCapturer,
  globalShortcut,
  shell,
  ipcMain,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import mixpanel from 'mixpanel-browser';
import expressionKeys from './config/expressions';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import TrayGenerator from './tray';
import { installCamera } from './config/installCameraDriver';

const firstRun = require('electron-first-run');

// TODO: Figure out how to inject env var to main.ts
mixpanel.init('7496dc17d1cd129e3a188c607f4421cf', { ip: false });

// Install camera driver upon initial opening
if (firstRun()) {
  installCamera();
}

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let permittedToQuit = false;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}
const protocol = 'hologram';
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(protocol, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(protocol);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 960,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
      webSecurity: false,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.setMinimizable(false);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('show', () => {
    // Track start of session (https://mixpanel.com/blog/community-tip-session-length-tracking/)
    mixpanel.time_event('app_session');
  });

  mainWindow.on('close', (e) => {
    mixpanel.time_event('app_session'); // Track end of session
    if (!permittedToQuit) {
      // Hide window by default
      e.preventDefault();
      mainWindow.hide();
    } else {
      // Quit app only upon explicit user request
      mainWindow = null;
      app.quit();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  ipcMain.on('get-sources', async (event, args) => {
    try {
      if (mainWindow) {
        const sources = await desktopCapturer.getSources({ types: args.types });
        if (args.types[0] === 'window') {
          mainWindow?.webContents.send('window-sources', sources);
        } else if (args.types[0] === 'screen') {
          mainWindow.webContents.send('screen-sources', sources);
        }

        event.returnValue = sources;
      }
    } catch (e) {
      console.error(e);
    }
  });

  ipcMain.on('map-expressions', async (event, exps) => {
    const expsArr = JSON.parse(exps);
    for (let i = 0; i < expsArr.length; i++) {
      const accelerator = `Alt+${expressionKeys[i]}`;
      const callback = () => {
        mainWindow?.webContents.send('activate-expressions', {
          expressionIndex: i,
        });
      };
      globalShortcut.register(accelerator, callback);
    }
  });

  ipcMain.on('quit', () => {
    permittedToQuit = true;
    mainWindow.destroy();
    mainWindow = null;
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

// Handle auth deeplink for Mac
app.on('open-url', (event, url) => {
  const content = url.replace(`${protocol}://`, '').split('?');
  const encryptedToken = content[0];
  const params = new URLSearchParams(`?${content[1]}`);
  mainWindow?.webContents.send('auth', {
    addr: params.get('addr'),
    provider: params.get('provider'),
    token: encryptedToken,
  });
});

app.on('before-quit', () => {
  mainWindow.removeAllListeners('close');
  mainWindow.close();
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }

    // Handle auth deeplink for Windows
    if (process.platform === 'win32') {
      const deeplinkingUrl = argv.find((arg) => arg.startsWith('hologram://'));
      if (deeplinkingUrl) {
        const content = deeplinkingUrl.replace(`${protocol}://`, '').split('?');
        const encryptedToken = content[0];
        const params = new URLSearchParams(`?${content[1]}`);
        mainWindow?.webContents.send('auth', {
          addr: params.get('addr'),
          provider: params.get('provider'),
          token: encryptedToken,
        });
      }
    }
  });

  app
    .whenReady()
    .then(async () => {
      await createWindow();
      const Tray = new TrayGenerator(mainWindow);
      Tray.createTray();

      app.on('activate', async () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
          await createWindow();
        } else {
          mainWindow.show();
        }
      });
    })
    .catch(console.log);
}
