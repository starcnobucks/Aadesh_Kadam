import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { CosmicCamera } from './CosmicCamera';
import { StarField } from './StarField';
import { DoorwayParticles } from './DoorwayParticles';
import { ContinuousOdysseyParticles } from './ContinuousOdysseyParticles';

interface CosmicCanvasProps {
  scrollProgress: number;
  particleDensity?: 'optimal' | 'cinematic';
  debugWireframe?: boolean;
}

export const CosmicCanvas: React.FC<CosmicCanvasProps> = ({
  scrollProgress,
  particleDensity = 'cinematic',
  debugWireframe = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointerNormalized, setPointerNormalized] = useState({ x: 0, y: 0 });
  const [pointer3D, setPointer3D] = useState(new THREE.Vector3(999, 999, 999));

  // Particle counts and base sizes
  const counts = useMemo(() => {
    if (particleDensity === 'optimal') {
      return {
        continuousPool: 9000,
        doorway: 10000,
        baseSize: 0.95,
      };
    }
    return {
      continuousPool: 14000,
      doorway: 16000,
      baseSize: 1.1,
    };
  }, [particleDensity]);



  // Software WebGL detection guard per Three.js skill directives
  const isSoftwareGl = useMemo(() => {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      return false;
    }
  }, []);

  // Track cursor movement
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      setPointerNormalized({ x: nx, y: ny });

      // Approximate 3D position at current focal depth
      const currentZ =
        scrollProgress > 0.75
          ? THREE.MathUtils.lerp(-24.0, -43.0, (scrollProgress - 0.75) / 0.25)
          : THREE.MathUtils.lerp(3.0, -24.0, scrollProgress / 0.75);
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      const fovRad = (55 * Math.PI) / 180;
      const halfH = Math.tan(fovRad * 0.5) * 12.0;
      const halfW = halfH * aspect;
      setPointer3D(new THREE.Vector3(nx * halfW - (scrollProgress > 0.8 ? 1.5 : 0), ny * halfH + 2.0, currentZ));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#020308]"
      data-testid="cosmic-canvas-container"
    >
      <Canvas
        camera={{ position: [0, 1.6, 12], fov: 55, near: 0.1, far: 350 }}
        dpr={isSoftwareGl ? 1.0 : Math.min(window.devicePixelRatio || 1, 2.0)}
        gl={{
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <color attach="background" args={['#02040a']} />

        {/* Camera controller smoothly travelling on scroll */}
        <CosmicCamera
          scrollProgress={scrollProgress}
          pointerNormalized={pointerNormalized}
        />

        {/* 3-Tier Layered Cosmic Starfield */}
        <StarField scrollProgress={scrollProgress} />

        {/* Monumental Doorway Particle System */}
        <DoorwayParticles
          scrollProgress={scrollProgress}
          pointerPos={pointer3D}
          baseSize={counts.baseSize}
          particleCount={counts.doorway}
        />

        {/* Unified Continuous Morphing Particle Pool (Astronaut -> Spaceship -> Interactive Sphere) */}
        <ContinuousOdysseyParticles
          scrollProgress={scrollProgress}
          pointerPos={pointer3D}
          baseSize={counts.baseSize}
          particleCount={counts.continuousPool}
        />

        {/* Dev debug mode: bounds only in development, never in production */}
        {process.env.NODE_ENV === 'development' && debugWireframe && (
          <gridHelper args={[40, 20, 0x334466, 0x112233]} position={[0, 0, 0]} />
        )}
      </Canvas>
    </div>
  );
};
