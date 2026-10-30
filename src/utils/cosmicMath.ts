/**
 * Math and animation curve helpers for the Cosmic Gateway portfolio.
 * Pure, deterministic functions decoupled from UI/WebGL rendering.
 */

export interface CameraState {
  posX: number;
  posY: number;
  posZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  fov: number;
}

/**
 * Normalizes scroll position to [0, 1] range.
 */
export function calculateScrollProgress(scrollTop: number, maxScroll: number): number {
  if (maxScroll <= 0) return 0;
  return Math.min(Math.max(scrollTop / maxScroll, 0), 1);
}

/**
 * Calculates astronaut particle dispersion factor [0, 1] based on scroll.
 * Begins dispersing at startThreshold (default 0.18) and completes at endThreshold (default 0.55).
 * Uses smooth Hermite interpolation for gentle organic disintegration.
 */
export function getAstronautDispersion(
  scrollProgress: number,
  startThreshold = 0.18,
  endThreshold = 0.55
): number {
  if (scrollProgress <= startThreshold) return 0;
  if (scrollProgress >= endThreshold) return 1;

  const t = (scrollProgress - startThreshold) / (endThreshold - startThreshold);
  // smoothstep: 3*t^2 - 2*t^3
  return t * t * (3 - 2 * t);
}

/**
 * Calculates doorway glow & portal scale expansion during transition.
 */
export function getDoorwayExpansion(scrollProgress: number): {
  energy: number;
  portalScale: number;
  tunnelOpacity: number;
} {
  // Portal energy swells as camera approaches and passes through
  const approach = Math.sin(Math.min(scrollProgress * 2, 1) * Math.PI * 0.5);
  const portalScale = 1 + Math.max(0, scrollProgress - 0.2) * 1.5;
  const tunnelOpacity = Math.min(Math.max((scrollProgress - 0.3) * 2.5, 0), 1);

  return {
    energy: approach,
    portalScale,
    tunnelOpacity,
  };
}

/**
 * Interpolates camera path along the cosmic journey through the gateway.
 */
export function getCameraJourney(progress: number): CameraState {
  const p = Math.min(Math.max(progress, 0), 1);

  // Key milestones:
  // p = 0.0: Standing before doorway, viewing astronaut silhouette against colossal arch
  // p = 0.35: Moving past astronaut, approaching threshold
  // p = 0.65: Traversing stargate event horizon into nebulae corridor
  // p = 1.0: Deep cosmos singularity & portfolio constellations
  let posX = 0;
  let posY = 3.8;
  let posZ = 13.5;

  let targetX = 0;
  let targetY = 6.2;
  let targetZ = 0.0;

  let fov = 54;

  if (p < 0.35) {
    const t = p / 0.35;
    const smoothT = t * t * (3 - 2 * t);
    // Move camera straight forward directly through the tall rectangular opening at x=0
    posX = 0.0;
    posY = 3.8 - smoothT * 0.8; // descends to 3.0 (portal eye level)
    posZ = 13.5 - smoothT * 11.5; // reaches 2.0 (just at the opening threshold)
    targetY = 6.2 - smoothT * 2.2; // centers target into portal horizon (4.0)
    targetZ = -12.0;
    fov = 54 + smoothT * 6;
  } else if (p < 0.70) {
    const t = (p - 0.35) / 0.35;
    const smoothT = t * t * (3 - 2 * t);
    // Traverses physically through the tall opening (z=0) into deep space
    posX = Math.sin(smoothT * 2.0) * 0.4;
    posY = 3.0 + smoothT * 0.6;
    posZ = 2.0 - smoothT * 18.0; // passes threshold z=0 into deep space z=-16
    targetY = 4.0 - smoothT * 1.0;
    targetZ = -30.0;
    fov = 60 + Math.sin(smoothT * Math.PI) * 8; // gentle warp sensation
  } else {
    const t = (p - 0.70) / 0.30;
    const smoothT = t * t * (3 - 2 * t);
    posX = Math.sin(smoothT * 1.5) * 0.6;
    posY = 3.6 - smoothT * 0.8;
    posZ = -16.0 - smoothT * 18.0; // deep space cruise corridor z=-34
    targetY = 3.0 + smoothT * 0.2;
    targetZ = -55.0;
    fov = 60 - smoothT * 4;
  }



  return {
    posX,
    posY,
    posZ,
    targetX,
    targetY,
    targetZ,
    fov,
  };
}

