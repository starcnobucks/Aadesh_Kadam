/**
 * Pure mathematical functions for the Celestial Web Audio Engine.
 * Enables deterministic testing of scroll velocity, pitch shifting,
 * filter cutoff modulation, and harmonic frequency generation.
 */

export interface PitchShiftOptions {
  maxUpCents?: number;       // Maximum pitch shift up in cents (default 500)
  maxDownCents?: number;     // Maximum pitch shift down in cents (default 300)
  velocityScale?: number;    // Velocity scaling coefficient (default 0.35)
}

/**
 * Calculates raw scroll velocity in pixels per millisecond.
 */
export function calculateScrollVelocity(
  currentScrollY: number,
  prevScrollY: number,
  deltaMs: number
): number {
  if (deltaMs <= 0) return 0;
  const deltaScroll = currentScrollY - prevScrollY;
  const velocity = deltaScroll / deltaMs;
  // Safety clamp against extreme tab-switch deltas
  return Math.max(-15, Math.min(15, velocity));
}

/**
 * Applies exponential smoothing (decay) to velocity to prevent audio clicking.
 */
export function smoothVelocity(
  currentSmooth: number,
  targetVelocity: number,
  smoothingFactor = 0.18
): number {
  const factor = Math.max(0.01, Math.min(1.0, smoothingFactor));
  return currentSmooth + (targetVelocity - currentSmooth) * factor;
}

/**
 * Maps smoothed velocity to pitch shift in cents (100 cents = 1 semitone).
 * Scrolling down (positive velocity) shifts pitch upwards into higher celestial resonance.
 * Scrolling up (negative velocity) shifts pitch slightly downwards.
 */
export function calculatePitchShift(
  velocity: number,
  options: PitchShiftOptions = {}
): number {
  const {
    maxUpCents = 500,
    maxDownCents = 300,
    velocityScale = 0.35,
  } = options;

  // Use a non-linear sigmoid-like response for musical feel
  if (velocity >= 0) {
    const normalized = Math.tanh(velocity * velocityScale);
    return normalized * maxUpCents;
  } else {
    const normalized = Math.tanh(Math.abs(velocity) * velocityScale);
    return -normalized * maxDownCents;
  }
}

/**
 * Converts pitch shift in cents to a frequency ratio multiplier.
 * ratio = 2^(cents / 1200)
 */
export function centsToFrequencyRatio(cents: number): number {
  return Math.pow(2, cents / 1200);
}

/**
 * Calculates dynamic low-pass filter cutoff based on scroll velocity and progression.
 * At rest, the filter is cozy and warm (e.g. 260Hz).
 * During scroll motion, the filter opens up to reveal celestial air and shimmers (up to ~2200Hz).
 */
export function calculateFilterCutoff(
  velocity: number,
  baseCutoff = 260,
  maxCutoff = 2200
): number {
  const absVel = Math.abs(velocity);
  const normalizedSpeed = Math.tanh(absVel * 0.4);
  return baseCutoff + (maxCutoff - baseCutoff) * normalizedSpeed;
}

/**
 * Calculates resonance (Q) based on scroll velocity.
 * Slight resonance boost during movement creates the feeling of travelling through a portal.
 */
export function calculateResonance(velocity: number, baseQ = 1.6, maxQ = 4.2): number {
  const absVel = Math.abs(velocity);
  const normalizedSpeed = Math.tanh(absVel * 0.3);
  return baseQ + (maxQ - baseQ) * normalizedSpeed;
}

/**
 * Generative harmonic chord structures based on voyage scroll progression (0.0 to 1.0).
 * Provides celestial chord evolutions across portfolio phases.
 */
export interface CelestialChord {
  phase: string;
  root: number;
  frequencies: number[];
  description: string;
}

export function getCelestialChordForProgress(progress: number): CelestialChord {
  const p = Math.max(0, Math.min(1, progress));

  if (p < 0.25) {
    // Phase 1: Portal / Threshold — Deep mystical A-minor cosmic drone
    return {
      phase: 'portal',
      root: 55, // A1
      frequencies: [55, 110, 164.81, 220, 261.63, 329.63], // A1, A2, E3, A3, C4, E4
      description: 'Deep A-minor mystical gateway drone',
    };
  } else if (p < 0.50) {
    // Phase 2: About / Manifesto — A sus2 / Celestial add9 (Ethereal wonder)
    return {
      phase: 'threshold',
      root: 55, // A1
      frequencies: [55, 110, 164.81, 220, 246.94, 329.63, 440], // A1, A2, E3, A3, B3, E4, A4
      description: 'A-sus2 ethereal open threshold',
    };
  } else if (p < 0.78) {
    // Phase 3: Projects / Technical — D-major 9 / Cosmic expanse
    return {
      phase: 'deep_space',
      root: 73.42, // D2
      frequencies: [73.42, 110, 146.83, 185.00, 220, 277.18, 329.63], // D2, A2, D3, F#3, A3, C#4, E4
      description: 'D-major 9 celestial expanse',
    };
  } else {
    // Phase 4: Axon / Contact — Crystalline F#m11 resonance
    return {
      phase: 'axon_contact',
      root: 46.25, // F#1
      frequencies: [46.25, 92.50, 138.59, 185.00, 220, 277.18, 370.0], // F#1, F#2, C#3, F#3, A3, C#4, F#4
      description: 'Crystalline interactive fluid harmony',
    };
  }
}
