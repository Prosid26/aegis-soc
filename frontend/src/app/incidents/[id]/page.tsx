'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/api';

export default function IncidentDetail({ params }: { params: { id: string } }) {
  const incidentId = parseInt(params.id);
  const [incident, setIncident] = useState<any>(null);
  const [detections, setDetections] = useState([]);
  const [events, setEvents] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch incident details
  const fetchIncidentDetails = async () => {
    if (!authUtils.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch incident
      const incidentResponse = await apiClient.get(`/incidents/${incidentId}`);
      setIncident(incidentResponse.data);

      // Fetch detections for this incident
      const detectionsResponse = await apiClient.get(`/detections/`, {
        params: { incident_id: incidentId }
      });
      setDetections(detectionsResponse.data);

      // Fetch events linked to these detections
      if (detectionsResponse.data.length > 0) {
        const eventIds = detectionsResponse.data
          .flatMap((detection: any) => detection.event_ids || [])
          .filter((id: number) => id !== null);

        if (eventIds.length > 0) {
          const eventsResponse = await apiClient.get(`/events/`, {
            params: { event_ids: eventIds.join(',') }
          });
          setEvents(eventsResponse.data);
        }
      }

      // Fetch AI analysis if available
      try {
        const analysisResponse = await apiClient.get(`/ai/incidents/${incidentId}/analyses`);
        // Get the most recent analysis
        const analyses = analysisResponse.data;
        if (analyses.length > 0) {
          // Sort by created_at descending and take the first
          const sortedAnalyses = analyses.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setAiAnalysis(sortedAnalyses[0]);
        }
      } catch (analysisError) {
        // AI analysis might not exist yet, that's OK
        console.log('No AI analysis found for this incident');
      }
    } catch (err) {
      console.error('Failed to fetch incident details:', err);
      setError('Failed to load incident details');
    } finally {
      setLoading(false);
    }
  };

  // Trigger AI analysis
  const triggerAiAnalysis = async () => {
    if (!authUtils.isAuthenticated() || analyzing) return;

    setAnalyzing(true);
    try {
      const response = await apiClient.post(`/ai/incidents/${incidentId}/analyze`);
      setAiAnalysis(response.data.analysis);

      // Refetch incident to get updated analysis list
      const incidentResponse = await apiClient.get(`/incidents/${incidentId}`);
      setIncident(incidentResponse.data);
    } catch (err) {
      console.error('Failed to trigger AI analysis:', err);
      setError('AI analysis temporarily unavailable');
    } finally {
      setAnalyzing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchIncidentDetails();
  }, [incidentId]);

  if (loading && !incident && !error) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <span className="text-primary">Aegis</span> Incident Details
              </div>
              <button
                onClick={() => window.location.href = '/incidents'}
                className="flex h-10 items-center justify-center rounded-md bg-zinc-800/50 px-4 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                ← Back to Incidents
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md border-2 border-primary/50 text-primary mb-4">
              Zap
            </div>
            <p className="text-zinc-400">Loading incident details...</p>
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <span className="text-primary">Aegis</span> Incident Details
              </div>
              <button
                onClick={() => window.location.href = '/incidents'}
                className="flex h-10 items-center justify-center rounded-md bg-zinc-800/50 px-4 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                ← Back to Incidents
              </button>
            </div>
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

  if (!incident) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <span className="text-primary">Aegis</span> Incident Details
              </div>
              <button
                onClick={() => window.location.href = '/incidents'}
                className="flex h-10 items-center justify-center rounded-md bg-zinc-800/50 px-4 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                ← Back to Incidents
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-zinc-400">Incident not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <span className="text-primary">Aegis</span> Incident Details
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/incidents'}
                className="flex h-10 items-center justify-center rounded-md bg-zinc-800/50 px-4 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                ← Back to Incidents
              </button>
              {!analyzing && (
                <button
                  onClick={triggerAiAnalysis}
                  className={`flex h-10 items-center justify-center rounded-md ${
                    aiAnalysis ? 'bg-primary' : 'bg-zinc-800/50'
                  } px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors`}
                  disabled={analyzing}
                >
                  {analyzing ? 'Analyzing...' : aiAnalysis ? 'View Analysis' : 'Analyze Incident'}
                </button>
              )}
              {analyzing && (
                <button
                  className="flex h-10 items-center justify-center rounded-md bg-zinc-800/50 px-4 text-sm font-medium text-zinc-300"
                  disabled
                >
                  Analyzing...
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Incident Header */}
        <div className="mb-8 p-6 bg-zinc-900/30 rounded-lg border border-zinc-800">
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 flex-shrink-0">
              ⚠️
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">{incident.title}</h3>
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
                {incident.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-zinc-500">
                <span>Status: <span className="text-white">{incident.status}</span></span>
                <span>Risk Score: <span className="text-white">{incident.risk_score}/100</span></span>
                <span>Confidence: <span className="text-white">{incident.confidence || 'N/A'}%</span></span>
                <span>Detected: <span className="text-white">
                  {new Date(incident.reported_at || incident.timestamp).toLocaleString()}
                </span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for different sections */}
        <div className="mb-6">
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => {}}
              className={`flex-1 px-4 py-3 text-left text-zinc-300 hover:text-white border-b-2 ${
                !aiAnalysis ? 'border-primary' : 'border-transparent'
              } ${aiAnalysis ? '' : 'font-medium'} transitions-colors`}
            >
              Overview
            </button>
            {aiAnalysis ? (
              <button
                onClick={() => {}}
                className={`flex-1 px-4 py-3 text-left text-zinc-300 hover:text-white border-b-2 ${
                  aiAnalysis ? 'border-primary' : 'border-transparent'
                } ${!aiAnalysis ? '' : 'font-medium'} transitions-colors`}
              >
                AI Analysis
              </button>
            ) : null}
          </div>
        </div>

        {/* Overview Tab Content */}
        {!aiAnalysis && (
          <>
            {/* Evidence & Detections */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Security Detections</h3>
              {detections.length > 0 ? (
                detections.map((detection: any) => (
                  <div key={detection.id} className="mb-6 p-4 bg-zinc-900/20 rounded-lg border border-zinc-800/30">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                        Zap
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white">{detection.rule_name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            detection.severity === 'high' || detection.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            detection.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {detection.severity?.toUpperCase() || 'LOW'}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm">{detection.description}</p>
                        {detection.mitre_techniques && detection.mitre_techniques.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {detection.mitre_techniques.map((tech: any) => (
                              <span key={tech.id} className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                {tech.technique_id}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 text-zinc-500 text-xs">
                          Detected: {new Date(detection.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  No detections associated with this incident
                </div>
              )}
            </div>

            {/* Events Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Event Timeline</h3>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event: any) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 bg-zinc-900/20 rounded border border-zinc-800/30">
                      <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                        {event.event_type?.substring(0, 3) || 'EVT'}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white">{event.event_type}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            event.severity === 'high' || event.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            event.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {event.severity?.toUpperCase() || 'LOW'}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm">
                          {event.source_ip} → {event.destination_ip || 'internal'}
                          {event.user ? ` (user: ${event.user})` : ''}
                        </p>
                        <p className="text-zinc-500 text-xs">{new Date(event.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  No events linked to this incident's detections
                </div>
              )}
            </div>
          </>
        )}

        {/* AI Analysis Tab Content */}
        {aiAnalysis && (
          <div className="space-y-6">
            {/* AI Analysis Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <Stat
                title="Risk Score"
                value={aiAnalysis.confidence || 0}
                trend="neutral"
                trendValue={0}
                description="AI confidence in analysis"
              />
              <Stat
                title="Threat Assessment"
                value={aiAnalysis.threat_assessment?.split(' ')[0] || 'UNKNOWN'}
                trend={aiAnalysis.threat_assessment?.includes('HIGH') || aiAnalysis.threat_assessment?.includes('CRITICAL') ? 'up' : 'neutral'}
                trendValue={0}
                description="AI threat assessment level"
              >
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  aiAnalysis.threat_assessment?.includes('CRITICAL') ? 'bg-red-500/20 text-red-400' :
                  aiAnalysis.threat_assessment?.includes('HIGH') ? 'bg-orange-500/20 text-orange-400' :
                  aiAnalysis.threat_assessment?.includes('MEDIUM') ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {aiAnalysis.threat_assessment?.split(' ')[0] || 'UNKNOWN'}
                </span>
              </Stat>
              <Stat
                title="Key Evidence Count"
                value={aiAnalysis.key_evidence?.length || 0}
                trend="neutral"
                trendValue={0}
                description="Pieces of evidence analyzed"
              />
              <Stat
                title="Recommended Actions"
                value={aiAnalysis.recommended_actions?.length || 0}
                trend="neutral"
                trendValue={0}
                description="Action items suggested by AI"
              />
            </div>

            {/* Analysis Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Executive Summary</h3>
              <p className="text-zinc-300">{aiAnalysis.summary}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Threat Assessment</h3>
              <p className="text-zinc-300">{aiAnalysis.threat_assessment}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">MITRE Analysis</h3>
              <p className="text-zinc-300">{aiAnalysis.mitre_analysis}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Key Evidence</h3>
              {aiAnalysis.key_evidence && aiAnalysis.key_evidence.length > 0 ? (
                <div className="space-y-2">
                  {aiAnalysis.key_evidence.map((evidence: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 text-zinc-400">
                      <div className="h-3 w-3 flex items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                        ●
                      </div>
                      <span>{evidence}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400">No key evidence identified</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recommended Actions</h3>
              {aiAnalysis.recommended_actions && aiAnalysis.recommended_actions.length > 0 ? (
                <div className="space-y-2">
                  {aiAnalysis.recommended_actions.map((action: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 text-zinc-400">
                      <div className="h-3 w-3 flex items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                        ●
                      </div>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400">No recommended actions</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Investigation Steps</h3>
              {aiAnalysis.investigation_steps && aiAnalysis.investigation_steps.length > 0 ? (
                <div className="space-y-2">
                  {aiAnalysis.investigation_steps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 text-zinc-400">
                      <div className="h-3 w-3 flex items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                        ●
                      </div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400">No investigation steps</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Questions for Analyst</h3>
              {aiAnalysis.questions_for_analyst && aiAnalysis.questions_for_analyst.length > 0 ? (
                <div className="space-y-2">
                  {aiAnalysis.questions_for_analyst.map((question: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 text-zinc-400">
                      <div className="h-3 w-3 flex items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                        ●
                      </div>
                      <span>{question}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400">No questions for analyst</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}