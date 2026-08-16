'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/api';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch incidents
  const fetchIncidents = async () => {
    if (!authUtils.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/incidents/');
      setIncidents(response.data);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setError('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and periodic updates
  useEffect(() => {
    fetchIncidents();

    // Update every 10 seconds
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && incidents.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
              <span className="text-primary">Aegis</span> SOC Incidents
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md border-2 border-primary/50 text-primary mb-4">
              Zap
            </div>
            <p className="text-zinc-400">Loading incidents...</p>
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
              <span className="text-primary">Aegis</span> SOC Incidents
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
            <span className="text-primary">Aegis</span> SOC Incidents
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Active Incidents</h2>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Search incidents..."
                className="bg-zinc-800/50 border border-zinc-700 rounded px-4 py-2 text-zinc-200 w-48"
              />
              {/* In a real app, this would navigate to an incident creation form */}
              <button
                disabled={true}
                className="flex h-10 items-center justify-center rounded-md bg-zinc-600/50 px-4 text-sm font-medium text-zinc-300"
              >
                New Incident
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {incidents.length > 0 ? (
            incidents.map((incident: any) => (
              <Card
                key={incident.id}
                className="hover:border-zinc-700/70 transition-colors cursor-pointer"
                onClick={() => {
                  // Navigate to incident detail page
                  // In a real app with routing: router.push(`/incidents/${incident.id}`)
                  window.location.href = `/incidents/${incident.id}`;
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 flex-shrink-0">
                    ⚠️
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">{incident.title || 'Untitled Incident'}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        incident.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        incident.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        incident.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {incident.severity?.toUpperCase() || 'LOW'}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm">
                      {incident.description || 'No description available'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-zinc-500">
                      <span>Status: <span className="text-white">{incident.status || 'UNKNOWN'}</span></span>
                      <span>Risk Score: <span className="text-white">{incident.risk_score || 0}/100</span></span>
                      <span>Detected: <span className="text-white">
                        {new Incident(incident.reported_at || incident.timestamp).toLocaleDateString()}
                      </span></span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/30">
                  <div className="flex items-center space-x-4">
                    <button
                      className="flex h-9 items-center justify-center rounded-md bg-zinc-800/50 px-3 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      className="flex h-9 items-center justify-center rounded-md bg-zinc-800/50 px-3 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
                    >
                      Add Note
                    </button>
                    <button
                      className="flex h-9 items-center justify-center rounded-md bg-zinc-800/50 px-3 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
                    >
                      Change Status
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <p>No incidents found</p>
              {/* In a real app, incidents would be generated by the detection engine */}
              <p className="mt-2 text-zinc-400 text-sm">
                Incidents are automatically created when security detections occur
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}