/**
 * Procedural fallback: generates a recognizable astronaut point cloud
 * if GLB fails to load or while loading.
 * Full body: Helmet, Visor, Torso, Backpack, Arms, Legs, Boots.
 */
export function generateProceduralAstronautParticles(count = 7000): {
  positions: Float32Array;
  colors: Float32Array;
  dispersalVectors: Float32Array;
  partTypes: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const dispersalVectors = new Float32Array(count * 3);
  const partTypes = new Float32Array(count); // 0: general suit, 1: helmet/visor, 2: backpack, 3: boots/limbs

  let idx = 0;

  const pushPoint = (
    x: number,
    y: number,
    z: number,
    r: number,
    g: number,
    b: number,
    type: number
  ) => {
    if (idx >= count) return;
    const i3 = idx * 3;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    colors[i3] = r;
    colors[i3 + 1] = g;
    colors[i3 + 2] = b;

    // Dispersal vector: radiate outward from astronaut center (0, 1.0, 0) with upward drift
    const dx = x + (Math.random() - 0.5) * 0.4;
    const dy = (y - 0.9) * 0.8 + 0.6 + Math.random() * 0.5;
    const dz = z + (Math.random() - 0.5) * 0.4;
    const len = Math.hypot(dx, dy, dz) || 1;

    dispersalVectors[i3] = (dx / len) * (1.2 + Math.random() * 1.8);
    dispersalVectors[i3 + 1] = (dy / len) * (1.5 + Math.random() * 2.0);
    dispersalVectors[i3 + 2] = (dz / len) * (1.2 + Math.random() * 1.8);

    partTypes[idx] = type;
    idx++;
  };

  // Helper random on sphere surface/shell
  const addSphereShell = (
    cx: number,
    cy: number,
    cz: number,
    rx: number,
    ry: number,
    rz: number,
    n: number,
    r: number,
    g: number,
    b: number,
    type: number
  ) => {
    for (let i = 0; i < n; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const rad = 0.92 + Math.random() * 0.16;
      const sinPhi = Math.sin(phi);
      const x = cx + rx * rad * sinPhi * Math.cos(theta);
      const y = cy + ry * rad * Math.cos(phi);
      const z = cz + rz * rad * sinPhi * Math.sin(theta);
      pushPoint(x, y, z, r, g, b, type);
    }
  };

  // Helper cylinder shell
  const addCylinderShell = (
    cx: number,
    cy: number,
    cz: number,
    rTop: number,
    rBot: number,
    height: number,
    n: number,
    r: number,
    g: number,
    b: number,
    type: number
  ) => {
    for (let i = 0; i < n; i++) {
      const h = Math.random();
      const rad = (rBot + (rTop - rBot) * h) * (0.94 + Math.random() * 0.12);
      const angle = Math.random() * Math.PI * 2;
      const x = cx + Math.cos(angle) * rad;
      const y = cy - height * 0.5 + h * height;
      const z = cz + Math.sin(angle) * rad;
      pushPoint(x, y, z, r, g, b, type);
    }
  };

  // Box shell
  const addBoxShell = (
    cx: number,
    cy: number,
    cz: number,
    w: number,
    h: number,
    d: number,
    n: number,
    r: number,
    g: number,
    b: number,
    type: number
  ) => {
    for (let i = 0; i < n; i++) {
      // Pick random face
      const face = Math.floor(Math.random() * 6);
      let x = (Math.random() - 0.5) * w;
      let y = (Math.random() - 0.5) * h;
      let z = (Math.random() - 0.5) * d;

      if (face === 0) x = w * 0.5;
      else if (face === 1) x = -w * 0.5;
      else if (face === 2) y = h * 0.5;
      else if (face === 3) y = -h * 0.5;
      else if (face === 4) z = d * 0.5;
      else z = -d * 0.5;

      // Small jitter
      x += (Math.random() - 0.5) * 0.02;
      y += (Math.random() - 0.5) * 0.02;
      z += (Math.random() - 0.5) * 0.02;
      pushPoint(cx + x, cy + y, cz + z, r, g, b, type);
    }
  };

  // Proportions: helmet: 15%, visor: 8%, torso: 22%, backpack: 18%, arms: 15%, legs: 16%, boots: 6%
  const nHelmet = Math.max(10, Math.floor(count * 0.14));
  const nVisor = Math.max(10, Math.floor(count * 0.08));
  const nTorso = Math.max(10, Math.floor(count * 0.20));
  const nChestPack = Math.max(5, Math.floor(count * 0.04));
  const nBackpack = Math.max(10, Math.floor(count * 0.14));
  const nTanks = Math.max(5, Math.floor(count * 0.04));
  const nArmPart = Math.max(5, Math.floor(count * 0.02));
  const nLegPart = Math.max(5, Math.floor(count * 0.03));
  const nBoots = Math.max(5, Math.floor(count * 0.03));

  // 1. Helmet & Visor (bright starlight white & electric cyan tint)
  addSphereShell(0, 1.62, 0, 0.16, 0.17, 0.16, nHelmet, 0.95, 0.98, 1.0, 1);
  addSphereShell(0, 1.62, 0.07, 0.13, 0.11, 0.08, nVisor, 0.70, 0.92, 1.0, 1);

  // 2. Torso & Chest pack
  addCylinderShell(0, 1.25, 0, 0.22, 0.18, 0.44, nTorso, 0.90, 0.94, 0.98, 0);
  addBoxShell(0, 1.28, 0.13, 0.18, 0.16, 0.08, nChestPack, 0.98, 1.0, 1.0, 0);

  // 3. Life support backpack (PLSS)
  addBoxShell(0, 1.26, -0.15, 0.32, 0.48, 0.18, nBackpack, 0.85, 0.92, 1.0, 2);
  addCylinderShell(-0.10, 1.28, -0.22, 0.05, 0.05, 0.40, nTanks, 0.75, 0.88, 1.0, 2);
  addCylinderShell(0.10, 1.28, -0.22, 0.05, 0.05, 0.40, nTanks, 0.75, 0.88, 1.0, 2);

  // 4. Arms & Gloves
  [-1, 1].forEach((side) => {
    // Shoulder
    addSphereShell(side * 0.26, 1.38, 0, 0.09, 0.09, 0.09, nArmPart, 0.92, 0.96, 1.0, 0);
    // Upper arm
    addCylinderShell(side * 0.27, 1.25, 0, 0.065, 0.06, 0.26, nArmPart, 0.88, 0.92, 0.98, 0);
    // Forearm
    addCylinderShell(side * 0.30, 1.02, 0.03, 0.06, 0.055, 0.24, nArmPart, 0.88, 0.92, 0.98, 0);
    // Glove
    addSphereShell(side * 0.31, 0.90, 0.06, 0.055, 0.07, 0.06, nArmPart, 0.95, 0.98, 1.0, 3);
  });

  // 5. Pelvis & Legs
  addCylinderShell(0, 0.98, 0, 0.18, 0.16, 0.18, nLegPart, 0.88, 0.92, 0.98, 0);

  [-1, 1].forEach((side) => {
    const legX = side * 0.11;
    // Thigh
    addCylinderShell(legX, 0.72, 0, 0.085, 0.075, 0.40, nLegPart, 0.88, 0.92, 0.98, 0);
    // Knee
    addSphereShell(legX, 0.52, 0.01, 0.08, 0.08, 0.08, nLegPart, 0.95, 0.98, 1.0, 0);
    // Shin
    addCylinderShell(legX, 0.33, 0.01, 0.075, 0.07, 0.38, nLegPart, 0.88, 0.92, 0.98, 0);
    // Boots
    addBoxShell(legX, 0.07, 0.04, 0.14, 0.12, 0.26, nBoots, 0.95, 0.98, 1.0, 3);
  });


  // Fill any remaining points with suit sparkles
  while (idx < count) {
    pushPoint(
      (Math.random() - 0.5) * 0.4,
      0.1 + Math.random() * 1.5,
      (Math.random() - 0.5) * 0.3,
      0.88,
      0.94,
      1.0,
      0
    );
  }

  return {
    positions,
    colors,
    dispersalVectors,
    partTypes,
  };
}

