import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Radio, 
  Volume2, 
  VolumeX, 
  Download, 
  RotateCcw, 
  MapPin, 
  Activity, 
  Layers, 
  ShieldAlert,
  Flame,
  Award,
  Wind,
  Moon
} from 'lucide-react';
import { FAMOUS_LANDING_SITES, LIVE_TELEMETRY } from '../data/marsDatasets';
import { marsAudio } from '../utils/audio';

export default function Navbar({ 
  activeSite, 
  onSelectSite, 
  waypointsCount, 
  onClearRoute, 
  onLoadPredefinedRoute, 
  onExportMissionPlan,
  isSimulating,
  onToggleSimulation,
  soundEnabled,
  onToggleSound,
  weatherCondition,
  onToggleWeather,
  isNightMode,
  onToggleNightMode,
  is3DMode,
  onToggle3DMode
}) {
  const [marsTime, setMarsTime] = useState(LIVE_TELEMETRY.localMarsTime);

  // Simulate tick for Martian Solar Time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const secs = String(now.getSeconds()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const hours = String((now.getHours() + 14) % 24).padStart(2, '0');
      setMarsTime(`${hours}:${mins}:${secs} LMST`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-panel" style={{
      margin: '12px 16px 0 16px',
      padding: '10px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      flexWrap: 'wrap',
      gap: '12px',
      borderLeft: '3px solid var(--mars-flame)'
    }}>
      {/* Brand & NASA Space Apps Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ff5722 0%, #8c2210 80%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 14px var(--mars-glow)',
          border: '1.5px solid var(--cyan-telemetry)'
        }}>
          <Compass size={20} color="#00f0ff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 900,
              letterSpacing: '1.5px',
              color: '#fff',
              margin: 0,
              textTransform: 'uppercase'
            }}>
              AstraMap <span style={{ color: 'var(--mars-flame)' }}>Mars</span>
            </h1>
            <span className="badge badge-live">
              <span className="pulse-indicator"></span>
              NASA 2026
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-data)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.8px',
            margin: 0
          }}>
            MARTIAN EVA & MULTI-MISSION LAYER TRAVERSE PLANNER
          </p>
        </div>
      </div>

      {/* Telemetry Sol Counter & Mars Clock */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '6px 14px',
        background: 'rgba(6, 9, 16, 0.65)',
        borderRadius: 'var(--border-radius-sm)',
        border: '1px solid rgba(0, 240, 255, 0.15)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '0.5px' }}>MISSION SOL</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--solar-gold)', fontWeight: 700 }}>
            SOL {LIVE_TELEMETRY.sol}
          </div>
        </div>

        <div style={{ width: '1px', height: '22px', background: 'rgba(255, 255, 255, 0.1)' }}></div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '0.5px' }}>LOCAL MARS TIME</span>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '14px', color: 'var(--cyan-telemetry)', fontWeight: 700 }}>
            {marsTime}
          </div>
        </div>

        <div style={{ width: '1px', height: '22px', background: 'rgba(255, 255, 255, 0.1)' }}></div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '0.5px' }}>SOLAR LON (Ls)</span>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: 'var(--bio-green)', fontWeight: 600 }}>
            {LIVE_TELEMETRY.lsDegree}
          </div>
        </div>
      </div>

      {/* Landing Sites Dropdown & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Site Switcher */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <MapPin size={14} color="var(--mars-flame)" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
          <select 
            id="site-selector"
            aria-label="Select Famous Mars Landing Site"
            value={activeSite.id} 
            onChange={(e) => {
              const selected = FAMOUS_LANDING_SITES.find(s => s.id === e.target.value);
              if (selected) {
                marsAudio.playRadioChirp();
                onSelectSite(selected);
              }
            }}
            style={{
              padding: '7px 12px 7px 30px',
              background: 'rgba(10, 15, 26, 0.9)',
              border: '1px solid var(--panel-border)',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-data)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {FAMOUS_LANDING_SITES.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.mission})</option>
            ))}
          </select>
        </div>

        {/* Load Preset Traverse */}
        <button 
          id="btn-load-preset"
          className="btn-cyber btn-ghost" 
          onClick={() => {
            marsAudio.playRadioChirp();
            onLoadPredefinedRoute();
          }}
          title="Load historical NASA rover traverse route"
        >
          <Layers size={13} />
          <span>ROVER PATH</span>
        </button>

        {/* Clear Traverse */}
        {waypointsCount > 0 && (
          <button 
            id="btn-clear-route"
            className="btn-cyber btn-ghost" 
            style={{ color: 'var(--hazard-red)', borderColor: 'rgba(255, 51, 102, 0.3)' }}
            onClick={() => {
              marsAudio.playRadioChirp();
              onClearRoute();
            }}
            title="Clear all waypoints"
          >
            <RotateCcw size={13} />
            <span>RESET ({waypointsCount})</span>
          </button>
        )}

        {/* Live Marswalk Simulation Button */}
        <button 
          id="btn-toggle-sim"
          className={`btn-cyber ${isSimulating ? 'btn-mars' : ''}`}
          onClick={() => {
            onToggleSimulation();
            if (!isSimulating) marsAudio.playSuccessChime();
          }}
          title="Simulate Astronaut walking along plotted route"
        >
          <Activity size={13} />
          <span>{isSimulating ? 'PAUSE WALK' : 'START MARSWALK'}</span>
        </button>

        {/* Export Mission Briefing */}
        <button 
          id="btn-export-plan"
          className="btn-cyber" 
          onClick={() => {
            marsAudio.playSuccessChime();
            onExportMissionPlan();
          }}
          title="Export NASA EVA Traversal Briefing Document"
        >
          <Download size={13} />
          <span>EXPORT EVA</span>
        </button>

        {/* Toggle Dust Storm */}
        <button 
          id="btn-toggle-weather"
          className={`btn-cyber ${weatherCondition === 'Dust Storm' ? 'btn-mars' : ''}`}
          onClick={() => {
            if (weatherCondition === 'Clear') {
              marsAudio.playHazardAlarm && marsAudio.playHazardAlarm(); // Optional sound
            } else {
              marsAudio.playSuccessChime();
            }
            onToggleWeather();
          }}
          title="Simulate Martian Dust Storm"
        >
          <Wind size={13} />
          <span>{weatherCondition === 'Dust Storm' ? 'CLEAR DUST' : 'DUST STORM'}</span>
        </button>

        {/* Toggle 3D Tactical Mode */}
        <button 
          id="btn-toggle-3d"
          className={`btn-cyber ${is3DMode ? 'btn-mars' : ''}`}
          onClick={() => {
            marsAudio.playRadioChirp();
            onToggle3DMode();
          }}
          title="Toggle 3D Holographic Tactical View"
        >
          <Layers size={13} />
          <span>{is3DMode ? '2D MAP' : '3D TACTICAL'}</span>
        </button>

        {/* Toggle Night Ops */}
        <button 
          id="btn-toggle-night"
          className={`btn-cyber ${isNightMode ? 'btn-mars' : ''}`}
          onClick={() => {
            marsAudio.playRadioChirp();
            onToggleNightMode();
          }}
          title="Toggle Night Ops Mode"
        >
          <Moon size={13} />
          <span>{isNightMode ? 'DAY OPS' : 'NIGHT OPS'}</span>
        </button>

        {/* Sound FX Toggle */}
        <button 
          id="btn-sound-toggle"
          onClick={() => {
            const next = onToggleSound();
            if (next) marsAudio.playRadioChirp();
          }}
          style={{
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid var(--panel-border)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '7px 9px',
            color: soundEnabled ? 'var(--cyan-telemetry)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          title={soundEnabled ? 'Mute HUD Audio' : 'Enable HUD Audio'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </header>
  );
}
