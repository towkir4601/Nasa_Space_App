import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { INITIAL_SCIENCE_TARGETS } from '../data/marsDatasets';

const REAL_MARS_SURFACE = 'https://upload.wikimedia.org/wikipedia/commons/4/46/Solarsystemscope_texture_2k_mars.jpg'; 
const MARS_BUMP_URL = '//unpkg.com/three-globe/example/img/earth-topology.png'; // Reliable bump map

export default function MarsMap3D({ 
  waypoints, 
  pastRoutes = [],
  onAddWaypoint, 
  onRemoveWaypoint,
  activeSite,
  weatherCondition,
  isNightMode,
  onSurfaceZoom
}) {
  const globeRef = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth - 320, // subtract sidebar width roughly
        height: window.innerHeight - 60 // subtract navbar
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configure initial globe rotation/position based on activeSite
  useEffect(() => {
    if (globeRef.current && activeSite) {
      globeRef.current.pointOfView({ lat: activeSite.lat, lng: activeSite.lng, altitude: 1.5 }, 2000);
    }
  }, [activeSite]);

  const hasZoomed = useRef(false);

  // Safe animation loop for custom objects & zoom tracking
  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      if (globeRef.current && !hasZoomed.current) {
        // Animate Dust Storm
        const customObj = globeRef.current.scene().children.find(c => c.name === 'dust-storm-particles');
        if (customObj) {
          customObj.rotation.y += 0.002;
          customObj.rotation.z += 0.001;
        }

        // Check camera altitude for Surface Transition
        const pov = globeRef.current.pointOfView();
        // react-globe.gl altitude is a relative distance from the surface. < 0.15 is very close.
        if (pov && pov.altitude < 0.15) {
          hasZoomed.current = true; // Prevent rapid-fire triggering
          globeRef.current.pointOfView({ ...pov, altitude: 0.5 }); // Pull back slightly for next time
          if (onSurfaceZoom) {
            onSurfaceZoom({ lat: pov.lat, lng: pov.lng });
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [onSurfaceZoom]);

  // Handle dynamic weather (Atmosphere changes)
  const isDustStorm = weatherCondition === 'Dust Storm';
  
  const atmosphereColor = isDustStorm ? '#ff3300' : (isNightMode ? '#1a233a' : '#c97e52');
  const atmosphereAltitude = isDustStorm ? 0.35 : 0.15;

  // Format waypoints for path rendering
  const pathData = useMemo(() => {
    const routes = [];
    if (waypoints.length > 1) {
      routes.push({
        path: waypoints.map(wp => [wp[0], wp[1], 0.01]),
        type: 'current'
      });
    }
    
    if (pastRoutes && pastRoutes.length > 0) {
      pastRoutes.forEach(r => {
        if (r.length > 1) {
          routes.push({
            path: r.map(wp => [wp[0], wp[1], 0.01]),
            type: 'past'
          });
        }
      });
    }
    return routes;
  }, [waypoints, pastRoutes]);

  // Combine science targets and waypoints for HTML markers
  const htmlMarkers = useMemo(() => {
    const scienceMarkers = INITIAL_SCIENCE_TARGETS.map(poi => ({
      lat: poi.lat,
      lng: poi.lng,
      type: 'science',
      data: poi
    }));

    const routeMarkers = waypoints.map((wp, i) => ({
      lat: wp[0],
      lng: wp[1],
      type: 'waypoint',
      index: i,
      isLast: i === waypoints.length - 1
    }));

    return [...scienceMarkers, ...routeMarkers];
  }, [waypoints]);

  // Render HTML element for markers
  const renderHtmlElement = (d) => {
    const el = document.createElement('div');
    
    if (d.type === 'science') {
      const poi = d.data;
      const isExtreme = poi.priority === 'CRITICAL';
      el.innerHTML = `
        <div style="
          width: 24px; height: 24px; 
          background: ${isExtreme ? 'rgba(255,51,102,0.2)' : 'rgba(0,255,157,0.2)'}; 
          border: 2px solid ${isExtreme ? '#ff3366' : '#00ff9d'}; 
          border-radius: 50%; 
          display: flex; justify-content: center; align-items: center;
          box-shadow: 0 0 15px ${isExtreme ? '#ff3366' : '#00ff9d'};
          cursor: pointer;
          animation: pulse-glow 2s infinite;
        ">
          <div style="width: 8px; height: 8px; background: #fff; border-radius: 50%;"></div>
        </div>
      `;
    } else if (d.type === 'waypoint') {
      el.innerHTML = `
        <div style="
          background: ${d.isLast ? '#ffb703' : '#00f0ff'};
          color: #000;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #fff;
          cursor: pointer;
        ">
          WP-${d.index + 1}
        </div>
      `;
      el.onclick = () => onRemoveWaypoint(d.index);
    }
    
    return el;
  };

  // Custom volumetric dust storm using Three.js Particles
  const customLayerData = useMemo(() => isDustStorm ? [1] : [], [isDustStorm]);
  const createDustParticles = () => {
    const particleCount = 12000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 101 + Math.random() * 15; 
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xff6600,
      size: 0.6,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geometry, material);
    points.name = 'dust-storm-particles'; // Used by animation loop
    return points;
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#05070c' }}>
      
      {/* 3D WebGL Globe */}
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl={REAL_MARS_SURFACE}
        bumpImageUrl={MARS_BUMP_URL}
        
        // Atmosphere
        atmosphereColor={atmosphereColor}
        atmosphereAltitude={atmosphereAltitude}
        
        // Background
        backgroundColor="#05070c"
        
        // Paths (Routes)
        pathsData={pathData}
        pathPoints="path"
        pathPointLat={p => p[0]}
        pathPointLng={p => p[1]}
        pathPointAlt={p => p[2]}
        pathColor={d => d.type === 'current' ? '#00f0ff' : '#475569'}
        pathDashLength={d => d.type === 'current' ? 0.01 : 0}
        pathDashGap={d => d.type === 'current' ? 0.004 : 0}
        pathDashAnimateTime={d => d.type === 'current' ? 10000 : 0}
        pathResolution={256}
        
        // HTML Markers (POIs & Waypoints)
        htmlElementsData={htmlMarkers}
        htmlElement={renderHtmlElement}
        
        // Custom 3D Objects (Dust Storm Particles)
        customLayerData={customLayerData}
        customThreeObject={createDustParticles}
        
        // Interaction
        onGlobeClick={(coords) => onAddWaypoint([coords.lat, coords.lng])}
      />
      
      {/* Helper Banner */}
      <div className="glass-panel" style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 500,
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        <div className="pulse-indicator" style={{ background: 'var(--cyan-telemetry)' }}></div>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--cyan-telemetry)', fontWeight: 600, letterSpacing: '0.5px' }}>
          FULL 3D MODE // CLICK SURFACE TO PLOT EVA WAYPOINTS
        </span>
      </div>

    </div>
  );
}
