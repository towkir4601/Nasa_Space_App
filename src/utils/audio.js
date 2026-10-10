// ==========================================================================
// ASTRAMAP MARS // WEB AUDIO SYNTHESIZER FOR ASTRONAUT HUD & TELEMETRY
// Native Web Audio API - No external audio assets required!
// ==========================================================================

class MarsAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.windNode = null;
    this.windGain = null;
    this.isStorm = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.windGain) {
      this.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    } else if (!this.muted && this.windGain) {
      this.windGain.gain.setTargetAtTime(this.isStorm ? 0.6 : 0.1, this.ctx.currentTime, 0.5);
    }
    return this.muted;
  }

  // Ambient Martian Wind Noise
  startAmbientWind() {
    if (this.windNode || this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Create a buffer of white noise
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.windNode = this.ctx.createBufferSource();
    this.windNode.buffer = buffer;
    this.windNode.loop = true;

    // Filter to make it sound like low rumbling wind
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Low rumble

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = this.isStorm ? 0.6 : 0.1;

    this.windNode.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.ctx.destination);

    this.windNode.start();
  }

  setWindIntensity(isStorm) {
    this.isStorm = isStorm;
    if (this.windGain && !this.muted) {
      this.windGain.gain.setTargetAtTime(isStorm ? 0.6 : 0.1, this.ctx.currentTime, 2.0); // 2 second fade
    }
    if (!this.windNode && !this.muted) {
      this.startAmbientWind();
    }
  }

  // Astronaut Radio Click / PTT chirp
  playRadioChirp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Waypoint Plot Confirmation Ping
  playWaypointPing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.setValueAtTime(987.77, now + 0.07); // B5

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Hazard Warning Siren
  playHazardAlarm() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + i * 0.14;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, start);
      osc.frequency.linearRampToValueAtTime(440, start + 0.1);

      gain.gain.setValueAtTime(0.09, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.12);
    }
  }

  // Mission Clearance Success Chime
  playSuccessChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.35);
    });
  }
}

export const marsAudio = new MarsAudioSynthesizer();
