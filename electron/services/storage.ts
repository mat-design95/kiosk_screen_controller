import Store from 'electron-store';
import { AppStore } from '../../shared/models';

const defaultStore: AppStore = {
  globalSettings: {
    launchAtStartup: true,
    restoreLastSession: true,
    hideCursor: false,
    disableRightClick: false,
    runInBackground: true,
  },
  nightModeSettings: {
    enabled: false,
    startTime: '18:00',
    endTime: '06:00',
    logoAssetPath: null,
    backgroundMode: 'black',
    unifiedDisplay: true,
  },
  displays: {}
};

export const store = new Store<AppStore>({
  defaults: defaultStore,
  name: 'kiosk-config'
});

export const StorageService = {
  getStore: (): AppStore => {
    return store.store;
  },
  
  updateGlobalSettings: (settings: Partial<AppStore['globalSettings']>) => {
    store.set('globalSettings', { ...store.get('globalSettings'), ...settings });
  },

  updateNightModeSettings: (settings: Partial<AppStore['nightModeSettings']>) => {
    store.set('nightModeSettings', { ...store.get('nightModeSettings'), ...settings });
  },

  updateDisplayConfig: (id: string, config: Partial<AppStore['displays'][string]>) => {
    const displays = store.get('displays');
    store.set('displays', {
      ...displays,
      [id]: {
        ...(displays[id] || {}),
        ...config,
        id
      }
    });
  },

  removeDisplayConfig: (id: string) => {
    const displays = store.get('displays');
    delete displays[id];
    store.set('displays', displays);
  }
};
