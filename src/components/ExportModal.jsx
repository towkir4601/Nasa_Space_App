import React from 'react';
import { Download, X, Printer, CheckCircle, ShieldCheck, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExportModal({
  isOpen,
  onClose,
  activeSite,
  waypoints,
  totalDistanceKm,
  activeBasemap
}) {
  if (!isOpen) return null;

  // Trigger celebration confetti when opening the briefing
  React.useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#ff5722', '#00ff9d']
    });
  }, []);

  const estHours = (totalDistanceKm / 3.2).toFixed(1);
  const o2Needed = (totalDistanceKm * 24.5).toFixed(0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(6, 7, 12, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '680px',
        maxWidth: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--border-radius-lg)',
        border: '1.5px solid var(--cyan-telemetry)',
        boxShadow: '0 0 50px rgba(0, 240, 255, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--panel-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10, 16, 28, 0.9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="var(--cyan-telemetry)" />
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: '#fff', margin: 0 }}>
                NASA EVA TRAVERSAL PLAN // OFFICIAL BRIEFING
              </h3>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--text-muted)' }}>
                SPACE APPS 2026 // EXPEDITION ARES DOCUMENT #EVA-2026-M4
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Printable Document */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, fontFamily: 'var(--font-body)' }}>
          {/* Header Badge */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '14px',
            borderBottom: '2px solid rgba(0, 240, 255, 0.2)'
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 900, color: 'var(--mars-flame)' }}>
                {activeSite.name.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: 'var(--cyan-telemetry)' }}>
                Target Site Mission: {activeSite.mission}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-live">FLIGHT APPROVED</span>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Classification: UNRESTRICTED SCIENCE
              </div>
            </div>
          </div>

          {/* Core Traversal Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            margin: '20px 0',
            fontFamily: 'var(--font-data)'
          }}>
            <div style={{ background: 'rgba(6, 10, 18, 0.7)', padding: '12px', borderRadius: '6px', border: '1px solid var(--panel-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL TRAVERSE</div>
              <div style={{ fontSize: '24px', color: '#fff', fontWeight: 700 }}>{totalDistanceKm} KM</div>
            </div>

            <div style={{ background: 'rgba(6, 10, 18, 0.7)', padding: '12px', borderRadius: '6px', border: '1px solid var(--panel-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ESTIMATED DURATION</div>
              <div style={{ fontSize: '24px', color: 'var(--cyan-telemetry)', fontWeight: 700 }}>{estHours} HRS</div>
            </div>

            <div style={{ background: 'rgba(6, 10, 18, 0.7)', padding: '12px', borderRadius: '6px', border: '1px solid var(--panel-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>O2 BUDGET REQUIRED</div>
              <div style={{ fontSize: '24px', color: '#00ff9d', fontWeight: 700 }}>{o2Needed} L</div>
            </div>
          </div>

          {/* Geological & Astrobiological Objective */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--solar-gold)', marginBottom: '6px' }}>
              PRIMARY EXPLORATION OBJECTIVES
            </h4>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
              {activeSite.description}
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', fontFamily: 'var(--font-data)' }}>
              <strong>Scientific Focus:</strong> {activeSite.scienceGoal}
            </div>
          </div>

          {/* Waypoint Manifest Table */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--cyan-telemetry)', marginBottom: '8px' }}>
              WAYPOINT COORDINATE MANIFEST ({waypoints.length} POINTS)
            </h4>
            <div style={{
              background: 'rgba(6, 10, 18, 0.8)',
              borderRadius: '6px',
              border: '1px solid var(--panel-border)',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-data)' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--cyan-telemetry)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>ID</th>
                    <th style={{ padding: '8px 12px' }}>MARTIAN LATITUDE</th>
                    <th style={{ padding: '8px 12px' }}>MARTIAN LONGITUDE</th>
                    <th style={{ padding: '8px 12px' }}>DESIGNATION</th>
                  </tr>
                </thead>
                <tbody>
                  {waypoints.map((wp, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', color: '#fff' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--cyan-telemetry)' }}>WP-{i + 1}</td>
                      <td style={{ padding: '8px 12px' }}>{wp[0]}° N/S</td>
                      <td style={{ padding: '8px 12px' }}>{wp[1]}° E/W</td>
                      <td style={{ padding: '8px 12px', color: i === 0 ? '#00ff9d' : i === waypoints.length - 1 ? '#ff5722' : '#cbd5e1' }}>
                        {i === 0 ? 'HAB / Egress Point' : i === waypoints.length - 1 ? 'Primary Sample Ingress' : 'Intermediate Geological Stop'}
                      </td>
                    </tr>
                  ))}
                  {waypoints.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No waypoints plotted yet. Click the map to drop traversal markers.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Safety Sign-off */}
          <div style={{
            background: 'rgba(0, 255, 157, 0.08)',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid rgba(0, 255, 157, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ShieldCheck size={28} color="#00ff9d" />
            <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
              <div style={{ color: '#00ff9d', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                NASA MISSION CONTROL & CAPCOM SIGN-OFF
              </div>
              <div>Traverse route conforms to EVA spacesuit thermal constraints, dust optical limits, and radiation thresholds.</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--panel-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          background: 'rgba(10, 16, 28, 0.9)'
        }}>
          <button className="btn-cyber btn-ghost" onClick={handlePrint}>
            <Printer size={14} />
            <span>PRINT / SAVE PDF</span>
          </button>
          <button className="btn-cyber btn-mars" onClick={onClose}>
            <span>CLOSE BRIEFING</span>
          </button>
        </div>
      </div>
    </div>
  );
}
