export default function SecurityMap() {
  // Mock data for the map
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

  return (
    <section className="relative z-10 pt-20 pb-24 bg-zinc-950">
      <div className="relative">
        <div className="absolute inset-0 -z-10">
          <div className="relative h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900"></div>
            <svg className="absolute inset-0 -z-10" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="gridLines" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.2"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#gridLines)" />
            </svg>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Interactive Security Map</h2>
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Global Threat Landscape</h3>
              <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                <span className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-red-500 mr-1"></span>
                  Active Threats
                </span>
                <span className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-yellow-500 mr-1"></span>
                  Monitoring
                </span>
                <span className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-green-500 mr-1"></span>
                  Secure
                </span>
                <span className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-gray-500 mr-1"></span>
                  Unknown
                </span>
              </div>
            </div>
            <div className="relative h-96">
              {/* Simplified world map using SVG - in reality, we'd use a proper map projection */}
              <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
                {/* Background gradient for ocean */}
                <defs>
                  <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#0f172a', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0.9 }} />
                  </linearGradient>
                  <linearGradient id="landGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 0.6 }} />
                    <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 0.8 }} />
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#00bcd4" flood-opacity="0.5" />
                  </filter>
                </defs>
                {/* Simplified land masses - very rough approximation */}
                <path d="M150,100 Q180,80 220,90 T280,100 Q300,120 280,140 T240,180 Q220,200 200,180 T160,160 Q140,140 150,120 Z"
                      fill="url(#landGradient)" />
                <path d="M350,150 Q380,130 420,140 T480,150 Q500,170 480,190 T440,210 Q400,230 350,190 T300,150 Z"
                      fill="url(#landGradient)" />
                {/* More land masses would go here - for brevity, we're keeping it simple */}

                {/* Location markers */}
                {locations.map(loc => {
                  // Convert lat/lng to approximate x/y on our simplified map
                  // This is a very rough conversion for demo purposes only
                  const x = ((loc.lng + 180) * (1000 / 360));
                  const y = ((90 - loc.lat) * (500 / 180));

                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'active': return '#ff3333';
                      case 'alert': return '#ff0000';
                      case 'monitoring': return '#ff9900';
                      case 'secure': return '#00c853';
                      default: return '#666';
                    }
                  };

                  const getThreatLevel = (level: string) => {
                    switch (level) {
                      case 'critical': return 'pulse-red';
                      case 'high': return 'pulse-orange';
                      case 'medium': return 'pulse-yellow';
                      case 'low': return 'pulse-green';
                      default: return '';
                    }
                  };

                  return (
                    <g key={loc.id}>
                      {/* Connection line to threat if applicable */}
                      {threats.find(t => t.location === loc.name) && (
                        <line
                          x1={x}
                          y1={y}
                          x2={x + 50}
                          y2={y - 30}
                          stroke="rgba(255,0,0,0.3)"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                      )}
                      {/* Marker */}
                      <circle
                        cx={x}
                        cy={y}
                        r={4}
                        fill={getStatusColor(loc.status)}
                        filter={loc.threatLevel !== 'low' ? 'url(#glow)' : undefined}
                        className="transition-all duration-300 hover:scale-110"
                      >
                        <title>
                          {loc.name}: {loc.status} - {loc.threatLevel} threat
                        </title>
                        {/* Animated pulse for high threat levels */}
                        {loc.threatLevel === 'critical' || loc.threatLevel === 'high' && (
                          <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
                        )}
                      </circle>
                    </g>
                  );
                })}

                {/* Threat markers */}
                {threats.map(threat => {
                  const loc = locations.find(l => l.name === threat.location);
                  if (!loc) return null;

                  const x = ((loc.lng + 180) * (1000 / 360));
                  const y = ((90 - loc.lat) * (500 / 180));

                  return (
                    <g key={threat.id}>
                      <circle
                        cx={x + 15}
                        cy={y - 15}
                        r={6}
                        fill="url(#threatGradient)"
                        className="transition-all duration-300 hover:scale-110"
                      >
                        <title>
                          {threat.ip} - {threat.type} ({threat.confidence}% confidence)
                        </title>
                        <defs>
                          <radialGradient id="threatGradient">
                            <stop offset="0%" stop-color="#ff3333" stop-opacity="0.8" />
                            <stop offset="100%" stop-color="#ff0000" stop-opacity="0" />
                          </radialGradient>
                        </defs>
                      </circle>
                      <text
                        x={x + 25}
                        y={y - 20}
                        fontSize="10"
                        fill="#ff3333"
                        className="transition-all duration-300 hover:scale-110"
                      >
                        �� ⚠
                      </text>
                    </g>
                  );
                })}

                {/* Legend for connections */}
                <defs>
                  <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="#ff3333" flood-opacity="0.3" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}