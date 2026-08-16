'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    eventsPerMinute: 0,
    activeIncidents: 0,
    criticalAssets: 0,
    threatLevel: 'LOW'
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    if (!authUtils.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch events count (last minute)
      const eventsResponse = await apiClient.get('/events/', {
        params: { limit: 1000 } // Get a reasonable sample
      });

      // Calculate events per minute (simplified - in production you'd have a specific endpoint)
      const allEvents = eventsResponse.data;
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

      const recentEvents = allEvents.filter((event: any) => {
        const eventTime = new Date(event.timestamp);
        return eventTime >= oneMinuteAgo;
      });

      // Fetch incidents
      const incidentsResponse = await apiClient.get('/incidents/');
      const allIncidents = incidentsResponse.data;
      const activeIncidents = allIncidents.filter((incident: any) =>
        incident.status === 'NEW' || incident.status === 'INVESTIGATING'
      ).length;

      // For critical assets, we'll use a placeholder - in production this would come from asset management
      const criticalAssets = 5; // Placeholder

      // Determine threat level based on active incidents and their severity
      let threatLevel = 'LOW';
      if (activeIncidents > 0) {
        const highSeverityIncidents = allIncidents.filter((incident: any) =>
          (incident.status === 'NEW' || incident.status === 'INVESTIGATING') &&
          incident.severity === 'high'
        ).length;

        const criticalSeverityIncidents = allIncidents.filter((incident: any) =>
          (incident.status === 'NEW' || incident.status === 'INVESTIGATING') &&
          incident.severity === 'critical'
        ).length;

        if (criticalSeverityIncidents > 0) {
          threatLevel = 'CRITICAL';
        } else if (highSeverityIncidents > 0) {
          threatLevel = 'HIGH';
        } else if (activeIncidents > 2) {
          threatLevel = 'MEDIUM';
        }
      }

      setStats({
        eventsPerMinute: recentEvents.length,
        activeIncidents,
        criticalAssets,
        threatLevel
      });

      // Store recent events for the event stream
      setEvents(recentEvents.slice(0, 10)); // Show latest 10 events
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and periodic updates
  useEffect(() => {
    fetchDashboardStats();

    // Update every 5 seconds
    const interval = setInterval(fetchDashboardStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && events.length === 0 && !error) {
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
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md border-2 border-primary/50 text-primary mb-4">
              Zap
            </div>
            <p className="text-zinc-400">Loading dashboard data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md border-2 border-red-500/50 text-red-400 mb-4">
              AlertTriangle
            </div>
            <p className="text-zinc-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

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
            trend={stats.eventsPerMinute > 100 ? 'up' : 'neutral'}
            trendValue={Math.max(0, stats.eventsPerMinute - 50)} // Simplified trend
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
            trend={stats.threatLevel === 'HIGH' || stats.threatLevel === 'CRITICAL' ? 'up' : stats.threatLevel === 'LOW' ? 'down' : 'neutral'}
            trendValue={0}
            description="Overall threat level"
          >
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              stats.threatLevel === 'HIGH' || stats.threatLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
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
                  <button
                    onClick={fetchDashboardStats}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
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
                {events.length > 0 ? (
                  events.map((event: any, index) => ({
                    key: event.id || index,
                    ...event
                  })).map((event: any, index) => (
                    <div key={event.id || index} className="flex items-start space-x-3 p-4 bg-zinc-900/20 rounded-lg border border-zinc-800/30">
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                        Zap
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white">{event.event_type || 'UNKNOWN'}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            event.severity === 'high' || event.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            event.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {event.severity?.toUpperCase() || 'LOW'}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm">
                          {event.source_ip} attempted to access {event.asset || 'unknown asset'}
                          {event.user ? `(user: ${event.user})` : ''}
                        </p>
                        <p className="text-zinc-500 text-xs">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    No recent events
                  </div>
                )}
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
                  {/* In a real implementation, this would come from a threat intel API */}
                  <div className="text-zinc-500 text-sm text-center py-8">
                    Threat intelligence integration coming soon
                  </div>
                </div>
              </Card>
              <Card className="h-full">
                <header className="p-6 border-b border-zinc-800">
                  <h2 className="text-lg font-semibold text-white">MITRE ATT&CK Coverage</h2>
                </header>
                <div className="p-4">
                  {/* Mock MITRE data - in production this would come from /mitre/techniques endpoint */}
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