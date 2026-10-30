/**
 * Custom GLSL Shaders for the cosmic particle systems.
 * Provides crisp circular point shaping, subtle bloom falloff,
 * cursor proximity luminescence, and organic curl dispersion.
 */

export const particleVertexShader = `
uniform float uTime;
uniform float uDispersion;
uniform vec3 uPointer;
uniform float uPointerRadius;
uniform float uBaseSize;

attribute vec3 aDispersalDir;
attribute vec3 aColor;
attribute float aBrightness;
attribute float aSize;

varying vec3 vColor;
varying float vAlpha;
varying float vBrightness;

// Low-cost sinusoidal curl turbulence for stardust drifting
vec3 curlTurbulence(vec3 p) {
  float s1 = sin(p.y * 2.5 + uTime * 0.7) * cos(p.z * 1.8 + uTime * 0.5);
  float s2 = sin(p.z * 2.2 + uTime * 0.6) * cos(p.x * 2.0 + uTime * 0.8);
  float s3 = sin(p.x * 1.9 + uTime * 0.9) * cos(p.y * 2.3 + uTime * 0.4);
  return vec3(s1, s2 + 0.4, s3);
}

void main() {
  vec3 pos = position;

  // Continuous organic life motion
  // 1. Luminous doorway opening vertical light flow & subtle forward escape
  if (abs(pos.x) < 1.1 && pos.y >= 0.0 && pos.y <= 15.5) {
    float verticalWave = sin(uTime * 1.6 + pos.y * 0.5);
    pos.y += verticalWave * 0.09;
    // Occasional gentle particle escape drifting outward from luminous opening
    float escapeZ = max(0.0, sin(uTime * 1.1 + pos.y * 0.35 + pos.x * 2.0) - 0.72) * 2.2;
    pos.z += escapeZ;
  }

  // 2. Gentle organic dispersion on scroll
  if (uDispersion > 0.0001) {
    float dispCurve = uDispersion * uDispersion * (3.0 - 2.0 * uDispersion);
    vec3 turb = curlTurbulence(pos * 0.7) * (uDispersion * 1.8);
    pos += (aDispersalDir * (dispCurve * 5.2)) + turb;
  }

  // 3. Local cursor proximity
  float distToPointer = length(pos - uPointer);
  float pointerProximity = 1.0 - smoothstep(0.0, uPointerRadius, distToPointer);

  // 4. Subtle per-particle twinkle & breathing luminance
  float twinkle = 0.92 + 0.14 * sin(uTime * 2.4 + pos.x * 12.0 + pos.y * 9.0);
  float breathing = 1.0 + 0.06 * sin(uTime * 1.8 + pos.y * 0.4);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Size attenuation with refined tiny particle scaling
  float pSize = uBaseSize * aSize * (1.0 + pointerProximity * 0.25);
  float depth = max(0.5, -mvPosition.z);
  gl_PointSize = clamp(pSize * (100.0 / depth), 1.0, 8.5);

  vColor = aColor;
  vBrightness = aBrightness * twinkle * breathing * (1.0 + pointerProximity * 0.4);

  // Fade alpha gracefully during final dispersion
  vAlpha = clamp(1.0 - smoothstep(0.40, 0.98, uDispersion), 0.0, 1.0);
}
`;


export const particleFragmentShader = `
precision highp float;

varying vec3 vColor;
varying float vAlpha;
varying float vBrightness;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  // Crisp center with soft celestial falloff (restrained glow, never large blobs)
  float core = smoothstep(0.18, 0.0, dist);
  float halo = exp(-dist * dist * 18.0);
  float intensity = mix(halo * 0.6, 1.0, core * 0.5) * vBrightness;

  vec3 rgb = vColor * intensity;
  // Soft stardust transparency so dense overlapping points form a luminous mist
  float alpha = vAlpha * halo * 0.52;

  gl_FragColor = vec4(rgb, alpha);
}
`;

/**
 * Continuous Morphing Particle Pool Shader:
 * Unified particle pool that morphs from Astronaut at the portal ->
 * to Spaceship cruising on the left ->
 * to Interactive Fluid Particle Sphere in the contact section (AXON dynamics).
 */
