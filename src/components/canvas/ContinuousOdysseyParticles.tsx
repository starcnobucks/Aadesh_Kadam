import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { sampleModelPointCloud, SampledPointCloud } from '../../utils/modelSampler';
import { generateProceduralSphereParticles } from '../../utils/cosmicMath';
import {
  continuousMorphVertexShader,
  particleFragmentShader,
} from '../../shaders/particleShaders';

interface ContinuousOdysseyParticlesProps {
  scrollProgress: number; // 0 to 1
  pointerPos: THREE.Vector3;
  baseSize?: number;
  particleCount?: number;
}

export const ContinuousOdysseyParticles: React.FC<ContinuousOdysseyParticlesProps> = ({
  scrollProgress,
  pointerPos,
  baseSize = 2.4,
  particleCount = 12000,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [astronautData, setAstronautData] = useState<SampledPointCloud | null>(null);
  const [spaceshipData, setSpaceshipData] = useState<SampledPointCloud | null>(null);

  // 1. Sample hidden source GLBs (with procedural fallbacks)
  useEffect(() => {
    let active = true;

    // Load and sample astronaut point cloud
    sampleModelPointCloud('/models/astronaut.glb', particleCount, {
      modelType: 'astronaut',
      targetScale: 1.0,
      centerOrigin: true,
      groundBase: true,
    }).then((data) => {
      if (active) setAstronautData(data);
    });

    // Load and sample spaceship point cloud
    sampleModelPointCloud('/models/spaceship.glb', particleCount, {
      modelType: 'spaceship',
      targetScale: 1.0,
      centerOrigin: true,
      groundBase: false,
    }).then((data) => {
      if (active) setSpaceshipData(data);
    });

    return () => {
      active = false;
    };
  }, [particleCount]);

  // 2. Build continuous morph BufferGeometry with shared particle pool
  const geometry = useMemo(() => {
    if (!astronautData || !spaceshipData) return null;

    const count = particleCount;
    const geom = new THREE.BufferGeometry();

    // Transform astronaut vertices to standing pose next to the monumental doorway
    // Position: [2.5, 0.65, 3.2], Rotation: [0, -Math.PI * 0.72, 0], Scale: 0.88
    const astroMat = new THREE.Matrix4();
    const astroPos = new THREE.Vector3(2.5, 0.65, 3.2);
    const astroRot = new THREE.Euler(0, -Math.PI * 0.72, 0);
    const astroScale = new THREE.Vector3(0.88, 0.88, 0.88);
    astroMat.compose(astroPos, new THREE.Quaternion().setFromEuler(astroRot), astroScale);

    const astronautTransformed = new Float32Array(count * 3);
    const tempV = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      tempV.set(astronautData.positions[i3], astronautData.positions[i3 + 1], astronautData.positions[i3 + 2]);
      tempV.applyMatrix4(astroMat);
      astronautTransformed[i3] = tempV.x;
      astronautTransformed[i3 + 1] = tempV.y;
      astronautTransformed[i3 + 2] = tempV.z;
    }

    // Transform spaceship vertices to distinct left-flank space cruise corridor
    // Position: [-4.4, 0.8, -23.5], Rotation: [0.02, Math.PI - 0.15, 0.06], Scale: 0.95
    const shipMat = new THREE.Matrix4();
    const shipPos = new THREE.Vector3(-4.4, 0.8, -23.5);
    const shipRot = new THREE.Euler(0.02, Math.PI - 0.15, 0.06);
    const shipScale = new THREE.Vector3(0.95, 0.95, 0.95);
    shipMat.compose(shipPos, new THREE.Quaternion().setFromEuler(shipRot), shipScale);

    const spaceshipTransformed = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      tempV.set(spaceshipData.positions[i3], spaceshipData.positions[i3 + 1], spaceshipData.positions[i3 + 2]);
      tempV.applyMatrix4(shipMat);
      spaceshipTransformed[i3] = tempV.x;
      spaceshipTransformed[i3 + 1] = tempV.y;
      spaceshipTransformed[i3 + 2] = tempV.z;
    }

    // Generate procedural interactive fluid sphere on left flank for Contact section
    const sphereData = generateProceduralSphereParticles(count, 3.4, [-4.4, 2.4, -43.0]);

    geom.setAttribute('aAstronautPos', new THREE.BufferAttribute(astronautTransformed, 3));
    geom.setAttribute('aSpaceshipPos', new THREE.BufferAttribute(spaceshipTransformed, 3));
    geom.setAttribute('aSpherePos', new THREE.BufferAttribute(sphereData.positions, 3));
    geom.setAttribute('aDispersalDir', new THREE.BufferAttribute(astronautData.dispersalVectors, 3));
    geom.setAttribute('aColor', new THREE.BufferAttribute(astronautData.colors, 3));
    geom.setAttribute('aBrightness', new THREE.BufferAttribute(astronautData.brightness, 1));
    geom.setAttribute('aSize', new THREE.BufferAttribute(astronautData.sizes, 1));

    // Initial position points to astronaut
    geom.setAttribute('position', new THREE.BufferAttribute(astronautTransformed, 3));
    geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -20), 200);

    return geom;
  }, [astronautData, spaceshipData, particleCount]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 999) },
      uPointerRadius: { value: 3.2 },
      uBaseSize: { value: baseSize },
      uSphereActive: { value: 0 },
    }),
    [baseSize]
  );

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    const time = state.clock.elapsedTime;
    materialRef.current.uniforms.uTime.value = time;

    // Smoothly damp scroll progress
    materialRef.current.uniforms.uScrollProgress.value = THREE.MathUtils.damp(
      materialRef.current.uniforms.uScrollProgress.value,
      scrollProgress,
      12,
      delta
    );

    // Dynamic fluid sphere activation in Contact section
    const sphereTarget = scrollProgress > 0.84 ? 1.0 : 0.0;
    materialRef.current.uniforms.uSphereActive.value = THREE.MathUtils.damp(
      materialRef.current.uniforms.uSphereActive.value,
      sphereTarget,
      8,
      delta
    );

    // Softly lerp pointer position to avoid harsh or jittery ripples
    materialRef.current.uniforms.uPointer.value.lerp(pointerPos, 0.08);
    materialRef.current.uniforms.uBaseSize.value = baseSize;
  });

  if (!geometry) return null;

  return (
    <group position={[0, 0, 0]}>
      <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={continuousMorphVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
