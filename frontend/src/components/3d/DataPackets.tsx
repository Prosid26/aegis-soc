'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Node = {
  id: string;
  position: [number, number, number];
};

type Connection = {
  from: string;
  to: string;
};

type DataPacketsProps = {
  nodes: Node[];
  connections: Connection[];
  activeSection?: number;
  threatsActive?: boolean;
};

export default function DataPackets({ nodes, connections, activeSection = 0, threatsActive = false }: DataPacketsProps) {
  // Pre-calculate connection paths to avoid doing lookups in the render loop
  const paths = useMemo(() => {
    const validPaths: Array<{ start: THREE.Vector3; end: THREE.Vector3; id: string }> = [];
    connections.forEach((conn) => {
      const startNode = nodes.find(n => n.id === conn.from);
      const endNode = nodes.find(n => n.id === conn.to);
      if (startNode && endNode) {
        validPaths.push({
          start: new THREE.Vector3(...startNode.position),
          end: new THREE.Vector3(...endNode.position),
          id: `${conn.from}-${conn.to}`
        });
      }
    });
    return validPaths;
  }, [nodes, connections]);

  // Create instanced packet tracks
  // Each connection path has 3 packets distributed evenly to create a continuous flow
  const packets = useMemo(() => {
    const list: Array<{ pathIdx: number; offset: number; meshRef: React.RefObject<THREE.Mesh | null>; speed: number }> = [];
    paths.forEach((path, idx) => {
      // 3 packets per connection
      for (let i = 0; i < 3; i++) {
        list.push({
          pathIdx: idx,
          offset: i / 3, // Distribute evenly
          meshRef: { current: null },
          // Speed up packets during sections illustrating active compromise (Section 2, 3, 4)
          speed: 0.28 + (activeSection >= 2 && activeSection <= 4 ? 0.35 : 0)
        });
      }
    });
    return list;
  }, [paths, activeSection]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    packets.forEach((packet) => {
      if (!packet.meshRef.current) return;
      const path = paths[packet.pathIdx];
      if (!path) return;

      // Calculate progress parameter t in [0, 1]
      const t = (elapsed * packet.speed + packet.offset) % 1.0;
      
      // Linearly interpolate position vector
      const currentPos = new THREE.Vector3().lerpVectors(path.start, path.end, t);
      packet.meshRef.current.position.copy(currentPos);
    });
  });

  return (
    <group>
      {packets.map((packet, idx) => {
        const path = paths[packet.pathIdx];
        const isCompromisedPath = threatsActive && 
          (path.id.includes('external') || path.id.includes('firewall') || path.id.includes('auth') || path.id.includes('admin') || path.id.includes('database'));

        return (
          <mesh key={idx} ref={packet.meshRef as any}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color={isCompromisedPath ? '#ef4444' : '#00e5ff'}
              emissive={isCompromisedPath ? '#ef4444' : '#00e5ff'}
              emissiveIntensity={1.5}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
}
