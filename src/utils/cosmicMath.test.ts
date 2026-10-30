import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScrollProgress,
  getAstronautDispersion,
  getCameraJourney,
  generateProceduralAstronautParticles,
  generateProceduralSphereParticles,
} from './cosmicMath';

test('calculateScrollProgress clamps values between 0 and 1', () => {
  assert.equal(calculateScrollProgress(0, 1000), 0);
  assert.equal(calculateScrollProgress(500, 1000), 0.5);
  assert.equal(calculateScrollProgress(1000, 1000), 1.0);
  assert.equal(calculateScrollProgress(-100, 1000), 0);
  assert.equal(calculateScrollProgress(1500, 1000), 1.0);
  assert.equal(calculateScrollProgress(100, 0), 0);
});

test('getAstronautDispersion handles thresholds and smooth transition', () => {
  // Before dispersal begins (0.0 - 0.18)
  assert.equal(getAstronautDispersion(0.0), 0);
  assert.equal(getAstronautDispersion(0.10), 0);
  assert.equal(getAstronautDispersion(0.18), 0);

  // During dispersal (0.18 - 0.55)
  const mid = getAstronautDispersion(0.365);
  assert.ok(mid > 0.4 && mid < 0.6, `Midpoint dispersion ${mid} should be near 0.5`);

  // After full dispersal (>= 0.55)
  assert.equal(getAstronautDispersion(0.55), 1.0);
  assert.equal(getAstronautDispersion(0.80), 1.0);
  assert.equal(getAstronautDispersion(1.0), 1.0);
});

test('getCameraJourney transitions camera smoothly along Z axis into space', () => {
  const start = getCameraJourney(0.0);
  const mid = getCameraJourney(0.5);
  const end = getCameraJourney(1.0);

  // Starting position in front of doorway and astronaut
  assert.ok(start.posZ > 10, 'Initial camera should be in front');
  assert.ok(mid.posZ < start.posZ, 'Camera should advance towards/through gateway');
  assert.ok(end.posZ < -30, 'Deep space camera should be deep in the void');
});

test('generateProceduralAstronautParticles returns full particle arrays', () => {
  const count = 500;
  const particles = generateProceduralAstronautParticles(count);

  assert.equal(particles.positions.length, count * 3);
  assert.equal(particles.colors.length, count * 3);
  assert.equal(particles.dispersalVectors.length, count * 3);
  assert.equal(particles.partTypes.length, count);

  // Verify non-zero bounds
  let maxY = -Infinity;
  let minY = Infinity;
  for (let i = 0; i < count; i++) {
    const y = particles.positions[i * 3 + 1];
    if (y > maxY) maxY = y;
    if (y < minY) minY = y;
  }
  assert.ok(maxY > 1.4, 'Helmet/head height should be > 1.4m');
  assert.ok(minY < 0.3, 'Feet/boots height should reach ground near ~0m');
});

test('generateProceduralSphereParticles generates spherical shell within radius bounds', () => {
  const count = 400;
  const radius = 3.4;
  const center: [number, number, number] = [-3.2, 2.4, -43.0];
  const sphere = generateProceduralSphereParticles(count, radius, center);

  assert.equal(sphere.positions.length, count * 3);
  assert.equal(sphere.colors.length, count * 3);
  assert.equal(sphere.brightness.length, count);

  for (let i = 0; i < count; i++) {
    const dx = sphere.positions[i * 3] - center[0];
    const dy = sphere.positions[i * 3 + 1] - center[1];
    const dz = sphere.positions[i * 3 + 2] - center[2];
    const dist = Math.hypot(dx, dy, dz);
    assert.ok(dist >= radius * 0.85 && dist <= radius * 1.15, `Distance ${dist} should be near radius ${radius}`);
  }
});

