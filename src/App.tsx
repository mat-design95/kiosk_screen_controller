import { useEffect, useState } from 'react';
import { API } from './api';
import { AppStore } from '../shared/models';
import './index.css';

type Tab = 'displays' | 'nightmode' | 'settings';

function App() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('displays');
  const [activeDisplayId, setActiveDisplayId] = useState<string | null>(null);

  useEffect(() => {
    API.getStore().then(data => {
      setStore(data);
      if (Object.keys(data.displays).length > 0) {
        setActiveDisplayId(Object.keys(data.displays)[0]);
      }
    });
  }, []);

  if (!store) return <div style={{ color: 'white', padding: 20 }}>Loading System...</div>;

  const displays = Object.values(store.displays);
  const activeDisplay = activeDisplayId ? store.displays[activeDisplayId] : null;

  return (
    <>
      <div className="glass-panel" style={{ width: '120px', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '25px 0', borderLeft: 'none', borderTop: 'none', borderBottom: 'none', borderRadius: 0, zIndex: 10 }}>
        
        <img src="./Mat_design_ikon.png" alt="Mat Design" style={{ width: '100%', height: 'auto', objectFit: 'contain', marginBottom: 40, opacity: 1, filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.3))', transform: 'scale(1.25)' }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button className={`btn ${activeTab === 'displays' ? 'primary' : ''}`} style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, fontSize: '20px' }} onClick={() => setActiveTab('displays')} title="Displays">
            🖥
          </button>
          <button className={`btn ${activeTab === 'nightmode' ? 'primary' : ''}`} style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, fontSize: '20px' }} onClick={() => setActiveTab('nightmode')} title="Night Mode">
            🌙
          </button>
          <button className={`btn ${activeTab === 'settings' ? 'primary' : ''}`} style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, fontSize: '20px' }} onClick={() => setActiveTab('settings')} title="Settings">
            ⚙️
          </button>
        </div>
      </div>

      <div style={{ flex: 1, height: '100vh', overflowY: 'auto', padding: '30px' }}>

        {activeTab === 'displays' && (
          <div style={{ display: 'flex', gap: '20px', minHeight: '100%' }}>

            <div className="glass-panel" style={{ width: '340px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 600 }}>Screens</h2>
              {displays.map(d => (
                <button
                  key={d.id}
                  className={`btn ${activeDisplayId === d.id ? 'primary' : ''}`}
                  onClick={() => setActiveDisplayId(d.id)}
                  style={{ justifyContent: 'flex-start' }}
                >
                  {d.name.substring(0, 20)}...
                </button>
              ))}
              <div style={{ marginTop: 'auto' }}>
                <button className="btn outline" style={{ width: '100%', borderColor: 'var(--glass-border)' }} onClick={() => API.identifyDisplays()}>
                  🎯 Identify Screens
                </button>
              </div>
            </div>

            <div className="glass-panel" style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column' }}>
              {activeDisplay ? (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h2 style={{ fontSize: '28px', marginBottom: '30px', fontWeight: 300 }}>{activeDisplay.name}</h2>

                  <div className="form-group">
                    <label className="label">Target URL</label>
                    <input
                      type="text"
                      className="input-field"
                      value={activeDisplay.url}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        setStore({
                          ...store,
                          displays: { ...store.displays, [activeDisplay.id]: { ...activeDisplay, url: newUrl } }
                        });
                        API.updateDisplayConfig(activeDisplay.id, { url: newUrl });
                      }}
                      placeholder="https://dashboard.example.com"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="label">Auto-refresh (Minutes)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={activeDisplay.refreshIntervalMinutes || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value, 10) : null;
                          setStore({
                            ...store, displays: { ...store.displays, [activeDisplay.id]: { ...activeDisplay, refreshIntervalMinutes: val } }
                          });
                          API.updateDisplayConfig(activeDisplay.id, { refreshIntervalMinutes: val });
                        }}
                        placeholder="Leave empty for disabled"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Watchdog Reload Timeout (Seconds)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={activeDisplay.errorTimeoutSeconds || 30}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 30;
                          setStore({
                            ...store, displays: { ...store.displays, [activeDisplay.id]: { ...activeDisplay, errorTimeoutSeconds: val } }
                          });
                          API.updateDisplayConfig(activeDisplay.id, { errorTimeoutSeconds: val });
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ display: 'flex', gap: '30px', padding: '10px 0' }}>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={activeDisplay.isKiosk}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setStore({ ...store, displays: { ...store.displays, [activeDisplay.id]: { ...activeDisplay, isKiosk: val } } });
                          API.updateDisplayConfig(activeDisplay.id, { isKiosk: val });
                        }}
                      />
                      Kiosk Mode
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={activeDisplay.reloadOnError}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setStore({ ...store, displays: { ...store.displays, [activeDisplay.id]: { ...activeDisplay, reloadOnError: val } } });
                          API.updateDisplayConfig(activeDisplay.id, { reloadOnError: val });
                        }}
                      />
                      Watchdog Reload
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '30px' }}>
                    <button className="btn success" style={{ flex: 1, padding: '14px', fontSize: '15px', whiteSpace: 'nowrap' }} onClick={() => API.startKiosk(activeDisplay.id)}>
                      ▶ Push to Display
                    </button>
                    <button className="btn danger" style={{ flex: 1, padding: '14px', fontSize: '15px', whiteSpace: 'nowrap' }} onClick={() => API.stopKiosk(activeDisplay.id)}>
                      ■ Close Display
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>Select a display to configure...</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'nightmode' && (
          <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
            <h1 style={{ margin: '0 0 30px 0', fontWeight: 300 }}>Night Mode Schedule</h1>

            <div className="form-group">
              <label className="checkbox-label" style={{ fontSize: '18px', marginBottom: '30px', color: 'var(--active)', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={store.nightModeSettings.enabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setStore({ ...store, nightModeSettings: { ...store.nightModeSettings, enabled } });
                    API.updateNightModeSettings({ enabled });
                  }}
                  style={{ width: 24, height: 24 }}
                />
                Enable Automatic System Standby
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', opacity: store.nightModeSettings.enabled ? 1 : 0.4, pointerEvents: store.nightModeSettings.enabled ? 'auto' : 'none', transition: 'all 0.3s ease' }}>
              <div className="form-group">
                <label className="label">Start Time (HH:MM)</label>
                <input
                  type="time"
                  className="input-field"
                  value={store.nightModeSettings.startTime}
                  onChange={(e) => {
                    setStore({ ...store, nightModeSettings: { ...store.nightModeSettings, startTime: e.target.value } });
                    API.updateNightModeSettings({ startTime: e.target.value });
                  }}
                />
              </div>
              <div className="form-group">
                <label className="label">End Time (HH:MM)</label>
                <input
                  type="time"
                  className="input-field"
                  value={store.nightModeSettings.endTime}
                  onChange={(e) => {
                    setStore({ ...store, nightModeSettings: { ...store.nightModeSettings, endTime: e.target.value } });
                    API.updateNightModeSettings({ endTime: e.target.value });
                  }}
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="label">Custom Logo Image Path / Base64</label>
                <input
                  type="text"
                  className="input-field"
                  value={store.nightModeSettings.logoAssetPath || ''}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    setStore({ ...store, nightModeSettings: { ...store.nightModeSettings, logoAssetPath: val } });
                    API.updateNightModeSettings({ logoAssetPath: val });
                  }}
                  placeholder="Leave empty for default logo"
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Tip: Host your logo online (e.g., Imgur) and paste the URL here, or place it in the "public" root folder.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
            <h1 style={{ margin: '0 0 30px 0', fontWeight: 300 }}>Global Constraints</h1>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={store.globalSettings.launchAtStartup}
                  onChange={(e) => {
                    const launchAtStartup = e.target.checked;
                    setStore({ ...store, globalSettings: { ...store.globalSettings, launchAtStartup } });
                    API.updateGlobalSettings({ launchAtStartup });
                  }}
                />
                Start Application Automatically at System Login
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={store.globalSettings.restoreLastSession}
                  onChange={(e) => {
                    const restoreLastSession = e.target.checked;
                    setStore({ ...store, globalSettings: { ...store.globalSettings, restoreLastSession } });
                    API.updateGlobalSettings({ restoreLastSession });
                  }}
                />
                Restore Last Active Displays on Boot
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={store.globalSettings.hideCursor}
                  onChange={(e) => {
                    const hideCursor = e.target.checked;
                    setStore({ ...store, globalSettings: { ...store.globalSettings, hideCursor } });
                    API.updateGlobalSettings({ hideCursor });
                  }}
                />
                Enforce Hidden Mouse Cursor
              </label>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
