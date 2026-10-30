import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { getCameraJourney } from '../../utils/cosmicMath';

interface CosmicCameraProps {
  scrollProgress: number; // 0 to 1
  pointerNormalized: { x: number; y: number };
}

export const CosmicCamera: React.FC<CosmicCameraProps> = ({
  scrollProgress,
  pointerNormalized,
}) => {
  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 4.5, -8.0));
  const tempVec = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const journey = getCameraJourney(scrollProgress);

    // Subtle pointer parallax tilt
    const parallaxX = pointerNormalized.x * 0.45;
    const parallaxY = pointerNormalized.y * 0.35;

    const destX = journey.posX + parallaxX;
    const destY = journey.posY + parallaxY;
    const destZ = journey.posZ;

    // Smooth exponential damping
    camera.position.x = THREE.MathUtils.damp(camera.position.x, destX, 8, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, destY, 8, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, destZ, 8, delta);

    // Target lookAt interpolation
    tempVec.current.set(journey.targetX, journey.targetY, journey.targetZ);
    currentTarget.current.lerp(tempVec.current, Math.min(1.0, delta * 9));
    camera.lookAt(currentTarget.current);

    // FOV adjustment
    const persCamera = camera as THREE.PerspectiveCamera;
    if (persCamera.fov !== journey.fov) {
      persCamera.fov = THREE.MathUtils.damp(persCamera.fov, journey.fov, 6, delta);
      persCamera.updateProjectionMatrix();
    }
  });

  return null;
};
