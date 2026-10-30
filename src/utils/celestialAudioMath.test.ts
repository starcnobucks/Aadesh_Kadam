import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScrollVelocity,
  smoothVelocity,
  calculatePitchShift,
  centsToFrequencyRatio,
  calculateFilterCutoff,
  calculateResonance,
  getCelestialChordForProgress,
} from './celestialAudioMath';

test('calculateScrollVelocity correctly handles forward, backward, zero, and boundary delta', () => {
  // 100px in 50ms = 2 px/ms forward
  assert.equal(calculateScrollVelocity(100, 0, 50), 2);
  // -150px in 50ms = -3 px/ms backward
  assert.equal(calculateScrollVelocity(0, 150, 50), -3);
  // zero time delta returns 0 (prevents division by zero)
  assert.equal(calculateScrollVelocity(100, 0, 0), 0);
  assert.equal(calculateScrollVelocity(100, 0, -10), 0);
  // extreme delta is safely clamped to [-15, 15]
  assert.equal(calculateScrollVelocity(50000, 0, 16), 15);
  assert.equal(calculateScrollVelocity(0, 50000, 16), -15);
});

test('smoothVelocity converges towards target with exponential smoothing factor', () => {
  let smooth = 0;
  const target = 4.0;
  // Step 1
  smooth = smoothVelocity(smooth, target, 0.2);
  assert.ok(smooth > 0 && smooth < target, 'Smooth should move towards target');
  assert.equal(Math.round(smooth * 100) / 100, 0.8);

  // After multiple steps, it converges very close to target
  for (let i = 0; i < 20; i++) {
    smooth = smoothVelocity(smooth, target, 0.2);
  }
  assert.ok(Math.abs(smooth - target) < 0.05, `Should converge to ~4.0, got ${smooth}`);

  // Test safety clamp on smoothingFactor
  assert.equal(smoothVelocity(0, 5, 0), 0.05); // clamped to 0.01 factor
  assert.equal(smoothVelocity(0, 5, 2.0), 5); // clamped to 1.0 factor
});

test('calculatePitchShift scales pitch smoothly in cents with directionality', () => {
  // At rest (0 velocity) -> 0 cents shift
  assert.equal(calculatePitchShift(0), 0);

  // Positive velocity (scrolling down) -> upward pitch shift
  const shiftDownLow = calculatePitchShift(0.5);
  const shiftDownMed = calculatePitchShift(2.0);
  const shiftDownHigh = calculatePitchShift(10.0);

  assert.ok(shiftDownLow > 0, 'Moderate forward velocity should shift pitch up');
  assert.ok(shiftDownMed > shiftDownLow, 'Higher forward velocity should produce greater pitch shift');
  assert.ok(shiftDownHigh <= 500, 'Pitch shift up should be bounded by maxUpCents (500)');

  // Negative velocity (scrolling up) -> downward pitch shift
  const shiftUpLow = calculatePitchShift(-0.5);
  const shiftUpHigh = calculatePitchShift(-10.0);

  assert.ok(shiftUpLow < 0, 'Backward velocity should shift pitch down');
  assert.ok(shiftUpHigh >= -300, 'Pitch shift down should be bounded by maxDownCents (-300)');
});

test('centsToFrequencyRatio accurately calculates equal temperament multipliers', () => {
  // 0 cents = 1.0 (unison)
  assert.equal(centsToFrequencyRatio(0), 1.0);
  // +1200 cents = 2.0 (one octave up)
  assert.ok(Math.abs(centsToFrequencyRatio(1200) - 2.0) < 0.0001);
  // -1200 cents = 0.5 (one octave down)
  assert.ok(Math.abs(centsToFrequencyRatio(-1200) - 0.5) < 0.0001);
  // +700 cents = perfect fifth (~1.4983)
  assert.ok(Math.abs(centsToFrequencyRatio(700) - 1.4983) < 0.001);
});

test('calculateFilterCutoff and calculateResonance respond dynamically to motion', () => {
  // Rest state
  const idleCutoff = calculateFilterCutoff(0);
  const idleQ = calculateResonance(0);
  assert.equal(idleCutoff, 260);
  assert.equal(idleQ, 1.6);

  // Active motion
  const movingCutoff = calculateFilterCutoff(3.0);
  const movingQ = calculateResonance(3.0);
  assert.ok(movingCutoff > 1000, `Moving cutoff ${movingCutoff} should open up significantly`);
  assert.ok(movingCutoff <= 2200, 'Moving cutoff should remain within ceiling');
  assert.ok(movingQ > idleQ, 'Resonance should increase dynamically during motion');
  assert.ok(movingQ <= 4.2, 'Resonance should remain within ceiling');
});

test('getCelestialChordForProgress generates rich celestial chords across voyage phases', () => {
  const portalChord = getCelestialChordForProgress(0.05);
  assert.equal(portalChord.phase, 'portal');
  assert.equal(portalChord.root, 55);
  assert.ok(portalChord.frequencies.includes(164.81));

  const thresholdChord = getCelestialChordForProgress(0.35);
  assert.equal(thresholdChord.phase, 'threshold');
  assert.ok(thresholdChord.frequencies.length >= 6);

  const deepSpaceChord = getCelestialChordForProgress(0.65);
  assert.equal(deepSpaceChord.phase, 'deep_space');
  assert.equal(deepSpaceChord.root, 73.42);

  const contactChord = getCelestialChordForProgress(0.95);
  assert.equal(contactChord.phase, 'axon_contact');
  assert.equal(contactChord.root, 46.25);
});
