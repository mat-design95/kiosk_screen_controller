import { BrowserWindow } from 'electron';
import { StorageService } from './storage';
import { DisplayManagerService } from './displayManager';

const activeWindows: Record<string, BrowserWindow> = {};

export const WindowManagerService = {
  startKioskWindow(displayId: string) {
    if (activeWindows[displayId]) {
      return; // Already running
    }

    const displays = DisplayManagerService.getSystemDisplays();
    const systemDisplay = displays.find(d => d.id === displayId);
    if (!systemDisplay) return;

    const config = StorageService.getStore().displays[displayId];
    if (!config || !config.url) return;

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

    kioskWindow.loadURL(config.url).catch(err => {
      console.error(`Failed to load URL on display ${displayId}:`, err);
    });

    kioskWindow.on('closed', () => {
      delete activeWindows[displayId];
    });

    activeWindows[displayId] = kioskWindow;
  },

  stopKioskWindow(displayId: string) {
    if (activeWindows[displayId]) {
      activeWindows[displayId].close();
      delete activeWindows[displayId];
    }
  },

  stopAllWindows() {
    Object.keys(activeWindows).forEach(id => {
      this.stopKioskWindow(id);
    });
  }
};
