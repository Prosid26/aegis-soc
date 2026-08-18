'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Types
type Node = {
  id: string;
  label: string;
  position: [number, number, number];
  type: 'server' | 'workstation' | 'database' | 'firewall' | 'router' | 'endpoint' | 'external' | 'auth';
  critical?: boolean;
};

type Connection = {
  from: string;
  to: string;
  label?: string;
};

type TelemetryEvent = {
  time: string;
  type: string;
  detail: string;
  className: string;
};

type IncidentInfo = {
  title: string;
  severity: string;
  riskScore: number;
  affectedAssets: number;
  eventCount: number;
  technique: string;
};

type SocLog = {
  message: string;
  timestamp: string;
};

// Attack sequence steps
const attackSteps = [
  {
    event: { time: '12:41:08', type: 'AUTH_FAILURE', detail: '185.141.63.120', className: 'text-red-400' },
    affectedNode: 'external',
    incident: {
      title: 'Credential Attack',
      severity: 'CRITICAL',
      riskScore: 30,
      affectedAssets: 1,
      eventCount: 1,
      technique: 'T1110 — Brute Force'
    },
    socLogs: [
      { message: 'correlating authentication events...', timestamp: '12:41:08' },
      { message: 'matching threat intelligence...', timestamp: '12:41:09' }
    ]
  },
  {
    event: { time: '12:41:11', type: 'AUTH_FAILURE', detail: '185.141.63.120', className: 'text-red-400' },
    affectedNode: 'external',
    incident: {
      title: 'Credential Attack',
      severity: 'CRITICAL',
      riskScore: 50,
      affectedAssets: 1,
      eventCount: 2,
      technique: 'T1110 — Brute Force'
    },
    socLogs: [
      { message: 'analyzing account behavior...', timestamp: '12:41:11' },
      { message: 'detecting brute force pattern...', timestamp: '12:41:12' }
    ]
  },
  {
    event: { time: '12:41:14', type: 'AUTH_FAILURE', detail: '185.141.63.120', className: 'text-red-400' },
    affectedNode: 'external',
    incident: {
      title: 'Credential Attack',
      severity: 'CRITICAL',
      riskScore: 70,
      affectedAssets: 1,
      eventCount: 3,
      technique: 'T1110 — Brute Force'
    },
    socLogs: [
      { message: 'mapping ATT&CK technique...', timestamp: '12:41:14' },
      { message: 'incident confidence: 70%', timestamp: '12:41:15' }
    ]
  },
  {
    event: { time: '12:41:19', type: 'BRUTE_FORCE', detail: 'auth-prod-01', className: 'text-orange-400' },
    affectedNode: 'auth',
    incident: {
      title: 'Credential Attack',
      severity: 'CRITICAL',
      riskScore: 80,
      affectedAssets: 2,
      eventCount: 4,
      technique: 'T1110 — Brute Force'
    },
    socLogs: [
      { message: 'authentication service compromised...', timestamp: '12:41:19' },
      { message: 'lateral movement attempted...', timestamp: '12:41:20' }
    ]
  },
  {
    event: { time: '12:41:24', type: 'IOC_MATCH', detail: '185.141.63.120', className: 'text-purple-400' },
    affectedNode: 'external',
    incident: {
      title: 'Credential Attack',
      severity: 'CRITICAL',
      riskScore: 85,
      affectedAssets: 2,
      eventCount: 5,
      technique: 'T1110 — Brute Force'
    },
    socLogs: [
      { message: 'threat intelligence match confirmed...', timestamp: '12:41:24' },
      { message: 'blocking external IP...', timestamp: '12:41:25' }
    ]
  },
  {
    event: { time: '12:41:28', type: 'PRIV_ESC', detail: '[admin@acme.local](mailto:admin@acme.local)', className: 'text-yellow-400' },
    affectedNode: 'admin',
    incident: {
      title: 'Privilege Escalation',
      severity: 'CRITICAL',
      riskScore: 90,
      affectedAssets: 3,
      eventCount: 6,
      technique: 'T1068 — Exploitation for Privilege Escalation'
    },
    socLogs: [
      { message: 'privilege escalation detected...', timestamp: '12:41:28' },
      { message: 'admin account compromised...', timestamp: '12:41:29' }
    ]
  },
  {
    event: { time: '12:41:33', type: 'LATERAL_MOVEMENT', detail: 'prod-api-04', className: 'text-blue-400' },
    affectedNode: 'api',
    incident: {
      title: 'Lateral Movement',
      severity: 'CRITICAL',
      riskScore: 94,
      affectedAssets: 4,
      eventCount: 7,
      technique: 'T1021 — Remote Services'
    },
    socLogs: [
      { message: 'lateral movement to API server...', timestamp: '12:41:33' },
      { message: 'data exfiltration risk detected...', timestamp: '12:41:34' }
    ]
  },
  {
    event: { time: '12:41:38', type: 'DATA_ACCESS', detail: 'db-prod-01', className: 'text-red-400' },
    affectedNode: 'database',
    incident: {
      title: 'Data Breach',
      severity: 'CRITICAL',
      riskScore: 98,
      affectedAssets: 5,
      eventCount: 8,
      technique: 'T1005 — Data from Local System'
    },
    socLogs: [
      { message: 'unauthorized database access...', timestamp: '12:41:38' },
      { message: 'incident response initiated...', timestamp: '12:41:39' }
    ]
  }
];

