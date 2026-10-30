import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { sampleModelPointCloud, SampledPointCloud } from '../../utils/modelSampler';
import { spaceshipVertexShader, particleFragmentShader } from '../../shaders/particleShaders';

interface SpaceshipParticlesProps {
  scrollProgress: number;
  pointerPos: THREE.Vector3;
  baseSize?: number;
  particleCount?: number;
}

export const SpaceshipParticles: React.FC<SpaceshipParticlesProps> = ({
  scrollProgress,
  pointerPos,
  baseSize = 2.4,
  particleCount = 11000,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [pointData, setPointData] = useState<SampledPointCloud | null>(null);

  useEffect(() => {
    let active = true;
    sampleModelPointCloud('/models/spaceship.glb', particleCount, {
      modelType: 'spaceship',
      targetScale: 1.0,
      centerOrigin: true,
      groundBase: false,
    }).then((data) => {
      if (active) setPointData(data);
    });
    return () => {
      active = false;
    };
  }, [particleCount]);

  // Build BufferGeometry with stable initial transition cloud
  const geometry = useMemo(() => {
    if (!pointData) return null;
    const geom = new THREE.BufferGeometry();
    const count = pointData.count;

    // Deterministic dispersed cloud positions
    const cloudPositions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spherical swirl distribution centered in space
      const radius = 2.0 + (i % 97) * 0.08 + Math.sin(i) * 1.5;
      const theta = (i * 0.38) % (Math.PI * 2);
      const phi = ((i * 0.17) % Math.PI) - Math.PI * 0.5;

      cloudPositions[i3] = Math.cos(phi) * Math.cos(theta) * radius * 1.6;
      cloudPositions[i3 + 1] = Math.sin(phi) * radius * 1.2;
      cloudPositions[i3 + 2] = Math.cos(phi) * Math.sin(theta) * radius * 1.8;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pointData.positions, 3));
    geom.setAttribute('aCloudPos', new THREE.BufferAttribute(cloudPositions, 3));
    geom.setAttribute('aColor', new THREE.BufferAttribute(pointData.colors, 3));
    geom.setAttribute('aBrightness', new THREE.BufferAttribute(pointData.brightness, 1));
    geom.setAttribute('aSize', new THREE.BufferAttribute(pointData.sizes, 1));
    return geom;
  }, [pointData]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAssembly: { value: 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 999) },
      uPointerRadius: { value: 4.0 },
      uBaseSize: { value: baseSize },
    }),
    [baseSize]
  );

  useFrame((state, delta) => {
    if (!materialRef.current || !groupRef.current) return;
    const time = state.clock.elapsedTime;
    materialRef.current.uniforms.uTime.value = time;

    // Assembly curve: 0.38 to 0.60
    let targetAssembly = 0;
    if (scrollProgress >= 0.38) {
      if (scrollProgress >= 0.60) {
        targetAssembly = 1.0;
      } else {
        const t = (scrollProgress - 0.38) / 0.22;
        targetAssembly = t * t * (3 - 2 * t);
      }
    }

    materialRef.current.uniforms.uAssembly.value = THREE.MathUtils.damp(
      materialRef.current.uniforms.uAssembly.value,
      targetAssembly,
      12,
      delta
    );

    // Spaceship position during Cruise phase (0.60 to 1.0):
    // Sails gracefully on the left flank of the camera view
    // Position transitions from deep center portal (z = -16) to left cruise corridor (x = -3.2, z = -24)
    if (scrollProgress < 0.55) {
      // Resting inside portal space
      groupRef.current.position.set(0, 2.5, -18.0);
      groupRef.current.rotation.set(0, Math.PI, 0); // facing forward toward camera/screen
    } else {
      // In cruise phase: placed on left side of viewport so portfolio is clear on right
      const cruiseProg = Math.min((scrollProgress - 0.55) / 0.35, 1.0);
      const targetX = THREE.MathUtils.lerp(0, -3.2, cruiseProg);
      const targetY = THREE.MathUtils.lerp(2.5, 0.6, cruiseProg) + Math.sin(time * 0.9) * 0.12;
      const targetZ = THREE.MathUtils.lerp(-18.0, -23.5, cruiseProg);

      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 8, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 8, delta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetZ, 8, delta);

      // Subtle sailing motion: roll bank & gentle pitch
      const bankRoll = Math.sin(time * 1.2) * 0.05 + 0.06; // slight bank toward right
      const pitchWave = Math.sin(time * 0.8) * 0.03;
      const yawAngle = Math.PI - 0.15; // slightly angled toward portfolio view

      groupRef.current.rotation.set(pitchWave, yawAngle, bankRoll);
    }

    materialRef.current.uniforms.uPointer.value.copy(pointerPos);
    materialRef.current.uniforms.uBaseSize.value = baseSize;
  });

  if (!geometry) return null;

  return (
    <group ref={groupRef} position={[0, 2.5, -18.0]} scale={[0.9, 0.9, 0.9]}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={spaceshipVertexShader}
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
