import {
  contextBridge,
  desktopCapturer,
  ipcRenderer,
  IpcRendererEvent,
} from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
          func(...args);
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, subscription);

        return () => ipcRenderer.removeListener(channel, subscription);
      }

      return undefined;
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (_event, ...args) => func(...args));
      }
    },
    async getDesktopSources() {
      await desktopCapturer
        .getSources({
          types: ['window', 'screen'],
        })
        .then((sources) =>
          sources.map((source) => ({
            id: source.id,
            name: source.name,
            appIconUrl: source?.appIcon?.toDataURL(),
            thumbnailUrl: source?.thumbnail
              ?.resize({ height: 160 })
              .toDataURL(),
          }))
        );
    },
  },
});
