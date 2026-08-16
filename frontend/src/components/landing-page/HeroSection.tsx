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
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

      // Create line geometry
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([
        fromNode.position[0], fromNode.position[1], fromNode.position[2],
        toNode.position[0], toNode.position[1], toNode.position[2]
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.LineDashedMaterial({
        color: 0x00bcd4,
        dashSize: 0.2,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.4
      });

      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      line.position.set(midX, midY, midZ);

      // Calculate rotation to align with connection
      // We'll use a simple approach: look at the direction vector
      line.lookAt(new THREE.Vector3(toNode.position[0], toNode.position[1], toNode.position[2]));
      line.rotateX(Math.PI / 2); // Adjust for Three.js orientation

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
    <section className="relative min-h-[80vh] bg-zinc-950 overflow-hidden">
      {/* Technical Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%22 height=%22100%22 fill=%22%23000000%22/><path d=%22M0 0 L100 100 M100 0 L0 100%22 stroke=%22rgba(255,255,255,0.02)%22 stroke-width=%221%22/></svg>')]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0%,rgba(0,0,0,0)_70%)]"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex h-full w-full items-start">
        {/* Left Side: Copy and CTAs */}
        <div className="flex-1 flex flex-col justify-center px-8 pb-12">
          <div className="space-y-4">
            <p className="text-xs font-medium tracking-wider text-zinc-400">AEGIS SECURITY OPERATIONS</p>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              See the threat before it becomes the incident.
            </h1>
            <p className="text-zinc-300 max-w-xl">
              AegisSOC correlates security telemetry, investigates suspicious behavior, and turns fragmented signals into actionable incidents.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <a href="/dashboard"
                 className="flex h-12 w-full sm:w-auto items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90 transition-colors border border-transparent">
                Launch Security Console
              </a>
              <a href="/architecture"
                 className="flex h-12 w-full sm:w-auto items-center justify-center rounded-md border border-zinc-700 px-5 text-sm font-medium text-zinc-200 hover:border-zinc-600 hover:bg-zinc-950 transition-colors">
                Explore the Architecture
              </a>
            </div>

            {/* Technical Trust Strip */}
            <div className="mt-6 flex flex-col space-x-2 text-xs font-mono text-zinc-400">
              <div className="flex flex-wrap gap-2">
                <span>REAL-TIME TELEMETRY</span>
                <span>AI INVESTIGATION</span>
                <span>THREAT CORRELATION</span>
                <span>MITRE ATT&CK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: 3D Visualization and Panels */}
        <div className="flex-1 flex flex-col">
          <div className="relative w-full h-[500px] md:h-[600px]">
            {/* 3D Security Graph */}
            <Canvas
              style={{ position: 'absolute', inset: 0 }}
              camera={{ position: [0, 0, 10], fov: 45 }}
            >
              {/* Lights */}
              <ambientLight intensity={0.3} />
              <directionalLight intensity={0.5} position={[5, 5, 5]} castShadow />

              {/* Nodes */}
              {nodes.map(node => (
                <g key={node.id}>
                  {node.type === 'server' && (
                    <mesh
                      geometry={new THREE.BoxGeometry(0.8, 0.8, 0.8)}
                      material={new THREE.MeshStandardMaterial({
                        color: node.critical ? '#ff3333' : '#00bcd4',
                        metalness: 0.2,
                        roughness: 0.5
                      })}
                    />
                  )}
                  {node.type === 'workstation' && (
                    <mesh
                      geometry={new THREE.BoxGeometry(0.6, 0.6, 0.6)}
                      material={new THREE.MeshStandardMaterial({
                        color: '#4caf50',
                        metalness: 0.2,
                        roughness: 0.5
                      })}
                    />
                  )}
                  {node.type === 'database' && (
                    <mesh
                      geometry={new THREE.SphereGeometry(0.5, 12, 12)}
                      material={new THREE.MeshStandardMaterial({
                        color: '#ff9800',
                        metalness: 0.1,
                        roughness: 0.6
                      })}
                    />
                  )}
                  {node.type === 'firewall' && (
                    <mesh
                      geometry={new THREE.BoxGeometry(0.9, 0.3, 0.9)}
                      material={new THREE.MeshStandardMaterial({
                        color: '#9c27b0',
                        metalness: 0.2,
                        roughness: 0.4
                      })}
                    />
                  )}
                  {node.type === 'router' && (
                    <mesh
                      geometry={new THREE.BoxGeometry(0.7, 0.7, 0.2)}
                      material={new THREE.MeshStandardMaterial({
                        color: '#607d8b',
                        metalness: 0.2,
                        roughness: 0.5
                      })}
                    />
                  )}
                  {node.type === 'endpoint' && (
                    <mesh
                      geometry={new THREE.SphereGeometry(0.4, 8, 8)}
                      material={new THREE.MeshStandardMaterial({
                        color: '#2196f3',
                        metalness: 0.1,
                        roughness: 0.7
                      })}
                    />
                  )}
                  {node.type === 'external' && (
                    <mesh
                      geometry={new THREE.SphereGeometry(0.3, 8, 8)}
                      material={new THREE.MeshStandardMaterial({
                        color: '#f44336',
                        metalness: 0.3,
                        roughness: 0.4
                      })}
                    />
                  )}
                  {node.type === 'auth' && (
                    <mesh
                      geometry={new THREE.CylinderGeometry(0.4, 0.6, 8)}
                      material={new THREE.MeshStandardMaterial({
                        color: '#ff9800',
                        metalness: 0.2,
                        roughness: 0.5
                      })}
                    />
                  )}
                </g>
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

            {/* Incident Panel */}
            <div className="absolute right-4 top-4 w-[280px] bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded">
                    !
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-300">ACTIVE INCIDENT</p>
                  <p className="text-white font-semibold">{incident.title}</p>
                  <div className="mt-2 space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span>Risk Score</span>
                      <span className="font-bold">{incident.riskScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Affected Assets</span>
                      <span>{incident.affectedAssets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Events</span>
                      <span>{incident.eventCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Technique</span>
                      <span className="whitespace-nowrap">{incident.technique}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SOC Console */}
            <div className="absolute left-4 bottom-4 w-[320px] max-h-[200px] bg-black/50 backdrop-blur border border-zinc-800/30 p-3 overflow-hidden">
              <div className="text-xs font-mono text-green-400">
                {socLogs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2 mb-1">
                    <span className="text-zinc-500">[{(log.timestamp)}]</span>
                    <span>{log.message}</span>
                  </div>
                ))}

                {/* Cursor blink effect */}
                <div className="mt-2 h-0.5 w-4 bg-green-400 animate-blink" />
              </div>
            </div>
          </div>

          {/* Live Telemetry Strip */}
          <div className="relative mt-4 h-12 bg-black/60 backdrop-blur-sm border-t border-zinc-800/50 px-4">
            <div className="flex h-full items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">EVENT STREAM</span>
              <div className="flex-1 flex overflow-x-hidden whitespace-nowrap">
                {telemetry.map((event, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-zinc-500">{event.time}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${event.className}`}
                    >
                      {event.type}
                    </span>
                    <span className="flex-1 text-left">{event.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}