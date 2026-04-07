import { app, screen } from 'electron';
import { StorageService } from './storage';

export const DisplayManagerService = {
  getSystemDisplays() {
    if (!app.isReady()) return [];
    
    const displays = screen.getAllDisplays();
    return displays.map((d, index) => ({
      id: d.id.toString(),
      name: `Display ${index + 1} (${d.size.width}x${d.size.height})`,
      bounds: d.bounds
    }));
  },

  syncDisplaysWithStore() {
    const systemDisplays = this.getSystemDisplays();
    const storeDisplays = StorageService.getStore().displays || {};
    
    systemDisplays.forEach(d => {
      if (!storeDisplays[d.id]) {
        StorageService.updateDisplayConfig(d.id, {
          name: d.name,
          url: '',
          refreshIntervalMinutes: null,
          isKiosk: true,
          isFullscreen: true,
          zoomFactor: 1.0,
          reloadOnError: true,
          errorTimeoutSeconds: 30
        });
      }
    });
  },

  identifyDisplays() {
    const displays = this.getSystemDisplays();
    
    displays.forEach((d, i) => {
      const { BrowserWindow } = require('electron'); // Inline require for BrowserWindow to avoid circular deps if any
      const identifyWin = new BrowserWindow({
        x: d.bounds.x,
        y: d.bounds.y,
        width: d.bounds.width,
        height: d.bounds.height,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        hasShadow: false,
        webPreferences: { nodeIntegration: false }
      });
      
      const content = `data:text/html;charset=UTF-8,
        <html>
          <body style="margin:0; overflow:hidden; display:flex; justify-content:center; align-items:center; height:100vh; background-color:rgba(0,0,0,0.85); color:white; font-family:'Inter', sans-serif;">
            <div style="display:flex; flex-direction:column; align-items:center; gap: 20px;">
              <h2 style="margin:0; font-size:40px; font-weight:300; letter-spacing:4px; opacity:0.7;">IDENTIFY</h2>
              <div style="font-size:300px; font-weight:bold; text-shadow: 0 0 40px rgba(0, 122, 204, 0.5);">${i + 1}</div>
              <p style="font-size:24px; opacity:0.5;">${d.name}</p>
            </div>
          </body>
        </html>
      `;
      identifyWin.loadURL(content);
      
      setTimeout(() => {
        if (!identifyWin.isDestroyed()) {
          identifyWin.close();
        }
      }, 4000);
    });
  }
};
