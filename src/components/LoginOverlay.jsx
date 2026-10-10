import React, { useState, useEffect } from 'react';
import { Shield, Activity, Loader2 } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function LoginOverlay({ onLogin }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);

  useEffect(() => {
    if (isAuthenticating) {
      const interval = setInterval(() => {
        setAuthProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isAuthenticating]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      onLogin({
        uid: user.uid,
        name: user.displayName || 'Space Explorer',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        email: user.email
      });
    } catch (error) {
      console.error("Firebase Login Error:", error);
      setIsAuthenticating(false);
      setAuthProgress(0);
      alert("Authentication Error: " + error.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(6, 7, 12, 0.95)',
      backdropFilter: 'blur(20px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-display)'
    }}>
      <div style={{ position: 'absolute', top: '10%', left: '10%', opacity: 0.1, color: 'var(--cyan-telemetry)' }}>
        <Shield size={200} />
      </div>

      <div className="glass-panel tech-corner" style={{
        width: '450px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        border: '1px solid var(--cyan-telemetry)',
        boxShadow: '0 0 40px rgba(0, 240, 255, 0.1)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <Activity size={48} color="var(--cyan-telemetry)" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '24px', letterSpacing: '3px', color: 'var(--cyan-telemetry)' }}>
            DEEP SPACE NETWORK
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '2px', marginTop: '8px' }}>
            AstraMap Mars Authentication Gateway
          </p>
        </div>

        {!isAuthenticating ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.5' }}>
              Authentication required to access the global Deep Space Network and compete with other explorers.
            </p>
            
            <button 
              onClick={handleAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#fff',
                color: '#757575',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Roboto, sans-serif',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'background 0.2s',
                width: '100%',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.target.style.background = '#f8f8f8'}
              onMouseOut={(e) => e.target.style.background = '#fff'}
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
            <Loader2 className="lucide-spin" size={32} color="var(--cyan-telemetry)" />
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${authProgress}%`, 
                height: '100%', 
                background: 'var(--cyan-telemetry)', 
                boxShadow: '0 0 10px var(--cyan-glow)',
                transition: 'width 0.15s ease'
              }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-cyan)', letterSpacing: '1px' }}>
              {authProgress < 40 ? 'ESTABLISHING UPLINK...' : authProgress < 80 ? 'VERIFYING CREDENTIALS...' : 'ACCESS GRANTED'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
