import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { sampleModelPointCloud, SampledPointCloud } from '../../utils/modelSampler';
import { getAstronautDispersion } from '../../utils/cosmicMath';
import { particleVertexShader, particleFragmentShader } from '../../shaders/particleShaders';

interface AstronautParticlesProps {
  scrollProgress: number; // 0 to 1
  pointerPos: THREE.Vector3;
  baseSize?: number;
  particleCount?: number;
}

export const AstronautParticles: React.FC<AstronautParticlesProps> = ({
  scrollProgress,
  pointerPos,
  baseSize = 2.2,
  particleCount = 10000,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [pointData, setPointData] = useState<SampledPointCloud | null>(null);

  // Load hidden GLB and sample surface once into point cloud (with automatic procedural fallback)
  useEffect(() => {
    let active = true;
    sampleModelPointCloud('/models/astronaut.glb', particleCount, {
      modelType: 'astronaut',
      targetScale: 1.0,
      centerOrigin: true,
      groundBase: true,
    }).then((data) => {
      if (active) setPointData(data);
    });
    return () => {
      active = false;
    };
  }, [particleCount]);

  // Construct stable BufferGeometry
  const geometry = useMemo(() => {
    if (!pointData) return null;
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pointData.positions, 3));
    geom.setAttribute('aDispersalDir', new THREE.BufferAttribute(pointData.dispersalVectors, 3));
    geom.setAttribute('aColor', new THREE.BufferAttribute(pointData.colors, 3));
    geom.setAttribute('aBrightness', new THREE.BufferAttribute(pointData.brightness, 1));
    geom.setAttribute('aSize', new THREE.BufferAttribute(pointData.sizes, 1));
    return geom;
  }, [pointData]);

  // Stable uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDispersion: { value: 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 999) },
      uPointerRadius: { value: 3.5 },
      uBaseSize: { value: baseSize },
    }),
    [baseSize]
  );

  // Update animation frame loop
  useFrame((state, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    // Smoothly calculate dispersion from scroll progress
    const targetDispersion = getAstronautDispersion(scrollProgress, 0.16, 0.48);
    // Smooth frame-rate independent damp
    materialRef.current.uniforms.uDispersion.value = THREE.MathUtils.damp(
      materialRef.current.uniforms.uDispersion.value,
      targetDispersion,
      14,
      delta
    );

    // Update pointer coordinates
    materialRef.current.uniforms.uPointer.value.copy(pointerPos);
    materialRef.current.uniforms.uBaseSize.value = baseSize;
  });

  if (!geometry) return null;

  return (
    // Static standing pose next to the doorway, facing toward the luminous rectangular portal
    <group position={[2.5, 0.65, 3.2]} rotation={[0, -Math.PI * 0.72, 0]} scale={[0.88, 0.88, 0.88]}>
      <points ref={pointsRef} geometry={geometry}>



        <shaderMaterial
          ref={materialRef}
          vertexShader={particleVertexShader}
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