/**
 * Procedural generator for the monumental monolithic dark wall with a single tall, narrow rectangular opening.
 * STRICTLY NO ARCHES, NO GOTHIC GATES, NO BUSY ORNAMENTS.
 * Clean, stark, imposing minimalist architectural monolith with thick physical depth.
 */
export function generateProceduralDoorwayParticles(count = 16000): {
  positions: Float32Array;
  colors: Float32Array;
  dispersalVectors: Float32Array;
  brightness: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const dispersalVectors = new Float32Array(count * 3);
  const brightness = new Float32Array(count);

  let idx = 0;

  const push = (
    x: number,
    y: number,
    z: number,
    r: number,
    g: number,
    b: number,
    bright: number,
    dispX: number,
    dispY: number,
    dispZ: number
  ) => {
    if (idx >= count) return;
    const i3 = idx * 3;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    colors[i3] = r;
    colors[i3 + 1] = g;
    colors[i3 + 2] = b;

    brightness[idx] = bright;

    dispersalVectors[i3] = dispX;
    dispersalVectors[i3 + 1] = dispY;
    dispersalVectors[i3 + 2] = dispZ;

    idx++;
  };

  // Dimensions of the opening:
  const portalHalfW = 1.0; // width = 2.0m (-1.0 to +1.0)
  const portalH = 15.0; // height = 15.0m (0 to 15m)
  const wallW = 14.0; // each side slab width (from 1.0 to 15.0m)
  const wallH = 18.0; // wall height 18m
  const wallDepth = 2.2; // depth thickness

  // 1. The Luminous Rectangular Opening (35% of total particles)
  // Dense field of intense, soft white & cool-blue light particles forming the vertical portal
  const nPortal = Math.floor(count * 0.38);
  for (let i = 0; i < nPortal; i++) {
    // Distributed inside opening x in [-portalHalfW, portalHalfW], y in [0, portalH]
    const x = (Math.random() - 0.5) * (portalHalfW * 1.95);
    const y = Math.random() * portalH;
    // Layered across the portal depth with directional rays
    const z = (Math.random() - 0.5) * (wallDepth * 0.95);

    // Light intensity: brightest near center and vertical axis
    const distToCenter = Math.abs(x) / portalHalfW;
    const isCoreBeam = distToCenter < 0.45;
    const bright = isCoreBeam ? 1.8 + Math.random() * 0.5 : 1.3 + Math.random() * 0.4;

    // Brilliant starlight white with subtle ice-blue fringe
    const r = isCoreBeam ? 0.98 : 0.88 + Math.random() * 0.1;
    const g = isCoreBeam ? 0.99 : 0.94 + Math.random() * 0.05;
    const b = 1.0;

    // Dispersal when entering: expands outward around camera
    const dispX = (x / portalHalfW) * 2.5;
    const dispY = (y - 7.5) * 0.3;
    const dispZ = -2.0 + Math.random() * 1.5;

    push(x, y, z, r, g, b, bright, dispX, dispY, dispZ);
  }

  // 2. Sharp Rectangular Portal Outline & Vertical Inner Jambs (15% of particles)
  const nEdges = Math.floor(count * 0.16);
  for (let i = 0; i < nEdges; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * portalHalfW + (Math.random() - 0.5) * 0.08;
    const y = Math.random() * portalH;
    const z = (Math.random() - 0.5) * wallDepth;

    // Crisp white/cyan contour edge
    push(x, y, z, 0.95, 0.98, 1.0, 1.6, side * 3.5, 0, (Math.random() - 0.5) * 2.0);
  }

  // Top lintel edge of the opening
  const nLintel = Math.floor(count * 0.04);
  for (let i = 0; i < nLintel; i++) {
    const x = (Math.random() - 0.5) * (portalHalfW * 2.0);
    const y = portalH + (Math.random() - 0.5) * 0.1;
    const z = (Math.random() - 0.5) * wallDepth;
    push(x, y, z, 0.95, 0.98, 1.0, 1.6, 0, 3.0, (Math.random() - 0.5) * 2.0);
  }

  // 3. The Enormous Monolithic Dark Wall Slabs (35% of particles)
  // Left and Right dark textured monolith walls filling almost entire viewport
  const nWall = Math.floor(count * 0.32);
  for (let i = 0; i < nWall; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    // Span from portal edge (1.0) to outer edge (14.0)
    const spanT = Math.pow(Math.random(), 0.7); // slightly denser near opening
    const x = side * (portalHalfW + spanT * (wallW - portalHalfW));
    const y = Math.random() * wallH;
    const z = (Math.random() - 0.5) * wallDepth;

    // Subtle dark slate/navy particles with micro texture
    const isTextureFleck = Math.random() < 0.08;
    const bright = isTextureFleck ? 0.85 : 0.42 + Math.random() * 0.25;

    const r = isTextureFleck ? 0.65 : 0.22 + Math.random() * 0.12;
    const g = isTextureFleck ? 0.78 : 0.28 + Math.random() * 0.14;
    const b = isTextureFleck ? 0.95 : 0.42 + Math.random() * 0.18;

    // Disperses sideways to open passage for camera
    const dispX = side * (2.8 + Math.random() * 2.0);
    const dispY = (Math.random() - 0.5) * 1.5;
    const dispZ = (Math.random() - 0.5) * 2.0;

    push(x, y, z, r, g, b, bright, dispX, dispY, dispZ);
  }

  // 4. Ground Threshold Platform
  while (idx < count) {
    const x = (Math.random() - 0.5) * 26.0;
    const z = -2.0 + Math.random() * 9.0;
    const y = -0.05 + Math.random() * 0.12;

    const isNearPortal = Math.abs(x) < portalHalfW * 1.5;
    const bright = isNearPortal ? 1.1 : 0.45;
    const r = isNearPortal ? 0.85 : 0.25;
    const g = isNearPortal ? 0.92 : 0.32;
    const b = isNearPortal ? 1.0 : 0.48;

    push(x, y, z, r, g, b, bright, (x > 0 ? 1 : -1) * 2.0, -1.0, 0);
  }

  return { positions, colors, dispersalVectors, brightness };
}


