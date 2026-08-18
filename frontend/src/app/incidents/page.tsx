'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/api';
import { 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  Activity, 
  Clock, 
  SlidersHorizontal,
  ChevronRight,
  Database
} from 'lucide-react';

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
  mitre_techniques?: Array<{ name: string }>;
  affected_assets?: number[];
  timeline?: Array<any>;
  raw_data?: any;
  reported_at: string;
  updated_at: string;
  resolved_at?: string;
};

type FilterState = {
  search: string;
  severity: 'all' | 'low' | 'medium' | 'high' | 'critical';
  status: 'all' | 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
  sort: 'risk_score_desc' | 'risk_score_asc' | 'reported_at_desc' | 'reported_at_asc';
};

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    severity: 'all',
    status: 'all',
    sort: 'risk_score_desc',
  });

  // Fetch incidents with severity and status filters
  const fetchIncidents = useCallback(async () => {
    if (!authUtils.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const params: any = {};
      if (filters.severity !== 'all') {
        params.severity = filters.severity;
      }
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      const response = await apiClient.get('/incidents/', { params });
      setIncidents(response.data);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setError('Failed to load incidents log');
    } finally {
      setLoading(false);
    }
  }, [filters.severity, filters.status]);

  // Initial load and periodic updates
  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  // Apply search and sort to the incidents list
  const filteredAndSortedIncidents = useCallback(() => {
    let result = [...incidents];

    // Apply search (case-insensitive on title and incident_id)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        (inc) =>
          inc.title?.toLowerCase().includes(searchTerm) ||
          inc.incident_id?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sort
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'risk_score_desc':
          return (b.risk_score || 0) - (a.risk_score || 0);
        case 'risk_score_asc':
          return (a.risk_score || 0) - (b.risk_score || 0);
        case 'reported_at_desc':
          return new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime();
        case 'reported_at_asc':
          return new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [incidents, filters.search, filters.sort]);

  // Determine operational status based on incidents
  const operationalStatus = useCallback(() => {
    if (incidents.length === 0) return 'Operations Normal';
    const criticalCount = incidents.filter(
      (inc) => inc.severity === 'critical'
    ).length;
    if (criticalCount > 0) return `${criticalCount} Critical Threat${criticalCount > 1 ? 's' : ''}`;
    const highCount = incidents.filter((inc) => inc.severity === 'high').length;
    if (highCount > 0) return `${highCount} High Alert${highCount > 1 ? 's' : ''}`;
    return 'Telemetry Stable';
  }, [incidents]);

  if (loading && incidents.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-[#03070b] flex flex-col items-center justify-center space-y-4">
        <Activity className="h-8 w-8 text-cyber-blue animate-pulse" />
        <p className="text-zinc-500 font-mono text-xs tracking-wider">PULLING INCIDENT INTELLIGENCE QUEUE...</p>
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
          onClick={fetchIncidents}
          className="flex h-10 items-center justify-center rounded bg-cyber-blue px-5 text-sm font-semibold text-[#03070b] hover:bg-primary-hover transition-colors"
        >
          RECONNECT QUEUE
        </button>
      </div>
    );
  }

  const displayIncidents = filteredAndSortedIncidents();

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
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">INCIDENT ANALYSIS RECORD</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="h-2 w-2 rounded-full bg-cyber-blue animate-pulse" />
                <span className="text-zinc-400 text-[10px]">{operationalStatus().toUpperCase()}</span>
              </div>
              <button
                onClick={fetchIncidents}
                className="flex items-center justify-center h-8 w-8 rounded bg-panel border border-panel-border text-zinc-400 hover:text-white transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* CRITICAL METRICS SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-panel border border-panel-border p-4 rounded">
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Intake Count</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">{incidents.length}</p>
          </div>
          <div className="bg-panel border border-panel-border p-4 rounded">
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Unresolved Critical</p>
            <p className="text-2xl font-bold font-mono text-severity-critical mt-1">
              {incidents.filter(i => i.severity === 'critical' && i.status !== 'RESOLVED').length}
            </p>
          </div>
          <div className="bg-panel border border-panel-border p-4 rounded">
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Under Investigation</p>
            <p className="text-2xl font-bold font-mono text-severity-high mt-1">
              {incidents.filter(i => i.status === 'INVESTIGATING').length}
            </p>
          </div>
          <div className="bg-panel border border-panel-border p-4 rounded">
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Resolution Rate</p>
            <p className="text-2xl font-bold font-mono text-severity-low mt-1">
              {incidents.length > 0 ? `${Math.round((incidents.filter(i => i.status === 'RESOLVED').length / incidents.length) * 100)}%` : '100%'}
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="bg-panel border border-panel-border rounded p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-auto flex-1 flex flex-col sm:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search by IP, ID or Title..."
                className="w-full bg-[#020508] border border-panel-border rounded py-2 pl-9 pr-4 text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-cyber-blue/50 transition-colors"
              />
            </div>

            {/* Severity Filter */}
            <div className="min-w-[140px]">
              <select
                value={filters.severity}
                onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value as FilterState['severity'] }))}
                className="w-full bg-[#020508] border border-panel-border rounded py-2 px-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyber-blue/50 transition-colors"
              >
                <option value="all">SEVERITY: ALL</option>
                <option value="critical">CRITICAL</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="min-w-[140px]">
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as FilterState['status'] }))}
                className="w-full bg-[#020508] border border-panel-border rounded py-2 px-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyber-blue/50 transition-colors"
              >
                <option value="all">STATUS: ALL</option>
                <option value="NEW">NEW</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="CONTAINED">CONTAINED</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="w-full md:w-auto min-w-[200px] flex items-center space-x-2">
            <SlidersHorizontal className="h-4 w-4 text-zinc-500 shrink-0" />
            <select
              value={filters.sort}
              onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value as FilterState['sort'] }))}
              className="w-full bg-[#020508] border border-panel-border rounded py-2 px-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyber-blue/50 transition-colors"
            >
              <option value="risk_score_desc">SORT: RISK (MAX → MIN)</option>
              <option value="risk_score_asc">SORT: RISK (MIN → MAX)</option>
              <option value="reported_at_desc">SORT: TIME (NEW → OLD)</option>
              <option value="reported_at_asc">SORT: TIME (OLD → NEW)</option>
            </select>
          </div>
        </div>

        {/* INCIDENT TABLE QUEUE */}
        <div className="bg-panel border border-panel-border rounded overflow-x-auto shadow-2xl">
          {displayIncidents.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-panel-header border-b border-panel-border/60">
                  <th className="py-3 px-4 text-[9px] font-mono uppercase tracking-widest text-zinc-500 w-[110px]">CASE ID</th>
                  <th className="py-3 px-4 text-[9px] font-mono uppercase tracking-widest text-zinc-500 w-[100px]">SEVERITY</th>
                  <th className="py-3 px-4 text-[9px] font-mono uppercase tracking-widest text-zinc-500">INCIDENT CONTEXT</th>
                  <th className="py-3 px-4 text-[9px] font-mono uppercase tracking-widest text-zinc-500 w-[90px] text-center">RISK</th>
                  <th className="py-3 px-4 text-[9px] font-mono uppercase tracking-widest text-zinc-500 w-[90px] text-center">CONF</th>
                  <th className="py-3 px-4 text-[9px] font-mono uppercase tracking-widest text-zinc-500 w-[130px]">STATUS</th>
                  <th className="py-3 px-4 text-[9px] font-mono uppercase tracking-widest text-zinc-500 w-[130px] hidden md:table-cell">MITRE TYPE</th>
                  <th className="py-3 px-4 text-[9px] font-mono uppercase tracking-widest text-zinc-500 w-[110px] text-right">REPORTED</th>
                  <th className="py-3 px-2 w-[40px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-border/30">
                {displayIncidents.map((incident) => {
                  const isCritical = incident.severity === 'critical';
                  const isHigh = incident.severity === 'high';
                  const isMedium = incident.severity === 'medium';

                  const severityColor = 
                    isCritical ? 'text-severity-critical bg-severity-critical/10 border-severity-critical/20' : 
                    isHigh ? 'text-severity-high bg-severity-high/10 border-severity-high/20' : 
                    isMedium ? 'text-severity-medium bg-severity-medium/10 border-severity-medium/20' : 
                    'text-severity-low bg-severity-low/10 border-severity-low/20';

                  const statusColor = 
                    incident.status === 'RESOLVED' ? 'text-severity-low bg-severity-low/5 border-severity-low/15' : 
                    incident.status === 'CONTAINED' ? 'text-cyber-blue bg-cyber-blue-muted border-cyber-blue/15' :
                    incident.status === 'INVESTIGATING' ? 'text-severity-high bg-severity-high-muted border-severity-high/15' :
                    'text-zinc-400 bg-zinc-800/30 border-zinc-700/20';

                  const mitreTechnique = incident.mitre_techniques?.[0]?.name;

                  return (
                    <tr
                      key={incident.id}
                      onClick={() => window.location.href = `/incidents/${incident.id}`}
                      className={`hover:bg-[#060c12]/60 hover:border-l-[3px] hover:border-l-cyber-blue transition-all duration-300 cursor-pointer group ${
                        isCritical ? 'border-l-[3px] border-l-severity-critical bg-severity-critical-muted/5' : 'border-l-[3px] border-l-transparent'
                      }`}
                    >
                      {/* Case ID */}
                      <td className="py-4 px-4 font-mono text-[11px] text-zinc-400 group-hover:text-cyber-blue transition-colors">
                        SEC-{incident.incident_id || incident.id}
                      </td>

                      {/* Severity Pill */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${severityColor}`}>
                          {incident.severity || 'low'}
                        </span>
                      </td>

                      {/* Incident Context (Title & description) */}
                      <td className="py-4 px-4 min-w-0">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            {isCritical && (
                              <span className="w-1.5 h-1.5 rounded-full bg-severity-critical animate-ping shrink-0" />
                            )}
                            <p className="font-bold text-white text-xs tracking-tight group-hover:text-cyber-blue transition-colors">
                              {incident.title}
                            </p>
                          </div>
                          {incident.description && (
                            <p className="text-zinc-500 text-[11px] line-clamp-1 max-w-[320px] lg:max-w-[450px]">
                              {incident.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-4 px-4 font-mono text-xs text-center font-bold">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-12 h-1 bg-[#020508] border border-panel-border/30 rounded-full overflow-hidden hidden sm:block shrink-0">
                            <div 
                              className={`h-full ${
                                isCritical ? 'bg-severity-critical' : isHigh ? 'bg-severity-high' : 'bg-cyber-blue'
                              }`}
                              style={{ width: `${incident.risk_score ?? 0}%` }}
                            />
                          </div>
                          <span className={isCritical ? 'text-severity-critical' : isHigh ? 'text-severity-high' : 'text-zinc-300'}>
                            {incident.risk_score ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Confidence */}
                      <td className="py-4 px-4 font-mono text-xs text-center text-cyber-blue font-bold">
                        {incident.confidence ?? 0}%
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${statusColor}`}>
                          {incident.status || 'UNKNOWN'}
                        </span>
                      </td>

                      {/* MITRE Technique */}
                      <td className="py-4 px-4 hidden md:table-cell font-mono text-[10px] text-zinc-500">
                        {mitreTechnique ? (
                          <span className="px-2 py-0.5 rounded bg-cyber-blue-muted border border-cyber-blue/15 text-cyber-blue text-[9px]">
                            {mitreTechnique.split(' — ')[0]}
                          </span>
                        ) : (
                          <span className="text-zinc-700">N/A</span>
                        )}
                      </td>

                      {/* Reported Time */}
                      <td className="py-4 px-4 font-mono text-[10px] text-zinc-400 text-right whitespace-nowrap">
                        {new Date(incident.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>

                      {/* Arrow */}
                      <td className="py-4 px-2 text-zinc-600 group-hover:text-white transition-colors">
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 space-y-3 font-mono">
              <Database className="h-8 w-8 text-zinc-600 mx-auto" />
              <p className="text-zinc-500 text-xs">[NO CORRELATED INCIDENTS IN QUEUE]</p>
              <p className="text-zinc-600 text-[10px]">Adjust search query or operations filter criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}