'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';

export default function Dashboard() {
  const [stats, setStats] = useState({
    eventsPerMinute: 0,
    activeIncidents: 0,
    criticalAssets: 0,
    threatLevel: 'LOW'
  });

  // Initialize random values for stats to avoid impure functions during render
  const [randomValues, setRandomValues] = useState(() => {
    return {
      eventsTrend: Math.floor(Math.random() * 20) + 5,
      ip1: Math.floor(Math.random() * 255),
      ip2: Math.floor(Math.random() * 255),
      ip3: Math.floor(Math.random() * 255),
      ip4: Math.floor(Math.random() * 255),
      time: new Date().toLocaleTimeString()
    };
  });

  // Update random values periodically
  useEffect(() => {
    const updateRandomValues = () => {
      setRandomValues(prev => ({
        eventsTrend: Math.floor(Math.random() * 20) + 5,
        ip1: Math.floor(Math.random() * 255),
        ip2: Math.floor(Math.random() * 255),
        ip3: Math.floor(Math.random() * 255),
        ip4: Math.floor(Math.random() * 255),
        time: new Date().toLocaleTimeString()
      }));
    };

    // Update every second for the time display
    const interval = setInterval(updateRandomValues, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate fetching stats
    const fetchStats = async () => {
      // In a real app, this would be an API call
      setStats({
        eventsPerMinute: Math.floor(Math.random() * 150) + 50,
        activeIncidents: Math.floor(Math.random() * 10),
        criticalAssets: Math.floor(Math.random() * 5) + 2,
        threatLevel: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW'
      });
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span className="text-primary">Aegis</span> Security Operations Dashboard
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Stat
            title="Events/Minute"
            value={stats.eventsPerMinute.toLocaleString()}
            trend="up"
            trendValue={randomValues.eventsTrend}
            description="Events processed in the last minute"
          />
          <Stat
            title="Active Incidents"
            value={stats.activeIncidents}
            trend={stats.activeIncidents > 0 ? 'up' : 'neutral'}
            trendValue={stats.activeIncidents}
            description="Currently under investigation"
          />
          <Stat
            title="Critical Assets"
            value={stats.criticalAssets}
            trend="neutral"
            trendValue={0}
            description="Assets requiring special monitoring"
          />
          <Stat
            title="Threat Level"
            value={stats.threatLevel}
            trend={stats.threatLevel === 'HIGH' ? 'up' : stats.threatLevel === 'LOW' ? 'down' : 'neutral'}
            trendValue={0}
            description="Overall threat level"
          >
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              stats.threatLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
              stats.threatLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {stats.threatLevel}
            </span>
          </Stat>
        </div>

        {/* Charts and Widgets */}
        <div className="grid gap-6">
          <div className="col-span-2 lg:col-span-3">
            <Card className="h-full">
              <header className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h2 className="text-lg font-semibold text-white">Real-Time Event Stream</h2>
                <div className="flex items-center space-x-2">
                  <button className="text-zinc-400 hover:text-white transition-colors">
                    Refresh
                  </button>
                  <select className="bg-zinc-800/50 border border-zinc-700 rounded px-3 py-1 text-zinc-200">
                    <option value="all">All Events</option>
                    <option value="critical">Critical Only</option>
                    <option value="alerts">Alerts Only</option>
                  </select>
                </div>
              </header>
              <div className="p-6 space-y-4">
                {/* Mock event stream */}
                {[1, 2, 3, 4, 5].map((i, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-zinc-900/20 rounded-lg border border-zinc-800/30">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                      Zap
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white">{index % 2 === 0 ? 'AUTH_FAILURE' : 'PORT_SCAN'}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          index % 2 === 0 ? 'bg-red-500/20 text-red-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {index % 2 === 0 ? 'MEDIUM' : 'LOW'}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm">
                        10.0.{randomValues.ip1}.{randomValues.ip2} attempted to access {index % 2 === 0 ? 'domain controller' : 'web server'}
                      </p>
                      <p className="text-zinc-500 text-xs">{randomValues.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="h-full">
                <header className="p-6 border-b border-zinc-800">
                  <h2 className="text-lg font-semibold text-white">Threat Intelligence Feed</h2>
                </header>
                <div className="p-4">
                  {/* Mock threat intel */}
                  {[1, 2, 3].map((i, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 mb-3 bg-zinc-900/20 rounded border border-zinc-800/20">
                      <div className="h-7 w-7 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 flex-shrink-0">
                        Alert
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-white">Malicious IP: 185.141.63.{100 + idx}</h4>
                        <p className="text-zinc-400 text-sm">C2 Server - Zeus Botnet</p>
                        <p className="text-zinc-500 text-xs">Confidence: 95% | First seen: 2023-05-12</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="h-full">
                <header className="p-6 border-b border-zinc-800">
                  <h2 className="text-lg font-semibold text-white">MITRE ATT&CK Coverage</h2>
                </header>
                <div className="p-4">
                  {/* Mock MITRE data */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0">
                        T1110
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Brute Force</h4>
                        <p className="text-zinc-400 text-sm">Credential Access</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0">
                        T1068
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Exploitation for Privilege Escalation</h4>
                        <p className="text-zinc-400 text-sm">Privilege Escalation</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0">
                        T1046
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Network Service Scanning</h4>
                        <p className="text-zinc-400 text-sm">Discovery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}