/**
 * Procedural fallback for the sleek interstellar spaceship.
 * Needle nose, swept delta wings, ion thrusters, cockpit canopy.
 */
export function generateProceduralSpaceshipParticles(count = 10000): {
  positions: Float32Array;
  colors: Float32Array;
  dispersalVectors: Float32Array;
  brightness: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const dispersalVectors = new Float32Array(count * 3);
  const brightness = new Float32Array(count);

  let idx = 0;

  const push = (
    x: number,
    y: number,
    z: number,
    r: number,
    g: number,
    b: number,
    bright: number
  ) => {
    if (idx >= count) return;
    const i3 = idx * 3;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    colors[i3] = r;
    colors[i3 + 1] = g;
    colors[i3 + 2] = b;

    brightness[idx] = bright;

    // Dispersal vector: outward from ship axis
    const dx = x + (Math.random() - 0.5) * 0.4;
    const dy = y + (Math.random() - 0.5) * 0.4;
    const dz = z + (Math.random() - 0.5) * 0.6;
    const len = Math.hypot(dx, dy, dz) || 1;

    dispersalVectors[i3] = (dx / len) * (1.2 + Math.random() * 1.5);
    dispersalVectors[i3 + 1] = (dy / len) * (1.2 + Math.random() * 1.5);
    dispersalVectors[i3 + 2] = (dz / len) * (1.2 + Math.random() * 1.5);

    idx++;
  };

  // 1. Nose & Fuselage (Length along Z: -4.0 to +4.5)
  const nBody = Math.floor(count * 0.42);
  for (let i = 0; i < nBody; i++) {
    const zNorm = Math.random(); // 0 (tail) to 1 (nose tip)
    const z = -3.5 + zNorm * 8.0; // -3.5 to 4.5
    // Width tapers toward nose
    const radius = Math.sin(zNorm * Math.PI) * 0.85 * (1.2 - zNorm * 0.5);
    const angle = Math.random() * Math.PI * 2;
    // Flatten elliptical cross-section
    const x = Math.cos(angle) * radius * 1.3;
    const y = Math.sin(angle) * radius * 0.65;

    const isNoseTip = z > 3.8;
    const bright = isNoseTip ? 1.5 : 1.0;
    push(x, y, z, 0.90, 0.95, 1.0, bright);
  }

  // 2. Swept Delta Wings (Left & Right)
  const nWings = Math.floor(count * 0.36);
  for (let i = 0; i < nWings; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const span = Math.random(); // 0 (near root) to 1 (wingtip)
    const x = side * (0.8 + span * 2.6); // 0.8 to 3.4
    const z = 1.0 - span * 3.6 + (Math.random() - 0.5) * 0.3; // swept back
    const y = -0.05 + Math.sin(span * Math.PI) * 0.08 + (Math.random() - 0.5) * 0.04;

    const isEdge = span > 0.85 || Math.random() < 0.15;
    const bright = isEdge ? 1.4 : 1.0;
    push(x, y, z, 0.86, 0.92, 1.0, bright);
  }

  // 3. Twin Engine Nacelles & Ion Exhaust (z = -3.2 to -4.5, x = ±1.1)
  const nEngines = Math.floor(count * 0.16);
  for (let i = 0; i < nEngines; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const z = -2.2 - Math.random() * 2.0;
    const angle = Math.random() * Math.PI * 2;
    const r = 0.38 + (Math.random() - 0.5) * 0.08;
    const x = side * 1.1 + Math.cos(angle) * r;
    const y = -0.1 + Math.sin(angle) * r;

    // Glowing cyan ion thruster particles behind nozzle
    const isExhaust = z < -3.4;
    const bright = isExhaust ? 1.8 : 1.1;
    const colorB = isExhaust ? 1.0 : 0.96;
    const colorR = isExhaust ? 0.45 : 0.88;
    const colorG = isExhaust ? 0.85 : 0.94;
    push(x, y, z, colorR, colorG, colorB, bright);
  }

  // Fill remaining points with hull structure
  while (idx < count) {
    const z = -2.0 + Math.random() * 5.0;
    push((Math.random() - 0.5) * 1.2, 0.3 + Math.random() * 0.3, z, 0.95, 0.98, 1.0, 1.2);
  }

  return { positions, colors, dispersalVectors, brightness };
}

