import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import {
  generateProceduralAstronautParticles,
  generateProceduralDoorwayParticles,
  generateProceduralSpaceshipParticles,
} from './cosmicMath';

export interface SampledPointCloud {
  positions: Float32Array;
  colors: Float32Array;
  dispersalVectors: Float32Array;
  brightness: Float32Array;
  sizes: Float32Array;
  count: number;
}

export interface SamplingOptions {
  modelType: 'astronaut' | 'doorway' | 'spaceship';
  targetScale?: number;
  centerOrigin?: boolean;
  groundBase?: boolean;
}

const pointCloudCache = new Map<string, SampledPointCloud>();

/**
 * Loads a GLB model as hidden source geometry, samples its surfaces into a point cloud,
 * and caches the result. Never attaches the GLB mesh to the scene.
 * Falls back immediately to procedural particle geometry if the file fails to load.
 */
export async function sampleModelPointCloud(
  url: string,
  targetCount: number,
  options: SamplingOptions
): Promise<SampledPointCloud> {
  const cacheKey = `${url}_${targetCount}_${options.targetScale ?? 1}_${options.modelType}`;
  if (pointCloudCache.has(cacheKey)) {
    return pointCloudCache.get(cacheKey)!;
  }

  try {
    const loader = new GLTFLoader();
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });

    const meshes: THREE.Mesh[] = [];
    gltf.scene.traverse((child: any) => {
      if (child.isMesh && child.geometry) {
        // Ensure geometry has normals and compute them if missing
        if (!child.geometry.attributes.normal) {
          child.geometry.computeVertexNormals();
        }
        child.updateWorldMatrix(true, false);
        meshes.push(child);
      }
    });

    if (meshes.length === 0) {
      throw new Error(`No meshes found in ${url}`);
    }

    // Build samplers for each mesh and calculate surface areas for proportional sampling
    const samplers: { sampler: MeshSurfaceSampler; weight: number; mesh: THREE.Mesh }[] = [];
    let totalArea = 0;

    for (const mesh of meshes) {
      try {
        const sampler = new MeshSurfaceSampler(mesh).build();
        mesh.geometry.computeBoundingBox();
        const bbox = mesh.geometry.boundingBox || new THREE.Box3();
        const size = bbox.getSize(new THREE.Vector3());
        // Estimate surface area
        const area = Math.max(0.01, 2 * (size.x * size.y + size.y * size.z + size.z * size.x));
        samplers.push({ sampler, weight: area, mesh });
        totalArea += area;
      } catch (err) {
        console.warn('Sampler build error on mesh:', err);
      }
    }

    if (samplers.length === 0) {
      throw new Error(`Failed to build samplers for ${url}`);
    }

    const positions = new Float32Array(targetCount * 3);
    const colors = new Float32Array(targetCount * 3);
    const dispersalVectors = new Float32Array(targetCount * 3);
    const brightness = new Float32Array(targetCount);
    const sizes = new Float32Array(targetCount);

    const tempPos = new THREE.Vector3();
    const tempNormal = new THREE.Vector3();
    let currentPointIdx = 0;

    // Sample from each mesh proportionally
    for (const { sampler, weight, mesh } of samplers) {
      const meshCount = Math.floor((weight / totalArea) * targetCount);
      const matrix = mesh.matrixWorld;

      for (let i = 0; i < meshCount && currentPointIdx < targetCount; i++) {
        sampler.sample(tempPos, tempNormal);
        tempPos.applyMatrix4(matrix);

        const i3 = currentPointIdx * 3;
        positions[i3] = tempPos.x;
        positions[i3 + 1] = tempPos.y;
        positions[i3 + 2] = tempPos.z;

        // Visual attributes based on model type
        if (options.modelType === 'astronaut') {
          // Identify anatomical regions from position
          const isHelmet = tempPos.y > 1.45;
          const isVisor = isHelmet && tempPos.z > 0.04;
          const isBackpack = tempPos.z < -0.06 && tempPos.y > 0.92 && tempPos.y < 1.6;
          const isChestPack = tempPos.z > 0.08 && tempPos.y > 1.15 && tempPos.y < 1.42;
          const isShoulders = tempPos.y > 1.28 && Math.abs(tempPos.x) > 0.20;
          const isBoots = tempPos.y < 0.22;
          const isArms = Math.abs(tempPos.x) > 0.22 && tempPos.y > 0.8 && tempPos.y <= 1.28;

          // Distinct brightness defining helmet, shoulders, arms, torso, backpack and legs
          if (isVisor) {
            brightness[currentPointIdx] = 1.6;
            colors[i3] = 0.55;
            colors[i3 + 1] = 0.88;
            colors[i3 + 2] = 1.0; // electric cyan visor glow
          } else if (isHelmet) {
            brightness[currentPointIdx] = 1.45;
            colors[i3] = 0.98;
            colors[i3 + 1] = 0.99;
            colors[i3 + 2] = 1.0; // crisp white helmet
          } else if (isBackpack) {
            brightness[currentPointIdx] = 1.35;
            colors[i3] = 0.75;
            colors[i3 + 1] = 0.88;
            colors[i3 + 2] = 1.0; // cool silver-blue PLSS backpack
          } else if (isChestPack) {
            brightness[currentPointIdx] = 1.4;
            colors[i3] = 0.85;
            colors[i3 + 1] = 0.96;
            colors[i3 + 2] = 1.0;
          } else if (isShoulders || isArms) {
            brightness[currentPointIdx] = 1.25;
            colors[i3] = 0.78;
            colors[i3 + 1] = 0.89;
            colors[i3 + 2] = 0.99;
          } else if (isBoots) {
            brightness[currentPointIdx] = 1.35;
            colors[i3] = 0.92;
            colors[i3 + 1] = 0.96;
            colors[i3 + 2] = 1.0;
          } else {
            // General space suit
            brightness[currentPointIdx] = 1.0;
            colors[i3] = 0.70 + Math.random() * 0.12;
            colors[i3 + 1] = 0.84 + Math.random() * 0.08;
            colors[i3 + 2] = 0.98;
          }

          // Dispersal vector: outward from center with gentle upward swirl
          const dx = tempPos.x + (Math.random() - 0.5) * 0.3;
          const dy = (tempPos.y - 0.9) * 0.7 + 0.6 + Math.random() * 0.4;
          const dz = tempPos.z + (Math.random() - 0.5) * 0.3;
          const len = Math.hypot(dx, dy, dz) || 1;
          dispersalVectors[i3] = (dx / len) * (1.4 + Math.random() * 1.6);
          dispersalVectors[i3 + 1] = (dy / len) * (1.6 + Math.random() * 2.0);
          dispersalVectors[i3 + 2] = (dz / len) * (1.4 + Math.random() * 1.6);
        } else if (options.modelType === 'doorway') {
          // Monolithic wall with tall narrow opening
          const isOpening = Math.abs(tempPos.x) <= 1.05 && tempPos.y <= 15.2;
          const isEdge =
            (Math.abs(Math.abs(tempPos.x) - 1.0) < 0.16 && tempPos.y <= 15.2) ||
            (tempPos.y >= 14.8 && tempPos.y <= 15.2 && Math.abs(tempPos.x) <= 1.05);

          if (isOpening) {
            // Luminous white/ice-blue opening
            brightness[currentPointIdx] = 2.0;
            colors[i3] = 0.98;
            colors[i3 + 1] = 0.99;
            colors[i3 + 2] = 1.0;
          } else if (isEdge) {
            // Crisp portal boundary
            brightness[currentPointIdx] = 1.6;
            colors[i3] = 0.92;
            colors[i3 + 1] = 0.96;
            colors[i3 + 2] = 1.0;
          } else {
            // Dark monolithic wall
            const isTexture = Math.random() < 0.08;
            brightness[currentPointIdx] = isTexture ? 0.75 : 0.35 + Math.random() * 0.2;
            colors[i3] = isTexture ? 0.55 : 0.20 + Math.random() * 0.1;
            colors[i3 + 1] = isTexture ? 0.68 : 0.26 + Math.random() * 0.1;
            colors[i3 + 2] = isTexture ? 0.88 : 0.38 + Math.random() * 0.15;
          }

          const dispX = tempPos.x >= 0 ? 3.2 : -3.2;
          const dispY = (tempPos.y - 7.5) * 0.2;
          const dispZ = (Math.random() - 0.5) * 2.0;
          dispersalVectors[i3] = dispX;
          dispersalVectors[i3 + 1] = dispY;
          dispersalVectors[i3 + 2] = dispZ;
        } else {

          // Spaceship
          const isNoseOrWingtip = Math.abs(tempPos.x) > 2.5 || tempPos.z > 3.0;
          const isEngine = tempPos.z < -2.5;
          const bright = isEngine ? 1.8 : isNoseOrWingtip ? 1.4 : 1.0;
          brightness[currentPointIdx] = bright;

          colors[i3] = isEngine ? 0.55 : 0.88 + Math.random() * 0.1;
          colors[i3 + 1] = isEngine ? 0.88 : 0.93 + Math.random() * 0.06;
          colors[i3 + 2] = 1.0;

          const dx = tempPos.x;
          const dy = tempPos.y;
          const dz = tempPos.z;
          const len = Math.hypot(dx, dy, dz) || 1;
          dispersalVectors[i3] = (dx / len) * (1.2 + Math.random() * 1.5);
          dispersalVectors[i3 + 1] = (dy / len) * (1.2 + Math.random() * 1.5);
          dispersalVectors[i3 + 2] = (dz / len) * (1.2 + Math.random() * 1.5);
        }

        // 1-5% size variation
        sizes[currentPointIdx] = 1.0 + (Math.random() - 0.5) * 0.08;
        currentPointIdx++;
      }
    }

    // Fill any remainder
    while (currentPointIdx < targetCount) {
      const srcIdx = Math.floor(Math.random() * Math.max(1, currentPointIdx));
      const i3 = currentPointIdx * 3;
      const s3 = srcIdx * 3;
      positions[i3] = positions[s3] + (Math.random() - 0.5) * 0.04;
      positions[i3 + 1] = positions[s3 + 1] + (Math.random() - 0.5) * 0.04;
      positions[i3 + 2] = positions[s3 + 2] + (Math.random() - 0.5) * 0.04;

      colors[i3] = colors[s3];
      colors[i3 + 1] = colors[s3 + 1];
      colors[i3 + 2] = colors[s3 + 2];

      dispersalVectors[i3] = dispersalVectors[s3];
      dispersalVectors[i3 + 1] = dispersalVectors[s3 + 1];
      dispersalVectors[i3 + 2] = dispersalVectors[s3 + 2];

      brightness[currentPointIdx] = brightness[srcIdx];
      sizes[currentPointIdx] = sizes[srcIdx];
      currentPointIdx++;
    }

    const result: SampledPointCloud = {
      positions,
      colors,
      dispersalVectors,
      brightness,
      sizes,
      count: targetCount,
    };

    pointCloudCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn(`Falling back to procedural point cloud for ${url} (${options.modelType}):`, error);
    return getProceduralFallback(options.modelType, targetCount, cacheKey);
  }
}

