'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/api';
import { 
  ShieldAlert, 
  Cpu, 
  Activity, 
  Clock, 
  Terminal, 
  Shield, 
  RefreshCw, 
  ChevronLeft, 
  CornerDownRight, 
  HelpCircle, 
  ListTodo, 
  FileCode, 
  Users,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';

const ThreatGraph = dynamic(() => import('@/components/3d/ThreatGraph'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-[10px] space-y-2">
      <RefreshCw className="h-6 w-6 animate-spin text-cyber-blue" />
      <span>COMPILING FORENSIC TOPOLOGY...</span>
    </div>
  )
});

type NodeType = 'server' | 'workstation' | 'database' | 'firewall' | 'router' | 'endpoint' | 'external' | 'auth';
type Node = {
  id: string;
  label: string;
  position: [number, number, number];
  type: NodeType;
  critical?: boolean;
  warning?: boolean;
};

// Types based on existing backend schemas
type Incident = {
  id: number;
  incident_id?: string;
  title: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
  assigned_to?: number;
  risk_score?: number;
  confidence?: number;
  mitre_techniques?: Array<{ technique_id: string; name: string; tactic?: string }>;
  affected_assets?: number[];
  timeline?: Array<any>;
  raw_data?: any;
  reported_at: string;
  updated_at: string;
  resolved_at?: string;
};

type Detection = {
  id: number;
  rule_id?: string;
  rule_name?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
  risk_score?: number;
  event_ids?: number[];
  mitre_techniques?: Array<{ technique_id: string; name: string; tactic?: string }>;
  timestamp: string;
};

type Event = {
  id: number;
  event_type?: string;
  source_ip?: string;
  destination_ip?: string;
  user?: string;
  asset?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  [key: string]: any; // For other metadata
};

type AIAnalysis = {
  summary: string;
  threat_assessment: string;
  severity_assessment?: string;
  mitre_analysis: string;
  key_evidence: string[];
  recommended_actions: string[];
  investigation_steps: string[];
  questions_for_analyst: string[];
  confidence: number;
  created_at: string;
};

type IncidentDetailPageState = {
  incident: Incident | null;
  detections: Detection[];
  events: Event[];
  aiAnalysis: AIAnalysis | null;
  loading: boolean;
  error: string | null;
  analyzing: boolean;
  analyzeError: string | null;
};

