import React from 'react';
import { Radio, X, Camera, MapPin, Calendar } from 'lucide-react';
import { marsAudio } from '../utils/audio';

export default function TransmissionModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="glass-panel" style={{
        width: '600px',
        maxWidth: '90%',
        padding: '24px',
        border: '1px solid var(--cyan-telemetry)',
        boxShadow: '0 0 40px rgba(0, 240, 255, 0.15)',
        animation: 'fade-in 0.3s ease-out'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,240,255,0.3)', paddingBottom: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Radio color="var(--cyan-telemetry)" size={24} className="pulse-indicator-fast" />
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--cyan-telemetry)', letterSpacing: '2px', fontSize: '18px' }}>
                INCOMING TRANSMISSION
              </h2>
              <span style={{ fontFamily: 'var(--font-data)', color: 'var(--solar-gold)', fontSize: '11px' }}>
                DEEP SPACE NETWORK // AUTHENTICATED
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              onClose();
            }}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img src={data.url} alt="Mars Rover" style={{ width: '100%', display: 'block' }} />
            
            {/* Scanline Overlay */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(transparent 50%, rgba(0, 240, 255, 0.02) 50%)',
              backgroundSize: '100% 4px',
              pointerEvents: 'none'
            }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: 'var(--font-data)', fontSize: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '4px', borderLeft: '2px solid var(--solar-gold)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={12}/> SOURCE
              </div>
              <div style={{ color: '#fff', fontWeight: 700 }}>Rover: {data.rover}</div>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '4px', borderLeft: '2px solid var(--cyan-telemetry)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={12}/> INSTRUMENT
              </div>
              <div style={{ color: '#fff', fontWeight: 700 }}>{data.camera}</div>
            </div>

            <div style={{ gridColumn: 'span 2', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '4px', borderLeft: '2px solid #00ff9d' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={12}/> TIMESTAMP
              </div>
              <div style={{ color: '#fff', fontWeight: 700 }}>Earth Date: {data.date}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
