'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/api';

export default function AIAnalyst() {
  const [investigationSteps, setInvestigationSteps] = useState([
    { id: 1, title: 'Correlating Events', description: 'Analyzing 2,487 related security events', status: 'complete' },
    { id: 2, title: 'Checking Asset Criticality', description: 'Assessing impact on critical infrastructure', status: 'complete' },
    { id: 3, title: 'Temporal Analysis', description: 'Building attack timeline and sequencing', status: 'complete' },
    { id: 4, title: 'Threat Intelligence Lookup', description: 'Checking indicators against global feeds', status: 'complete' },
    { id: 5, title: 'MITRE ATT&CK Mapping', description: 'Mapping observed tactics to framework', status: 'complete' },
    { id: 6, title: 'Risk Calculation', description: 'Computing probability and impact scores', status: 'in-progress' },
    { id: 7, title: 'Generating Recommendations', description: 'Creating prioritized action plan', status: 'pending' },
  ]);

  const [results, setResults] = useState({
    riskScore: 94,
    severity: 'CRITICAL',
    technique: 'T1110 - Brute Force',
    confidence: 91
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch real data for the AI analyst showcase
  const fetchRealData = async () => {
    if (!authUtils.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the most recent incident to showcase
      const incidentsResponse = await apiClient.get('/incidents/', {
        params: { limit: 1 }
      });
      const incidents = incidentsResponse.data;

      if (incidents.length > 0) {
        const latestIncident = incidents[0];

        // Get AI analysis for this incident if available
        try {
          const analysisResponse = await apiClient.get(`/ai/incidents/${latestIncident.id}/analyses`);
          const analyses = analysisResponse.data;

          if (analyses.length > 0) {
            // Use the most recent analysis
            const latestAnalysis = analyses[0];

            // Update investigation steps based on real analysis
            setInvestigationSteps([
              { id: 1, title: 'Correlating Events', description: `Analyzing ${latestAnalysis.key_evidence?.length || 0} related security events`, status: 'complete' },
              { id: 2, title: 'Checking Asset Criticality', description: 'Assessing impact on critical infrastructure', status: 'complete' },
              { id: 3, title: 'Temporal Analysis', description: 'Building attack timeline and sequencing', status: 'complete' },
              { id: 4, title: 'Threat Intelligence Lookup', description: 'Checking indicators against global feeds', status: 'complete' },
              { id: 5, title: 'MITRE ATT&CK Mapping', description: 'Mapping observed tactics to framework', status: 'complete' },
              { id: 6, title: 'Risk Calculation', description: 'Computing probability and impact scores', status: 'complete' },
              { id: 7, title: 'Generating Recommendations', description: 'Creating prioritized action plan', status: 'complete' },
            ]);

            // Update results
            setResults({
              riskScore: latestAnalysis.confidence || 85,
              severity: latestAnalysis.threat_assessment?.split(' ')[0] || 'MEDIUM',
              technique: latestAnalysis.mitre_analysis?.split(' ')[2] || 'T1110 - Brute Force',
              confidence: latestAnalysis.confidence || 85
            });
          } else {
            // No analysis yet, show option to analyze
            setAnalyzing(true);
          }
        } catch (analysisError) {
          // No AI analysis available, keep mock data but show analyze button
          console.log('No AI analysis available for latest incident');
          setAnalyzing(true);
        }
      } else {
        // No incidents, keep mock data
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch real data for AI analyst:', err);
      setError('Using demo data - connect to backend for real analysis');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Trigger AI analysis on latest incident
  const triggerAiAnalysis = async () => {
    if (!authUtils.isAuthenticated()) return;

    setAnalyzing(true);
    try {
      // Get the most recent incident
      const incidentsResponse = await apiClient.get('/incidents/', {
        params: { limit: 1 }
      });
      const incidents = incidentsResponse.data;

      if (incidents.length > 0) {
        const latestIncident = incidents[0];

        // Trigger analysis
        const response = await apiClient.post(`/ai/incidents/${latestIncident.id}/analyze`);
        const analysis = response.data.analysis;

        // Update investigation steps
        setInvestigationSteps([
          { id: 1, title: 'Correlating Events', description: `Analyzing ${analysis.key_evidence?.length || 0} related security events`, status: 'complete' },
          { id: 2, title: 'Checking Asset Criticality', description: 'Assessing impact on critical infrastructure', status: 'complete' },
          { id: 3, title: 'Temporal Analysis', description: 'Building attack timeline and sequencing', status: 'complete' },
          { id: 4, title: 'Threat Intelligence Lookup', description: 'Checking indicators against global feeds', status: 'complete' },
          { id: 5, title: 'MITRE ATT&CK Mapping', description: 'Mapping observed tactics to framework', status: 'complete' },
          { id: 6, title: 'Risk Calculation', description: 'Computing probability and impact scores', status: 'complete' },
          { id: 7, title: 'Generating Recommendations', description: 'Creating prioritized action plan', status: 'complete' },
        ]);

        // Update results
        setResults({
          riskScore: analysis.confidence || 85,
          severity: analysis.threat_assessment?.split(' ')[0] || 'MEDIUM',
          technique: analysis.mitre_analysis?.split(' ')[2] || 'T1110 - Brute Force',
          confidence: analysis.confidence || 85
        });
      }
    } catch (err) {
      console.error('Failed to trigger AI analysis:', err);
      setError('AI analysis temporarily unavailable');
    } finally {
      setAnalyzing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRealData();
  }, []);

  if (loading) {
    return (
      <section className="relative z-10 pt-20 pb-24 bg-zinc-950">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="relative h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900"></div>
              <svg className="absolute inset-0 -z-10" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="circuit" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M0,10 L20,10 M10,0 L10,20" stroke="rgba(0,189,212,0.03)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#circuit)" />
              </svg>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="sr-only">AI Security Analyst</h2>
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">AI Security Analyst in Action</h3>
                <p className="text-zinc-300 mb-4">
                  Watch as our AI analyst autonomously investigates a security incident, correlates evidence,
                  and provides actionable intelligence.
                </p>
              </div>

              {/* Incident Summary */}
              <div className="mb-8 p-6 bg-zinc-900/30 rounded-lg border border-zinc-800">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded bg-primary/20 text-primary flex-shrink-0">
                    🤖
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Incident Investigation: Loading...</h4>
                    <p className="text-zinc-400 text-sm">Analyzing security events...</p>
                  </div>
                </div>
              </div>

              {/* Investigation Steps */}
              <div className="space-y-4">
                {investigationSteps.map(step => (
                  <div key={step.id} className="flex items-start space-x-4 p-4 bg-zinc-900/20 rounded-lg border border-zinc-800/30 transition-all hover:border-zinc-700/50">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full flex-shrink-0">
                      {step.status === 'complete' ? (
                        <span className="text-green-500">✓</span>
                      ) : step.status === 'in-progress' ? (
                        <span className="text-yellow-500 animate-spin">⟳</span>
                      ) : (
                        <span className="text-zinc-500">○</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium text-white">{step.title}</h4>
                      <p className="text-zinc-400 text-sm">{step.description}</p>
                    </div>
                    <div className="h-4 w-4 flex items-center justify-center">
                      {step.status === 'complete' && (
                        <span className="h-3 w-3 bg-green-500 rounded-full" />
                      )}
                      {step.status === 'in-progress' && (
                        <span className="h-3 w-3 bg-yellow-500 rounded-full animate-ping" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Results Preview */}
              <div className="mt-8 p-6 bg-zinc-900/30 rounded-lg border border-zinc-800">
                <h4 className="font-semibold text-white mb-4">Investigation Results</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-zinc-400">Risk Score:</p>
                    <p className="text-2xl font-bold text-red-500">--/100</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-400">Severity:</p>
                    <p className="text-2xl font-bold text-red-500">--</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-400">Likely Technique:</p>
                    <p className="text-xl font-semibold text-blue-400">--</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-400">Confidence:</p>
                    <p className="text-2xl font-bold text-blue-400">--%</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={triggerAiAnalysis}
                  className="flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                  disabled={analyzing}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Incident'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && !analyzing) {
    return (
      <section className="relative z-10 pt-20 pb-24 bg-zinc-950">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="relative h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900"></div>
              <svg className="absolute inset-0 -z-10" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="circuit" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M0,10 L20,10 M10,0 L10,20" stroke="rgba(0,189,212,0.03)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#circuit)" />
              </svg>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="sr-only">AI Security Analyst</h2>
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">AI Security Analyst in Action</h3>
                <p className="text-zinc-300 mb-4">
                  Watch as our AI analyst autonomously investigates a security incident, correlates evidence,
                  and provides actionable intelligence.
                </p>
              </div>

              {/* Incident Summary */}
              <div className="mb-8 p-6 bg-zinc-900/30 rounded-lg border border-zinc-800">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded bg-primary/20 text-primary flex-shrink-0">
                    🤖
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Incident Investigation: Potential Credential Stuffing Attack</h4>
                    <p className="text-zinc-400 text-sm">347 failed authentication attempts detected across 18 accounts</p>
                  </div>
                </div>
              </div>

              {/* Investigation Steps */}
              <div className="space-y-4">
                {investigationSteps.map(step => (
                  <div key={step.id} className="flex items-start space-x-4 p-4 bg-zinc-900/20 rounded-lg border border-zinc-800/30 transition-all hover:border-zinc-700/50">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full flex-shrink-0">
                      {step.status === 'complete' ? (
                        <span className="text-green-500">✓</span>
                      ) : step.status === 'in-progress' ? (
                        <span className="text-yellow-500 animate-spin">⟳</span>
                      ) : (
                        <span className="text-zinc-500">○</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium text-white">{step.title}</h4>
                      <p className="text-zinc-400 text-sm">{step.description}</p>
                    </div>
                    <div className="h-4 w-4 flex items-center justify-center">
                      {step.status === 'complete' && (
                        <span className="h-3 w-3 bg-green-500 rounded-full" />
                      )}
                      {step.status === 'in-progress' && (
                        <span className="h-3 w-3 bg-yellow-500 rounded-full animate-ping" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Results Preview */}
              <div className="mt-8 p-6 bg-zinc-900/30 rounded-lg border border-zinc-800">
                <h4 className="font-semibold text-white mb-4">Investigation Results</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-zinc-400">Risk Score:</p>
                    <p className="text-2xl font-bold text-red-500">{results.riskScore}/100</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-400">Severity:</p>
                    <p className="text-2xl font-bold text-red-500">{results.severity}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-400">Likely Technique:</p>
                    <p className="text-xl font-semibold text-blue-400">{results.technique}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-400">Confidence:</p>
                    <p className="text-2xl font-bold text-blue-400">{results.confidence}%</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 text-center">
                <a href="/incidents" className="flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                  View Full Investigation
                </a>
                {error && (
                  <p className="mt-4 text-zinc-400 text-sm">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 pt-20 pb-24 bg-zinc-950">
      <div className="relative">
        <div className="absolute inset-0 -z-10">
          <div className="relative h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900"></div>
            <svg className="absolute inset-0 -z-10" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="circuit" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0,10 L20,10 M10,0 L10,20" stroke="rgba(0,189,212,0.03)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#circuit)" />
            </svg>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">AI Security Analyst</h2>
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">AI Security Analyst in Action</h3>
              <p className="text-zinc-300 mb-4">
                Watch as our AI analyst autonomously investigates a security incident, correlates evidence,
                and provides actionable intelligence.
              </p>
            </div>

            {/* Incident Summary */}
            <div className="mb-8 p-6 bg-zinc-900/30 rounded-lg border border-zinc-800">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 flex items-center justify-center rounded bg-primary/20 text-primary flex-shrink-0">
                  🤖
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Incident Investigation: Potential Credential Stuffing Attack</h4>
                  <p className="text-zinc-400 text-sm">347 failed authentication attempts detected across 18 accounts</p>
                </div>
              </div>
            </div>

            {/* Investigation Steps */}
            <div className="space-y-4">
              {investigationSteps.map(step => (
                <div key={step.id} className="flex items-start space-x-4 p-4 bg-zinc-900/20 rounded-lg border border-zinc-800/30 transition-all hover:border-zinc-700/50">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full flex-shrink-0">
                    {step.status === 'complete' ? (
                      <span className="text-green-500">✓</span>
                    ) : step.status === 'in-progress' ? (
                      <span className="text-yellow-500 animate-spin">⟳</span>
                    ) : (
                      <span className="text-zinc-500">○</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-white">{step.title}</h4>
                    <p className="text-zinc-400 text-sm">{step.description}</p>
                  </div>
                  <div className="h-4 w-4 flex items-center justify-center">
                    {step.status === 'complete' && (
                      <span className="h-3 w-3 bg-green-500 rounded-full" />
                    )}
                    {step.status === 'in-progress' && (
                      <span className="h-3 w-3 bg-yellow-500 rounded-full animate-ping" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Results Preview */}
            <div className="mt-8 p-6 bg-zinc-900/30 rounded-lg border border-zinc-800">
              <h4 className="font-semibold text-white mb-4">Investigation Results</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-zinc-400">Risk Score:</p>
                  <p className="text-2xl font-bold text-red-500">{results.riskScore}/100</p>
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-400">Severity:</p>
                  <p className="text-2xl font-bold text-red-500">{results.severity}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-400">Likely Technique:</p>
                  <p className="text-xl font-semibold text-blue-400">{results.technique}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-400">Confidence:</p>
                  <p className="text-2xl font-bold text-blue-400">{results.confidence}%</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 text-center">
              <a href="/incidents" className="flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                View Full Investigation
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }
}