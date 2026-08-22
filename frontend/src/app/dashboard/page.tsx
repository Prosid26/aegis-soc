'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/api';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  Radio, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Server, 
  User, 
  Bell, 
  RefreshCw, 
  Terminal, 
  Network,
  Cpu
} from 'lucide-react';

const ThreatGraph = dynamic(() => import('@/components/3d/ThreatGraph'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-[10px] space-y-2">
      <RefreshCw className="h-6 w-6 animate-spin text-cyber-blue" />
      <span>COMPILING WORKSTATION MODEL...</span>
    </div>
  )
});

// Components for the SOC dashboard
const ThreatLevelIndicator = ({ level }: { level: string }) => {
  const getThreatLevelProps = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
        return {
          label: 'CRITICAL STATE',
          bg: 'bg-severity-critical-muted',
          text: 'text-severity-critical',
          border: 'border-severity-critical/30',
          pulse: 'animate-threat-pulse'
        };
      case 'HIGH':
        return {
          label: 'HIGH ALERT',
          bg: 'bg-severity-high-muted',
          text: 'text-severity-high',
          border: 'border-severity-high/30',
          pulse: ''
        };
      case 'ELEVATED':
        return {
          label: 'ELEVATED STATUS',
          bg: 'bg-severity-medium-muted',
          text: 'text-severity-medium',
          border: 'border-severity-medium/30',
          pulse: ''
        };
      case 'GUARDED':
        return {
          label: 'GUARDED WATCH',
          bg: 'bg-severity-medium-muted/50',
          text: 'text-severity-medium',
          border: 'border-severity-medium/20',
          pulse: ''
        };
      default:
        return {
          label: 'SECURE MONITORING',
          bg: 'bg-severity-low-muted',
          text: 'text-severity-low',
          border: 'border-severity-low/30',
          pulse: ''
        };
    }
  };

  const props = getThreatLevelProps(level);

  return (
    <div className={`flex items-center justify-between p-4 ${props.bg} rounded border ${props.border} transition-all duration-500`}>
      <div className="space-y-1">
        <h4 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">GLOBAL OPERATIONS THREAT STATE</h4>
        <div className="flex items-center space-x-3">
          <span className={`text-2xl font-bold tracking-tight font-mono ${props.text} ${props.pulse}`}>
            {props.label}
          </span>
        </div>
      </div>
      <div className="text-[10px] font-mono text-zinc-500 max-w-[200px] text-right hidden sm:block">
        Deterministic telemetry correlation and sensor assessment model active.
      </div>
    </div>
  );
};

const SecurityMetrics = ({ metrics }: { metrics: any }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Stat
        title="Events/Min"
        value={metrics.eventsPerMinute}
        trend={metrics.eventsPerMinute > 50 ? 'up' : 'neutral'}
        trendValue={Math.max(0, metrics.eventsPerMinute - 25)}
        description="Core signal intake speed"
      />
      <Stat
        title="Active Incidents"
        value={metrics.activeIncidents}
        trend={metrics.activeIncidents > 0 ? 'up' : 'neutral'}
        trendValue={metrics.activeIncidents}
        description="Cases open in queue"
      />
      <Stat
        title="Critical Incidents"
        value={metrics.criticalIncidents}
        trend={metrics.criticalIncidents > 0 ? 'up' : 'neutral'}
        trendValue={metrics.criticalIncidents}
        description="Immediate actions required"
      />
      <Stat
        title="Detections Run"
        value={metrics.detectionCount}
        trend="neutral"
        trendValue={0}
        description="Detections compiled"
      />
      <Stat
        title="Avg Risk Score"
        value={metrics.avgRiskScore?.toFixed(1) || '0'}
        trend={metrics.avgRiskScore && metrics.avgRiskScore > 50 ? 'up' : 'neutral'}
        trendValue={0}
        description="Deterministic threat mean"
      />
      <Stat
        title="High Risk Detections"
        value={metrics.highRiskDetections}
        trend={metrics.highRiskDetections > 0 ? 'up' : 'neutral'}
        trendValue={metrics.highRiskDetections}
        description="Risk thresholds > 70"
      />
    </div>
  );
};

