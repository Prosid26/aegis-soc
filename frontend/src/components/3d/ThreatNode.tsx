'use client';

import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type NodeType = 'server' | 'workstation' | 'database' | 'firewall' | 'router' | 'endpoint' | 'external' | 'auth';

type ThreatNodeProps = {
  id: string;
  position: [number, number, number];
  type: NodeType;
  label: string;
  critical?: boolean;
  warning?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
};

export default function ThreatNode({
  id,
  position,
  type,
  label,
  critical = false,
  warning = false,
  selected = false,
  onClick,
  onHover
}: ThreatNodeProps) {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);

  // Determine geometry parameters based on node type
  const getGeometry = (type: NodeType) => {
    switch (type) {
      case 'database':
        return <sphereGeometry args={[0.35, 16, 16]} />;
      case 'firewall':
        return <boxGeometry args={[0.6, 0.22, 0.6]} />;
      case 'router':
        return <cylinderGeometry args={[0.26, 0.26, 0.15, 16]} />;
      case 'auth':
        return <cylinderGeometry args={[0.22, 0.32, 0.5, 16]} />;
      default: // server, workstation, endpoint, external
        return <boxGeometry args={[0.38, 0.38, 0.38]} />;
    }
  };

  // Determine node base color states
  const getNodeColor = () => {
    if (critical) return '#ef4444'; // Red
    if (warning) return '#f97316';  // Orange
    return '#00e5ff';               // Cyan (healthy)
  };

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // Concentric threat warning rings animation
    if (ringRef.current && (critical || warning)) {
      const scale = 1.0 + (elapsed * 2.2) % 2.0;
      ringRef.current.scale.set(scale, scale, scale);
      const material = ringRef.current.material as THREE.MeshBasicMaterial;
      if (material) {
        material.opacity = Math.max(0, 1.0 - (scale - 1.0) / 2.0) * 0.45;
      }
    }
  });

  const color = getNodeColor();
  const baseScale = selected ? 1.45 : hovered ? 1.25 : 1.0;

  return (
    <group position={position}>
      {/* Central Node Mesh */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          if (onHover) onHover(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          if (onHover) onHover(false);
        }}
        scale={[baseScale, baseScale, baseScale]}
      >
        {getGeometry(type)}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || selected ? 1.2 : 0.25}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      {/* Selected Indicator Outline */}
      {selected && (
        <mesh>
          <sphereGeometry args={[0.62, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.25}
          />
        </mesh>
      )}

      {/* Expanding warning rings (for critical threats / warnings) */}
      {(critical || warning) && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.53, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
