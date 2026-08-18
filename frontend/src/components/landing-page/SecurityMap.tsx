'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Radio, Compass, RefreshCw } from 'lucide-react';

export default function SecurityMap() {
  const [isClient, setIsClient] = useState(false);
  const [sweepAngle, setSweepAngle] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      setSweepAngle(prev => (prev + 2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Mock data for the threat map
  const locations = [
    { id: 1, name: 'New York, USA', lat: 40.7128, lng: -74.0060, status: 'active', threatLevel: 'high' },
    { id: 2, name: 'London, UK', lat: 51.5074, lng: -0.1278, status: 'monitoring', threatLevel: 'medium' },
    { id: 3, name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, status: 'active', threatLevel: 'low' },
    { id: 4, name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, status: 'secure', threatLevel: 'low' },
    { id: 5, name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333, status: 'alert', threatLevel: 'critical' },
    { id: 6, name: 'Frankfurt, Germany', lat: 50.1109, lng: 8.6821, status: 'monitoring', threatLevel: 'medium' },
  ];

  const threats = [
    { id: 1, ip: '185.141.63.120', location: 'New York, USA', type: 'C2 Server', confidence: 95 },
    { id: 2, ip: '104.244.42.1', location: 'Frankfurt, Germany', type: 'Tor Exit Node', confidence: 80 },
    { id: 3, ip: '45.33.32.156', location: 'São Paulo, Brazil', type: 'Malware Distribution', confidence: 90 },
  ];

  // Convert lat/lng to approximate x/y on 1000x500 flat SVG grid
  const getCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) * (1000 / 360));
    const y = ((90 - lat) * (500 / 180));
    return { x, y };
  };

  return (
    <section className="relative z-10 pt-20 pb-24 bg-[#03070b] border-b border-panel-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-panel rounded-lg border border-panel-border overflow-hidden shadow-2xl">
          {/* Header Panel */}
          <div className="border-b border-panel-border bg-panel-header px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 border border-panel-border rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                  <span>SIMULATED THREAT FEED</span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Global Sensor Grid</h3>
            </div>
            
            {/* Status Legend */}
            <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-400">
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-severity-critical mr-1.5 animate-pulse"></span>
                Critical Threat
              </span>
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-severity-high mr-1.5"></span>
                Active Attack
              </span>
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-severity-medium mr-1.5"></span>
                Monitoring
              </span>
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-severity-low mr-1.5"></span>
                Secure
              </span>
            </div>
          </div>

          <div className="relative h-[480px] bg-panel-header/20 overflow-hidden flex items-center justify-center">
            {isClient ? (
              <div className="w-full h-full p-4 relative">
                {/* Dotted grid lines & radar sweeps */}
                <svg className="w-full h-full bg-[#020508]/85 border border-panel-border/30 rounded" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                    </radialGradient>
                    <filter id="cyberGlow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Horizontal and Vertical Grid Lines */}
                  {[...Array(10)].map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="0"
                      y1={i * 50}
                      x2="1000"
                      y2={i * 50}
                      stroke="#131920"
                      strokeWidth="0.5"
                      strokeDasharray="4,8"
                    />
                  ))}
                  {[...Array(20)].map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * 50}
                      y1="0"
                      x2={i * 50}
                      y2="500"
                      stroke="#131920"
                      strokeWidth="0.5"
                      strokeDasharray="4,8"
                    />
                  ))}

                  {/* Radar Concentric Rings in center */}
                  <circle cx="500" cy="250" r="100" fill="none" stroke="rgba(0, 229, 255, 0.05)" strokeWidth="1" />
                  <circle cx="500" cy="250" r="200" fill="none" stroke="rgba(0, 229, 255, 0.05)" strokeWidth="1" />
                  <circle cx="500" cy="250" r="300" fill="none" stroke="rgba(0, 229, 255, 0.03)" strokeWidth="1" />
                  
                  {/* Radar Crosshairs */}
                  <line x1="500" y1="50" x2="500" y2="450" stroke="rgba(0, 229, 255, 0.05)" strokeWidth="1" />
                  <line x1="100" y1="250" x2="900" y2="250" stroke="rgba(0, 229, 255, 0.05)" strokeWidth="1" />

                  {/* Radar Sweep Line */}
                  <line
                    x1="500"
                    y1="250"
                    x2={500 + 350 * Math.cos((sweepAngle * Math.PI) / 180)}
                    y2={250 + 350 * Math.sin((sweepAngle * Math.PI) / 180)}
                    stroke="rgba(0, 229, 255, 0.15)"
                    strokeWidth="1.5"
                  />

                  {/* Threat Connection Lines (Simulated Paths) */}
                  {threats.map(threat => {
                    const loc = locations.find(l => l.name === threat.location);
                    if (!loc) return null;
                    const coords = getCoords(loc.lat, loc.lng);
                    return (
                      <g key={`connection-${threat.id}`}>
                        <path
                          d={`M 500 250 Q ${(500 + coords.x) / 2} ${(250 + coords.y) / 2 - 40} ${coords.x} ${coords.y}`}
                          fill="none"
                          stroke={loc.threatLevel === 'critical' ? '#ef4444' : '#00e5ff'}
                          strokeWidth="1"
                          strokeDasharray="4,4"
                          opacity="0.4"
                        />
                      </g>
                    );
                  })}

                  {/* Location Nodes */}
                  {locations.map(loc => {
                    const { x, y } = getCoords(loc.lat, loc.lng);
                    const isCritical = loc.threatLevel === 'critical';
                    const isHigh = loc.threatLevel === 'high';
                    const color = isCritical ? '#ef4444' : isHigh ? '#f97316' : loc.status === 'monitoring' ? '#eab308' : '#10b981';

                    return (
                      <g key={`loc-${loc.id}`}>
                        {/* Outer pulsing beacon */}
                        {(isCritical || isHigh) && (
                          <circle
                            cx={x}
                            cy={y}
                            r="12"
                            fill="none"
                            stroke={color}
                            strokeWidth="1.5"
                            opacity="0.5"
                          >
                            <animate attributeName="r" values="3;16;3" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                          </circle>
                        )}
                        {/* Small core sensor point */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isCritical ? "4.5" : "3.5"}
                          fill={color}
                          filter="url(#cyberGlow)"
                        />
                        {/* Technical Label overlay on hover */}
                        <text
                          x={x + 8}
                          y={y - 4}
                          fill="#9ca3af"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {loc.name.split(',')[0].toUpperCase()}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Tactical Status Panel */}
                <div className="absolute left-6 top-6 w-[260px] bg-panel/90 backdrop-blur-md border border-panel-border p-4 shadow-2xl rounded text-xs">
                  <div className="flex items-center space-x-2 border-b border-panel-border/30 pb-2 mb-3">
                    <Radio className="h-4 w-4 text-cyber-blue animate-pulse" />
                    <span className="font-bold text-white tracking-tight uppercase">SIMULATION CONSOLE</span>
                  </div>
                  <div className="space-y-2.5 font-mono text-zinc-400">
                    {threats.map(threat => (
                      <div key={threat.id} className="border-l border-panel-border/50 pl-2 py-0.5 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[10px] text-zinc-500">SOURCE IP</span>
                          <span className="text-zinc-200">{threat.ip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-zinc-500">TYPE</span>
                          <span className="text-severity-critical">{threat.type}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span>CONFIDENCE</span>
                          <span className="text-cyber-blue">{threat.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin text-cyber-blue" />
                <span className="text-xs font-mono">CALIBRATING WORLD SENSOR GATES...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}