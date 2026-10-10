import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MARS_BASEMAPS, INITIAL_SCIENCE_TARGETS } from '../data/marsDatasets';
import { marsAudio } from '../utils/audio';

// Custom Martian SVG Marker Icons
const createAstronautIcon = () => {
  return L.divIcon({
    className: 'astronaut-hud-marker',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px dashed #00f0ff;
          animation: spin 6s linear infinite;
        "></div>
        <div style="
          width: 24px;
          height: 24px;
          background: #00f0ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px #00f0ff;
          border: 2px solid #fff;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06070c" stroke-width="2.5">
            <circle cx="12" cy="7" r="4"/>
            <path d="M5.5 21v-3a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
};

const createWaypointIcon = (index, isLast) => {
  const bg = index === 0 ? '#00ff9d' : isLast ? '#ff5722' : '#00f0ff';
  const label = index === 0 ? 'START' : isLast ? 'END' : `WP-${index + 1}`;
  return L.divIcon({
    className: 'waypoint-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      ">
        <div style="
          background: rgba(6, 10, 18, 0.9);
          border: 1px solid ${bg};
          color: ${bg};
          font-family: var(--font-data);
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 3px;
          margin-bottom: 3px;
          white-space: nowrap;
          box-shadow: 0 0 8px ${bg}88;
        ">
          ${label}
        </div>
        <div style="
          width: 14px;
          height: 14px;
          background: ${bg};
          border: 2px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 12px ${bg};
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 36]
  });
};

const createPoiIcon = (priority) => {
  const color = priority.includes('ALPHA') ? '#00ff9d' : '#ffb703';
  return L.divIcon({
    className: 'poi-marker',
    html: `
      <div style="
        width: 26px;
        height: 26px;
        background: rgba(10, 15, 26, 0.85);
        border: 1.5px solid ${color};
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px ${color}66;
        cursor: pointer;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

export default function MarsMap({
  activeBasemap,
  overlays,
  waypoints,
  pastRoutes = [],
  onAddWaypoint,
  onRemoveWaypoint,
  activeSite,
  simulatedPosition,
  weatherCondition,
  isNightMode,
  is3DMode
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const roverTrailPolylineRef = useRef(null);
  const astronautMarkerRef = useRef(null);
  const overlaysLayerGroupRef = useRef(null);
  const poiLayerGroupRef = useRef(null);
  const pastRoutesLayerGroupRef = useRef(null);

  // Initialize Leaflet Map configured for Mars
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use EPSG:4326 for standard planetary cylindrical projections
    const map = L.map(mapContainerRef.current, {
      center: [activeSite.lat, activeSite.lng],
      zoom: activeSite.zoom,
      minZoom: 1,
      maxZoom: 12,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true
    });

    // Add Zoom Control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Click handler to plot Marswalk waypoints
    map.on('click', (e) => {
      marsAudio.playWaypointPing();
      onAddWaypoint([parseFloat(e.latlng.lat.toFixed(4)), parseFloat(e.latlng.lng.toFixed(4))]);
    });

    mapRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);
    overlaysLayerGroupRef.current = L.layerGroup().addTo(map);
    poiLayerGroupRef.current = L.layerGroup().addTo(map);
    pastRoutesLayerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap Layer
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const baseConfig = MARS_BASEMAPS.find(b => b.id === activeBasemap) || MARS_BASEMAPS[0];

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(baseConfig.url, {
      maxZoom: 12,
      maxNativeZoom: baseConfig.maxZoom,
      minZoom: baseConfig.minZoom,
      attribution: baseConfig.attribution,
      noWrap: false
    }).addTo(map);

  }, [activeBasemap]);

  // Center Map when active site changes
  useEffect(() => {
    if (!mapRef.current || !activeSite) return;
    mapRef.current.flyTo([activeSite.lat, activeSite.lng], activeSite.zoom, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [activeSite]);

  // Render Overlays (CRISM Minerals, Slope Hazards, Radiation)
  useEffect(() => {
    if (!mapRef.current || !overlaysLayerGroupRef.current) return;
    const group = overlaysLayerGroupRef.current;
    group.clearLayers();

    // 1. CRISM Hydrated Minerals Layer
    if (overlays['crism-minerals']) {
      // Add mineral deposit hotspots near Jezero and Gale
      const mineralSpots = [
        { lat: 18.421, lng: 77.518, radius: 24000, desc: 'Smectite Clay Fan' },
        { lat: 18.360, lng: 77.620, radius: 18000, desc: 'Carbonate Rim Unit' },
        { lat: -4.660, lng: 137.380, radius: 32000, desc: 'Sulfate & Clay Bed' }
      ];

      mineralSpots.forEach(s => {
        const circle = L.circle([s.lat, s.lng], {
          radius: s.radius,
          color: '#00ff9d',
          fillColor: '#00ff9d',
          fillOpacity: 0.25,
          weight: 1.5,
          dashArray: '4, 6'
        }).bindPopup(`
          <div style="font-family: var(--font-data);">
            <div style="color: #00ff9d; font-weight: 700;">CRISM MINERAL DETECT</div>
            <div style="font-size: 13px; color: #fff;">${s.desc}</div>
            <div style="font-size: 11px; color: #94a3b8;">High astrobiological preservation priority</div>
          </div>
        `);
        group.addLayer(circle);
      });
    }

    // 2. Slope Hazard Layer
    if (overlays['slope-hazards']) {
      const hazardZones = [
        { lat: 18.460, lng: 77.470, radius: 16000, desc: 'Delta Scarp Cliff (>24° slope)' },
        { lat: -4.750, lng: 137.330, radius: 22000, desc: 'Mount Sharp Ridge Boulder Field' }
      ];

      hazardZones.forEach(h => {
        const circle = L.circle([h.lat, h.lng], {
          radius: h.radius,
          color: '#ff3366',
          fillColor: '#ff3366',
          fillOpacity: 0.35,
          weight: 2,
          dashArray: '3, 5'
        }).bindPopup(`
          <div style="font-family: var(--font-data);">
            <div style="color: #ff3366; font-weight: 700;">TERRAIN HAZARD DETECT</div>
            <div style="font-size: 13px; color: #fff;">${h.desc}</div>
            <div style="font-size: 11px; color: #ff99aa;">EVA spacesuit traverse hazard: extreme slip risk</div>
          </div>
        `);
        group.addLayer(circle);
      });
    }

    // 3. Radiation Exposure Heat Map
    if (overlays['radiation-heat']) {
      const radZone = L.circle([activeSite.lat, activeSite.lng], {
        radius: 75000,
        color: '#ffb703',
        fillColor: '#ffb703',
        fillOpacity: 0.15,
        weight: 1.2,
        dashArray: '6, 6'
      }).bindPopup(`
        <div style="font-family: var(--font-data);">
          <div style="color: #ffb703; font-weight: 700;">COSMIC RADIATION DOSIMETRY</div>
          <div style="font-size: 12px; color: #fff;">Surface Dosage: 24.1 uSv/hr</div>
          <div style="font-size: 11px; color: #cbd5e1;">RAD Sensor confirmed: Safe for up to 8.5 hr EVA walk</div>
        </div>
      `);
      group.addLayer(radZone);
    }

    // 4. Subsurface Water/Ice Probability (Odyssey GRS)
    if (overlays['water-ice']) {
      const iceZones = [
        { lat: 18.410, lng: 77.500, radius: 28000, desc: 'High Probability Subsurface Ice Table' },
        { lat: -4.680, lng: 137.350, radius: 15000, desc: 'Hydrated Mineral Seep' }
      ];

      iceZones.forEach(h => {
        const polygon = L.circle([h.lat, h.lng], {
          radius: h.radius,
          color: '#00ccff',
          fillColor: '#00ccff',
          fillOpacity: 0.3,
          weight: 2,
          dashArray: '2, 8'
        }).bindPopup(`
          <div style="font-family: var(--font-data);">
            <div style="color: #00ccff; font-weight: 700;">ISRU WATER/ICE DETECTED</div>
            <div style="font-size: 13px; color: #fff;">${h.desc}</div>
            <div style="font-size: 11px; color: #94a3b8;">Odyssey GRS: Potential resource for human settlement</div>
          </div>
        `);
        group.addLayer(polygon);
      });
    }

    // 5. SHARAD Subsurface Radar Profile
    if (overlays['subsurface-radar']) {
      // Draw a line representing a radar track
      const radarTrack = L.polyline([
        [activeSite.lat + 0.1, activeSite.lng - 0.2],
        [activeSite.lat - 0.1, activeSite.lng + 0.2]
      ], {
        color: '#b366ff',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5'
      }).bindPopup(`
        <div style="font-family: var(--font-data);">
          <div style="color: #b366ff; font-weight: 700;">SHARAD RADAR PROFILE</div>
          <div style="font-size: 13px; color: #fff;">Subsurface Layering Detected</div>
          <div style="font-size: 11px; color: #d8b4fe;">Revealing buried sedimentary rocks up to 1km deep</div>
        </div>
      `);
      group.addLayer(radarTrack);
    }
  }, [overlays, activeSite]);

  // Render Science Points of Interest (POIs)
  useEffect(() => {
    if (!mapRef.current || !poiLayerGroupRef.current) return;
    const group = poiLayerGroupRef.current;
    group.clearLayers();

    INITIAL_SCIENCE_TARGETS.forEach(poi => {
      const marker = L.marker([poi.lat, poi.lng], {
        icon: createPoiIcon(poi.priority)
      }).bindPopup(`
        <div style="font-family: var(--font-body); width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-family: var(--font-data); font-size: 10px; color: var(--cyan-telemetry); font-weight: 700;">${poi.category}</span>
            <span style="font-family: var(--font-data); font-size: 10px; color: #00ff9d;">${poi.priority}</span>
          </div>
          <h4 style="font-family: var(--font-display); font-size: 13px; color: #fff; margin: 0 0 6px 0;">${poi.name}</h4>
          <p style="font-size: 11px; color: #cbd5e1; margin-bottom: 6px;">${poi.significance}</p>
          <div style="background: rgba(0, 240, 255, 0.08); padding: 5px 8px; border-radius: 4px; border: 1px solid rgba(0, 240, 255, 0.2); font-size: 10px; color: var(--cyan-telemetry);">
            <strong>Action:</strong> ${poi.recommendedAction}
          </div>
        </div>
      `);
      group.addLayer(marker);
    });
  }, []);

  // Render Historical Rover Trail for the active site
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (roverTrailPolylineRef.current) {
      map.removeLayer(roverTrailPolylineRef.current);
    }

    if (activeSite.roverTrail && activeSite.roverTrail.length > 0) {
      roverTrailPolylineRef.current = L.polyline(activeSite.roverTrail, {
        color: '#ffb703',
        weight: 2.5,
        dashArray: '6, 8',
        opacity: 0.8
      }).addTo(map);

      roverTrailPolylineRef.current.bindTooltip(`${activeSite.mission} Historic Traverse`, {
        permanent: false,
        direction: 'center',
        className: 'rover-path-tooltip'
      });
    }
  }, [activeSite]);

  // Render Past Explored Routes
  useEffect(() => {
    if (!mapRef.current || !pastRoutesLayerGroupRef.current) return;
    const group = pastRoutesLayerGroupRef.current;
    group.clearLayers();

    pastRoutes.forEach(route => {
      if (route.length < 2) return;
      const track = L.polyline(route, {
        color: '#475569', // Muted slate color
        weight: 3,
        opacity: 0.6,
        dashArray: '5, 10', // Dashed line to look like old tracks
        lineCap: 'round'
      }).bindPopup('<div style="font-family: var(--font-data); font-size: 11px; color: #cbd5e1;">PREVIOUSLY EXPLORED SECTOR</div>');
      group.addLayer(track);
    });
  }, [pastRoutes, activeSite]);

  // Render Interactive Route Waypoints & Polyline
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    const map = mapRef.current;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }

    // Add Waypoint Markers
    waypoints.forEach((wp, index) => {
      const isLast = index === waypoints.length - 1;
      const marker = L.marker([wp[0], wp[1]], {
        icon: createWaypointIcon(index, isLast)
      }).addTo(markersGroup);

      marker.bindPopup(`
        <div style="font-family: var(--font-data); text-align: center; padding: 4px;">
          <div style="color: var(--cyan-telemetry); font-weight: 700; font-size: 12px;">WAYPOINT ${index + 1}</div>
          <div style="color: #fff; font-size: 12px; margin: 2px 0;">Lat: ${wp[0]}° | Lng: ${wp[1]}°</div>
          <button 
            onclick="window.dispatchEvent(new CustomEvent('remove-waypoint', { detail: ${index} }))"
            style="
              margin-top: 6px;
              background: rgba(255, 51, 102, 0.15);
              border: 1px solid #ff3366;
              color: #ff3366;
              border-radius: 4px;
              padding: 3px 8px;
              font-size: 10px;
              cursor: pointer;
            "
          >
            DELETE WAYPOINT
          </button>
        </div>
      `);
    });

    // Draw Route Polyline
    if (waypoints.length > 1) {
      routePolylineRef.current = L.polyline(waypoints, {
        color: '#00f0ff',
        weight: 3.5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
    }
  }, [waypoints]);

  // Listen for custom delete-waypoint events from Leaflet popups
  useEffect(() => {
    const handleRemove = (e) => {
      onRemoveWaypoint(e.detail);
      marsAudio.playRadioChirp();
    };
    window.addEventListener('remove-waypoint', handleRemove);
    return () => window.removeEventListener('remove-waypoint', handleRemove);
  }, [onRemoveWaypoint]);

  // Render Simulated Astronaut Walker Icon
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (astronautMarkerRef.current) {
      map.removeLayer(astronautMarkerRef.current);
      astronautMarkerRef.current = null;
    }

    if (simulatedPosition) {
      astronautMarkerRef.current = L.marker([simulatedPosition[0], simulatedPosition[1]], {
        icon: createAstronautIcon(),
        zIndexOffset: 1000
      }).addTo(map);
    }
  }, [simulatedPosition]);

  return (
    <div 
      className={is3DMode ? 'hologram-container' : ''}
      style={{ position: 'relative', width: '100%', height: '100%', flex: 1 }}
    >
      {/* Map Element */}
      <div 
        id="mars-map-canvas"
        ref={mapContainerRef} 
        className={is3DMode ? 'map-3d-active' : 'map-2d-active'}
        style={{ 
          width: '100%', 
          height: '100%', 
          background: '#05070c',
          filter: isNightMode ? 'brightness(0.4) sepia(0.6) hue-rotate(180deg) saturate(1.5)' : 'none',
          transition: 'filter 2s ease'
        }}
      />

      {/* Holographic scanner that sweeps across the map in 3D mode */}
      {is3DMode && <div className="hologram-scanner"></div>}

      {/* Floating Map Reticle / Crosshair in Center */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 500,
        opacity: 0.35
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="14" fill="none" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3, 3" />
          <line x1="20" y1="2" x2="20" y2="10" stroke="#00f0ff" strokeWidth="1.5" />
          <line x1="20" y1="30" x2="20" y2="38" stroke="#00f0ff" strokeWidth="1.5" />
          <line x1="2" y1="20" x2="10" y2="20" stroke="#00f0ff" strokeWidth="1.5" />
          <line x1="30" y1="20" x2="38" y2="20" stroke="#00f0ff" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Dynamic Weather Overlay: Dust Storm */}
      {weatherCondition === 'Dust Storm' && (
        <div className="dust-storm-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 800,
          overflow: 'hidden'
        }}>
          {/* SVG Noise filter for dusty texture */}
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <filter id="dustNoise">
              <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="noise" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.5 0 0 0  0 0.2 0 0 0  0 0 0 0.6 0" in="noise" result="coloredNoise" />
              <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
            </filter>
          </svg>
          <div style={{
            width: '200%',
            height: '200%',
            background: 'rgba(210, 80, 20, 0.4)',
            filter: 'url(#dustNoise)',
            animation: 'dust-storm-flow 3s linear infinite',
            transform: 'translate(-25%, -25%)'
          }}></div>
        </div>
      )}

      {/* Bottom Map Helper Instruction Banner */}
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
          CLICK MARTIAN SURFACE TO PLOT EVA WAYPOINTS // {waypoints.length} WAYPOINTS ACTIVE
        </span>
      </div>
    </div>
  );
}
