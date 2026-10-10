// ==========================================================================
// ASTRAMAP MARS // SCIENTIFIC MISSION DATA & SATELLITE LAYERS
// Sourced from NASA PDS, USGS Astrogeology, MRO CRISM, and MGS MOLA
// ==========================================================================

export const MARS_BASEMAPS = [
  {
    id: 'opm-shaded',
    name: 'Mars Topography (3D Shaded Relief)',
    mission: 'MGS MOLA & HRSC',
    description: 'High-precision shaded relief digital elevation model. Makes craters and mountains look highly realistic in 2.5D.',
    url: 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-shaded-v0-1/all/{z}/{x}/{y}.png',
    attribution: 'NASA / MGS MOLA / USGS / OpenPlanetary',
    maxZoom: 7,
    minZoom: 1,
    tag: 'ELEVATION'
  },
  {
    id: 'mola-color',
    name: 'MGS MOLA Topography (Color Shaded)',
    mission: 'Mars Global Surveyor (MGS) - MOLA',
    description: 'High-precision laser altimeter elevation data showing relief from the deepest hellas basin to highest Olympus Mons summit.',
    url: 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png',
    attribution: 'NASA / MGS MOLA / USGS / OpenPlanetary',
    maxZoom: 7,
    minZoom: 1,
    tag: 'COLOR'
  },
  {
    id: 'viking-visible',
    name: 'Viking MDIM 2.1 (Global Natural Albedo)',
    mission: 'Viking Orbiter 1 & 2',
    description: 'Global orthorectified visible spectrum photomosaic showing true Martian surface coloration, dust plains, and dark basalt dunes.',
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    attribution: 'NASA / JPL / USGS Astrogeology',
    maxZoom: 7,
    minZoom: 1,
    tag: 'VISIBLE'
  },
  {
    id: 'themis-ir',
    name: '2001 Mars Odyssey THEMIS (Day Infrared)',
    mission: '2001 Mars Odyssey - Thermal Emission Imaging System',
    description: 'Thermal inertia mosaic mapping surface temperature differences to distinguish loose sand from bedrock and safe rover ground.',
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_THEMIS_IR_Day_global_100m_v12/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    attribution: 'NASA / JPL / ASU THEMIS Team',
    maxZoom: 7,
    minZoom: 1,
    tag: 'THERMAL'
  }
];

export const MARS_OVERLAYS = [
  {
    id: 'crism-minerals',
    name: 'CRISM Hydrated Minerals & Clays',
    mission: 'Mars Reconnaissance Orbiter (MRO) - CRISM',
    description: 'Spectrometer data highlights phyllosilicates (smectite clays), hydrated silica, and carbonates indicative of ancient habitable aqueous environments.',
    color: '#00ff9d',
    opacity: 0.75,
    tag: 'ASTROBIOLOGY'
  },
  {
    id: 'slope-hazards',
    name: 'Slope & Rock Hazard Safety Mask',
    mission: 'HiRISE & MOLA Combined Digital Elevation Models',
    description: 'Grades slopes >18° as severe slip hazards for EVA spacesuits and identifies high boulder density zones.',
    color: '#ff3366',
    opacity: 0.65,
    tag: 'SAFETY'
  },
  {
    id: 'radiation-heat',
    name: 'Surface Cosmic Ray & Solar UV Exposure',
    mission: 'Curiosity RAD & InSight TWINS',
    description: 'Surface radiation model mapping dose rates in uSv/hr depending on atmospheric shielding thickness and terrain shadow.',
    color: '#ffb703',
    opacity: 0.6,
    tag: 'ENVIRONMENT'
  },
  {
    id: 'water-ice',
    name: 'Subsurface Water/Ice Probability',
    mission: 'Odyssey GRS & Phoenix Lander',
    description: 'Hydrogen abundance proxy indicating shallow subsurface ice tables essential for ISRU (In-Situ Resource Utilization).',
    color: '#00ccff',
    opacity: 0.65,
    tag: 'RESOURCES'
  },
  {
    id: 'subsurface-radar',
    name: 'SHARAD Subsurface Radar Profile',
    mission: 'Mars Reconnaissance Orbiter (MRO) - SHARAD',
    description: 'Radar sounding data revealing buried craters, sedimentary layering, and potential underground lava tubes.',
    color: '#b366ff',
    opacity: 0.7,
    tag: 'GEOLOGY'
  }
];

