'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type HolographicCoreProps = {
  activeSection?: number;
  isAIAnalyst?: boolean;
};

export default function HolographicCore({ activeSection = 0, isAIAnalyst = false }: HolographicCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  // Generate data particles that flow inwards towards the core (AI ingest simulation)
  const particleCount = 45;
  const particles = useMemo(() => {
    const list: Array<{
      pos: THREE.Vector3;
      origin: THREE.Vector3;
      speed: number;
      offset: number;
      meshRef: React.RefObject<THREE.Mesh | null>;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      // Pick random direction on sphere shell
      const dir = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize();

      const origin = dir.clone().multiplyScalar(4.5); // Start outside

      list.push({
        pos: new THREE.Vector3().copy(origin),
        origin,
        speed: 0.85 + Math.random() * 0.9,
        offset: Math.random() * 1.5,
        meshRef: { current: null }
      });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    // Constant slow rotations on central group
    if (groupRef.current) {
      groupRef.current.rotation.y = elapsed * 0.15;
    }

    // Concentric rings rotating counter-directions
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = elapsed * 0.4;
      ring1Ref.current.rotation.y = elapsed * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -elapsed * 0.5;
      ring2Ref.current.rotation.z = elapsed * 0.3;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = -elapsed * 0.3;
      ring3Ref.current.rotation.x = elapsed * 0.6;
    }

    // Animate central sphere breathing pulse
    if (sphereRef.current) {
      const pulse = 1.0 + Math.sin(elapsed * 4) * 0.08;
      sphereRef.current.scale.set(pulse, pulse, pulse);
    }

    // Animate incoming intelligence particles
    particles.forEach((particle) => {
      if (!particle.meshRef.current) return;

      // Calculate progress parameter t based on velocity
      const progress = ((elapsed * particle.speed + particle.offset) % 1.0);
      
      // Interpolate from outer boundary shell to center core
      const targetPos = new THREE.Vector3().lerpVectors(particle.origin, new THREE.Vector3(0, 0, 0), progress);
      particle.meshRef.current.position.copy(targetPos);

      // Fade out as it merges
      const material = particle.meshRef.current.material as THREE.MeshBasicMaterial;
      if (material) {
        material.opacity = 1.0 - progress;
      }
    });
  });

  // Render when active on landing sections (Hero Section 0, and AI Core Section 5) or if explicitly used in AI pages
  const shouldRender = isAIAnalyst || activeSection === 0 || activeSection === 5;
  if (!shouldRender) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central Core Sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={2.0}
          roughness={0.05}
          metalness={0.95}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Wireframe outer shell */}
      <mesh>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshStandardMaterial
          color="#00e5ff"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Orbit Ring 1 (X/Y) */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.3, 0.015, 8, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.4} />
      </mesh>

      {/* Orbit Ring 2 (Y/Z) */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.6, 0.012, 8, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.3} />
      </mesh>

      {/* Orbit Ring 3 (Z/X) */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.0, 0.01, 8, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.2} />
      </mesh>

      {/* AI Telemetry outer flat alignment ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.4, 2.42, 64]} />
        <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} transparent opacity={0.12} />
      </mesh>

      {/* Ingesting flow particles */}
      {particles.map((p, idx) => (
        <mesh key={idx} ref={p.meshRef as any}>
          <boxGeometry args={[0.06, 0.06, 0.06]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={1.0}
          />
        </mesh>
      ))}
    </group>
  );
}
