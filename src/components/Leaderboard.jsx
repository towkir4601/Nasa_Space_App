import React, { useState, useEffect } from 'react';
import { Trophy, Star } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Leaderboard({ userProfile }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Listen to real-time updates from the "users" collection
    const q = query(collection(db, 'users'), orderBy('score', 'desc'), limit(15));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(usersData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '12px', 
        borderBottom: '1px solid var(--panel-border)', paddingBottom: '16px' 
      }}>
        <div style={{ background: 'rgba(255, 183, 3, 0.15)', padding: '10px', borderRadius: '8px' }}>
          <Trophy size={24} color="var(--solar-gold)" />
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--solar-gold)', letterSpacing: '1px', m: 0 }}>
            GLOBAL RANKINGS
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Deep Space Network Explorer Standings
          </p>
        </div>
      </div>

      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: '8px', 
        maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' 
      }}>
        {players.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
            Awaiting Telemetry...
          </div>
        )}
        
        {players.map((player, index) => {
          const isUser = userProfile && userProfile.uid === player.uid;
          return (
            <div 
              key={player.id}
              className="glass-panel"
              style={{
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderLeft: isUser ? '3px solid var(--solar-gold)' : '1px solid var(--panel-border)',
                background: isUser ? 'rgba(255, 183, 3, 0.05)' : 'var(--panel-bg)'
              }}
            >
              <div style={{ width: '24px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 'bold', color: index < 3 ? 'var(--solar-gold)' : 'var(--text-secondary)' }}>
                #{index + 1}
              </div>
              
              <img src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}`} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-data)', fontSize: '14px', fontWeight: isUser ? 'bold' : 'normal', color: isUser ? '#fff' : 'var(--text-primary)' }}>
                  {player.name} {isUser && '(You)'}
                </div>
                {index === 0 && <div style={{ fontSize: '10px', color: 'var(--solar-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={10} /> Fleet Admiral</div>}
              </div>

              <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--cyan-telemetry)' }}>
                {(player.score || 0).toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>PTS</span>
              </div>
            </div>
          )
        })}
      </div>
      
    </div>
  );
}
