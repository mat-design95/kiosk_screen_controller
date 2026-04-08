import { BrowserWindow } from 'electron';
import { StorageService } from './storage';
import { DisplayManagerService } from './displayManager';
import path from 'node:path';

const activeWindows: Record<string, BrowserWindow> = {};
const activeRefreshTimers: Record<string, NodeJS.Timeout> = {};
const watchdogReconnections: Record<string, NodeJS.Timeout> = {};

let globalNightModeActive = false;

export const WindowManagerService = {
  startKioskWindow(displayId: string) {
    if (activeWindows[displayId]) return;

    const displays = DisplayManagerService.getSystemDisplays();
    const systemDisplay = displays.find(d => d.id === displayId);
    if (!systemDisplay) return;

    const config = StorageService.getStore().displays[displayId];
    if (!config || !config.url) return;

    // Track i permanent array
    const tempStore = StorageService.getStore();
    if (!tempStore.activeDisplays?.includes(displayId)) {
      StorageService.updateActiveDisplays([...(tempStore.activeDisplays || []), displayId]);
    }

    const kioskWindow = new BrowserWindow({
      x: systemDisplay.bounds.x,
      y: systemDisplay.bounds.y,
      width: systemDisplay.bounds.width,
      height: systemDisplay.bounds.height,
      kiosk: config.isKiosk,
      fullscreen: config.isFullscreen,
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    activeWindows[displayId] = kioskWindow;

    // Load required visual state
    this.navigateWindow(displayId);

    // Watchdog logic (Network drops / missing routes)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    kioskWindow.webContents.on('did-fail-load', (_evt, errorCode, errorDescription) => {
      if (globalNightModeActive) return; // Do not reload network if we are purposefully looking at a local black frame

      console.error(`Watchdog Error on display ${displayId}: [${errorCode}] ${errorDescription}`);
      if (config.reloadOnError) {
        if (!watchdogReconnections[displayId]) {
          watchdogReconnections[displayId] = setTimeout(() => {
            if (activeWindows[displayId]) kioskWindow.loadURL(config.url);
            delete watchdogReconnections[displayId];
          }, (config.errorTimeoutSeconds || 30) * 1000);
        }
      }
    });

    // Watchdog logic (Crash in Web Contents)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    kioskWindow.webContents.on('render-process-gone', (_evt, details) => {
      console.error(`Crash on display ${displayId}: ${details.reason}`);
      if (config.reloadOnError) {
        kioskWindow.reload();
      }
    });

    // Handle Escape key to forcefully close the display
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    kioskWindow.webContents.on('before-input-event', (_event, input) => {
      if (input.key === 'Escape') {
        this.stopKioskWindow(displayId);
      }
    });

    // Auto-refresh interval
    if (config.refreshIntervalMinutes && config.refreshIntervalMinutes > 0) {
      activeRefreshTimers[displayId] = setInterval(() => {
        if (!globalNightModeActive) {
          kioskWindow.reload();
        }
      }, config.refreshIntervalMinutes * 60 * 1000);
    }

    kioskWindow.on('closed', () => {
      this.cleanupTimers(displayId);
      delete activeWindows[displayId];
    });
  },

  stopKioskWindow(displayId: string) {
    if (activeWindows[displayId]) {
      this.cleanupTimers(displayId);
      activeWindows[displayId].close();
      delete activeWindows[displayId];

      const tempStore = StorageService.getStore();
      if (tempStore.activeDisplays?.includes(displayId)) {
        StorageService.updateActiveDisplays(tempStore.activeDisplays.filter(id => id !== displayId));
      }
    }
  },

  stopAllWindows() {
    Object.keys(activeWindows).forEach(id => {
      this.stopKioskWindow(id);
    });
  },

  restoreSession() {
    const store = StorageService.getStore();
    if (store.globalSettings.restoreLastSession && store.activeDisplays) {
      store.activeDisplays.forEach(id => this.startKioskWindow(id));
    }
  },

  cleanupTimers(displayId: string) {
    if (activeRefreshTimers[displayId]) {
      clearInterval(activeRefreshTimers[displayId]);
      delete activeRefreshTimers[displayId];
    }
    if (watchdogReconnections[displayId]) {
      clearTimeout(watchdogReconnections[displayId]);
      delete watchdogReconnections[displayId];
    }
  },

  setNightModeForAll(isNight: boolean) {
    globalNightModeActive = isNight;
    Object.keys(activeWindows).forEach(id => {
      this.navigateWindow(id);
    });
  },

  navigateWindow(displayId: string) {
    const win = activeWindows[displayId];
    if (!win) return;

    if (globalNightModeActive) {
      const store = StorageService.getStore();
      const logoParam = store.nightModeSettings.logoAssetPath || 'Mat_design_logo.png';
      const bgHex = store.nightModeSettings.backgroundMode === 'black' ? '000000' : '1e1e1e';

      const devUrl = process.env['VITE_DEV_SERVER_URL'];
      if (devUrl) {
        win.loadURL(`${devUrl}/nightmode.html?logo=${logoParam}&bg=${bgHex}`);
      } else {
        const publicPath = process.env.VITE_PUBLIC || path.join(__dirname, '../public');
        win.loadFile(path.join(publicPath, 'nightmode.html'), { query: { logo: logoParam, bg: bgHex } });
      }
    } else {
      const config = StorageService.getStore().displays[displayId];
      if (config && config.url) {
        win.loadURL(config.url).catch(() => { });
      }
    }
  }
};
