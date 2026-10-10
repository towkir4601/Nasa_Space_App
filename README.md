# 🔴 AstraMap Mars
> **NASA Space Apps Challenge 2026** // Mission Category: *Planetary Science & Human Marswalk Surface Navigation*

[![NASA Mission Data](https://img.shields.io/badge/NASA%20Data-MOLA%20%7C%20CRISM%20%7C%20MEDA-ff5722)](https://mars.nasa.gov)
[![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20Leaflet%20%7C%20WebAudio-00f0ff)](https://vitejs.dev)
[![Status](https://img.shields.io/badge/Status-Mission%20Ready-00ff9d)](#)

---

## 🌟 Executive Summary & Challenge Solution

When the first human astronauts step onto the rust-red surface of Mars, navigation will mean the difference between life and death. Walking in a 0.38g gravitational field under extreme negative temperatures (-85°C to -14°C) with an 8-hour life-support tether requires far more than a standard map—it demands an **integrated, multi-mission intelligence dashboard**.

**AstraMap Mars** solves the NASA challenge by fusing decades of robotic planetary exploration data into an interactive, real-time EVA (Extravehicular Activity) mission control planner designed specifically for Martian surface explorers.

---

## 🛰️ NASA Science Mission Datasets Integrated

AstraMap Mars brings together data from premier NASA planetary science missions:

1. **MGS MOLA (Mars Global Surveyor - Mars Orbiter Laser Altimeter)**:
   - High-resolution topography, digital elevation models, and color shaded relief to calculate slope grades and terrain elevation changes.
2. **Viking Orbiter 1 & 2 (MDIM 2.1)**:
   - True-color global orthorectified visible spectrum photomosaic showing real surface features, dunes, and bedrock outcrops.
3. **MRO CRISM (Compact Reconnaissance Imaging Spectrometer for Mars)**:
   - Hydrated mineral distributions (phyllosilicates/smectite clays, carbonates, and hydrated silica) highlighting high-priority astrobiological sample caching targets.
4. **2001 Mars Odyssey THEMIS (Thermal Emission Imaging System)**:
   - Day/Night infrared thermal inertia maps to identify loose sand traps vs. solid traversable bedrock and subterranean lava tube skylights.
5. **Mars 2020 Perseverance (MEDA) & MSL Curiosity (REMS / RAD)**:
   - Live simulated environmental telemetry: surface pressure (Pascals), air & ground temperature, UV index, dust opacity ($\tau$), and cosmic ray radiation dosimeter readings ($\mu\text{Sv/hr}$).

---

## 🚀 Core Features & Innovations

- **Interactive Marswalk Waypoint Planner**:
  - Click anywhere on the Martian globe to plot astronaut waypoints.
  - Automatically calculates true Martian spherical surface distance ($R_{Mars} = 3,389.5\text{ km}$).
- **0.38g Life Support & Consumables Engine**:
  - Real-time oxygen ($O_2$) reserve depletion modeling based on distance and slope.
  - Suit battery and thermal heating power drain estimator.
  - Metabolic caloric burn calculation adjusted for reduced Martian gravity.
- **Historic NASA Rover Traverse Alignment**:
  - Direct overlay of historic rover paths (Perseverance & Ingenuity in Jezero Crater, Curiosity in Gale Crater).
- **Astronaut Audio HUD & Sound Synthesis**:
  - Pure native Web Audio API synthesizer generating astronaut radio squelch chirps, waypoint telemetry pings, and safety alerts.
- **One-Click NASA EVA Briefing Exporter**:
  - Formats a flight-certified mission clearance document detailing coordinate manifests, consumables budgets, and safety sign-offs ready to print or save to PDF.

---

## 💻 Local Setup & Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Launch Mission Control Dev Server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 🏆 NASA Space Apps Pitch Deck Structure (Judges Guide)

1. **The Hook (0:00 - 0:30)**:
   - "When humanity lands on Mars, who guides the astronauts' footsteps across unfamiliar craters?"
2. **The Problem (0:30 - 1:00)**:
   - Decades of NASA data exists in disconnected PDS archives. Astronauts on the surface need one single glass-panel HUD.
3. **The Solution - AstraMap Mars (1:00 - 2:00)**:
   - Live demo showing Jezero Crater, MOLA topography layer switch, CRISM clay discovery, and clicking waypoints to calculate real-time oxygen burn.
4. **Impact & Feasibility (2:00 - 2:40)**:
   - Zero external servers needed; runs in lightweight client browsers; deployable on lunar gateway or Martian habitat surface terminals.