export const continuousMorphVertexShader = `
uniform float uTime;
uniform float uScrollProgress;
uniform vec3 uPointer;
uniform float uPointerRadius;
uniform float uBaseSize;
uniform float uSphereActive;

attribute vec3 aAstronautPos;
attribute vec3 aSpaceshipPos;
attribute vec3 aSpherePos;
attribute vec3 aDispersalDir;
attribute vec3 aColor;
attribute float aBrightness;
attribute float aSize;

varying vec3 vColor;
varying float vAlpha;
varying float vBrightness;

vec3 curlTurbulence(vec3 p) {
  float s1 = sin(p.y * 2.5 + uTime * 0.7) * cos(p.z * 1.8 + uTime * 0.5);
  float s2 = sin(p.z * 2.2 + uTime * 0.6) * cos(p.x * 2.0 + uTime * 0.8);
  float s3 = sin(p.x * 1.9 + uTime * 0.9) * cos(p.y * 2.3 + uTime * 0.4);
  return vec3(s1, s2 + 0.4, s3);
}

mat3 rotY(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat3(
    c, 0.0, s,
    0.0, 1.0, 0.0,
    -s, 0.0, c
  );
}

void main() {
  float s = clamp(uScrollProgress, 0.0, 1.0);
  vec3 pos = aAstronautPos;
  float currentBrightness = aBrightness;
  vec3 currentColor = aColor;

  if (s < 0.20) {
    // 1. Astronaut standing beside the monumental doorway
    pos = aAstronautPos;
  } else if (s < 0.48) {
    // 2. Astronaut to Spaceship Transition (organic stardust dispersal toward left side)
    float t = (s - 0.20) / 0.28;
    float smoothT = t * t * (3.0 - 2.0 * t);
    
    // Arching stardust trajectory streaming over to left flank
    vec3 archDisp = (aDispersalDir + vec3(-1.4, 0.4, 0.0)) * sin(t * 3.14159) * 3.2;
    vec3 turb = curlTurbulence(mix(aAstronautPos, aSpaceshipPos, smoothT) * 0.6) * sin(t * 3.14159) * 1.8;

    pos = mix(aAstronautPos, aSpaceshipPos, smoothT) + archDisp + turb;
  } else if (s < 0.76) {
    // 3. Spaceship Cruise along the left flank
    pos = aSpaceshipPos;
    if (pos.z < -24.5) {
      pos.z += sin(uTime * 30.0 + pos.x * 15.0) * 0.04;
    }
  } else if (s < 0.86) {
    // 4. Spaceship to Interactive Sphere Transition
    float t2 = (s - 0.76) / 0.10;
    float smoothT2 = t2 * t2 * (3.0 - 2.0 * t2);
    
    vec3 archDisp2 = aDispersalDir * sin(t2 * 3.14159) * 2.5;
    vec3 turb2 = curlTurbulence(mix(aSpaceshipPos, aSpherePos, smoothT2) * 0.8) * sin(t2 * 3.14159) * 1.5;

    pos = mix(aSpaceshipPos, aSpherePos, smoothT2) + archDisp2 + turb2;
  } else {
    // 5. Interactive Fluid Sphere in Contact Section (AXON dynamics)
    vec3 sphereCenter = vec3(-4.4, 2.4, -43.0);
    vec3 localPos = aSpherePos - sphereCenter;

    // Smooth continuous fluid rotation
    localPos = rotY(uTime * 0.20) * localPos;

    // Gentle AXON fluid breathing waves across sphere shell
    float breathe = sin(uTime * 1.5 + localPos.y * 2.0 + localPos.x * 1.8) * 0.08;
    localPos += normalize(localPos) * breathe;

    pos = sphereCenter + localPos;

    // Restrained, subtle cursor interaction (much less sensitive, gentle organic ripple)
    float distToPointer = length(pos - uPointer);
    if (distToPointer < uPointerRadius) {
      float factor = 1.0 - (distToPointer / uPointerRadius);
      float pushStrength = factor * factor * 0.38; // gentle, restrained push
      vec3 pushDir = normalize(pos - uPointer);
      
      vec3 eddy = cross(pushDir, vec3(0.0, 1.0, 0.0)) * factor * 0.24; // subtle eddy
      pos += (pushDir * pushStrength + eddy) * uSphereActive;

      currentBrightness += factor * 0.55; // gentle, pleasing highlight
      currentColor = mix(currentColor, vec3(0.82, 0.94, 1.0), factor * 0.35);
    }
  }

  // Soft cursor proximity highlight across all phases
  float dCursor = length(pos - uPointer);
  if (dCursor < 2.8) {
    float cProximity = 1.0 - (dCursor / 2.8);
    currentBrightness += cProximity * 0.25;
  }

  // Delicate twinkling
  float twinkle = 0.92 + 0.14 * sin(uTime * 2.8 + pos.x * 8.0 + pos.y * 7.0);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float depth = max(0.5, -mvPosition.z);
  gl_PointSize = clamp(uBaseSize * aSize * (120.0 / depth), 1.5, 9.5);

  vColor = currentColor;
  vBrightness = currentBrightness * twinkle;
  vAlpha = 0.98;
}
`;