// Node positions and types
const nodes: Node[] = [
  { id: 'external', label: '185.141.63.120', position: [-8, 3, -4], type: 'external' },
  { id: 'firewall', label: 'FIREWALL-01', position: [-4, 0, -2], type: 'firewall' },
  { id: 'auth', label: 'AUTH-SERVICE', position: [0, -2, 0], type: 'auth' },
  { id: 'admin', label: 'ADMIN-ACCOUNT', position: [3, -1, 2], type: 'endpoint' },
  { id: 'api', label: 'PROD-API-04', position: [4, 1, -1], type: 'server' },
  { id: 'database', label: 'DB-PROD-01', position: [6, -1, -3], type: 'database', critical: true }
];

// Connections
const connections: Connection[] = [
  { from: 'external', to: 'firewall' },
  { from: 'firewall', to: 'auth' },
  { from: 'auth', to: 'admin' },
  { from: 'admin', to: 'api' },
  { from: 'api', to: 'database' }
];

// Helper to find node by id
const getNodeById = (id: string) => nodes.find(n => n.id === id);

// Helper function to create text sprite for node labels (commented out because not used and causing SSR issues)
// function createTextSprite(text: string, fontsize: number, color: string): HTMLCanvasElement {
//   // Guard against server-side rendering where document is not defined
//   if (typeof document === 'undefined') {
//     // Return a dummy canvas to avoid SSR errors
//     const canvas = document.createElement('canvas');
//     return canvas;
//   }

//   const canvas = document.createElement('canvas');
//   const context = canvas.getContext('2d');
//   if (!context) return canvas;

//   context.font = `${fontsize}px sans-serif`;
//   context.fillStyle = color;
//   context.fillText(text, 0, fontsize);

//   // Scale up for better quality
//   canvas.width = context.measureText(text).width * 2;
//   canvas.height = fontsize * 2;
//   context.scale(2, 2);
//   context.font = `${fontsize}px sans-serif`;
//   context.fillStyle = color;
//   context.fillText(text, 0, fontsize);

//   return canvas;
// }

