import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { sampleModelPointCloud, SampledPointCloud } from '../../utils/modelSampler';
import { particleVertexShader, particleFragmentShader } from '../../shaders/particleShaders';

interface DoorwayParticlesProps {
  scrollProgress: number;
  pointerPos: THREE.Vector3;
  baseSize?: number;
  particleCount?: number;
}

export const DoorwayParticles: React.FC<DoorwayParticlesProps> = ({
  scrollProgress,
  pointerPos,
  baseSize = 2.4,
  particleCount = 14000,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [pointData, setPointData] = useState<SampledPointCloud | null>(null);

  useEffect(() => {
    let active = true;
    sampleModelPointCloud('/models/doorway.glb', particleCount, {
      modelType: 'doorway',
      targetScale: 1.0,
      centerOrigin: false,
      groundBase: true,
    }).then((data) => {
      if (active) setPointData(data);
    });
    return () => {
      active = false;
    };
  }, [particleCount]);

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

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDispersion: { value: 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 999) },
      uPointerRadius: { value: 5.5 },
      uBaseSize: { value: baseSize },
    }),
    [baseSize]
  );

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    // Doorway disperses as camera traverses threshold (0.28 to 0.55)
    let doorwayDispersion = 0;
    if (scrollProgress > 0.28) {
      const t = Math.min((scrollProgress - 0.28) / 0.24, 1.0);
      doorwayDispersion = t * t * (3 - 2 * t);
    }

    materialRef.current.uniforms.uDispersion.value = THREE.MathUtils.damp(
      materialRef.current.uniforms.uDispersion.value,
      doorwayDispersion,
      12,
      delta
    );

    materialRef.current.uniforms.uPointer.value.copy(pointerPos);
    materialRef.current.uniforms.uBaseSize.value = baseSize;
  });

  if (!geometry) return null;

  return (
    <group position={[0, 0, 0]}>
      <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
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
