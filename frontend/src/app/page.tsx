'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  ShieldAlert, 
  Terminal, 
  Cpu, 
  Activity, 
  Server, 
  Network, 
  ArrowRight,
  MousePointerClick,
  Sliders
} from 'lucide-react';

// Hydration safe dynamic import for R3F Canvas components
const ThreatGraph = dynamic(() => import('@/components/3d/ThreatGraph'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#03070b] flex flex-col items-center justify-center space-y-3 z-0">
      <Activity className="h-7 w-7 text-cyber-blue animate-pulse" />
      <span className="text-[10px] font-mono text-zinc-500 tracking-wider">CORRELATING SPACE NODES...</span>
    </div>
  )
});

type Section = {
  badge: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  btnLabel?: string;
  btnAction?: () => void;
  floatingText?: string[];
};

export default function Home() {
  const [activeSection, setActiveSection] = useState<number>(0);
  const [isClient, setIsClient] = useState<boolean>(false);
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const height = window.innerHeight;
      // Calculate which section occupies the viewport midpoint
      const activeIdx = Math.min(
        Math.max(Math.floor((scrollPos + height / 2.2) / height), 0),
        6
      );
      setActiveSection(activeIdx);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections: Section[] = [
    {
      badge: '01 / CORE TOPOLOGY',
      title: 'AegisSOC Security Operating System',
      desc: 'An autonomous threat detection, investigation, and response console. Telemetry inputs map to spatial models of your enterprise architecture.',
      icon: <Network className="h-4 w-4" />,
      btnLabel: 'Deploy Workstation',
      btnAction: () => window.location.href = '/dashboard'
    },
    {
      badge: '02 / TELEMETRY INGEST',
      title: 'Real-Time Telemetry Intake',
      desc: 'Ingesting and parsing authentication logs, network headers, and asset records. System events are correlated as active data paths.',
      icon: <Terminal className="h-4 w-4" />,
      floatingText: [
        'INBOUND: syslog_d_504 -> 10.0.1.18',
        'AUTH: 185.141.63.120 [failed_attempts: 14]',
        'DECRYPT: ssl_handshake -> active_ingress_2'
      ]
    },
    {
      badge: '03 / DETECTION PIPELINE',
      title: 'Deterministic Rules Correlation',
      desc: 'Evaluating behavior signatures to locate anomalous activity loops. Compiling ingress events into unified threat markers.',
      icon: <Sliders className="h-4 w-4" />,
      floatingText: [
        'RULE MATCH: brute_force_credential_stuffing',
        'SEVERITY: elevated -> high',
        'CONFIDENCE: 84% [confidence_threshold: pass]'
      ]
    },
    {
      badge: '04 / TACTICAL TTP MAPPING',
      title: 'MITRE ATT&CK Matrix Alignment',
      desc: 'Mapping compromised pathways against tactical methodologies to reveal actor intent, cataloging credentials abuse, lateral movement, and privilege escalation.',
      icon: <Server className="h-4 w-4" />,
      floatingText: [
        'TACTIC: credential_access',
        'TECHNIQUE: T1110 -> Brute Force',
        'IMPACT: workstation_auth_compromise'
      ]
    },
    {
      badge: '05 / INCIDENT CORRELATION',
      title: 'Risk Evaluation & Escalation',
      desc: 'Aggregating active detections and asset impact factors. Critical server breaches trigger immediate threat pulse warnings.',
      icon: <ShieldAlert className="h-4 w-4" />,
      floatingText: [
        'INCIDENT ESCALATION: Case #SEC-419',
        'TARGET: DB-PROD-01 [critical_asset: yes]',
        'RISK SCORE: 98/100 [critical_threshold_exceeded]'
      ]
    },
    {
      badge: '06 / AI ANALYST CORE',
      title: 'Autonomous Investigation Core',
      desc: 'LLM agents correlate timelines and map assets into structured findings: Observed signals, Inferred vectors, and Recommended response playbooks.',
      icon: <Cpu className="h-4 w-4" />,
      floatingText: [
        'AI CONSOLE: correlation sweep active',
        'OBSERVED: 347 failed auth logs from external IP',
        'RECOMMENDED: revoke session token, rotate credentials'
      ]
    },
    {
      badge: '07 / SEC-OPS WORKSTATION',
      title: 'Launch Operational Workstation',
      desc: 'Command your security perimeter. Access the high-density console logs, threat topology grids, and autonomous mitigation controllers.',
      icon: <Activity className="h-4 w-4" />,
      btnLabel: 'Launch Console Workstation',
      btnAction: () => window.location.href = '/dashboard'
    }
  ];

  return (
    <div className="relative bg-[#03070b] min-h-screen text-white overflow-x-hidden select-none">
      
      {/* FIXED 3D WEBGL GRAPH ENVIRONMENT */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        {isClient && (
          <ThreatGraph 
            activeSection={activeSection} 
            isLandingPage={true} 
            threatsActive={activeSection >= 2} 
          />
        )}
      </div>

      {/* GRADIENT PANEL OVERLAYS */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-gradient-to-r from-[#03070b]/60 via-transparent to-transparent"></div>
      <div className="fixed inset-0 pointer-events-none z-10 bg-gradient-to-b from-[#03070b]/40 via-transparent to-[#03070b]/40"></div>

      {/* PIPELINE PROGRESS BAR (LEFT SIDE) */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col space-y-6 z-40 font-mono text-[10px]">
        {sections.map((sec, idx) => {
          const isActive = idx === activeSection;
          return (
            <div 
              key={idx} 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: idx * window.innerHeight, behavior: 'smooth' })}
            >
              <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                isActive ? 'bg-cyber-blue scale-150 shadow-[0_0_8px_#00e5ff]' : 'bg-zinc-700 group-hover:bg-zinc-400'
              }`} />
              <span className={`transition-all duration-300 ${
                isActive ? 'text-cyber-blue font-bold tracking-wider' : 'text-zinc-500 group-hover:text-zinc-300'
              }`}>
                {sec.badge.split(' / ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-[#03070b]/90 to-transparent backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white font-extrabold text-lg tracking-tight">AEGIS<span className="text-cyber-blue">SOC</span></span>
            <span className="h-3 w-px bg-panel-border"></span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">AUTONOMOUS CYBER OPS</span>
          </div>
          <div>
            <a 
              href="/dashboard"
              className="flex h-8 items-center justify-center rounded bg-cyber-blue px-4 text-[11px] font-mono font-bold text-[#03070b] hover:bg-primary-hover shadow-lg shadow-cyber-blue/15 hover:shadow-cyber-blue/25 transition-all duration-300"
            >
              Access Console
            </a>
          </div>
        </div>
      </header>

      {/* SCROLL-SENTINEL HTML INTERFACE */}
      <div ref={scrollContainer} className="relative z-20 min-h-screen">
        {sections.map((sec, idx) => {
          const isActive = idx === activeSection;
          return (
            <section 
              key={idx} 
              className="min-h-screen flex items-center justify-start max-w-7xl mx-auto px-6 md:px-24"
            >
              <div className="max-w-md w-full grid grid-cols-1 gap-6">
                
                {/* Visual Glass Content Box */}
                <div className={`bg-[#03070b]/75 border border-panel-border/40 p-6 rounded-lg shadow-2xl backdrop-blur-md space-y-4 transition-all duration-700 ${
                  isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-panel-border/30">
                    <span className="text-[9px] font-mono tracking-widest text-cyber-blue uppercase bg-cyber-blue-muted px-2 py-0.5 border border-cyber-blue/15 rounded">
                      {sec.badge}
                    </span>
                    <div className="text-cyber-blue opacity-85">
                      {sec.icon}
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-white tracking-tight">{sec.title}</h2>
                  <p className="text-zinc-400 text-xs leading-relaxed">{sec.desc}</p>

                  {sec.btnLabel && sec.btnAction && (
                    <button
                      onClick={sec.btnAction}
                      className="w-full flex h-10 items-center justify-center space-x-2 rounded bg-cyber-blue hover:bg-primary-hover text-xs font-mono font-bold text-[#03070b] transition-all duration-300 cursor-pointer shadow-lg shadow-cyber-blue/15"
                    >
                      <span>{sec.btnLabel}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Floating console telemetries */}
                {sec.floatingText && sec.floatingText.length > 0 && (
                  <div className={`space-y-1.5 font-mono text-[9px] text-zinc-500 pl-4 border-l border-panel-border/30 transition-all duration-700 delay-200 ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
                  }`}>
                    {sec.floatingText.map((txt, textIdx) => (
                      <p key={textIdx} className="flex items-center space-x-1.5">
                        <span className="text-cyber-blue shrink-0">▸</span>
                        <span className="truncate">{txt}</span>
                      </p>
                    ))}
                  </div>
                )}

              </div>
            </section>
          );
        })}
      </div>

      {/* FOOTER MOUSE DRAG SCROLL INVITATION */}
      {activeSection < 6 && (
        <div className="fixed bottom-6 right-6 z-40 hidden md:flex items-center space-x-2.5 font-mono text-[9px] text-zinc-500 bg-[#03070b]/60 border border-panel-border/30 px-3 py-1.5 rounded backdrop-blur-sm animate-pulse">
          <MousePointerClick className="h-3 w-3 text-cyber-blue" />
          <span>SCROLL DOWN TO TRACE CORRELATION</span>
        </div>
      )}

    </div>
  );
}