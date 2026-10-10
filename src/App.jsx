import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import MarsMap from './components/MarsMap';
import MarsMap3D from './components/MarsMap3D';
import MissionSidebar from './components/MissionSidebar';
import ExportModal from './components/ExportModal';
import TransmissionModal from './components/TransmissionModal';
import LoginOverlay from './components/LoginOverlay';
import { fetchRoverPhoto } from './utils/nasaApi';
import { FAMOUS_LANDING_SITES } from './data/marsDatasets';
import { marsAudio } from './utils/audio';

import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Mars radius in kilometers (mean volumetric radius)
const MARS_RADIUS_KM = 3389.5;

// Accurate Mars Great-Circle Distance
function calculateMarsDistance(lat1, lon1, lat2, lon2) {
  const toRad = (val) => (val * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return MARS_RADIUS_KM * c;
}

export default function App() {
  const [activeSite, setActiveSite] = useState(FAMOUS_LANDING_SITES[0]);
  const [activeBasemap, setActiveBasemap] = useState('mola-color');
  const [overlays, setOverlays] = useState({
    'crism-minerals': true,
    'slope-hazards': true,
    'radiation-heat': false
  });

  // Waypoints for the Marswalk Traversal
  const [waypoints, setWaypoints] = useState([
    [18.380, 77.580],
    [18.405, 77.550],
    [18.421, 77.518]
  ]);

  const [totalDistanceKm, setTotalDistanceKm] = useState(0);

  // Persistence for explored routes
  const [pastRoutes, setPastRoutes] = useState(() => {
    try {
      const saved = localStorage.getItem('astramap_past_routes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('astramap_past_routes', JSON.stringify(pastRoutes));
  }, [pastRoutes]);

  // Astronaut Walk Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedPosition, setSimulatedPosition] = useState(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const simulationProgressRef = useRef(0);
  const simulationIntervalRef = useRef(null);

  // Sound and Export Modal State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Dynamic Environment State
  const [weatherCondition, setWeatherCondition] = useState('Clear');
  const [isNightMode, setIsNightMode] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);
  const [scienceScore, setScienceScore] = useState(0);

  // Gamification: NASA API Transmissions & User Profiles
  const [userProfile, setUserProfile] = useState(null);
  const [transmissionData, setTransmissionData] = useState(null);
  const lastReportedIndexRef = useRef(0);
  const isPausedRef = useRef(false);

  // Authentication State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const userProfileData = {
          uid: user.uid,
          name: user.displayName || 'Space Explorer',
          avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          email: user.email
        };
        setUserProfile(userProfileData);
        
        // Fetch existing score if any
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setScienceScore(docSnap.data().score || 0);
        } else {
          // Initialize user in db
          await setDoc(docRef, { ...userProfileData, score: 0 }, { merge: true });
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync score to Firestore when it changes
  useEffect(() => {
    if (userProfile && scienceScore > 0) {
      const docRef = doc(db, 'users', userProfile.uid);
      setDoc(docRef, { score: scienceScore }, { merge: true }).catch(err => {
        console.error("Failed to sync score:", err);
      });
    }
  }, [scienceScore, userProfile]);

  // Gamification: Auto-transition from 3D Orbit to 2D Surface
  const handleSurfaceZoom = (coords) => {
    setIs3DMode(false);
    setActiveSite({ 
      ...activeSite, 
      name: 'Custom Surface Sector',
      lat: coords.lat, 
      lng: coords.lng 
    });
    // Ensure 2D map centers on the new coordinates
    // We could add sound here later
  };

  // Field Science Checklist
  const [tasks, setTasks] = useState([
    {
      id: 'task-1',
      title: 'Airlock Depressurization & Egress',
      description: 'Verify spacesuit seal at 4.3 psi pure oxygen and check PLSS telemetry.',
      completed: true
    },
    {
      id: 'task-2',
      title: 'Neretva Delta Sediment Core Drill',
      description: 'Collect 10 cm rock core from smectite clay outcrop for organic carbon screening.',
      completed: false
    },
    {
      id: 'task-3',
      title: 'Multispectral Raman Surface Scan',
      description: 'Analyze laser-induced fluorescence for biosignature aromatics and amino acids.',
      completed: false
    },
    {
      id: 'task-4',
      title: 'Deploy Automated Weather Transponder',
      description: 'Anchor sonic anemometer and ground thermocouple into basalt bedrock.',
      completed: false
    }
  ]);

  // Recalculate total route distance whenever waypoints change
  useEffect(() => {
    if (waypoints.length < 2) {
      setTotalDistanceKm(0);
      return;
    }

    let dist = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      dist += calculateMarsDistance(
        waypoints[i][0],
        waypoints[i][1],
        waypoints[i + 1][0],
        waypoints[i + 1][1]
      );
    }
    setTotalDistanceKm(parseFloat(dist.toFixed(2)));
  }, [waypoints]);

  // Handle Marswalk Astronaut Simulation
  useEffect(() => {
    if (!isSimulating || waypoints.length < 2) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }

    // Reset progress if start
    simulationProgressRef.current = 0;
    lastReportedIndexRef.current = 0;

    simulationIntervalRef.current = setInterval(() => {
      // Pause if a transmission is open
      if (isPausedRef.current) return;

      simulationProgressRef.current += 0.01;

      if (simulationProgressRef.current >= waypoints.length - 1) {
        setIsSimulating(false);
        const completedRoute = [...waypoints];
        setPastRoutes(prev => [...prev, completedRoute]);
        
        marsAudio.playSuccessChime(); // Play success sound on finish!
        
        // Trigger final gamified anomaly for the End Point!
        isPausedRef.current = true;
        fetchRoverPhoto('perseverance', 1000 + (completedRoute.length - 1) * 10).then(photo => {
          if (photo) {
            setTransmissionData(photo);
            setScienceScore(prev => prev + 500); // Huge bonus for reaching the end!
          } else {
            isPausedRef.current = false;
          }
          setWaypoints([]); // Clear current waypoints so user can start a new route
        });
        
        return;
      }

      const currentIndex = Math.floor(simulationProgressRef.current);
      
      // Trigger gamified anomaly when hitting a new waypoint (except 0)
      if (currentIndex > lastReportedIndexRef.current) {
        lastReportedIndexRef.current = currentIndex;
        
        // Pause and fetch NASA anomaly!
        isPausedRef.current = true;
        marsAudio.playWaypointPing();
        fetchRoverPhoto('perseverance', 1000 + currentIndex * 10).then(photo => {
          if (photo) {
            setTransmissionData(photo);
            setScienceScore(prev => prev + 250); // Reward player!
          } else {
            isPausedRef.current = false;
          }
        });
      }

      const nextIndex = Math.min(currentIndex + 1, waypoints.length - 1);
      const segmentFraction = simulationProgressRef.current - currentIndex;

      const p1 = waypoints[currentIndex];
      const p2 = waypoints[nextIndex];

      if (p1 && p2) {
        const curLat = p1[0] + (p2[0] - p1[0]) * segmentFraction;
        const curLng = p1[1] + (p2[1] - p1[1]) * segmentFraction;
        setSimulatedPosition([parseFloat(curLat.toFixed(4)), parseFloat(curLng.toFixed(4))]);
        setSimulationProgress(simulationProgressRef.current);
      }
    }, 100);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isSimulating, waypoints]);

  // Audio Wind Intensity Effect
  useEffect(() => {
    if (soundEnabled) {
      marsAudio.setWindIntensity(weatherCondition === 'Dust Storm');
    }
  }, [weatherCondition, soundEnabled]);

  // Waypoint operations & Science calculation
  const handleAddWaypoint = (coords) => {
    setWaypoints(prev => [...prev, coords]);
    // Calculate science score increase (fake a boost for adding waypoints)
    setScienceScore(prev => prev + Math.floor(Math.random() * 15) + 5);
  };

  const handleRemoveWaypoint = (index) => {
    setWaypoints(prev => prev.filter((_, i) => i !== index));
    if (waypoints.length <= 1) {
      setScienceScore(0);
    }
  };

  const handleClearRoute = () => {
    setWaypoints([]);
    setIsSimulating(false);
    setSimulatedPosition(null);
  };

  const handleLoadPredefinedRoute = () => {
    if (activeSite.roverTrail && activeSite.roverTrail.length > 0) {
      setWaypoints([...activeSite.roverTrail]);
      marsAudio.playSuccessChime();
    }
  };

  const handleToggleOverlay = (overlayId) => {
    setOverlays(prev => ({
      ...prev,
      [overlayId]: !prev[overlayId]
    }));
  };

  const handleToggleTask = (taskId) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleToggleSound = () => {
    const isMuted = marsAudio.toggleMute();
    setSoundEnabled(!isMuted);
    return !isMuted;
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Night Mode Global Overlay Filter */}
      {isNightMode && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 10, 30, 0.25)', // Deep blue dark tint
          pointerEvents: 'none',
          zIndex: 998,
          mixBlendMode: 'multiply'
        }}></div>
      )}

      {/* HUD Scanline Overlay for Space Helmet feel */}
      <div className="hud-scanlines"></div>

      {/* Futuristic Navbar */}
      <Navbar
        activeSite={activeSite}
        onSelectSite={(site) => {
          setActiveSite(site);
          if (site.roverTrail) {
            setWaypoints([...site.roverTrail]);
          }
        }}
        waypointsCount={waypoints.length}
        onClearRoute={handleClearRoute}
        onLoadPredefinedRoute={handleLoadPredefinedRoute}
        onExportMissionPlan={() => setIsExportOpen(true)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(prev => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        weatherCondition={weatherCondition}
        onToggleWeather={() => setWeatherCondition(prev => prev === 'Clear' ? 'Dust Storm' : 'Clear')}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode(prev => !prev)}
        is3DMode={is3DMode}
        onToggle3DMode={() => setIs3DMode(prev => !prev)}
      />

      {/* Main Mission Control Workspace */}
      <div style={{
        flex: 1,
        display: 'flex',
        padding: '12px 16px',
        gap: '16px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Full-Screen Interactive Martian Map */}
        <div className="glass-panel" style={{
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          borderRadius: 'var(--border-radius-md)',
          position: 'relative',
          display: 'flex'
        }}>
          {is3DMode ? (
            <MarsMap3D
              waypoints={waypoints}
              pastRoutes={pastRoutes}
              onAddWaypoint={handleAddWaypoint}
              onRemoveWaypoint={handleRemoveWaypoint}
              activeSite={activeSite}
              weatherCondition={weatherCondition}
              isNightMode={isNightMode}
              onSurfaceZoom={handleSurfaceZoom}
            />
          ) : (
            <MarsMap
              activeBasemap={activeBasemap}
              overlays={overlays}
              waypoints={waypoints}
              pastRoutes={pastRoutes}
              onAddWaypoint={handleAddWaypoint}
              onRemoveWaypoint={handleRemoveWaypoint}
              activeSite={activeSite}
              simulatedPosition={simulatedPosition}
              weatherCondition={weatherCondition}
              isNightMode={isNightMode}
              is3DMode={false}
            />
          )}
        </div>

        {/* Mission Telemetry & Layer Control Sidebar */}
        <MissionSidebar
          activeBasemap={activeBasemap}
          onSelectBasemap={setActiveBasemap}
          overlays={overlays}
          onToggleOverlay={handleToggleOverlay}
          waypoints={waypoints}
          totalDistanceKm={totalDistanceKm}
          activeSite={activeSite}
          tasks={tasks}
          onToggleTask={handleToggleTask}
          weatherCondition={weatherCondition}
          isSimulating={isSimulating}
          simulationProgress={simulationProgress}
          scienceScore={scienceScore}
          userProfile={userProfile}
          onScanAtmosphere={() => setScienceScore(prev => prev + 50)}
        />
      </div>

      {/* NASA EVA Traversal Briefing Document Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        activeSite={activeSite}
        waypoints={waypoints}
        totalDistanceKm={totalDistanceKm}
        activeBasemap={activeBasemap}
      />
      
      <TransmissionModal 
        data={transmissionData} 
        onClose={() => {
          setTransmissionData(null);
          isPausedRef.current = false;
        }} 
      />

      {/* Gamification: Login Gateway */}
      {!userProfile && <LoginOverlay onLogin={(profile) => setUserProfile(profile)} />}
    </div>
  );
}
