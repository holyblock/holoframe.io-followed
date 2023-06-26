import { ipcRenderer, Tray, Menu, nativeImage } from 'electron';

const TRAY_LOGO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAD5SURBVHgBhVOBEYIwEAPPAToCG8gG4gaM4AhuAG7gJrgBMAFsgBuUDeo/5r1KvzV3ubZp+6RpybIdnHON+6BJaSpowZW4EAviRKw0LVWg5w3oVxgHWqoAw6BviDaiGW1zUB2WNa2U8dGbOxFLmuy4JRpwc0bNTFyxtsZ4myxwTou2hsZ2HyD3Sy8XJ8GyA7Z4J45cMM/zp2d3hbbKF3ELI9z0B6wNQ/kPKxlc4KIgDvgCV395GUgenM0Z7Yy9X7utpI7Wh8WZO/RvgR+ENO20PqJVWoGfR4Kx0zR/n4ToJy2PhO96iGg6cM8T3sGCHynQshQQJqNNaYI3DiyGmooVXv4AAAAASUVORK5CYII=';

export default class TrayGenerator {
  private tray: any;

  private mainWindow: any;

  constructor(mainWindow) {
    this.tray = null;
    this.mainWindow = mainWindow;
  }

  getWindowPosition = () => {
    const windowBounds = this.mainWindow.getBounds(); // Window size
    const trayBounds = this.tray.getBounds();
    // Center position of the window
    const x = Math.round(
      trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
    );
    const y = Math.round(trayBounds.y + trayBounds.height);
    return { x, y };
  };

  showWindow = () => {
    const position = { x: 0, y: 0 };
    this.mainWindow.setPosition(position.x, position.y, false);
    this.mainWindow.show();
    this.mainWindow.setVisibleOnAllWorkspaces(true);
    this.mainWindow.focus();
    this.mainWindow.setVisibleOnAllWorkspaces(false);
  };

  toggleWindow = () => {
    this.showWindow();
  };

  rightClickMenu = () => {
    const menu: any = [
      {
        label: 'Open Hologram',
        click: () => {
          this.showWindow();
        },
      },
      {
        role: 'quit',
        label: 'Quit',
        click: () => {
          ipcRenderer.send('quit');
        },
      },
    ];
    this.tray.popUpContextMenu(Menu.buildFromTemplate(menu));
  };

  createTray = () => {
    const icon = nativeImage.createFromDataURL(TRAY_LOGO);
    this.tray = new Tray(icon);
    this.tray.setIgnoreDoubleClickEvents(true);

    this.tray.on('click', this.toggleWindow);
    this.tray.on('right-click', this.rightClickMenu);
  };
}
