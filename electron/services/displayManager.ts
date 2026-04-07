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
  }
};