/**
 * Spaceship shader: handles convergence from transition cloud into assembled ship,
 * and thruster particle pulsation.
 */
export const spaceshipVertexShader = `
uniform float uTime;
uniform float uAssembly; // 0.0 = cloud, 1.0 = assembled ship
uniform vec3 uPointer;
uniform float uPointerRadius;
uniform float uBaseSize;

attribute vec3 aCloudPos;
attribute vec3 aColor;
attribute float aBrightness;
attribute float aSize;

varying vec3 vColor;
varying float vAlpha;
varying float vBrightness;

void main() {
  // Smooth Hermite interpolation from cloud to ship
  float t = clamp(uAssembly, 0.0, 1.0);
  float smoothT = t * t * (3.0 - 2.0 * t);

  // Add subtle flight vibration & engine shimmer
  vec3 shipPos = position;
  float engineShimmer = 0.0;
  if (shipPos.z < -2.2) {
    // Engine zone
    engineShimmer = sin(uTime * 35.0 + shipPos.x * 20.0) * 0.04 * smoothT;
    shipPos.z += engineShimmer;
  }

  vec3 pos = mix(aCloudPos, shipPos, smoothT);

  // Cursor proximity
  float distToPointer = length(pos - uPointer);
  float pointerProximity = 1.0 - smoothstep(0.0, uPointerRadius, distToPointer);

  // Twinkle
  float twinkle = 0.94 + 0.12 * sin(uTime * 3.0 + pos.x * 10.0 + pos.z * 8.0);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float pSize = uBaseSize * aSize * (1.0 + pointerProximity * 0.25);
  float depth = max(0.5, -mvPosition.z);
  gl_PointSize = clamp(pSize * (100.0 / depth), 1.0, 9.0);

  vColor = aColor;
  vBrightness = aBrightness * twinkle * (1.0 + pointerProximity * 0.4);
  // Ship visibility increases with assembly and remains visible during cruise
  vAlpha = clamp(smoothT * 1.1, 0.0, 1.0);
}
`;


/**
 * Starfield shader: lightweight point shader with layered twinkle and parallax.
 */
export const starfieldVertexShader = `
uniform float uTime;
uniform float uTwinkleSpeed;
uniform float uBaseSize;

attribute float aTwinklePhase;
attribute float aBrightness;
attribute vec3 aColor;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float twinkle = 0.75 + 0.25 * sin(uTime * uTwinkleSpeed + aTwinklePhase);
  float depth = max(1.0, -mvPosition.z);
  gl_PointSize = clamp(uBaseSize * (220.0 / depth), 1.0, 16.0);

  vColor = aColor * aBrightness * twinkle;
  vAlpha = 0.85 * twinkle;
}
`;

export const starfieldFragmentShader = `
precision highp float;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  float halo = exp(-dist * dist * 14.0);
  gl_FragColor = vec4(vColor, vAlpha * halo);
}
`;
