'use client';

import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import ThreatNode from './ThreatNode';
import ThreatConnections from './ThreatConnections';
import DataPackets from './DataPackets';
import HolographicCore from './HolographicCore';
import CameraRig from './CameraRig';

type NodeType = 'server' | 'workstation' | 'database' | 'firewall' | 'router' | 'endpoint' | 'external' | 'auth';

type Node = {
  id: string;
  label: string;
  position: [number, number, number];
  type: NodeType;
  critical?: boolean;
  warning?: boolean;
};

type Connection = {
  from: string;
  to: string;
};

type ThreatGraphProps = {
  nodes?: Node[];
  connections?: Connection[];
  selectedNodeId?: string | null;
  onNodeSelect?: (id: string | null) => void;
  activeSection?: number;
  isLandingPage?: boolean;
  threatsActive?: boolean;
};

// Default high-fidelity topological map if none provided
const defaultNodes: Node[] = [
  { id: 'external', label: '185.141.63.120', position: [-6, 2.5, -3], type: 'external', critical: true },
  { id: 'firewall', label: 'FW-INGRESS-01', position: [-3, 0.5, -1], type: 'firewall' },
  { id: 'auth', label: 'AUTH-GATE-PROD', position: [0, -1, 0.5], type: 'auth', warning: true },
  { id: 'admin', label: 'SEC-WORKSTATION', position: [3, 0.5, 1.5], type: 'workstation' },
  { id: 'api', label: 'PROD-API-04', position: [3, 2, -1], type: 'server' },
  { id: 'database', label: 'DB-PROD-01', position: [6, -0.5, -2], type: 'database', critical: true }
];

const defaultConnections: Connection[] = [
  { from: 'external', to: 'firewall' },
  { from: 'firewall', to: 'auth' },
  { from: 'auth', to: 'admin' },
  { from: 'admin', to: 'api' },
  { from: 'api', to: 'database' }
];

export default function ThreatGraph({
  nodes = defaultNodes,
  connections = defaultConnections,
  selectedNodeId = null,
  onNodeSelect,
  activeSection = 0,
  isLandingPage = false,
  threatsActive = true
}: ThreatGraphProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const hoveredNode = nodes.find(n => n.id === hoveredNodeId);

  const handleNodeClick = (id: string) => {
    if (onNodeSelect) {
      if (selectedNodeId === id) {
        onNodeSelect(null); // Deselect on double-tap
      } else {
        onNodeSelect(id);
      }
    }
  };

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 42 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight intensity={0.8} position={[5, 10, 5]} />
        <pointLight intensity={0.5} position={[-5, -5, -5]} />

        {/* Cinematic Starfield Background */}
        <Stars radius={80} depth={40} count={600} factor={3.5} saturation={0.5} fade speed={1.2} />

        <gridHelper 
          args={[30, 24, '#00e5ff', '#1e293b']} 
          position={[0, -3.5, 0]} 
        >
          <lineBasicMaterial attach="material" opacity={0.06} transparent />
        </gridHelper>

        {/* Central Rotating Security / AI Core Ring Visualizer */}
        <HolographicCore activeSection={activeSection} isAIAnalyst={activeSection === 5} />

        {/* Dynamic Data Traffic Ingestion */}
        {activeSection !== 5 && (
          <DataPackets 
            nodes={nodes} 
            connections={connections} 
            activeSection={activeSection} 
            threatsActive={threatsActive} 
          />
        )}

        {/* Network Topography Connections */}
        {activeSection !== 5 && (
          <ThreatConnections 
            nodes={nodes} 
            connections={connections} 
            threatsActive={threatsActive} 
          />
        )}

        {/* Network Topography Nodes */}
        {activeSection !== 5 && nodes.map((node) => (
          <ThreatNode
            key={node.id}
            id={node.id}
            position={node.position}
            type={node.type}
            label={node.label}
            critical={node.critical}
            warning={node.warning}
            selected={selectedNodeId === node.id}
            onClick={() => handleNodeClick(node.id)}
            onHover={(hovered) => setHoveredNodeId(hovered ? node.id : null)}
          />
        ))}

        {/* Anchored 3D Space Tooltip Overlays */}
        {hoveredNode && activeSection !== 5 && (
          <Html position={hoveredNode.position} distanceFactor={14} style={{ pointerEvents: 'none' }}>
            <div className="bg-[#03070b]/90 border border-panel-border/80 text-white font-mono text-[9px] p-2.5 rounded shadow-2xl space-y-1 select-none w-44 backdrop-blur-sm z-50">
              <div className="flex justify-between border-b border-panel-border/30 pb-1">
                <span className="text-zinc-500 uppercase">IP/ASSET</span>
                <span className="font-bold text-white truncate max-w-[100px]">{hoveredNode.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">NODE CLASS</span>
                <span className="text-cyber-blue uppercase font-bold">{hoveredNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">THREAT STATE</span>
                <span className={hoveredNode.critical ? 'text-severity-critical font-bold' : hoveredNode.warning ? 'text-severity-high font-bold' : 'text-severity-low font-bold'}>
                  {hoveredNode.critical ? 'COMPROMISED' : hoveredNode.warning ? 'SUSPICIOUS' : 'SECURED'}
                </span>
              </div>
            </div>
          </Html>
        )}

        {/* Focus Rig camera controller */}
        <CameraRig
          targetPosition={selectedNode ? selectedNode.position : null}
          activeSection={activeSection}
          isLandingPage={isLandingPage}
        />

        {/* Orbit Interactions */}
        {!isLandingPage && (
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            maxPolarAngle={Math.PI / 1.8} 
            minDistance={2.5} 
            maxDistance={15} 
          />
        )}
      </Canvas>
    </div>
  );
}
