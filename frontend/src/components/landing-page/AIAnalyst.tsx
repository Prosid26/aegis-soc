'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/api';
import { Cpu, Terminal, Radio } from 'lucide-react';

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
      <section className="relative z-10 pt-16 pb-20 bg-[#03070b] border-b border-panel-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-panel rounded-lg border border-panel-border p-6 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center space-x-2 text-[10px] font-mono tracking-widest text-cyber-blue uppercase bg-cyber-blue-muted px-2.5 py-1 border border-cyber-blue/20 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-pulse"></span>
                <span>AI CO-PILOT SIMULATOR</span>
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">AI Security Analyst in Action</h3>
              <p className="text-zinc-400 text-xs max-w-lg mx-auto">
                Watch as the autonomous analyst correlates system signals, identifies attack sequences, and generates threat mitigation advice.
              </p>
            </div>

            {/* Incident Summary */}
            <div className="p-4 bg-panel-header border border-panel-border rounded flex items-center space-x-3">
              <div className="h-8 w-8 flex items-center justify-center rounded bg-cyber-blue-muted border border-cyber-blue/20 text-cyber-blue shrink-0">
                <Cpu className="h-4 w-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm">Incident Investigation: Calibrating sensors...</h4>
                <p className="text-zinc-500 text-xs font-mono">Analyzing incoming network signals</p>
              </div>
            </div>

            {/* Investigation Steps */}
            <div className="space-y-2">
              {investigationSteps.map(step => (
                <div key={step.id} className="flex items-center justify-between p-3 bg-panel-header/50 border border-panel-border/30 rounded text-xs opacity-60">
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-mono bg-zinc-800/30 text-zinc-500 border border-zinc-700/20 px-2 py-0.5 rounded">WAIT</span>
                    <span className="font-mono text-zinc-400">{step.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600">[STEP-0{step.id}]</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && !analyzing) {
    return (
      <section className="relative z-10 pt-16 pb-20 bg-[#03070b] border-b border-panel-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-panel rounded-lg border border-panel-border p-6 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center space-x-2 text-[10px] font-mono tracking-widest text-cyber-blue uppercase bg-cyber-blue-muted px-2.5 py-1 border border-cyber-blue/20 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-pulse"></span>
                <span>AI CO-PILOT SIMULATOR</span>
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">AI Security Analyst in Action</h3>
              <p className="text-zinc-400 text-xs max-w-lg mx-auto">
                Watch as the autonomous analyst correlates system signals, identifies attack sequences, and generates threat mitigation advice.
              </p>
            </div>

            {/* Incident Summary */}
            <div className="p-4 bg-panel-header border border-panel-border rounded flex items-center space-x-3">
              <div className="h-8 w-8 flex items-center justify-center rounded bg-cyber-blue-muted border border-cyber-blue/20 text-cyber-blue shrink-0">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm">Potential Credential Stuffing Attack</h4>
                <p className="text-zinc-500 text-xs font-mono">347 failed authentication attempts detected across 18 accounts</p>
              </div>
            </div>

            {/* Investigation Steps */}
            <div className="space-y-2">
              {investigationSteps.map(step => (
                <div key={step.id} className="flex items-center justify-between p-3 bg-panel-header/50 border border-panel-border/30 rounded text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-mono font-bold text-severity-low bg-severity-low/10 border border-severity-low/20 px-2 py-0.5 rounded">OK</span>
                    <span className="font-mono text-zinc-300">{step.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">[STEP-0{step.id}]</span>
                </div>
              ))}
            </div>

            {/* Results Preview */}
            <div className="p-4 bg-[#020508] border border-panel-border rounded space-y-3">
              <h4 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase border-b border-panel-border/30 pb-1.5">INVESTIGATION RESULTS</h4>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 text-xs font-mono">
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500">RISK INDEX</p>
                  <p className="text-lg font-bold text-severity-critical">{results.riskScore}/100</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500">SEVERITY</p>
                  <p className="text-lg font-bold text-severity-critical">{results.severity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500">TECHNIQUE</p>
                  <p className="text-xs text-cyber-blue font-bold truncate">{results.technique}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500">CONFIDENCE</p>
                  <p className="text-lg font-bold text-cyber-blue">{results.confidence}%</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center space-y-3 pt-2">
              <a href="/incidents" className="w-full flex h-10 items-center justify-center rounded bg-cyber-blue hover:bg-primary-hover text-[13px] font-bold text-[#03070b] transition-all duration-300">
                View Full Investigation
              </a>
              {error && (
                <p className="text-[10px] font-mono text-zinc-500">
                  Status: {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 pt-16 pb-20 bg-[#03070b] border-b border-panel-border">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-panel rounded-lg border border-panel-border p-6 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center space-x-2 text-[10px] font-mono tracking-widest text-cyber-blue uppercase bg-cyber-blue-muted px-2.5 py-1 border border-cyber-blue/20 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-pulse"></span>
              <span>AI CO-PILOT SIMULATOR</span>
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">AI Security Analyst in Action</h3>
            <p className="text-zinc-400 text-xs max-w-lg mx-auto">
              Watch as the autonomous analyst correlates system signals, identifies attack sequences, and generates threat mitigation advice.
            </p>
          </div>

          {/* Incident Summary */}
          <div className="p-4 bg-panel-header border border-panel-border rounded flex items-center space-x-3">
            <div className="h-8 w-8 flex items-center justify-center rounded bg-cyber-blue-muted border border-cyber-blue/20 text-cyber-blue shrink-0">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-white text-sm">Incident Investigation: Potential Credential Stuffing Attack</h4>
              <p className="text-zinc-500 text-xs font-mono">347 failed authentication attempts detected across 18 accounts</p>
            </div>
          </div>

          {/* Investigation Steps */}
          <div className="space-y-2">
            {investigationSteps.map(step => (
              <div key={step.id} className="flex items-center justify-between p-3 bg-panel-header/50 border border-panel-border/30 rounded text-xs hover:border-panel-border transition-colors">
                <div className="flex items-center space-x-3">
                  {step.status === 'complete' ? (
                    <span className="text-[10px] font-mono font-bold text-severity-low bg-severity-low/10 border border-severity-low/20 px-2 py-0.5 rounded">OK</span>
                  ) : step.status === 'in-progress' ? (
                    <span className="text-[10px] font-mono font-bold text-severity-high bg-severity-high/10 border border-severity-high/20 px-2 py-0.5 rounded animate-pulse">EXEC</span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-800/30 border border-zinc-700/20 px-2 py-0.5 rounded">WAIT</span>
                  )}
                  <span className="font-mono text-zinc-300">{step.title}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">[STEP-0{step.id}]</span>
              </div>
            ))}
          </div>

          {/* Results Preview */}
          <div className="p-4 bg-[#020508] border border-panel-border rounded space-y-3">
            <h4 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase border-b border-panel-border/30 pb-1.5">INVESTIGATION RESULTS</h4>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 text-xs font-mono">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500">RISK INDEX</p>
                <p className="text-lg font-bold text-severity-critical">{results.riskScore}/100</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500">SEVERITY</p>
                <p className="text-lg font-bold text-severity-critical">{results.severity}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500">TECHNIQUE</p>
                <p className="text-xs text-cyber-blue font-bold truncate">{results.technique}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500">CONFIDENCE</p>
                <p className="text-lg font-bold text-cyber-blue">{results.confidence}%</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <a href="/incidents" className="flex h-10 items-center justify-center rounded bg-cyber-blue hover:bg-primary-hover text-[13px] font-bold text-[#03070b] transition-all duration-300">
              View Full Investigation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
 