export default function IncidentDetail({ params }: { params: { id: string } }) {
  const incidentId = parseInt(params.id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [state, setState] = useState<IncidentDetailPageState>({
    incident: null,
    detections: [],
    events: [],
    aiAnalysis: null,
    loading: true,
    error: null,
    analyzing: false,
    analyzeError: null,
  });

  // Fetch incident details
  const fetchIncidentDetails = useCallback(async () => {
    if (!authUtils.isAuthenticated()) {
      setState(prev => ({ ...prev, loading: false, error: 'Authentication required' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null, analyzeError: null }));

      // Fetch incident
      const incidentResponse = await apiClient.get(`/incidents/${incidentId}`);
      const incident = incidentResponse.data;

      // Fetch detections for this incident
      const detectionsResponse = await apiClient.get(`/detections/`, {
        params: { incident_id: incidentId }
      });
      const detections = detectionsResponse.data || [];

      // Fetch events linked to these detections
      let events: Event[] = [];
      if (detections.length > 0) {
        const eventIds = detections
          .flatMap((detection: Detection) => detection.event_ids || [])
          .filter((id: number) => id !== null)
          .filter((value: number, index: number, self: number[]) => self.indexOf(value) === index); // Remove duplicates

        if (eventIds.length > 0) {
          const eventsResponse = await apiClient.get(`/events/`, {
            params: { event_ids: eventIds.join(',') }
          });
          events = eventsResponse.data || [];
        }
      }

      // Fetch AI analyses (list) and get the most recent
      let aiAnalysis: AIAnalysis | null = null;
      try {
        const analysisResponse = await apiClient.get(`/ai/incidents/${incidentId}/analyses`);
        const analyses = analysisResponse.data || [];
        if (analyses.length > 0) {
          // Sort by created_at descending and take the first
          const sortedAnalyses = analyses.sort(
            (a: AIAnalysis, b: AIAnalysis) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          aiAnalysis = sortedAnalyses[0];
        }
      } catch (analysisError) {
        // AI analysis might not exist yet, that's OK
        console.log('No AI analysis found for this incident');
      }

      setState({
        incident,
        detections,
        events,
        aiAnalysis,
        loading: false,
        error: null,
        analyzing: false,
        analyzeError: null,
      });
    } catch (err: any) {
      console.error('Failed to fetch incident details:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.response?.data?.detail || 'Failed to load incident details',
        analyzing: false,
      }));
    }
  }, [incidentId]);

  // Trigger AI analysis
  const triggerAiAnalysis = useCallback(async () => {
    if (!authUtils.isAuthenticated() || state.analyzing) return;

    setState(prev => ({ ...prev, analyzing: true, analyzeError: null }));
    try {
      const response = await apiClient.post(`/ai/incidents/${incidentId}/analyze`);
      const newAnalysis = response.data.analysis || response.data; // Adjust based on actual response shape

      // Refetch incident to get updated analysis list
      const incidentResponse = await apiClient.get(`/incidents/${incidentId}`);
      const incident = incidentResponse.data;

      // Fetch detections and events again (in case they changed)
      const detectionsResponse = await apiClient.get(`/detections/`, {
        params: { incident_id: incidentId }
      });
      const detections = detectionsResponse.data || [];

      let events: Event[] = [];
      if (detections.length > 0) {
        const eventIds = detections
          .flatMap((detection: Detection) => detection.event_ids || [])
          .filter((id: number) => id !== null)
          .filter((value: number, index: number, self: number[]) => self.indexOf(value) === index);

        if (eventIds.length > 0) {
          const eventsResponse = await apiClient.get(`/events/`, {
            params: { event_ids: eventIds.join(',') }
          });
          events = eventsResponse.data || [];
        }
      }

      setState(prev => ({
        ...prev,
        incident,
        detections,
        events,
        aiAnalysis: newAnalysis,
        loading: false,
        analyzing: false,
        analyzeError: null,
      }));
    } catch (err: any) {
      console.error('Failed to trigger AI analysis:', err);
      setState(prev => ({
        ...prev,
        analyzing: false,
        analyzeError: err.response?.data?.detail || 'AI analysis temporarily unavailable',
      }));
    }
  }, [state.analyzing, incidentId]);

  // Initial load
  useEffect(() => {
    fetchIncidentDetails();
  }, [fetchIncidentDetails]);

  // Loading state
  if (state.loading && !state.incident && !state.error) {
    return (
      <div className="min-h-screen bg-[#03070b] flex flex-col items-center justify-center space-y-4">
        <Activity className="h-8 w-8 text-cyber-blue animate-pulse" />
        <p className="text-zinc-500 font-mono text-xs tracking-wider">CORRELATING INCIDENT EVIDENCE FILES...</p>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-[#03070b] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 flex items-center justify-center bg-severity-critical/10 text-severity-critical border border-severity-critical/20 rounded">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-zinc-400 font-mono text-xs">{state.error}</p>
        <button
          onClick={fetchIncidentDetails}
          className="flex h-10 items-center justify-center rounded bg-cyber-blue px-5 text-sm font-semibold text-[#03070b] hover:bg-primary-hover transition-colors"
        >
          RETRY PULL
        </button>
      </div>
    );
  }

  // Incident not found
  if (!state.incident) {
    return (
      <div className="min-h-screen bg-[#03070b] flex flex-col items-center justify-center p-6">
        <p className="text-zinc-500 font-mono text-xs">[SPECIFIED INCIDENT RECORD NOT LOCATED]</p>
        <button
          onClick={() => window.location.href = '/incidents'}
          className="mt-4 flex h-9 items-center justify-center rounded bg-panel border border-panel-border px-4 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
        >
          BACK TO INCIDENTS
        </button>
      </div>
    );
  }

  // Helper function to get severity class
  const getSeverityClass = (severity: string | undefined) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-severity-critical/10 text-severity-critical border-severity-critical/20';
      case 'high': return 'bg-severity-high/10 text-severity-high border-severity-high/20';
      case 'medium': return 'bg-severity-medium/10 text-severity-medium border-severity-medium/20';
      case 'low': return 'bg-severity-low/10 text-severity-low border-severity-low/20';
      default: return 'bg-zinc-800/30 text-zinc-400 border-zinc-700/20';
    }
  };

  const getStatusClass = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED': return 'bg-severity-low/10 text-severity-low border-severity-low/20';
      case 'CONTAINED': return 'bg-cyber-blue-muted text-cyber-blue border-cyber-blue/20';
      case 'INVESTIGATING': return 'bg-severity-high-muted text-severity-high border-severity-high/20';
      default: return 'bg-zinc-800/30 text-zinc-400 border-zinc-700/20';
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#03070b] text-[#f3f4f6]">
      {/* HEADER BAR */}
      <header className="border-b border-panel-border bg-panel-header/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span 
                className="text-white font-extrabold text-lg tracking-tight cursor-pointer"
                onClick={() => window.location.href = '/dashboard'}
              >
                AEGIS<span className="text-cyber-blue">SOC</span>
              </span>
              <span className="h-4 w-px bg-panel-border"></span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">CASE CORRELATION CONSOLE</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/incidents'}
                className="flex h-9 items-center justify-center rounded border border-panel-border bg-panel px-4 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to queue
              </button>
              
              {!state.analyzing ? (
                <button
                  onClick={triggerAiAnalysis}
                  className={`flex h-9 items-center justify-center rounded px-4 text-xs font-semibold text-[#03070b] transition-colors ${
                    state.aiAnalysis ? 'bg-cyber-blue hover:bg-primary-hover' : 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600'
                  }`}
                >
                  <Cpu className="h-4 w-4 mr-1.5" />
                  {state.aiAnalysis ? 'Run Analysis Recheck' : 'Trigger AI Copilot'}
                </button>
              ) : (
                <button
                  className="flex h-9 items-center justify-center rounded bg-panel border border-panel-border px-4 text-xs font-mono text-zinc-500 cursor-default"
                  disabled
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin text-cyber-blue" />
                  ANALYZING CORE DATA...
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* INCIDENT DETAILS HEADER BLOCK */}
        <div className="bg-panel border border-panel-border p-5 rounded-lg shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-[3px] bg-severity-critical"></div>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono bg-panel-header border border-panel-border px-2 py-0.5 rounded text-zinc-400 uppercase">
                  CASE-ID: SEC-{state.incident.incident_id || state.incident.id}
                </span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getSeverityClass(state.incident.severity)}`}>
                  {state.incident.severity || 'LOW'}
                </span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusClass(state.incident.status)}`}>
                  {state.incident.status}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{state.incident.title}</h1>
              {state.incident.description && (
                <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">{state.incident.description}</p>
              )}
            </div>

            {/* Micro Metadata Metrics */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-panel-border/30 pt-3 md:border-t-0 md:pt-0 font-mono text-[11px] text-zinc-500 max-w-sm shrink-0">
              <div className="flex justify-between border-b border-panel-border/30 pb-1">
                <span>RISK</span>
                <span className="font-bold text-severity-high pl-3">{state.incident.risk_score ?? 0}/100</span>
              </div>
              <div className="flex justify-between border-b border-panel-border/30 pb-1">
                <span>CONFIDENCE</span>
                <span className="font-bold text-cyber-blue pl-3">{state.incident.confidence ?? 0}%</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span>TIMESTAMP</span>
                <span className="text-zinc-300 pl-3">{formatTimestamp(state.incident.reported_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN CONSOLE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: TELEMETRY & INCIDENT CONTEXT */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 3D FORENSIC ATTACK PATHWAY */}
            {(() => {
              const sourceIp = state.events[0]?.source_ip || 'EXTERNAL';
              const sourceNode: Node = { id: 'source_node', label: sourceIp, position: [-4.8, 1.2, -1.2], type: 'external', critical: true };
              
              const eventNodes: Node[] = state.events.slice(0, 3).map((ev, idx) => ({
                id: 'ev-' + ev.id,
                label: ev.event_type || 'Event',
                position: [-1.8, 1.2 - idx * 0.9, -0.4] as [number, number, number],
                type: 'router'
              }));
              
              const detectionNodes: Node[] = state.detections.slice(0, 3).map((det, idx) => ({
                id: 'det-' + det.id,
                label: det.rule_name || 'Detection',
                position: [1.2, 1.2 - idx * 0.9, 0.4] as [number, number, number],
                type: 'firewall',
                warning: true
              }));
              
              const assetId = state.events[0]?.asset || 'ASSET-TARGET';
              const assetNode: Node = { id: 'asset_node', label: assetId, position: [3.8, 0.4, -0.6], type: 'server', warning: true };
              
              const incidentNode: Node = { id: 'incident_node', label: 'INCIDENT-' + state.incident.id, position: [6.0, 0.4, -1.8], type: 'database', critical: true };
              
              const forensicNodes: Node[] = [sourceNode, ...eventNodes, ...detectionNodes, assetNode, incidentNode];
              
              const sourceToEvents = eventNodes.map(ev => ({ from: 'source_node', to: ev.id }));
              const eventsToDetections = eventNodes.map((ev, idx) => ({
                from: ev.id,
                to: detectionNodes[idx % detectionNodes.length]?.id || 'asset_node'
              }));
              const detectionsToAsset = detectionNodes.map(det => ({ from: det.id, to: 'asset_node' }));
              const assetToIncident = { from: 'asset_node', to: 'incident_node' };
              
              const forensicConnections = [...sourceToEvents, ...eventsToDetections, ...detectionsToAsset, assetToIncident];
              const selectedNode = forensicNodes.find(n => n.id === selectedNodeId);

              return (
                <Card>
                  <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                    <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center">
                      <Cpu className="h-4 w-4 text-cyber-blue mr-2 animate-pulse" />
                      3D FORENSIC ATTACK PATHWAY
                    </h3>
                  </div>
                  <div className="relative h-72 bg-[#020508]/85 rounded border border-panel-border/30 overflow-hidden flex flex-col justify-end">
                    <div className="absolute inset-0 z-0">
                      <ThreatGraph
                        nodes={forensicNodes}
                        connections={forensicConnections}
                        selectedNodeId={selectedNodeId}
                        onNodeSelect={setSelectedNodeId}
                        threatsActive={true}
                      />
                    </div>

                    {/* Mini details HUD overlay */}
                    {selectedNode && (
                      <div className="absolute left-3 top-3 bg-[#03070b]/90 border border-panel-border/80 p-3 rounded shadow-2xl font-mono text-[9px] text-zinc-300 w-52 space-y-1.5 backdrop-blur-sm z-10 select-none">
                        <div className="flex justify-between border-b border-panel-border/30 pb-1">
                          <span className="text-zinc-500 uppercase">IDENTIFIER</span>
                          <span className="font-bold text-white truncate max-w-[120px]">{selectedNode.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">CLASS</span>
                          <span className="text-cyber-blue font-bold uppercase">{selectedNode.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">THREAT STATE</span>
                          <span className={selectedNode.critical ? 'text-severity-critical font-bold' : selectedNode.warning ? 'text-severity-high font-bold' : 'text-severity-low font-bold'}>
                            {selectedNode.critical ? 'COMPROMISED' : selectedNode.warning ? 'WARNING' : 'SECURED'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="absolute right-3 bottom-3 pointer-events-none z-10 text-[8px] font-mono text-zinc-600 bg-[#03070b]/40 px-2 py-0.5 rounded">
                      ORBIT OR ZOOM TO INVESTIGATE COMPROMISE VECTORS
                    </div>
                  </div>
                </Card>
              );
            })()}
            
            {/* EVIDENCE SOURCE INFO */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center">
                  <Terminal className="h-4 w-4 text-cyber-blue mr-2" />
                  INCIDENT CORE EVIDENCE
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-panel-header/50 border border-panel-border/40 rounded flex items-center justify-between">
                  <span className="text-zinc-500 uppercase text-[10px]">SOURCE IP</span>
                  <span className="text-zinc-200 font-bold">{state.events[0]?.source_ip || 'N/A'}</span>
                </div>
                <div className="p-3 bg-panel-header/50 border border-panel-border/40 rounded flex items-center justify-between">
                  <span className="text-zinc-500 uppercase text-[10px]">DESTINATION IP</span>
                  <span className="text-zinc-200 font-bold">{state.events[0]?.destination_ip || 'INTERNAL'}</span>
                </div>
                <div className="p-3 bg-panel-header/50 border border-panel-border/40 rounded flex items-center justify-between">
                  <span className="text-zinc-500 uppercase text-[10px]">TARGET ACCOUNT</span>
                  <span className="text-zinc-200 font-bold">{state.events[0]?.user || 'N/A'}</span>
                </div>
                <div className="p-3 bg-panel-header/50 border border-panel-border/40 rounded flex items-center justify-between">
                  <span className="text-zinc-500 uppercase text-[10px]">AFFECTED GATEWAY</span>
                  <span className="text-zinc-200 font-bold">{state.events[0]?.asset || 'N/A'}</span>
                </div>
              </div>
            </Card>

            {/* DETECTIONS LIST */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center">
                  <Shield className="h-4 w-4 text-cyber-blue mr-2" />
                  COMPILE DETECTIONS ({state.detections.length})
                </h3>
              </div>
              {state.detections.length > 0 ? (
                <div className="space-y-4">
                  {state.detections.map((detection) => (
                    <div key={detection.id} className="p-4 bg-panel-header/35 border border-panel-border/30 rounded hover:border-panel-border transition-colors">
                      <div className="flex items-start justify-between gap-4 font-mono text-xs">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white text-sm uppercase tracking-tight">{detection.rule_name}</h4>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              detection.severity === 'critical' ? 'bg-severity-critical/10 text-severity-critical border-severity-critical/20' :
                              detection.severity === 'high' ? 'bg-severity-high/10 text-severity-high border-severity-high/20' :
                              detection.severity === 'medium' ? 'bg-severity-medium/10 text-severity-medium border-severity-medium/20' :
                              'bg-severity-low-muted text-severity-low border-severity-low/20'
                            }`}>
                              {detection.severity || 'LOW'}
                            </span>
                          </div>
                          
                          {detection.description && (
                            <p className="text-zinc-400 text-[11px] font-sans leading-relaxed">
                              {detection.description}
                            </p>
                          )}
                          
                          {detection.mitre_techniques && detection.mitre_techniques.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {detection.mitre_techniques.map((tech) => (
                                <span key={tech.technique_id} className="px-2 py-0.5 rounded bg-cyber-blue-muted border border-cyber-blue/25 text-cyber-blue text-[9px]">
                                  {tech.technique_id} : {tech.name}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center space-x-6 text-[10px] text-zinc-500 pt-2 border-t border-panel-border/30">
                            <span>RISK SCORE: <span className="text-zinc-200">{detection.risk_score ?? 0}</span></span>
                            <span>CONFIDENCE: <span className="text-zinc-200">{detection.confidence ?? 0}%</span></span>
                            <span>TRIGGER TIME: <span className="text-zinc-300">{formatTimestamp(detection.timestamp)}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 font-mono text-xs">
                  [NO DIRECT DETECTIONS LOGGED FOR CASE]
                </div>
              )}
            </Card>

            {/* EVENT TIMELINE */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center">
                  <Activity className="h-4 w-4 text-cyber-blue mr-2" />
                  ATTACK SEQUENCE TIMELINE ({state.events.length})
                </h3>
              </div>
              {state.events.length > 0 ? (
                <div className="relative pl-6 space-y-6">
                  {/* Timeline connecting line */}
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-panel-border"></div>
                  
                  {state.events.map((event, index) => {
                    const isCritical = event.severity === 'critical' || event.severity === 'high';
                    const isMedium = event.severity === 'medium';
                    const dotColor = isCritical ? 'bg-severity-critical border-severity-critical/40' : isMedium ? 'bg-severity-high border-severity-high/40' : 'bg-severity-low border-severity-low/40';

                    return (
                      <div key={event.id} className="relative font-mono text-xs">
                        {/* Timeline absolute node point */}
                        <div className={`absolute left-[-21px] top-1 h-3.5 w-3.5 rounded-full border-4 ${dotColor}`}></div>
                        
                        <div className="bg-panel-header/35 border border-panel-border/30 rounded p-4 space-y-2 hover:border-panel-border transition-colors ml-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white text-sm uppercase tracking-tight">{event.event_type}</h4>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              isCritical ? 'bg-severity-critical/10 text-severity-critical border-severity-critical/20' :
                              isMedium ? 'bg-severity-high/10 text-severity-high border-severity-high/20' :
                              'bg-severity-low-muted text-severity-low border-severity-low/20'
                            }`}>
                              {event.severity || 'LOW'}
                            </span>
                          </div>
                          
                          <p className="text-zinc-400 text-[11px]">
                            {event.source_ip} <span className="text-zinc-600">→</span> {event.destination_ip || 'INTERNAL'}
                            {event.user ? ` [ACCOUNT: ${event.user}]` : ''}
                            {event.asset ? ` [GATEWAY: ${event.asset}]` : ''}
                          </p>
                          
                          <div className="text-[10px] text-zinc-500 border-t border-panel-border/30 pt-1.5 flex justify-between items-center">
                            <span>EVENT-ID: {event.id}</span>
                            <span className="text-zinc-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1 shrink-0" />
                              {formatTimestamp(event.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 font-mono text-xs">
                  [NO TIMELINE LOG EVENTS AVAILABLE]
                </div>
              )}
            </Card>

            {/* MITRE ATT&CK MAPPING */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center">
                  <Shield className="h-4 w-4 text-cyber-blue mr-2" />
                  MITRE ATT&CK SEGMENTS
                </h3>
              </div>
              
              {!state.incident.mitre_techniques?.length && state.detections.every(d => !d.mitre_techniques?.length) ? (
                <p className="text-zinc-500 text-center py-8 font-mono text-xs">
                  [NO MITRE ATT&CK TECHNIQUES DETECTED]
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ...(state.incident.mitre_techniques || []),
                    ...state.detections.flatMap((d: Detection) => d.mitre_techniques || [])
                  ]
                  .filter((value, index, self) =>
                    self.findIndex((t) => t.technique_id === value.technique_id) === index
                  ) // Remove duplicates
                  .map((tech) => (
                    <div key={tech.technique_id} className="p-3 bg-panel-header/50 border border-panel-border/40 rounded flex items-start space-x-3 font-mono text-xs">
                      <div className="h-7 w-7 rounded bg-cyber-blue-muted border border-cyber-blue/15 text-cyber-blue flex items-center justify-center shrink-0 font-bold text-[10px]">
                        {tech.technique_id}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{tech.name}</h4>
                        {tech.tactic && (
                          <p className="text-[10px] text-zinc-500 uppercase">Tactic: {tech.tactic}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN: AI ANALYST & RISK SCORING */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* RISK DIAGNOSTICS */}
            <Card>
              <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
                  RISK ASSESSMENT
                </h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2.5 bg-panel-header/50 border border-panel-border/30 rounded">
                    <p className="text-[9px] text-zinc-500">RISK</p>
                    <p className="text-lg font-bold text-severity-critical mt-1">{state.incident.risk_score ?? 0}</p>
                  </div>
                  <div className="p-2.5 bg-panel-header/50 border border-panel-border/30 rounded col-span-2">
                    <p className="text-[9px] text-zinc-500">SEVERITY STATE</p>
                    <span className="inline-block mt-1 text-xs font-bold text-white uppercase">{state.incident.severity || 'low'}</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-zinc-500 text-center leading-relaxed">
                  Calculated based on asset criticality, mapped detections, and behavioral confidence indices.
                </div>
              </div>
            </Card>

            {/* AI CO-PILOT ASSISTANT */}
            <Card className="cyber-scanline relative">
              <div className="flex items-center space-x-2 border-b border-panel-border/40 pb-3 mb-4">
                <Cpu className="h-4 w-4 text-cyber-blue animate-pulse shrink-0" />
                <span className="font-mono text-xs font-bold text-white tracking-widest uppercase">AI ANALYST CO-PILOT</span>
              </div>
              
              {state.analyzing ? (
                <div className="text-center py-16 space-y-3 font-mono">
                  <RefreshCw className="h-8 w-8 text-cyber-blue animate-spin mx-auto" />
                  <p className="text-zinc-400 text-xs font-bold">COMPILING SYSTEM LOG DATA...</p>
                  <p className="text-zinc-600 text-[10px]">Correlating network nodes and IOC parameters</p>
                </div>
              ) : state.aiAnalysis ? (
                <div className="space-y-5 text-xs">
                  
                  {/* OBSERVED SEGMENT */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase border-b border-panel-border/30 pb-1">
                      [01] OBSERVED SIGS
                    </h4>
                    
                    <div className="p-3 bg-panel-header/60 border border-panel-border/30 rounded text-zinc-300 font-sans leading-relaxed">
                      <strong>Executive Summary:</strong> {state.aiAnalysis.summary}
                    </div>

                    <div className="space-y-2">
                      <p className="font-mono text-zinc-400 font-bold uppercase text-[10px]">Key Evidence Logged:</p>
                      {state.aiAnalysis.key_evidence.length > 0 ? (
                        <div className="space-y-1.5 pl-1.5 border-l border-panel-border font-mono text-[11px] text-zinc-400">
                          {state.aiAnalysis.key_evidence.map((evidence, index) => (
                            <div key={index} className="flex items-start space-x-1.5">
                              <span className="text-cyber-blue shrink-0">▪</span>
                              <span>{evidence}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-600 font-mono text-[10px]">[No logged evidence]</p>
                      )}
                    </div>
                  </div>

                  {/* INFERRED SEGMENT */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase border-b border-panel-border/30 pb-1">
                      [02] INFERRED TACTICS
                    </h4>
                    
                    <div className="space-y-1.5 font-mono text-[11px] text-zinc-400">
                      <div className="flex justify-between border-b border-panel-border/20 pb-1.5">
                        <span>MITRE Threat Model:</span>
                        <span className="text-zinc-300 font-bold text-[10px] max-w-[160px] truncate">{state.aiAnalysis.mitre_analysis}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Threat Confidence:</span>
                        <span className="text-cyber-blue font-bold">{state.aiAnalysis.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {/* RECOMMENDED SEGMENT */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase border-b border-panel-border/30 pb-1">
                      [03] RECOMMENDED RESPONSE
                    </h4>

                    <div className="space-y-2">
                      <p className="font-mono text-zinc-400 font-bold uppercase text-[10px]">Mitigation Playbook Actions:</p>
                      {state.aiAnalysis.recommended_actions.length > 0 ? (
                        <div className="space-y-1.5 pl-1.5 border-l border-panel-border font-mono text-[11px] text-zinc-400">
                          {state.aiAnalysis.recommended_actions.map((action, index) => (
                            <div key={index} className="flex items-start space-x-1.5">
                              <span className="text-severity-high shrink-0">▪</span>
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-600 font-mono text-[10px]">[No actions flagged]</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="font-mono text-zinc-400 font-bold uppercase text-[10px]">Investigation Verification Steps:</p>
                      {state.aiAnalysis.investigation_steps.length > 0 ? (
                        <div className="space-y-1.5 pl-1.5 border-l border-panel-border font-mono text-[11px] text-zinc-400">
                          {state.aiAnalysis.investigation_steps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-1.5">
                              <span className="text-cyber-blue shrink-0">▪</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-600 font-mono text-[10px]">[No steps flagged]</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4 font-mono">
                  <PlayCircle className="h-10 w-10 text-zinc-600 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-zinc-400 text-xs font-bold">CO-PILOT CONSOLE READY</p>
                    <p className="text-zinc-600 text-[10px]">Trigger autonomous investigation analyzer.</p>
                  </div>
                  <button
                    onClick={triggerAiAnalysis}
                    className="w-full flex h-10 items-center justify-center rounded bg-cyber-blue text-xs font-bold text-[#03070b] hover:bg-primary-hover transition-colors"
                  >
                    RUN CORRELATION SWEEP
                  </button>
                </div>
              )}
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}