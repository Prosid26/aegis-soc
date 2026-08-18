'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type CameraRigProps = {
  targetPosition: [number, number, number] | null;
  activeSection?: number;
  isLandingPage?: boolean;
};

export default function CameraRig({ targetPosition, activeSection = 0, isLandingPage = false }: CameraRigProps) {
  const { camera, controls } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentCamPos = useRef(new THREE.Vector3(0, 0, 10));

  // Determine section-specific camera paths for the landing page scroll narrative
  const getSectionCameraConfig = (section: number) => {
    switch (section) {
      case 0: // Hero: wide operational network
        return {
          pos: new THREE.Vector3(0, 0, 9.5),
          look: new THREE.Vector3(0, 0, 0)
        };
      case 1: // Telemetry: zoom in on traffic flow
        return {
          pos: new THREE.Vector3(-4, 2, 5),
          look: new THREE.Vector3(-4, 0, -2)
        };
      case 2: // Detection: Focus on compromise vector
        return {
          pos: new THREE.Vector3(-2, -0.5, 4.5),
          look: new THREE.Vector3(0, -2, 0)
        };
      case 3: // MITRE: Focus on compromised workstations
        return {
          pos: new THREE.Vector3(2, -0.5, 3.8),
          look: new THREE.Vector3(3, -1, 2)
        };
      case 4: // Incident: Focus on Database threat pulse
        return {
          pos: new THREE.Vector3(4.8, -0.2, 3),
          look: new THREE.Vector3(6, -1, -3)
        };
      case 5: // AI Core: Central spinning orb
        return {
          pos: new THREE.Vector3(0, 0, 5.5),
          look: new THREE.Vector3(0, 0, 0)
        };
      case 6: // Command terminal exit overview
        return {
          pos: new THREE.Vector3(0, 0.5, 11),
          look: new THREE.Vector3(0, 0, 0)
        };
      default:
        return {
          pos: new THREE.Vector3(0, 0, 10),
          look: new THREE.Vector3(0, 0, 0)
        };
    }
  };

  useEffect(() => {
    // Initialize current refs on mount
    if (camera) {
      currentCamPos.current.copy(camera.position);
    }
  }, [camera]);

  useFrame((state, delta) => {
    // Speed adjustments for smooth transitions
    const speed = 2.8 * delta;

    if (isLandingPage) {
      // Landing page scrolling camera path configuration
      const config = getSectionCameraConfig(activeSection);
      
      // Interpolate camera position
      currentCamPos.current.lerp(config.pos, speed);
      camera.position.copy(currentCamPos.current);

      // Interpolate camera target (lookAt)
      currentTarget.current.lerp(config.look, speed);
      camera.lookAt(currentTarget.current);
    } else {
      // Dashboard/Investigation interactive focus behavior
      let destPos = new THREE.Vector3(0, 0, 8);
      let destLook = new THREE.Vector3(0, 0, 0);

      if (targetPosition) {
        // Focus camera closer to the selected node
        const [x, y, z] = targetPosition;
        destLook.set(x, y, z);
        destPos.set(x, y, z + 3.8); // Offset along Z to view the node
      }

      // Smoothly interpolate camera position
      currentCamPos.current.lerp(destPos, speed);
      camera.position.copy(currentCamPos.current);

      // Smoothly interpolate lookAt focus
      currentTarget.current.lerp(destLook, speed);
      camera.lookAt(currentTarget.current);

      // Update controls target to prevent camera snapping on manual orbit drag
      if (controls) {
        const ctrl = controls as any;
        if (ctrl.target) {
          ctrl.target.lerp(destLook, speed);
        }
      }
    }
  });

  return null;
}
