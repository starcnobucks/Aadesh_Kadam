import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { starfieldVertexShader, starfieldFragmentShader } from '../../shaders/particleShaders';

interface StarFieldProps {
  scrollProgress: number;
}

export const StarField: React.FC<StarFieldProps> = ({ scrollProgress }) => {
  const nearRef = useRef<THREE.Points>(null);
  const midRef = useRef<THREE.Points>(null);
  const distRef = useRef<THREE.Points>(null);

  const nearMat = useRef<THREE.ShaderMaterial>(null);
  const midMat = useRef<THREE.ShaderMaterial>(null);
  const distMat = useRef<THREE.ShaderMaterial>(null);

  // Layer 1: Distant stars (~4,500 points, deep space sphere r=120, very slow twinkle, dim silver/cool-blue)
  const distantGeometry = useMemo(() => {
    const count = 4500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const twinkle = new Float32Array(count);
    const bright = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = 90 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      const isRareBright = Math.random() < 0.04;
      bright[i] = isRareBright ? 0.95 : 0.35 + Math.random() * 0.3;

      const isCoolBlue = Math.random() < 0.35;
      col[i3] = isCoolBlue ? 0.82 : 0.94;
      col[i3 + 1] = isCoolBlue ? 0.90 : 0.96;
      col[i3 + 2] = 1.0;

      twinkle[i] = Math.random() * Math.PI * 2;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aTwinklePhase', new THREE.BufferAttribute(twinkle, 1));
    g.setAttribute('aBrightness', new THREE.BufferAttribute(bright, 1));
    return g;
  }, []);

  // Layer 2: Mid-depth stars (~3,000 points, cylinder corridor z=-60 to +30, r=45)
  const midGeometry = useMemo(() => {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const twinkle = new Float32Array(count);
    const bright = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const rad = 25 + Math.random() * 45;
      const angle = Math.random() * Math.PI * 2;
      const z = -65 + Math.random() * 95;

      pos[i3] = Math.cos(angle) * rad;
      pos[i3 + 1] = Math.sin(angle) * rad * 0.75;
      pos[i3 + 2] = z;

      const isRareBright = Math.random() < 0.07;
      bright[i] = isRareBright ? 1.1 : 0.45 + Math.random() * 0.4;

      col[i3] = 0.88 + Math.random() * 0.1;
      col[i3 + 1] = 0.94 + Math.random() * 0.05;
      col[i3 + 2] = 1.0;

      twinkle[i] = Math.random() * Math.PI * 2;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aTwinklePhase', new THREE.BufferAttribute(twinkle, 1));
    g.setAttribute('aBrightness', new THREE.BufferAttribute(bright, 1));
    return g;
  }, []);

  // Layer 3: Near floating cosmic dust (~1,200 points, subtle parallax)
  const nearGeometry = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const twinkle = new Float32Array(count);
    const bright = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 35;
      pos[i3 + 1] = (Math.random() - 0.5) * 22;
      pos[i3 + 2] = -50 + Math.random() * 65;

      bright[i] = 0.35 + Math.random() * 0.45;
      col[i3] = 0.92;
      col[i3 + 1] = 0.96;
      col[i3 + 2] = 1.0;
      twinkle[i] = Math.random() * Math.PI * 2;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aTwinklePhase', new THREE.BufferAttribute(twinkle, 1));
    g.setAttribute('aBrightness', new THREE.BufferAttribute(bright, 1));
    return g;
  }, []);

  const distUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTwinkleSpeed: { value: 0.8 },
      uBaseSize: { value: 1.4 },
    }),
    []
  );

  const midUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTwinkleSpeed: { value: 1.3 },
      uBaseSize: { value: 1.8 },
    }),
    []
  );

  const nearUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTwinkleSpeed: { value: 2.0 },
      uBaseSize: { value: 2.2 },
    }),
    []
  );

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (distMat.current) distMat.current.uniforms.uTime.value = time;
    if (midMat.current) midMat.current.uniforms.uTime.value = time;
    if (nearMat.current) nearMat.current.uniforms.uTime.value = time;

    // Continuous slow cosmic drift even without scrolling
    // Distant stars rotate imperceptibly
    if (distRef.current) distRef.current.rotation.y = time * 0.003;

    // Mid stars have subtle roll and parallax
    if (midRef.current) {
      midRef.current.rotation.z = time * 0.006;
      const targetMidZ = scrollProgress * 15.0 - (time * 0.4) % 15.0;
      midRef.current.position.z = THREE.MathUtils.damp(
        midRef.current.position.z,
        targetMidZ,
        3,
        delta
      );
    }

    // Near dust continuously drifts gently forward toward the doorway (-Z)
    if (nearRef.current) {
      // Endless smooth flow toward doorway with scroll amplification
      const flowZ = scrollProgress * 25.0 - (time * 1.2) % 30.0;
      nearRef.current.position.z = THREE.MathUtils.damp(
        nearRef.current.position.z,
        flowZ,
        4,
        delta
      );
      nearRef.current.rotation.y = Math.sin(time * 0.1) * 0.04;
    }
  });


  return (
    <group>
      {/* Distant stars */}
      <points ref={distRef} geometry={distantGeometry}>
        <shaderMaterial
          ref={distMat}
          vertexShader={starfieldVertexShader}
          fragmentShader={starfieldFragmentShader}
          uniforms={distUniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Mid stars */}
      <points ref={midRef} geometry={midGeometry}>
        <shaderMaterial
          ref={midMat}
          vertexShader={starfieldVertexShader}
          fragmentShader={starfieldFragmentShader}
          uniforms={midUniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Near dust */}
      <points ref={nearRef} geometry={nearGeometry}>
        <shaderMaterial
          ref={nearMat}
          vertexShader={starfieldVertexShader}
          fragmentShader={starfieldFragmentShader}
          uniforms={nearUniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
