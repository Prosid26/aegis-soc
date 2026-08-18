'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';

type Node = {
  id: string;
  position: [number, number, number];
};

type Connection = {
  from: string;
  to: string;
};

type ThreatConnectionsProps = {
  nodes: Node[];
  connections: Connection[];
  threatsActive?: boolean;
};

export default function ThreatConnections({ nodes, connections, threatsActive = false }: ThreatConnectionsProps) {
  // Map connections into lines with coordinate pairs
  const linesData = useMemo(() => {
    const list: Array<{ points: [number, number, number][]; fromId: string; toId: string; key: string }> = [];
    
    connections.forEach((conn) => {
      const startNode = nodes.find(n => n.id === conn.from);
      const endNode = nodes.find(n => n.id === conn.to);
      
      if (startNode && endNode) {
        list.push({
          points: [startNode.position, endNode.position],
          fromId: conn.from,
          toId: conn.to,
          key: `${conn.from}-${conn.to}`
        });
      }
    });

    return list;
  }, [nodes, connections]);

  return (
    <group>
      {linesData.map((line) => {
        // Highlight connections that are compromised/under active threat simulation
        const isCompromised = threatsActive && 
          (line.key.includes('external') || line.key.includes('firewall') || line.key.includes('auth') || line.key.includes('admin') || line.key.includes('database'));

        return (
          <Line
            key={line.key}
            points={line.points}
            color={isCompromised ? '#ef4444' : '#00e5ff'}
            lineWidth={isCompromised ? 1.6 : 0.8}
            transparent
            opacity={isCompromised ? 0.8 : 0.15}
          />
        );
      })}
    </group>
  );
}
