import { useEffect, useState } from 'react';
import { API } from './api';
import { AppStore } from '../shared/models';

function App() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [activeDisplayId, setActiveDisplayId] = useState<string | null>(null);

  useEffect(() => {
    API.getStore().then(data => {
      setStore(data);
      if (Object.keys(data.displays).length > 0) {
        setActiveDisplayId(Object.keys(data.displays)[0]);
      }
    });
  }, []);

  if (!store) return <div style={{ color: 'white', padding: 20 }}>Loading...</div>;

  const displays = Object.values(store.displays);
  const activeDisplay = activeDisplayId ? store.displays[activeDisplayId] : null;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ width: '250px', borderRight: '1px solid #333', padding: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Kiosk Screens</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displays.map(d => (
            <button
              key={d.id}
              onClick={() => setActiveDisplayId(d.id)}
              style={{
                padding: '10px',
                textAlign: 'left',
                backgroundColor: activeDisplayId === d.id ? '#007ACC' : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '30px' }}>
        {activeDisplay ? (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>{activeDisplay.name} Settings</h2>
            
            <div style={{ marginBottom: '20px', maxWidth: '600px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#aaa' }}>Target URL</label>
              <input 
                type="text" 
                value={activeDisplay.url}
                onChange={(e) => {
                  const newStore = { ...store };
                  newStore.displays[activeDisplay.id].url = e.target.value;
                  setStore(newStore);
                  API.updateDisplayConfig(activeDisplay.id, { url: e.target.value });
                }}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  backgroundColor: '#333', 
                  border: '1px solid #444', 
                  color: 'white', 
                  borderRadius: '4px',
                  outline: 'none'
                }}
                placeholder="https://your-dashboard-url.com"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button 
                onClick={() => {
                  API.startKiosk(activeDisplay.id)
                }}
                style={{ padding: '12px 24px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Start Kiosk
              </button>
              
              <button 
                onClick={() => {
                  API.stopKiosk(activeDisplay.id)
                }}
                style={{ padding: '12px 24px', backgroundColor: '#e53935', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Stop
              </button>
            </div>
            
          </div>
        ) : (
          <div style={{ color: '#aaa' }}>Select a display to configure</div>
        )}
      </div>
    </div>
  );
}

export default App;