export const FAMOUS_LANDING_SITES = [
  {
    id: 'jezero',
    name: 'Jezero Crater Delta',
    mission: 'Mars 2020 Perseverance & Ingenuity',
    lat: 18.38,
    lng: 77.58,
    zoom: 6,
    elevation: -2500, // meters below datum
    solDate: 1422,
    geology: 'Fan-delta sediments, igneous floor, olivine-rich cumulate, hydrated clays',
    safetyRating: 'MODERATE - Scarp cliffs along delta front',
    scienceGoal: 'Biosignature search & sample return caching',
    description: 'An ancient open-basin lake fed by Neretva Vallis, preserving layered mudstones rich in organic carbon preservation potential.',
    roverTrail: [
      [18.380, 77.580],
      [18.385, 77.565],
      [18.402, 77.540],
      [18.421, 77.518],
      [18.445, 77.495],
      [18.460, 77.480]
    ]
  },
  {
    id: 'gale',
    name: 'Gale Crater & Mount Sharp (Aeolis Mons)',
    mission: 'Mars Science Laboratory (Curiosity)',
    lat: -4.59,
    lng: 137.44,
    zoom: 6,
    elevation: -4500,
    solDate: 4320,
    geology: 'Layered sulfate salts, hematite ridge, clay-bearing unit',
    safetyRating: 'CAUTION - Sharp ventifact rocks (gator-skin terrain)',
    scienceGoal: 'Past habitability & groundwater transition history',
    description: 'A 154 km wide crater featuring a central 5.5 km tall mound recording millions of years of Martian climate transition.',
    roverTrail: [
      [-4.590, 137.440],
      [-4.620, 137.420],
      [-4.660, 137.380],
      [-4.710, 137.360],
      [-4.745, 137.340]
    ]
  },
  {
    id: 'olympus',
    name: 'Olympus Mons Caldera & Basalt Plains',
    mission: 'Human Exploratory Expedition 1 (Proposed)',
    lat: 18.65,
    lng: -133.8,
    zoom: 5,
    elevation: 21287,
    solDate: 1,
    geology: 'Massive tholeiitic basalt lava tubes, collapsed calderas, lava flows',
    safetyRating: 'EXTREME - High altitude (near-vacuum), sheer 8km scarp',
    scienceGoal: 'Deep mantle vulcanism & potential subsurface lava tube shelter',
    description: 'The largest planetary shield volcano in the solar system, towering 22 km above surrounding plains.',
    roverTrail: [
      [18.65, -133.80],
      [18.72, -133.72],
      [18.80, -133.60]
    ]
  },
  {
    id: 'valles-marineris',
    name: 'Valles Marineris (Melas Chasma)',
    mission: 'Human EVA Target Site B',
    lat: -9.8,
    lng: -76.4,
    zoom: 5,
    elevation: -7000,
    solDate: 1,
    geology: 'Wall rock stratigraphy, recurring slope lineae (RSL), landslide deposits',
    safetyRating: 'EXTREME - Deep vertical canyons, rockfalls',
    scienceGoal: 'Internal crustal cross-section & active water-vapor seeps',
    description: 'Grand canyon system extending over 4,000 km, plunging up to 7 km deep into the Martian bedrock.',
    roverTrail: [
      [-9.80, -76.40],
      [-9.88, -76.32],
      [-9.95, -76.20]
    ]
  }
];

export const INITIAL_SCIENCE_TARGETS = [
  {
    id: 'poi-1',
    name: 'Hydrated Clay Outcrop (Smectite)',
    category: 'Astrobiology Target',
    lat: 18.421,
    lng: 77.518,
    missionSource: 'MRO CRISM FRT0000B24C',
    priority: 'ALPHA (High)',
    recommendedAction: 'Extract 15cm core sample with sterile rotary drill',
    significance: 'Preserves microfossils and organic macromolecules under protective clay matrices.'
  },
  {
    id: 'poi-2',
    name: 'Olivine-rich Igneous Bedrock',
    category: 'Volcanic Chronology',
    lat: 18.395,
    lng: 77.550,
    missionSource: 'Perseverance PIXL & SuperCam',
    priority: 'BETA (Medium)',
    recommendedAction: 'X-ray fluorescence elemental scan + Raman spectroscopy',
    significance: 'Direct radiometric dating of the crater floor emplacement.'
  },
  {
    id: 'poi-3',
    name: 'Subsurface Lava Tube Skylight',
    category: 'Habitat Exploration',
    lat: 18.72,
    lng: -133.72,
    missionSource: 'THEMIS Night-IR Thermal Cavity Detection',
    priority: 'ALPHA (High)',
    recommendedAction: 'Deploy tethered lidar probe to map subterranean volume',
    significance: 'Natural radiation shelter shielded from cosmic rays, viable for permanent human base.'
  },
  {
    id: 'poi-4',
    name: 'Sulfate Vein Complex',
    category: 'Hydrology Record',
    lat: -4.660,
    lng: 137.380,
    missionSource: 'Curiosity ChemCam & Mastcam-Z',
    priority: 'GAMMA (Routine)',
    recommendedAction: 'Ablate dust with gas puffer; photograph crystal structure',
    significance: 'Evidence of late-stage acidic groundwater evaporation cycles.'
  }
];

export const LIVE_TELEMETRY = {
  sol: 1422,
  earthDate: '2026-10-06 UTC',
  localMarsTime: '14:26:08 LMST',
  lsDegree: '214.2° (Mars Southern Spring)',
  weather: {
    tempMax: -14.2, // Celsius
    tempMin: -82.6,
    pressure: 748, // Pascals
    windSpeed: 8.4, // m/s
    windDir: 'ENE (68°)',
    uvIndex: 'High (Solar Noon Peak)',
    dustOpticalDepth: 0.42, // tau
    radiationDose: '23.8 uSv/hr (Within EVA Safety Margins)'
  },
  lifeSupportLimits: {
    maxEvaHours: 8.0,
    oxygenBurnPerKmWalk: 24.5, // Liters
    calorieBurnPerHourWalk: 380, // kcal (0.38g gravity accounted)
    suitBatteryDrainPerHour: 11.2 // %
  }
};
