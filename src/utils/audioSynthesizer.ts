/**
 * Procedural Web Audio API Celestial Ambient & Generative Hum Engine.
 * 
 * Features:
 * - 100% Native Web Audio API: Zero external MP3 assets, zero dead audio states.
 * - Multi-oscillator celestial chord cluster with warm sub-drone and ethereal shimmer.
 * - Real-time scroll velocity tracking with exponential damping.
 * - Dynamic pitch-shifting linked to scroll velocity (bends up as velocity increases, relaxes on halt).
 * - Velocity-reactive resonant low-pass filter (opens celestial breath/harmonics during rapid travel).
 * - Generative micro-overtone chimes when transitioning between cosmic voyage phases.
 */

import {
  calculateScrollVelocity,
  smoothVelocity,
  calculatePitchShift,
  calculateFilterCutoff,
  calculateResonance,
  getCelestialChordForProgress,
  CelestialChord,
} from './celestialAudioMath';

interface HarmonicOscillatorNode {
  osc: OscillatorNode;
  baseFreq: number;
  baseDetune: number;
  gain: GainNode;
  panner?: StereoPannerNode | null;
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
}

export class CelestialAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private dynamicFilter: BiquadFilterNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private subGain: GainNode | null = null;
  private subFilter: BiquadFilterNode | null = null;
  private shimmerGain: GainNode | null = null;
  private shimmerFilter: BiquadFilterNode | null = null;
  private shimmerLfo: OscillatorNode | null = null;

  private harmonicVoices: HarmonicOscillatorNode[] = [];
  private isPlaying = false;
  private isInitialized = false;

  // Scroll tracking state
  private lastScrollY = 0;
  private lastScrollTime = 0;
  private currentSmoothVelocity = 0;
  private lastPhaseName = 'portal';
  private currentProgress = 0;
  private animationFrameId: number | null = null;

  public init() {
    if (this.isInitialized && this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Dynamic reactive filter for celestial breath
    this.dynamicFilter = this.ctx.createBiquadFilter();
    this.dynamicFilter.type = 'lowpass';
    this.dynamicFilter.frequency.setValueAtTime(260, this.ctx.currentTime);
    this.dynamicFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);
    this.dynamicFilter.connect(this.masterGain);

    this.isInitialized = true;
    this.startVelocityLoop();
  }

  public toggle(): boolean {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.masterGain) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.fadeOut();
      this.isPlaying = false;
    } else {
      this.fadeIn();
      this.isPlaying = true;
    }
    return this.isPlaying;
  }

  public start(): boolean {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.masterGain) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.isPlaying) {
      this.fadeIn();
      this.isPlaying = true;
    }
    return true;
  }

  public stop(): boolean {
    if (this.isPlaying) {
      this.fadeOut();
      this.isPlaying = false;
    }
    return false;
  }

  public getState(): boolean {
    return this.isPlaying;
  }

  /**
   * Called on scroll events from App.tsx or window listener.
   * Updates velocity and recalculates dynamic pitch and filter sweeps.
   */
  public updateScroll(scrollY: number, progress = 0) {
    const now = performance.now();
    this.currentProgress = Math.max(0, Math.min(1, progress));

    if (this.lastScrollTime === 0) {
      this.lastScrollY = scrollY;
      this.lastScrollTime = now;
      return;
    }

    const deltaMs = now - this.lastScrollTime;
    if (deltaMs >= 8) {
      const rawVelocity = calculateScrollVelocity(scrollY, this.lastScrollY, deltaMs);
      this.currentSmoothVelocity = smoothVelocity(this.currentSmoothVelocity, rawVelocity, 0.28);
      this.lastScrollY = scrollY;
      this.lastScrollTime = now;

      // Apply pitch shift and filter cutoff updates if playing
      this.applyVelocityModulations();
    }

    // Check for celestial phase chord transitions
    this.checkPhaseProgression();
  }

  /**
   * Continuous animation frame loop to ensure smooth decay back to rest
   * when scrolling ceases.
   */
  private startVelocityLoop() {
    const tick = () => {
      const now = performance.now();
      const timeSinceLastScroll = now - this.lastScrollTime;

      // If user hasn't scrolled for over 50ms, decay velocity smoothly toward zero
      if (timeSinceLastScroll > 50 && Math.abs(this.currentSmoothVelocity) > 0.001) {
        this.currentSmoothVelocity = smoothVelocity(this.currentSmoothVelocity, 0, 0.12);
        this.applyVelocityModulations();
      }

      this.animationFrameId = requestAnimationFrame(tick);
    };

    if (typeof window !== 'undefined') {
      this.animationFrameId = requestAnimationFrame(tick);
    }
  }

  private applyVelocityModulations() {
    if (!this.ctx || !this.isPlaying || !this.dynamicFilter) return;

    const t = this.ctx.currentTime;
    const vel = this.currentSmoothVelocity;

    // 1. Calculate dynamic pitch shift in cents based on velocity
    const pitchShiftCents = calculatePitchShift(vel, {
      maxUpCents: 450,
      maxDownCents: 260,
      velocityScale: 0.38,
    });

    // 2. Modulate oscillator detune
    this.harmonicVoices.forEach((voice) => {
      try {
        const targetDetune = voice.baseDetune + pitchShiftCents;
        voice.osc.detune.setTargetAtTime(targetDetune, t, 0.06);
      } catch {
        // Safe fallback
      }
    });

    // 3. Sub-bass detune (subtler shift to maintain anchoring foundation)
    if (this.subOsc) {
      try {
        this.subOsc.detune.setTargetAtTime(pitchShiftCents * 0.45, t, 0.08);
      } catch {
        // Safe fallback
      }
    }

    // 4. Modulate dynamic lowpass filter cutoff and resonance
    const targetCutoff = calculateFilterCutoff(vel, 240, 2100);
    const targetQ = calculateResonance(vel, 1.6, 3.8);

    try {
      this.dynamicFilter.frequency.setTargetAtTime(targetCutoff, t, 0.07);
      this.dynamicFilter.Q.setTargetAtTime(targetQ, t, 0.07);
    } catch {
      // Safe fallback
    }

    // 5. If velocity is high, trigger subtle celestial star-dust sparkle
    if (Math.abs(vel) > 3.5 && Math.random() < 0.15) {
      this.triggerCelestialChime(this.currentProgress);
    }
  }

  private checkPhaseProgression() {
    const chord = getCelestialChordForProgress(this.currentProgress);
    if (chord.phase !== this.lastPhaseName) {
      this.lastPhaseName = chord.phase;
      this.morphToCelestialChord(chord);
      // Delicate celestial harmonic chime marking entry to new realm
      if (this.isPlaying) {
        this.triggerCelestialChime(this.currentProgress, true);
      }
    }
  }

  private morphToCelestialChord(chord: CelestialChord) {
    if (!this.ctx || !this.isPlaying) return;
    const t = this.ctx.currentTime;

    // Smoothly retarget voice frequencies to new chord palette
    this.harmonicVoices.forEach((voice, idx) => {
      const newFreq = chord.frequencies[idx % chord.frequencies.length];
      voice.baseFreq = newFreq;
      try {
        voice.osc.frequency.setTargetAtTime(newFreq, t, 1.2);
      } catch {
        // Safe fallback
      }
    });

    // Smoothly retarget sub bass
    if (this.subOsc) {
      try {
        this.subOsc.frequency.setTargetAtTime(chord.root, t, 1.5);
      } catch {
        // Safe fallback
      }
    }
  }

  /**
   * Generates a crystalline, ethereal sine ping that decays exponentially.
   */
  private triggerCelestialChime(progress: number, isPhaseTransition = false) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    try {
      const t = this.ctx.currentTime;
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      const chimePan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      // Select celestial harmonic overtone (A4, C#5, E5, G#5, B5)
      const celestialPings = [880, 1108.73, 1318.51, 1661.22, 1975.53];
      const noteIdx = Math.floor(Math.random() * celestialPings.length);
      const freq = celestialPings[noteIdx];

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, t);

      // Pitch glide up slightly for ethereal upward starlight feel
      chimeOsc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + 0.9);

      const maxGain = isPhaseTransition ? 0.045 : 0.025;
      chimeGain.gain.setValueAtTime(0.0001, t);
      chimeGain.gain.exponentialRampToValueAtTime(maxGain, t + 0.08);
      chimeGain.gain.exponentialRampToValueAtTime(0.00001, t + (isPhaseTransition ? 2.4 : 1.4));

      if (chimePan) {
        chimePan.pan.setValueAtTime((Math.random() - 0.5) * 1.2, t);
        chimeOsc.connect(chimeGain);
        chimeGain.connect(chimePan);
        chimePan.connect(this.masterGain);
      } else {
        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.masterGain);
      }

      chimeOsc.start(t);
      chimeOsc.stop(t + (isPhaseTransition ? 2.5 : 1.5));
    } catch {
      // Safe fallback
    }
  }

  private fadeIn() {
    if (!this.ctx || !this.masterGain) return;
    this.buildCelestialGraph();

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    // Smooth celestial fade-in over 2.0s to comfortable atmospheric volume (0.22)
    this.masterGain.gain.linearRampToValueAtTime(0.22, now + 2.0);
  }

  private fadeOut() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);

    setTimeout(() => {
      this.cleanupGraph();
    }, 1300);
  }

  private buildCelestialGraph() {
    if (!this.ctx || !this.masterGain || !this.dynamicFilter) return;
    this.cleanupGraph();

    const t = this.ctx.currentTime;
    const initialChord = getCelestialChordForProgress(this.currentProgress);

    // 1. Anchored Sub-Bass Drone (Pure warmth)
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(initialChord.root, t);

    this.subFilter = this.ctx.createBiquadFilter();
    this.subFilter.type = 'lowpass';
    this.subFilter.frequency.setValueAtTime(125, t);

    this.subGain = this.ctx.createGain();
    this.subGain.gain.setValueAtTime(0.36, t);

    this.subOsc.connect(this.subFilter);
    this.subFilter.connect(this.subGain);
    this.subGain.connect(this.masterGain);
    this.subOsc.start(t);

    // 2. Harmonic Celestial Cluster (Multi-layered detuned voices)
    this.harmonicVoices = [];
    const panPositions = [-0.65, -0.3, 0.0, 0.3, 0.65, -0.15];

    initialChord.frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.dynamicFilter) return;

      const osc = this.ctx.createOscillator();
      // Alternate sine and gentle triangle for rich overtone complexity
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      // Fine base micro-detuning for organic chorusing
      const baseDetune = (idx % 2 === 0 ? 1 : -1) * (idx * 2.2);
      osc.detune.setValueAtTime(baseDetune, t);

      // Subtle slow LFO modulating detune
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.06 + idx * 0.03, t);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(2.2, t);
      lfo.connect(osc.detune);
      lfo.start(t);

      // Voice individual gain node
      const voiceGain = this.ctx.createGain();
      // High frequencies have softer individual gain for a smooth top-end
      const gainAmount = 0.09 / Math.sqrt(idx + 1);
      voiceGain.gain.setValueAtTime(gainAmount, t);

      // Spatial stereo panner
      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (pan) {
        const panPos = panPositions[idx % panPositions.length];
        pan.pan.setValueAtTime(panPos, t);
        osc.connect(voiceGain);
        voiceGain.connect(pan);
        pan.connect(this.dynamicFilter);
      } else {
        osc.connect(voiceGain);
        voiceGain.connect(this.dynamicFilter);
      }

      osc.start(t);

      this.harmonicVoices.push({
        osc,
        baseFreq: freq,
        baseDetune,
        gain: voiceGain,
        panner: pan,
        lfo,
        lfoGain,
      });
    });

    // 3. Ethereal Shimmer Layer (High resonant bandpass filtered starlight)
    this.shimmerFilter = this.ctx.createBiquadFilter();
    this.shimmerFilter.type = 'bandpass';
    this.shimmerFilter.frequency.setValueAtTime(2400, t);
    this.shimmerFilter.Q.setValueAtTime(3.5, t);

    this.shimmerGain = this.ctx.createGain();
    this.shimmerGain.gain.setValueAtTime(0.015, t);

    // Modulate shimmer with an ultra-slow LFO (0.04 Hz)
    this.shimmerLfo = this.ctx.createOscillator();
    this.shimmerLfo.frequency.setValueAtTime(0.04, t);
    const shimmerLfoGain = this.ctx.createGain();
    shimmerLfoGain.gain.setValueAtTime(0.012, t);
    this.shimmerLfo.connect(shimmerLfoGain);
    shimmerLfoGain.connect(this.shimmerGain.gain);
    this.shimmerLfo.start(t);

    // Connect voices through shimmer filter to master
    this.harmonicVoices.slice(2).forEach((v) => {
      v.osc.connect(this.shimmerFilter!);
    });
    this.shimmerFilter.connect(this.shimmerGain);
    this.shimmerGain.connect(this.masterGain);
  }

  private cleanupGraph() {
    // Stop and disconnect harmonic voices
    this.harmonicVoices.forEach((v) => {
      try {
        v.osc.stop();
        v.osc.disconnect();
        v.lfo?.stop();
        v.lfo?.disconnect();
        v.lfoGain?.disconnect();
        v.gain.disconnect();
        v.panner?.disconnect();
      } catch {
        // Safe cleanup
      }
    });
    this.harmonicVoices = [];

    // Stop sub drone
    if (this.subOsc) {
      try {
        this.subOsc.stop();
        this.subOsc.disconnect();
        this.subFilter?.disconnect();
        this.subGain?.disconnect();
      } catch {
        // Safe cleanup
      }
      this.subOsc = null;
      this.subFilter = null;
      this.subGain = null;
    }

    // Stop shimmer
    if (this.shimmerLfo) {
      try {
        this.shimmerLfo.stop();
        this.shimmerLfo.disconnect();
        this.shimmerFilter?.disconnect();
        this.shimmerGain?.disconnect();
      } catch {
        // Safe cleanup
      }
      this.shimmerLfo = null;
      this.shimmerFilter = null;
      this.shimmerGain = null;
    }
  }

  public destroy() {
    this.stop();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // Safe cleanup
      }
      this.ctx = null;
    }
    this.isInitialized = false;
  }
}

export const celestialAudio = new CelestialAudioEngine();
// Backwards-compatible alias for existing imports
export const cosmicAudio = celestialAudio;
