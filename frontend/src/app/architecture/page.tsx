'use client';

import { Shield, Server, Database, Network, Cpu, ArrowRight, Activity, Terminal } from 'lucide-react';

export default function Architecture() {
  return (
    <div className="min-h-screen bg-[#03070b] text-[#f3f4f6]">
      {/* HEADER BAR */}
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
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">SYSTEM ARCHITECTURE</span>
            </div>
            <div>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex h-9 items-center justify-center rounded border border-panel-border bg-panel px-4 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Launch Console
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <section className="space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-2 text-[10px] font-mono tracking-widest text-cyber-blue uppercase bg-cyber-blue-muted px-2.5 py-1 border border-cyber-blue/20 rounded">
              SYSTEM SCHEMATICS
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight md:text-4xl">High-Level Infrastructure</h2>
          </div>
          <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
            AegisSOC implements a normalized threat processing pipeline. Telemetry signals from heterogeneous agent arrays are parsed, correlated under a deterministic rules engine, and enriched using autonomous LLM analysts.
          </p>

          <div className="grid gap-6 md:grid-cols-2 pt-4">
            <div className="bg-panel border border-panel-border rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-panel-border/30">
                <Cpu className="h-5 w-5 text-cyber-blue" />
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Core Operations Layers</h3>
              </div>
              <ul className="space-y-3 text-xs font-mono text-zinc-400">
                <li className="flex items-center space-x-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-blue shrink-0"></span>
                  <span>Normalized Event Ingestion Gateways</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-blue shrink-0"></span>
                  <span>Deterministic Correlation Engine</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-blue shrink-0"></span>
                  <span>Autonomous AI Agent Incident Copilot</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-blue shrink-0"></span>
                  <span>Incident Queue State Controller</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-blue shrink-0"></span>
                  <span>Threat Intelligence Feed Aggregator</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-blue shrink-0"></span>
                  <span>MITRE ATT&CK Matrix Mapping Model</span>
                </li>
              </ul>
            </div>

            <div className="bg-panel border border-panel-border rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-panel-border/30">
                <Terminal className="h-5 w-5 text-cyber-blue" />
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Technology Stack</h3>
              </div>
              <ul className="space-y-3 text-xs font-mono text-zinc-400">
                <li className="flex items-center space-x-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-blue shrink-0"></span>
                  <span>Frontend: Next.js 16 (Turbopack), React 19, Tailwind CSS v4</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-blue shrink-0"></span>
                  <span>Backend: Python 3.11, FastAPI REST API Controller</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-blue shrink-0"></span>
                  <span>Database: SQLite Relational Database Engine</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-blue shrink-0"></span>
                  <span>AI: Dynamic Prompt-Chain Investigation Engine</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-blue shrink-0"></span>
                  <span>Containerization: Docker / Docker-Compose Configs</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center space-x-2 text-[10px] font-mono tracking-widest text-cyber-blue uppercase bg-cyber-blue-muted px-2.5 py-1 border border-cyber-blue/20 rounded">
              SIGNAL PATHWAYS
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Data Processing Lifecycle</h2>
          </div>
          
          <div className="bg-panel border border-panel-border rounded-lg p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 border-l border-panel-border pl-4 py-1">
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="h-5 w-5 bg-cyber-blue-muted border border-cyber-blue/25 text-cyber-blue rounded-full flex items-center justify-center font-mono text-[10px] font-bold">1</div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase">Telemetry Ingest</h4>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                  Raw telemetry events are ingested from firewall ports, gateway syslog, auth databases, and system agents.
                </p>
              </div>

              <div className="space-y-2 border-l border-panel-border pl-4 py-1">
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="h-5 w-5 bg-cyber-blue-muted border border-cyber-blue/25 text-cyber-blue rounded-full flex items-center justify-center font-mono text-[10px] font-bold">2</div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase">Normalization & DB Write</h4>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                  Events are parsed into standardized JSON schemas, correlated with assets, and written to the SQLite datastore.
                </p>
              </div>

              <div className="space-y-2 border-l border-panel-border pl-4 py-1">
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="h-5 w-5 bg-cyber-blue-muted border border-cyber-blue/25 text-cyber-blue rounded-full flex items-center justify-center font-mono text-[10px] font-bold">3</div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase">Detection & AI Co-Pilot</h4>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                  The rule engine runs correlation passes, scoring risk and mapping tactics. The AI agent analyzes the alert timeline.
                </p>
              </div>

              <div className="space-y-2 border-l border-panel-border pl-4 py-1">
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="h-5 w-5 bg-cyber-blue-muted border border-cyber-blue/25 text-cyber-blue rounded-full flex items-center justify-center font-mono text-[10px] font-bold">4</div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase">Analyst Escalation</h4>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                  Correlated incidents are escalated to the SOC command board, enabling investigation and containment playbooks.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}