function getProceduralFallback(
  modelType: 'astronaut' | 'doorway' | 'spaceship',
  count: number,
  cacheKey: string
): SampledPointCloud {
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    sizes[i] = 1.0 + (Math.random() - 0.5) * 0.08;
  }

  if (modelType === 'astronaut') {
    const raw = generateProceduralAstronautParticles(count);
    const brightness = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      brightness[i] = raw.partTypes[i] === 1 ? 1.4 : raw.partTypes[i] === 2 ? 1.25 : 1.0;
    }
    const result: SampledPointCloud = {
      positions: raw.positions,
      colors: raw.colors,
      dispersalVectors: raw.dispersalVectors,
      brightness,
      sizes,
      count,
    };
    pointCloudCache.set(cacheKey, result);
    return result;
  }

  if (modelType === 'doorway') {
    const raw = generateProceduralDoorwayParticles(count);
    const result: SampledPointCloud = {
      positions: raw.positions,
      colors: raw.colors,
      dispersalVectors: raw.dispersalVectors,
      brightness: raw.brightness,
      sizes,
      count,
    };
    pointCloudCache.set(cacheKey, result);
    return result;
  }

  // Spaceship
  const raw = generateProceduralSpaceshipParticles(count);
  const result: SampledPointCloud = {
    positions: raw.positions,
    colors: raw.colors,
    dispersalVectors: raw.dispersalVectors,
    brightness: raw.brightness,
    sizes,
    count,
  };
  pointCloudCache.set(cacheKey, result);
  return result;
}
