import React, { useState } from 'react';
import { 
  Layers, 
  Activity, 
  Wind, 
  CheckSquare, 
  AlertTriangle, 
  Battery, 
  Heart, 
  Zap, 
  Thermometer, 
  Gauge, 
  Eye, 
  ChevronRight,
  ShieldCheck,
  FileText,
  Trophy
} from 'lucide-react';
import { MARS_BASEMAPS, MARS_OVERLAYS, LIVE_TELEMETRY } from '../data/marsDatasets';
import { marsAudio } from '../utils/audio';
import Leaderboard from './Leaderboard';

export default function MissionSidebar({
  activeBasemap,
  onSelectBasemap,
  overlays,
  onToggleOverlay,
  waypoints,
  totalDistanceKm,
  activeSite,
  tasks,
  onToggleTask,
  weatherCondition,
  isSimulating,
  simulationProgress,
  scienceScore,
  userProfile,
  onScanAtmosphere
}) {
  const [activeTab, setActiveTab] = useState('traverse'); // 'layers', 'traverse', 'weather', 'tasks', 'rankings'

  // Calculate Consumables based on Distance
  const effectiveDistance = isSimulating && waypoints.length > 1 
    ? (totalDistanceKm * (simulationProgress / (waypoints.length - 1))) 
    : totalDistanceKm;

  const isStorm = weatherCondition === 'Dust Storm';
  const weatherMultiplier = isStorm ? 1.4 : 1.0;
  const estTimeHours = (effectiveDistance / (isStorm ? 2.0 : 3.2)).toFixed(1); // avg 3.2 km/h walking speed in 0.38g
  const o2UsedLiters = (effectiveDistance * LIVE_TELEMETRY.lifeSupportLimits.oxygenBurnPerKmWalk * weatherMultiplier).toFixed(0);
  const o2PercentRemaining = Math.max(0, 100 - (o2UsedLiters / 450 * 100)).toFixed(0); // 450L tank capacity
  const batteryPercentRemaining = Math.max(0, 100 - (estTimeHours * LIVE_TELEMETRY.lifeSupportLimits.suitBatteryDrainPerHour * (isStorm ? 2.5 : 1.0))).toFixed(0);
  const caloriesBurned = (estTimeHours * LIVE_TELEMETRY.lifeSupportLimits.calorieBurnPerHourWalk * weatherMultiplier).toFixed(0);

  // Generate pseudo-random Elevation Data for the chart based on waypoints length
  const elevationData = React.useMemo(() => {
    const points = Math.max(10, waypoints.length * 2);
    const data = [];
    let currentElev = -2500; // Jezero crater avg depth
    for (let i = 0; i <= points; i++) {
      currentElev += (Math.random() - 0.45) * 40; // Random walk
      data.push(currentElev);
    }
    return data;
  }, [waypoints.length]);

  // Terrain Difficulty Index
  const difficultyLevel = isStorm ? 'CRITICAL (SEEK SHELTER)' : (totalDistanceKm > 15 ? 'HAZARDOUS (EXCEEDING SAFE EVA RADIUS)' : totalDistanceKm > 6 ? 'MODERATE (ROVER TETHER RECOMMENDED)' : 'NOMINAL (SAFE PEDESTRIAN WALK)');
  const difficultyColor = isStorm || totalDistanceKm > 15 ? 'var(--hazard-red)' : totalDistanceKm > 6 ? 'var(--solar-gold)' : 'var(--bio-green)';

  return (
    <aside className="glass-panel" style={{
      width: '380px',
      margin: '0 16px 16px 0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden',
      borderLeft: '3px solid var(--cyan-telemetry)'
    }}>
      {/* Sidebar Header & Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--panel-border)',
        background: 'rgba(6, 9, 16, 0.7)'
      }}>
        {[
          { id: 'traverse', label: 'TRAVERSE', icon: Activity },
          { id: 'layers', label: 'LAYERS', icon: Layers },
          { id: 'weather', label: 'TELEMETRY', icon: Wind },
          { id: 'rankings', label: 'RANKINGS', icon: Trophy }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                marsAudio.playRadioChirp();
                setActiveTab(tab.id);
              }}
              style={{
                flex: 1,
                padding: '12px 6px',
                background: isActive ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--cyan-telemetry)' : '2px solid transparent',
                color: isActive ? 'var(--cyan-telemetry)' : 'var(--text-muted)',
                fontFamily: 'var(--font-data)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* =================================================================
            TAB 1: MARSWALK TRAVERSE & LIFE SUPPORT TELEMETRY
            ================================================================= */}
        {activeTab === 'traverse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Traverse Overview Card */}
            <div style={{
              background: 'rgba(10, 16, 28, 0.85)',
              padding: '14px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--panel-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '0.5px' }}>
                  PLANNED EVA DISTANCE
                </span>
                <span className="badge badge-live">0.38G GRAVITY</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: '#fff', fontWeight: 900 }}>
                  {effectiveDistance.toFixed(2)}
                </span>
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '16px', color: 'var(--cyan-telemetry)', fontWeight: 700 }}>
                  KM {isSimulating ? '(LIVE)' : ''}
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-data)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  ≈ {estTimeHours} HRS WALK
                </span>
              </div>

              {/* Waypoint count & Status */}
              <div style={{
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontFamily: 'var(--font-data)'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Waypoints: <strong>{waypoints.length}</strong></span>
                <span style={{ color: difficultyColor, fontWeight: 700 }}>{difficultyLevel}</span>
              </div>
            </div>

            {/* Integrated Route Analysis Card */}
            <div style={{
              background: 'rgba(10, 16, 28, 0.85)',
              padding: '14px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--panel-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: '#ffb703', letterSpacing: '0.5px', margin: 0 }}>
                INTEGRATED ROUTE ANALYSIS
              </h4>
              
              {/* Slope Danger (MOLA) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-data)' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Terrain & Slope:</span>
                  <div style={{ marginTop: '2px' }}><span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', fontSize: '9px' }}>MOLA (MGS)</span></div>
                </div>
                <span style={{ color: difficultyLevel.includes('CRITICAL') || difficultyLevel.includes('HAZARDOUS') ? 'var(--hazard-red)' : '#00ff9d', fontWeight: 700, textAlign: 'right' }}>
                  {difficultyLevel.includes('CRITICAL') || difficultyLevel.includes('HAZARDOUS') ? 'HIGH RISK' : 'NOMINAL'}
                </span>
              </div>

              {/* Weather Impact (MEDA) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-data)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Weather Impact:</span>
                  <div style={{ marginTop: '2px' }}><span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', fontSize: '9px' }}>MEDA (Perseverance)</span></div>
                </div>
                <span style={{ color: isStorm ? 'var(--hazard-red)' : '#00ff9d', fontWeight: 700, textAlign: 'right' }}>
                  {isStorm ? 'SEVERE DUST STORM' : 'CLEAR SKY (-80°C)'}
                </span>
              </div>

              {/* Radiation Dose (RAD) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-data)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Radiation Dose:</span>
                  <div style={{ marginTop: '2px' }}><span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', fontSize: '9px' }}>RAD (Curiosity)</span></div>
                </div>
                <span style={{ color: estTimeHours > 4 ? 'var(--solar-gold)' : '#00ff9d', fontWeight: 700, textAlign: 'right' }}>
                  {(estTimeHours * 24.1).toFixed(1)} uSv
                </span>
              </div>
              
              {/* Surface Minerals (CRISM) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-data)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Mineral Discovery:</span>
                  <div style={{ marginTop: '2px' }}><span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', fontSize: '9px' }}>CRISM (MRO)</span></div>
                </div>
                <span style={{ color: '#00f0ff', fontWeight: 700, textAlign: 'right', maxWidth: '100px' }}>
                  {activeSite.geology.split(' ')[0]} DEPOSITS
                </span>
              </div>

              {/* ISRU Water/Ice (Odyssey) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-data)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Subsurface Ice (ISRU):</span>
                  <div style={{ marginTop: '2px' }}><span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', fontSize: '9px' }}>GRS (Odyssey)</span></div>
                </div>
                <span style={{ color: activeSite.name.includes('Permafrost') || activeSite.geology.includes('Ice') ? '#00ccff' : 'var(--text-muted)', fontWeight: 700, textAlign: 'right', maxWidth: '100px' }}>
                  {activeSite.name.includes('Permafrost') || activeSite.geology.includes('Ice') ? 'HIGH PROBABILITY' : 'LOW YIELD'}
                </span>
              </div>
            </div>

            {/* Life Support Telemetry Gauges */}
            <div style={{
              background: 'rgba(10, 16, 28, 0.85)',
              padding: '14px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--panel-border)'
            }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--cyan-telemetry)', marginBottom: '12px', letterSpacing: '0.5px' }}>
                LIFE SUPPORT & CONSUMABLES SIMULATION
              </h4>

              {/* Oxygen Reserve */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-data)', marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-primary)' }}>
                    <Heart size={12} color="#00ff9d" /> OXYGEN (O2) RESERVE
                  </span>
                  <span style={{ color: '#00ff9d', fontWeight: 700 }}>{o2PercentRemaining}% ({450 - o2UsedLiters}L)</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${o2PercentRemaining}%`, height: '100%', background: '#00ff9d', transition: 'width 0.4s' }}></div>
                </div>
              </div>

              {/* Suit Battery */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-data)', marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-primary)' }}>
                    <Battery size={12} color="#00f0ff" /> SUIT POWER / HEATING
                  </span>
                  <span style={{ color: 'var(--cyan-telemetry)', fontWeight: 700 }}>{batteryPercentRemaining}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${batteryPercentRemaining}%`, height: '100%', background: 'var(--cyan-telemetry)', transition: 'width 0.4s' }}></div>
                </div>
              </div>

              {/* Metabolic Burn */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-data)', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Metabolic Energy:</span>
                <span style={{ color: 'var(--solar-gold)', fontWeight: 700 }}>{caloriesBurned} kcal</span>
              </div>
            </div>

            {/* Target Location Geologic Context */}
            <div style={{
              background: 'rgba(10, 16, 28, 0.85)',
              padding: '14px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--panel-border)'
            }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--solar-gold)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                TARGET SITE GEOLOGY // {activeSite.name}
              </h4>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '8px' }}>
                {activeSite.description}
              </p>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-data)' }}>
                <div><strong>Primary Mission Goal:</strong> {activeSite.scienceGoal}</div>
                <div style={{ marginTop: '4px' }}><strong>Geological Formation:</strong> {activeSite.geology}</div>
                <div style={{ marginTop: '4px', color: activeSite.safetyRating.includes('EXTREME') ? 'var(--hazard-red)' : 'var(--solar-gold)' }}>
                  <strong>Safety Protocol:</strong> {activeSite.safetyRating}
                </div>
              </div>
            </div>

            {/* Science Return Score */}
            <div style={{
              background: 'rgba(10, 16, 28, 0.85)',
              padding: '14px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--panel-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: '#00ff9d', letterSpacing: '0.5px', margin: 0 }}>
                  SCIENCE RETURN POTENTIAL
                </h4>
                <div style={{
                  background: 'rgba(0, 255, 157, 0.1)',
                  color: '#00ff9d',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-data)',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: '1px solid rgba(0, 255, 157, 0.3)'
                }}>
                  {scienceScore} PTS
                </div>
              </div>
              <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.1)', marginTop: '8px', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (scienceScore / 100) * 100)}%`, height: '100%', background: '#00ff9d', transition: 'width 0.3s' }}></div>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '8px', fontFamily: 'var(--font-data)' }}>
                Plot your route near glowing NASA Science Targets to maximize astrobiology and geology data collection.
              </p>
            </div>

            {/* Topographic Elevation Profile */}
            <div style={{
              background: 'rgba(10, 16, 28, 0.85)',
              padding: '14px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--panel-border)'
            }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--cyan-telemetry)', marginBottom: '12px', letterSpacing: '0.5px' }}>
                ELEVATION PROFILE (MOLA DATA)
              </h4>
              <div style={{ height: '80px', width: '100%', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {(() => {
                    const minElev = Math.min(...elevationData);
                    const maxElev = Math.max(...elevationData);
                    const range = Math.max(maxElev - minElev, 1);
                    const points = elevationData.map((d, i) => {
                      const x = (i / (elevationData.length - 1)) * 100;
                      const y = 100 - ((d - minElev) / range) * 100;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <>
                        {/* Fill area */}
                        <polygon points={`0,100 ${points} 100,100`} fill="rgba(0, 240, 255, 0.1)" />
                        {/* Line */}
                        <polyline points={points} fill="none" stroke="var(--cyan-telemetry)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                      </>
                    );
                  })()}
                </svg>
                {/* Simulation Position Indicator on Chart */}
                {isSimulating && waypoints.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${(simulationProgress / (waypoints.length - 1)) * 100}%`,
                    width: '2px',
                    background: 'var(--hazard-red)',
                    boxShadow: '0 0 4px var(--hazard-red)'
                  }} />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-data)' }}>
                <span>Start</span>
                <span>{elevationData.length > 0 ? elevationData[elevationData.length - 1].toFixed(0) : 0}m</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 2: NASA MISSION LAYERS & OVERLAYS
            ================================================================= */}
        {activeTab === 'layers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Basemap Selection */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--cyan-telemetry)', marginBottom: '10px', letterSpacing: '0.5px' }}>
                PRIMARY MARTIAN BASEMAPS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {MARS_BASEMAPS.map(base => {
                  const isSelected = activeBasemap === base.id;
                  return (
                    <div
                      key={base.id}
                      onClick={() => {
                        marsAudio.playRadioChirp();
                        onSelectBasemap(base.id);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--border-radius-sm)',
                        background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(10, 16, 28, 0.7)',
                        border: isSelected ? '1.5px solid var(--cyan-telemetry)' : '1px solid var(--panel-border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                          {base.name}
                        </span>
                        <span className="badge" style={{ background: isSelected ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: isSelected ? 'var(--cyan-telemetry)' : 'var(--text-muted)' }}>
                          {base.tag}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.3' }}>
                        {base.description}
                      </p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', display: 'block', marginTop: '4px' }}>
                        Source: {base.mission}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Multi-Mission Scientific Overlays */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--bio-green)', marginBottom: '10px', letterSpacing: '0.5px' }}>
                MULTI-MISSION SCIENCE OVERLAYS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {MARS_OVERLAYS.map(ov => {
                  const isEnabled = overlays[ov.id];
                  return (
                    <div
                      key={ov.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--border-radius-sm)',
                        background: 'rgba(10, 16, 28, 0.7)',
                        border: isEnabled ? `1.5px solid ${ov.color}` : '1px solid var(--panel-border)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => {
                              marsAudio.playRadioChirp();
                              onToggleOverlay(ov.id);
                            }}
                            style={{ accentColor: ov.color, cursor: 'pointer' }}
                          />
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                            {ov.name}
                          </span>
                        </label>
                        <span className="badge" style={{ background: `${ov.color}22`, color: ov.color, border: `1px solid ${ov.color}55` }}>
                          {ov.tag}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.3' }}>
                        {ov.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 3: LIVE TELEMETRY & IN-SITU WEATHER FEEDS
            ================================================================= */}
        {activeTab === 'weather' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: 'rgba(10, 16, 28, 0.85)',
              padding: '14px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--panel-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--cyan-telemetry)', letterSpacing: '0.5px' }}>
                  PERSEVERANCE MEDA SENSOR SUITE
                </h4>
                <span className="badge badge-live">TRANSMITTING</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontFamily: 'var(--font-data)' }}>
                {/* Max Temp */}
                <div style={{ background: 'rgba(6, 10, 18, 0.8)', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MAX AIR TEMP</div>
                  <div style={{ fontSize: '18px', color: '#ff8a65', fontWeight: 700 }}>{isStorm ? '-45' : LIVE_TELEMETRY.weather.tempMax} °C</div>
                </div>

                {/* Min Temp */}
                <div style={{ background: 'rgba(6, 10, 18, 0.8)', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MIN NIGHT TEMP</div>
                  <div style={{ fontSize: '18px', color: 'var(--cyan-telemetry)', fontWeight: 700 }}>{isStorm ? '-110' : LIVE_TELEMETRY.weather.tempMin} °C</div>
                </div>

                {/* Atmospheric Pressure */}
                <div style={{ background: 'rgba(6, 10, 18, 0.8)', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SURFACE PRESSURE</div>
                  <div style={{ fontSize: '18px', color: '#fff', fontWeight: 700 }}>{isStorm ? '860.5' : LIVE_TELEMETRY.weather.pressure} Pa</div>
                </div>

                {/* Wind Speed */}
                <div style={{ background: 'rgba(6, 10, 18, 0.8)', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>WIND VECTOR</div>
                  <div style={{ fontSize: '18px', color: isStorm ? 'var(--hazard-red)' : 'var(--solar-gold)', fontWeight: 700 }}>{isStorm ? '124.3' : LIVE_TELEMETRY.weather.windSpeed} m/s</div>
                </div>
              </div>

              {/* Radiation & Dust Index */}
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '11px', fontFamily: 'var(--font-data)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Atmospheric Dust Opacity (&tau;):</span>
                  <span style={{ color: isStorm ? 'var(--hazard-red)' : '#fff', fontWeight: 700 }}>{isStorm ? '5.8 (Severe Storm)' : LIVE_TELEMETRY.weather.dustOpticalDepth + ' (Clear Sky)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Cosmic Ray Radiation:</span>
                  <span style={{ color: 'var(--bio-green)', fontWeight: 700 }}>{LIVE_TELEMETRY.weather.radiationDose}</span>
                </div>
                
                {/* Gamification: Scan Environment */}
                <button 
                  onClick={(e) => {
                    marsAudio.playWaypointPing();
                    e.target.innerText = "SCAN COMPLETE (+50 PTS)";
                    e.target.style.background = 'var(--bio-green)';
                    e.target.style.color = '#000';
                    e.target.disabled = true;
                    if (onScanAtmosphere) onScanAtmosphere();
                  }}
                  className="btn-cyber" 
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Wind size={14} /> SCAN ATMOSPHERE & EARN PTS
                </button>
              </div>
            </div>

            {/* Astronaut Safety Advisory */}
            <div style={{
              background: isStorm ? 'rgba(255, 51, 102, 0.1)' : 'rgba(0, 255, 157, 0.08)',
              padding: '12px',
              borderRadius: 'var(--border-radius-sm)',
              border: isStorm ? '1px solid rgba(255, 51, 102, 0.4)' : '1px solid rgba(0, 255, 157, 0.3)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              {isStorm ? (
                <AlertTriangle size={20} color="var(--hazard-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <ShieldCheck size={20} color="#00ff9d" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div>
                <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: isStorm ? 'var(--hazard-red)' : '#00ff9d', marginBottom: '2px' }}>
                  {isStorm ? 'EVA FLIGHT SURGEON STATUS: CRITICAL' : 'EVA FLIGHT SURGEON STATUS: GREEN'}
                </h5>
                <p style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: '1.4' }}>
                  {isStorm 
                    ? 'WARNING: Severe atmospheric dust storm detected. Visibility approaching zero. Suit thermal limits tested. Seek immediate shelter.' 
                    : 'Atmospheric dust opacity and cosmic radiation levels permit extended human surface egress up to 8.0 hours.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 4: ASTRONAUT FIELD SCIENCE TASKS (Moved to bottom)
            ================================================================= */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--cyan-telemetry)', letterSpacing: '0.5px' }}>
                MARSWALK FIELD PROTOCOLS
              </h4>
              <span className="badge badge-live">
                {tasks.filter(t => t.completed).length}/{tasks.length} DONE
              </span>
            </div>

            {tasks.map(task => (
              <div
                key={task.id}
                onClick={() => {
                  marsAudio.playWaypointPing();
                  onToggleTask(task.id);
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: task.completed ? 'rgba(0, 255, 157, 0.1)' : 'rgba(10, 16, 28, 0.7)',
                  border: task.completed ? '1px solid #00ff9d' : '1px solid var(--panel-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}} // Handled by div click
                  style={{ accentColor: '#00ff9d', cursor: 'pointer', marginTop: '3px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: task.completed ? '#00ff9d' : '#fff',
                    textDecoration: task.completed ? 'line-through' : 'none'
                  }}>
                    {task.title}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {task.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =================================================================
            TAB 5: GAMIFICATION LEADERBOARD
            ================================================================= */}
        {activeTab === 'rankings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Leaderboard userProfile={userProfile} userScore={scienceScore} />
          </div>
        )}
      </div>
    </aside>
  );
}