/**
 * Procedural generator for the interactive fluid particle sphere in the contact section.
 * Distributed on a spherical shell (Fibonacci lattice) with fluid dynamic perturbations.
 */
export function generateProceduralSphereParticles(
  count = 10000,
  radius = 3.4,
  center: [number, number, number] = [-3.2, 2.4, -43.0]
): {
  positions: Float32Array;
  colors: Float32Array;
  dispersalVectors: Float32Array;
  brightness: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const dispersalVectors = new Float32Array(count * 3);
  const brightness = new Float32Array(count);

  const phiGolden = Math.PI * (3 - Math.sqrt(5)); // Golden angle ~2.39996

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const yNorm = 1 - (i / (count - 1)) * 2; // -1 to 1
    const rAtY = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
    const theta = phiGolden * i;

    // Shell radius with micro-layering (AXON fluid volume feel)
    const shellThickness = radius * (0.92 + (i % 7) * 0.025 + Math.sin(i * 0.5) * 0.04);

    const x = center[0] + Math.cos(theta) * rAtY * shellThickness;
    const y = center[1] + yNorm * shellThickness;
    const z = center[2] + Math.sin(theta) * rAtY * shellThickness;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Radial dispersal vectors
    const dx = x - center[0];
    const dy = y - center[1];
    const dz = z - center[2];
    const len = Math.hypot(dx, dy, dz) || 1;

    dispersalVectors[i3] = (dx / len) * 1.5;
    dispersalVectors[i3 + 1] = (dy / len) * 1.5;
    dispersalVectors[i3 + 2] = (dz / len) * 1.5;

    // Elegant silver-blue and diamond white stardust colors
    const isCoreSpark = i % 11 === 0;
    colors[i3] = isCoreSpark ? 0.98 : 0.85 + (i % 5) * 0.025;
    colors[i3 + 1] = isCoreSpark ? 0.99 : 0.92 + (i % 4) * 0.02;
    colors[i3 + 2] = 1.0;

    brightness[i] = isCoreSpark ? 1.5 : 1.0 + (i % 3) * 0.15;
  }

  return { positions, colors, dispersalVectors, brightness };
}

