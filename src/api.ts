import { AppStore, DisplayConfig } from '../shared/models';

type IPCRenderer = {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, listener: (e: any, ...args: any[]) => void) => () => void;
  off: (channel: string, ...args: any[]) => void;
};

const ipcRenderer = (window as unknown as { ipcRenderer: IPCRenderer }).ipcRenderer;

export const API = {
  getStore: (): Promise<AppStore> => ipcRenderer.invoke('get-store'),
  
  getSystemDisplays: (): Promise<{id: string, name: string, bounds: any}[]> => 
    ipcRenderer.invoke('get-system-displays'),
    
  updateDisplayConfig: (id: string, config: Partial<DisplayConfig>) => 
    ipcRenderer.send('update-display-config', id, config),
    
  updateGlobalSettings: (settings: any) => 
    ipcRenderer.send('update-global-settings', settings),
    
  updateNightModeSettings: (settings: any) => 
    ipcRenderer.send('update-nightmode-settings', settings),
    
  startKiosk: (id: string) => ipcRenderer.send('start-kiosk', id),
  stopKiosk: (id: string) => ipcRenderer.send('stop-kiosk', id),
  
  identifyDisplays: () => ipcRenderer.send('identify-displays'),
};
