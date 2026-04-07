export interface GlobalSettings {
  launchAtStartup: boolean;
  restoreLastSession: boolean;
  passwordProtection?: string;
  hideCursor: boolean;
  disableRightClick: boolean;
  runInBackground: boolean;
}

export interface NightModeSettings {
  enabled: boolean;
  startTime: string; // "18:00"
  endTime: string;   // "06:00"
  logoAssetPath: string | null;
  backgroundMode: 'black' | 'simple_theme';
  unifiedDisplay: boolean;
}

export interface DisplayConfig {
  id: string; // unique ID from Electron screen API
  name: string;
  url: string;
  refreshIntervalMinutes: number | null;
  isKiosk: boolean;
  isFullscreen: boolean;
  zoomFactor: number;
  reloadOnError: boolean;
  errorTimeoutSeconds: number;
}

export interface AppStore {
  globalSettings: GlobalSettings;
  nightModeSettings: NightModeSettings;
  displays: Record<string, DisplayConfig>;
  activeDisplays: string[];
}