const LiveEventStream = ({ events }: { events: any[] }) => {
  return (
    <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
      {events.length > 0 ? (
        events.map((event, index) => {
          const isCritical = event.severity === 'high' || event.severity === 'critical';
          const isMedium = event.severity === 'medium';
          
          return (
            <div
              key={event.id || index}
              className={`flex items-start space-x-3 p-3 bg-panel-header/35 border border-panel-border/30 rounded hover:border-panel-border transition-all duration-300 font-mono text-xs`}
            >
              <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 text-[10px] font-bold ${
                isCritical ? 'bg-severity-critical/10 text-severity-critical border border-severity-critical/20' :
                isMedium ? 'bg-severity-high/10 text-severity-high border border-severity-high/20' :
                'bg-cyber-blue-muted text-cyber-blue border border-cyber-blue/15'
              }`}>
                EV
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200 uppercase truncate pr-2">{event.event_type || 'UNKNOWN_SIG'}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    isCritical ? 'bg-severity-critical/10 text-severity-critical border border-severity-critical/20' :
                    isMedium ? 'bg-severity-high/10 text-severity-high border border-severity-high/20' :
                    'bg-severity-low-muted text-severity-low border border-severity-low/20'
                  }`}>
                    {event.severity?.toUpperCase() || 'LOW'}
                  </span>
                </div>
                
                <p className="text-zinc-400 text-[11px] truncate">
                  {event.source_ip} <span className="text-zinc-600">→</span> {event.destination_ip || 'INTERNAL'}
                  {event.user ? ` [${event.user}]` : ''}
                </p>
                
                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                  <span className="truncate max-w-[150px]">{event.asset || 'unknown_endpoint'}</span>
                  <span className="text-zinc-600 flex items-center">
                    <Clock className="h-3 w-3 mr-0.5 shrink-0" />
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 text-zinc-500 font-mono text-xs">
          [NO TELEMETRY LOGGED IN FEED]
        </div>
      )}
    </div>
  );
};

type NodeType = 'server' | 'workstation' | 'database' | 'firewall' | 'router' | 'endpoint' | 'external' | 'auth';
type Node = {
  id: string;
  label: string;
  position: [number, number, number];
  type: NodeType;
  critical?: boolean;
  warning?: boolean;
};

const ThreatActivityViz = ({ events, incidents }: { events: any[]; incidents: any[] }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const sourceIPs = [...new Set(events.map((e: any) => e.source_ip).filter(Boolean))].slice(0, 4);
  const assets = [...new Set(incidents.flatMap((i: any) => i.affected_assets || []).filter(Boolean))].slice(0, 4);

  const centralNode: Node = { id: 'central_core', label: 'AEGIS-CORE', position: [0, 0, 0], type: 'router' };
  
  const sourceNodes: Node[] = sourceIPs.map((ip, idx) => ({
    id: `src-${ip}`,
    label: ip,
    position: [
      -4.0 - Math.sin(idx * 0.8) * 1.2,
      1.2 - (idx * 0.9),
      -0.8 + idx * 0.4
    ] as [number, number, number],
    type: 'external',
    critical: true
  }));

  const assetNodes: Node[] = assets.map((asset, idx) => ({
    id: `asset-${asset}`,
    label: `ASSET-${asset}`,
    position: [
      4.0 + Math.sin(idx * 0.8) * 1.2,
      1.2 - (idx * 0.9),
      -0.8 - idx * 0.4
    ] as [number, number, number],
    type: (idx % 2 === 0 ? 'database' : 'server') as NodeType,
    warning: true
  }));

  const nodes: Node[] = [centralNode, ...sourceNodes, ...assetNodes];

  const connections = [
    ...sourceNodes.map(sn => ({ from: sn.id, to: 'central_core' })),
    ...assetNodes.map(an => ({ from: 'central_core', to: an.id }))
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="relative h-64 bg-[#020508]/85 rounded border border-panel-border/40 overflow-hidden flex flex-col justify-end">
      {/* 3D WebGL Threat Graph */}
      <div className="absolute inset-0 z-0">
        <ThreatGraph
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId}
          onNodeSelect={setSelectedNodeId}
          threatsActive={incidents.length > 0}
        />
      </div>

      {/* Mini details HUD overlay */}
      {selectedNode && (
        <div className="absolute left-3 top-3 bg-[#03070b]/90 border border-panel-border/80 p-3 rounded shadow-2xl font-mono text-[9px] text-zinc-300 w-48 space-y-1.5 backdrop-blur-sm z-10 select-none">
          <div className="flex justify-between border-b border-panel-border/30 pb-1">
            <span className="text-zinc-500 uppercase">IP/ID</span>
            <span className="font-bold text-white truncate max-w-[100px]">{selectedNode.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">CLASS</span>
            <span className="text-cyber-blue font-bold uppercase">{selectedNode.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">STATUS</span>
            <span className={selectedNode.critical ? 'text-severity-critical font-bold' : selectedNode.warning ? 'text-severity-high font-bold' : 'text-severity-low font-bold'}>
              {selectedNode.critical ? 'COMPROMISED' : selectedNode.warning ? 'SUSPICIOUS' : 'SECURED'}
            </span>
          </div>
        </div>
      )}

      {/* Tactical overlay */}
      <div className="absolute right-3 bottom-3 pointer-events-none z-10 text-[8px] font-mono text-zinc-600 bg-[#03070b]/40 px-2 py-0.5 rounded">
        DRAG TO ORBIT / SCROLL TO ZOOM
      </div>
    </div>
  );
};

const IncidentPriorityPanel = ({ incidents }: { incidents: any[] }) => {
  const sortedIncidents = [...incidents].sort((a, b) =>
    (b.risk_score || 0) - (a.risk_score || 0)
  ).slice(0, 4);

  return (
    <div className="space-y-3 font-mono text-xs">
      {sortedIncidents.length > 0 ? (
        sortedIncidents.map((incident, index) => {
          const isCritical = incident.severity === 'critical';
          const isHigh = incident.severity === 'high';
          const indicatorColor = isCritical ? 'bg-severity-critical text-severity-critical' : isHigh ? 'bg-severity-high text-severity-high' : 'bg-severity-medium text-severity-medium';

          return (
            <div
              key={incident.id || index}
              onClick={() => window.location.href = `/incidents/${incident.id}`}
              className={`flex items-start space-x-3 p-3 bg-panel-header/35 border border-panel-border/30 hover:border-cyber-blue/30 rounded cursor-pointer transition-all duration-300 ${
                index === 0 ? 'border-l-2 border-l-severity-critical' : ''
              }`}
            >
              <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 font-bold ${
                isCritical ? 'bg-severity-critical/10 text-severity-critical' :
                isHigh ? 'bg-severity-high/10 text-severity-high' :
                'bg-severity-medium/10 text-severity-medium'
              }`}>
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-200 truncate pr-2">{incident.title || 'UNTITLED INCIDENT'}</h4>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isCritical ? 'bg-severity-critical/10 text-severity-critical' :
                    isHigh ? 'bg-severity-high/10 text-severity-high' :
                    'bg-severity-medium/10 text-severity-medium'
                  }`}>
                    {incident.severity?.toUpperCase() || 'LOW'}
                  </span>
                </div>
                
                <p className="text-zinc-400 text-[11px] truncate">
                  {incident.description || 'No case logs registered.'}
                </p>
                
                <div className="flex items-center space-x-4 text-[10px] text-zinc-500 pt-1">
                  <span>Risk Score: <span className={isCritical ? 'text-severity-critical font-bold' : 'text-zinc-300'}>{incident.risk_score}/100</span></span>
                  <span>Status: <span className="text-zinc-300">{incident.status}</span></span>
                  <span className="truncate">Time: <span className="text-zinc-400">{new Date(incident.reported_at || incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-8 text-zinc-500 font-mono">
          [NO ACTIVE INCIDENTS OPEN]
        </div>
      )}
    </div>
  );
};

const DetectionActivity = ({ detections }: { detections: any[] }) => {
  const detectionCounts: Record<string, number> = {};
  detections.forEach((d: any) => {
    const ruleName = d.rule_name || 'Unknown Rule';
    detectionCounts[ruleName] = (detectionCounts[ruleName] || 0) + 1;
  });

  const sortedDetections = Object.entries(detectionCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5);

  return (
    <div className="space-y-2.5 font-mono text-xs">
      {sortedDetections.length > 0 ? (
        sortedDetections.map(([ruleName, count], index) => (
          <div key={ruleName} className="flex items-center justify-between p-3 bg-panel-header/35 border border-panel-border/30 rounded hover:border-panel-border transition-colors">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-6 w-6 rounded bg-cyber-blue-muted border border-cyber-blue/15 text-cyber-blue flex items-center justify-center shrink-0">
                <Terminal className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-zinc-200 truncate pr-2">{ruleName}</span>
            </div>
            <span className="text-[10px] font-bold text-cyber-blue bg-cyber-blue-muted px-2 py-0.5 border border-cyber-blue/20 rounded">
              {count} HITS
            </span>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-zinc-500 font-mono">
          [NO DETECTION RUNS TRIGGERED]
        </div>
      )}
    </div>
  );
};

type HealthStatus = 'healthy' | 'unhealthy' | 'unknown' | 'degraded';

const SystemHealth = ({ health }: { health: Record<string, HealthStatus> }) => {
  return (
    <div className="space-y-2.5 font-mono text-xs">
      {Object.entries(health).map(([component, status]) => {
        const isHealthy = status === 'healthy';
        const isDegraded = status === 'degraded';
        const badgeColor = isHealthy ? 'text-severity-low bg-severity-low/10 border-severity-low/20' : isDegraded ? 'text-severity-high bg-severity-high/10 border-severity-high/20' : 'text-severity-critical bg-severity-critical/10 border-severity-critical/20';

        return (
          <div
            key={component}
            className={`flex items-center justify-between p-3 bg-panel-header/35 border border-panel-border/30 rounded`}
          >
            <div className="flex items-center space-x-3">
              <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 border ${
                isHealthy ? 'bg-severity-low/10 border-severity-low/25 text-severity-low' :
                isDegraded ? 'bg-severity-high/10 border-severity-high/25 text-severity-high' :
                'bg-severity-critical/10 border-severity-critical/25 text-severity-critical'
              }`}>
                {isHealthy ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              </div>
              <span className="font-bold text-zinc-200 uppercase tracking-tight">{component.replace(/([A-Z])/g, ' $1')}</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
              {status.toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function Dashboard() {
  const [threatLevel, setThreatLevel] = useState<string>('LOW');
  const [metrics, setMetrics] = useState<any>({
    eventsPerMinute: 0,
    activeIncidents: 0,
    criticalIncidents: 0,
    detectionCount: 0,
    avgRiskScore: 0,
    highRiskDetections: 0
  });
  const [events, setEvents] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [detections, setDetections] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>({
    api: 'unknown',
    database: 'unknown',
    detectionEngine: 'unknown',
    aiAnalyst: 'unknown',
    authentication: 'unknown'
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
  if (!authUtils.isAuthenticated()) {
    // Redirect to login page if not authenticated
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return;
  }

  try {
    setError(null);

    // Get authoritative dashboard metrics from the backend
    const dashboardResponse = await apiClient.get('/analytics/dashboard');
    const dashboard = dashboardResponse.data;

    // Fetch events for the telemetry panel
    const eventsResponse = await apiClient.get('/events/', {
      params: { skip: 0, limit: 1000 }
    });

    const allEvents = Array.isArray(eventsResponse.data)
      ? eventsResponse.data
      : [];

    // Sort newest events first
    const sortedEvents = [...allEvents].sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    );

    const latestEvents = sortedEvents.slice(0, 15);

    // Events per minute based on backend's 24-hour count
    const events24h = Number(dashboard.events_24h || 0);
    const eventsPerMinute =
      Math.round((events24h / (24 * 60)) * 10) / 10;

    // Fetch incidents
    const incidentsResponse = await apiClient.get('/incidents/', {
      params: { skip: 0, limit: 100 }
    });

    const allIncidents = Array.isArray(incidentsResponse.data)
      ? incidentsResponse.data
      : [];

    // Active incidents
    const activeIncidentObjects = allIncidents.filter(
      (incident: any) =>
        incident.status === 'NEW' ||
        incident.status === 'INVESTIGATING'
    );

    const activeIncidents = Number(dashboard.open_incidents || 0);

    // Critical incidents from backend analytics
    const criticalIncidents = Number(
      dashboard.critical_incidents || 0
    );

    // Average risk score
    const avgRiskScore =
      activeIncidentObjects.length > 0
        ? activeIncidentObjects.reduce(
            (sum: number, incident: any) =>
              sum + Number(incident.risk_score || 0),
            0
          ) / activeIncidentObjects.length
        : 0;

    // High-risk active incidents
    const highRiskDetections = activeIncidentObjects.filter(
      (incident: any) =>
        Number(incident.risk_score || 0) > 70
    ).length;

    // Determine threat level
    const highSeverityIncidents = activeIncidentObjects.filter(
      (incident: any) =>
        incident.severity?.toLowerCase() === 'high'
    ).length;

    let threatLevel = 'LOW';

    if (criticalIncidents > 0) {
      threatLevel = 'CRITICAL';
    } else if (highSeverityIncidents > 2) {
      threatLevel = 'HIGH';
    } else if (highSeverityIncidents > 0) {
      threatLevel = 'ELEVATED';
    } else if (activeIncidents > 3) {
      threatLevel = 'GUARDED';
    }

    // System health checks
    // IMPORTANT: Do not run the detection engine here.
    const healthChecks = await Promise.allSettled([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://aegis-soc-su9w.onrender.com'}/health`),
      apiClient.get('/assets/', {
        params: { skip: 0, limit: 1 }
      }),
      apiClient.get('/detection/health/', {
        params: { skip: 0, limit: 1 }
      })
    ]);

    const apiHealthy =
      healthChecks[0].status === 'fulfilled';

    const databaseHealthy =
      healthChecks[1].status === 'fulfilled';

    const detectionEngineHealthy =
      healthChecks[2].status === 'fulfilled';

    const systemHealth = {
      api: apiHealthy ? 'healthy' : 'unhealthy',
      database: databaseHealthy ? 'healthy' : 'unhealthy',
      detectionEngine: detectionEngineHealthy ? 'healthy' : 'unhealthy',
      aiAnalyst: 'unknown',
      authentication: authUtils.isAuthenticated()
        ? 'healthy'
        : 'unhealthy'
    };

    // Update dashboard state
    setEvents(latestEvents);
    setIncidents(allIncidents);

    // Detection engine is not executed during dashboard refresh
    setDetections([]);

    setThreatLevel(threatLevel);

    setMetrics({
      eventsPerMinute,
      activeIncidents,
      criticalIncidents,
      detectionCount: 0,
      avgRiskScore: Number(avgRiskScore.toFixed(1)),
      highRiskDetections
    });

    setSystemHealth(systemHealth);

  } catch (err: any) {
    console.error('Failed to fetch dashboard data:', err);

    if (err?.response?.status === 401) {
  setError('Authentication expired. Please log in again.');
} else {
  setError('Failed to load dashboard data');
}
  } finally {
    setLoading(false);
  }
};

  // Initial load and periodic updates
  useEffect(() => {
    const loadData = async () => {
      await fetchDashboardData();
    };

    loadData();

    // Update every 4 seconds for real-time operations look
    const interval = setInterval(async () => {
      await fetchDashboardData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading && events.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-[#03070b] flex flex-col items-center justify-center space-y-4">
        <Cpu className="h-10 w-10 text-cyber-blue animate-spin" />
        <p className="text-zinc-500 font-mono text-xs tracking-wider">BOOTING SEC-OPS OPERATIONS CENTER ENGINE...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#03070b] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 flex items-center justify-center bg-severity-critical/10 text-severity-critical border border-severity-critical/20 rounded">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-zinc-400 font-mono text-xs">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex h-10 items-center justify-center rounded bg-cyber-blue px-5 text-sm font-semibold text-[#03070b] hover:bg-primary-hover transition-colors"
        >
          RESTART OPERATIONS
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03070b] text-[#f3f4f6]">
      {/* TOP HEADER STATUS BAR */}
      <header className="border-b border-panel-border bg-panel-header/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span 
                className="text-white font-extrabold text-lg tracking-tight cursor-pointer"
                onClick={() => window.location.href = '/'}
              >
                AEGIS<span className="text-cyber-blue">SOC</span>
              </span>
              <span className="h-4 w-px bg-panel-border"></span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline-block">COMMAND WORKSTATION</span>
            </div>
            
            <div className="flex items-center space-x-6 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full animate-pulse ${
                  threatLevel === 'CRITICAL' ? 'bg-severity-critical' :
                  threatLevel === 'HIGH' ? 'bg-severity-high' :
                  threatLevel === 'ELEVATED' ? 'bg-severity-medium' :
                  threatLevel === 'GUARDED' ? 'bg-severity-medium' :
                  'bg-severity-low'
                }`} />
                <span className="text-zinc-400 text-[10px]">SOC STATUS: ONLINE</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-4 text-zinc-500">
                <span className="text-[10px]">ENV: {process.env.NODE_ENV === 'development' ? 'DEV' : 'PROD'}</span>
                <span className="text-[10px] text-zinc-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="relative cursor-pointer hover:text-white transition-colors" onClick={() => window.location.href = '/incidents'}>
                  <Bell className="h-4 w-4" />
                  {metrics.criticalIncidents > 0 && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-severity-critical animate-ping" />
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONSOLE PANEL */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* THREAT LEVEL BANNER */}
        <section>
          <ThreatLevelIndicator level={threatLevel} />
        </section>

        {/* THREE-COLUMN GRID CONSOLE */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: TELEMETRY & METRICS */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center">
                  <Activity className="h-4 w-4 text-cyber-blue mr-2" />
                  SECURITY METRICS
                </h3>
              </div>
              <SecurityMetrics metrics={metrics} />
            </Card>

            <Card className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center">
                  <Terminal className="h-4 w-4 text-cyber-blue mr-2" />
                  LIVE EVENT TELEMETRY
                </h3>
                <button 
                  onClick={fetchDashboardData}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
              <LiveEventStream events={events} />
            </Card>
          </div>

          {/* MIDDLE COLUMN: VISUALIZATION & PRIORITY QUEUE */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center">
                  <Network className="h-4 w-4 text-cyber-blue mr-2" />
                  THREAT CORRELATION MAP
                </h3>
              </div>
              <ThreatActivityViz events={events} incidents={incidents} />
            </Card>

            <Card className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center">
                  <ShieldAlert className="h-4 w-4 text-cyber-blue mr-2" />
                  INCIDENT PRIORITY QUEUE
                </h3>
                <span 
                  onClick={() => window.location.href = '/incidents'}
                  className="text-[10px] font-mono text-cyber-blue hover:underline cursor-pointer"
                >
                  QUEUE LIST →
                </span>
              </div>
              <IncidentPriorityPanel incidents={incidents} />
            </Card>
          </div>

          {/* RIGHT COLUMN: DETECTIONS & DIAGNOSTIC SYSTEM HEALTH */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center">
                  <Cpu className="h-4 w-4 text-cyber-blue mr-2" />
                  DETECTION SIGNALS
                </h3>
              </div>
              <DetectionActivity detections={detections} />
            </Card>

            <Card className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-panel-border mb-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center">
                  <Server className="h-4 w-4 text-cyber-blue mr-2" />
                  DIAGNOSTIC HEALTH
                </h3>
              </div>
              <SystemHealth health={systemHealth} />
            </Card>
          </div>

        </section>
      </main>
    </div>
  );
}