export default function HeroSection() {
  const [stepIndex, setStepIndex] = useState(0);
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [incident, setIncident] = useState<IncidentInfo>({
    title: '',
    severity: '',
    riskScore: 0,
    affectedAssets: 0,
    eventCount: 0,
    technique: ''
  });
  const [socLogs, setSocLogs] = useState<SocLog[]>([]);
  const [isClient, setIsClient] = useState(false);
  const startTimeRef = useRef(0);
  const packetsRef = useRef<THREE.Mesh[]>([]);
  const linesRef = useRef<THREE.Line[]>([]);
  let animationFrame: number;

  // Initialize telemetry with first event
  useEffect(() => {
    setTelemetry([attackSteps[0].event]);
    setIncident(attackSteps[0].incident);
    setSocLogs(attackSteps[0].socLogs);
  }, []);

  // Auto-advance steps every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % attackSteps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update telemetry, incident, and soc logs when step changes
  useEffect(() => {
    const step = attackSteps[stepIndex];
    // Add new event to telemetry (keep last 8)
    setTelemetry(prev => {
      const newList = [...prev, step.event];
      return newList.slice(-8);
    });
    setIncident(step.incident);
    setSocLogs(step.socLogs);
  }, [stepIndex]);

  // Initialize packets and lines
  useEffect(() => {
    // Create 3 packets
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.SphereGeometry(0.08, 8, 8);
      const material = new THREE.MeshStandardMaterial({
        color: 0x00bcd4,
        emissive: 0x00bcd4,
        emissiveIntensity: 1.5
      });
      const packet = new THREE.Mesh(geometry, material);
      packet.position.set(nodes[0].position[0], nodes[0].position[1], nodes[0].position[2]);
      packetsRef.current.push(packet);
    }

    // Create lines for all connections
    connections.forEach(connection => {
      const fromNode = getNodeById(connection.from)!;
      const toNode = getNodeById(connection.to)!;

      // Calculate midpoint and distance
      const midX = (fromNode.position[0] + toNode.position[0]) / 2;
      const midY = (fromNode.position[1] + toNode.position[1]) / 2;
      const midZ = (fromNode.position[2] + toNode.position[2]) / 2;

      const dx = toNode.position[0] - fromNode.position[0];
      const dy = toNode.position[1] - fromNode.position[1];
      const dz = toNode.position[2] - fromNode.position[2];

      // Create line geometry
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([
        fromNode.position[0], fromNode.position[1], fromNode.position[2],
        toNode.position[0], toNode.position[1], toNode.position[2]
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.LineDashedMaterial({
        color: 0x00e5ff,
        dashSize: 0.25,
        gapSize: 0.15,
        transparent: true,
        opacity: 0.35
      });

      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      linesRef.current.push(line);
    });
  }, []);

  // Animation loop for packet movement
  useEffect(() => {
    const startTime = Date.now();
    startTimeRef.current = startTime;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const stepDuration = 5000; // 5 seconds
      const progressInStep = Math.min(elapsed / stepDuration, 1); // 0 to 1

      // If we've exceeded the step duration, we don't reset here because the stepIndex will change via the interval above
      // Update packets
      packetsRef.current.forEach((packet, index) => {
        const packetDuration = 1500; // 1.5 seconds
        const stagger = index * 200; // 200ms stagger
        const adjustedTime = (elapsed - stagger) % packetDuration;
        const packetProgress = adjustedTime / packetDuration; // 0 to 1

        // Get the current step's affected node to determine the active connection
        const step = attackSteps[stepIndex];
        const affectedNodeId = step.affectedNode;
        const connectionIndex = connections.findIndex(conn =>
          conn.to === affectedNodeId || conn.from === affectedNodeId
        );

        if (connectionIndex >= 0 && connectionIndex < connections.length) {
          const connection = connections[connectionIndex];
          const fromNode = getNodeById(connection.from)!;
          const toNode = getNodeById(connection.to)!;

          // Interpolate position
          const x = fromNode.position[0] + (toNode.position[0] - fromNode.position[0]) * packetProgress;
          const y = fromNode.position[1] + (toNode.position[1] - fromNode.position[1]) * packetProgress;
          const z = fromNode.position[2] + (toNode.position[2] - fromNode.position[2]) * packetProgress;

          packet.position.set(x, y, z);

          // Pulse effect
          const pulse = Math.sin(packetProgress * Math.PI * 2);
          packet.scale.set(1 + pulse * 0.3, 1 + pulse * 0.3, 1 + pulse * 0.3);
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [stepIndex]); // Re-run when stepIndex changes to reset start time

  // Client-side detection for SSR compatibility
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="relative min-h-[85vh] bg-[#03070b] overflow-hidden flex flex-col justify-center cyber-grid-dot border-b border-panel-border">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-blue/5 rounded-full filter blur-[120px]"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Copy and CTAs */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center space-x-2 text-[10px] font-mono tracking-widest text-cyber-blue uppercase bg-cyber-blue-muted px-2.5 py-1 border border-cyber-blue/20 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-pulse"></span>
                <span>AEGIS SOC PLATFORM</span>
              </span>
            </div>
            
            <h1 className="text-4xl font-extrabold text-white md:text-5xl tracking-tight leading-none">
              Autonomous threat intelligence & correlation.
            </h1>
            
            <p className="text-zinc-400 text-base leading-relaxed max-w-lg">
              AegisSOC correlates fragmented security telemetry, investigates suspicious behavior, and resolves attacks before they impact operations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a href="/dashboard"
               className="flex h-11 items-center justify-center rounded bg-cyber-blue hover:bg-primary-hover px-6 text-sm font-semibold text-[#03070b] hover:shadow-lg hover:shadow-cyber-blue/20 transition-all duration-300">
              Launch Security Console
            </a>
            <a href="/architecture"
               className="flex h-11 items-center justify-center rounded border border-panel-border bg-panel/50 px-6 text-sm font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition-all duration-300 hover:bg-panel">
              Explore Architecture
            </a>
          </div>

          {/* Technical Trust Strip */}
          <div className="border-t border-panel-border/50 pt-4 space-y-2">
            <p className="text-[10px] font-mono text-zinc-500 tracking-wider">PLATFORM PROTOCOLS</p>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-panel/80 border border-panel-border/30">REAL-TIME SIEM</span>
              <span className="px-2 py-0.5 rounded bg-panel/80 border border-panel-border/30">MITRE ENGAGE</span>
              <span className="px-2 py-0.5 rounded bg-panel/80 border border-panel-border/30">AI SECURITY CO-PILOT</span>
              <span className="px-2 py-0.5 rounded bg-panel/80 border border-panel-border/30">XDR PIPELINE</span>
            </div>
          </div>
        </div>

        {/* Right Side: 3D Visualization and Panels */}
        <div className="lg:col-span-7 flex flex-col relative w-full h-[550px] lg:h-[600px] bg-panel/20 rounded-lg border border-panel-border/40 overflow-hidden backdrop-blur-sm shadow-2xl">
          {/* Cyber Scanline/Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 border border-panel-border/20 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#03070b]/20 via-transparent to-[#03070b]/50"></div>
          </div>

          {/* 3D Security Graph */}
          {isClient && (
            <Canvas
              style={{ position: 'absolute', inset: 0, zIndex: 1 }}
              camera={{ position: [0, 0, 10], fov: 42 }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight intensity={0.8} position={[5, 8, 5]} />

              {/* Nodes */}
              {nodes.map(node => (
                <group key={node.id} position={node.position}>
                  {node.type === 'server' && (
                    <mesh>
                      <boxGeometry args={[0.7, 0.7, 0.7]} />
                      <meshStandardMaterial
                        color={node.critical ? '#ef4444' : '#00e5ff'}
                        metalness={0.8}
                        roughness={0.2}
                        emissive={node.critical ? '#ef4444' : '#00e5ff'}
                        emissiveIntensity={0.2}
                      />
                    </mesh>
                  )}
                  {node.type === 'workstation' && (
                    <mesh>
                      <boxGeometry args={[0.5, 0.5, 0.5]} />
                      <meshStandardMaterial
                        color="#10b981"
                        metalness={0.6}
                        roughness={0.3}
                      />
                    </mesh>
                  )}
                  {node.type === 'database' && (
                    <mesh>
                      <sphereGeometry args={[0.45, 16, 16]} />
                      <meshStandardMaterial
                        color="#eab308"
                        metalness={0.4}
                        roughness={0.4}
                        emissive="#eab308"
                        emissiveIntensity={0.1}
                      />
                    </mesh>
                  )}
                  {node.type === 'firewall' && (
                    <mesh>
                      <boxGeometry args={[0.8, 0.25, 0.8]} />
                      <meshStandardMaterial
                        color="#a855f7"
                        metalness={0.7}
                        roughness={0.2}
                      />
                    </mesh>
                  )}
                  {node.type === 'router' && (
                    <mesh>
                      <boxGeometry args={[0.6, 0.6, 0.15]} />
                      <meshStandardMaterial
                        color="#64748b"
                        metalness={0.8}
                        roughness={0.2}
                      />
                    </mesh>
                  )}
                  {node.type === 'endpoint' && (
                    <mesh>
                      <sphereGeometry args={[0.35, 12, 12]} />
                      <meshStandardMaterial
                        color="#0284c7"
                        metalness={0.5}
                        roughness={0.4}
                      />
                    </mesh>
                  )}
                  {node.type === 'external' && (
                    <mesh>
                      <sphereGeometry args={[0.3, 12, 12]} />
                      <meshStandardMaterial
                        color="#ef4444"
                        metalness={0.9}
                        roughness={0.1}
                        emissive="#ef4444"
                        emissiveIntensity={0.4}
                      />
                    </mesh>
                  )}
                  {node.type === 'auth' && (
                    <mesh>
                      <cylinderGeometry args={[0.3, 0.45, 0.7, 12]} />
                      <meshStandardMaterial
                        color="#f97316"
                        metalness={0.5}
                        roughness={0.3}
                      />
                    </mesh>
                  )}
                </group>
              ))}

              {/* Connections (Lines) */}
              {linesRef.current.map((line, index) => (
                <primitive key={index} object={line} />
              ))}

              {/* Packets */}
              {packetsRef.current.map((packet, index) => (
                <primitive key={index} object={packet} />
              ))}
            </Canvas>
          )}

          {/* Incident Panel overlay */}
          <div className="absolute right-4 top-4 w-[280px] bg-panel/90 backdrop-blur-md border border-panel-border p-4 z-10 shadow-2xl rounded">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 flex items-center justify-center bg-severity-critical/20 border border-severity-critical/30 text-severity-critical text-xs font-bold rounded animate-pulse">
                  ⚠
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono tracking-widest text-zinc-500">ACTIVE DETECTED IMPACT</p>
                <p className="text-zinc-100 font-bold text-sm truncate">{incident.title}</p>
                <div className="mt-2 space-y-1.5 text-[11px] font-mono text-zinc-400">
                  <div className="flex justify-between border-b border-panel-border/30 pb-0.5">
                    <span>Risk Score</span>
                    <span className="font-bold text-severity-critical">{incident.riskScore}/100</span>
                  </div>
                  <div className="flex justify-between border-b border-panel-border/30 pb-0.5">
                    <span>Affected Assets</span>
                    <span className="text-zinc-200">{incident.affectedAssets}</span>
                  </div>
                  <div className="flex justify-between border-b border-panel-border/30 pb-0.5">
                    <span>Events Correlated</span>
                    <span className="text-zinc-200">{incident.eventCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MITRE Technique</span>
                    <span className="text-cyber-blue truncate max-w-[140px]">{incident.technique.split(' — ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SOC Console overlay */}
          <div className="absolute left-4 bottom-4 w-[320px] max-h-[170px] bg-panel/95 backdrop-blur-md border border-panel-border p-3 overflow-hidden z-10 shadow-2xl rounded">
            <div className="text-[11px] font-mono text-severity-low">
              {socLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2 mb-1">
                  <span className="text-zinc-600 font-semibold">[{log.timestamp}]</span>
                  <span className="text-zinc-300">{log.message}</span>
                </div>
              ))}
              <div className="mt-1 h-0.5 w-3 bg-severity-low animate-pulse" />
            </div>
          </div>

          {/* Live Telemetry Strip */}
          <div className="absolute bottom-0 inset-x-0 h-11 bg-panel-header border-t border-panel-border px-4 flex items-center justify-between text-[11px] font-mono z-10">
            <span className="text-zinc-500 font-bold tracking-wider shrink-0 mr-3">CORRELATOR FEED</span>
            <div className="flex-1 flex overflow-hidden whitespace-nowrap space-x-6">
              {telemetry.map((event, index) => (
                <div key={index} className="flex items-center space-x-2 shrink-0">
                  <span className="text-zinc-600">[{event.time}]</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    event.className.includes('text-red') ? 'bg-severity-critical/10 text-severity-critical' :
                    event.className.includes('text-orange') ? 'bg-severity-high/10 text-severity-high' :
                    event.className.includes('text-purple') ? 'bg-purple-500/10 text-purple-400' :
                    'bg-cyber-blue/10 text-cyber-blue'
                  }`}>
                    {event.type}
                  </span>
                  <span className="text-zinc-400">{event.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}