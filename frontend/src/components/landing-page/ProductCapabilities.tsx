'use client';

import { Zap, Brain, Shield, Headset, Map, BarChart3 } from 'lucide-react';

export default function ProductCapabilities() {
  const capabilities = [
    {
      title: 'Real-Time Detection',
      description: 'Detect threats as they happen with advanced correlation and behavioral analytics.',
      icon: 'Zap',
      features: [
        'Sub-second event processing',
        'Machine learning anomaly detection',
        '200+ built-in detection rules',
        'Custom rule engine'
      ]
    },
    {
      title: 'AI Investigation',
      description: 'Autonomous AI analyst that investigates incidents and provides actionable insights.',
      icon: 'Brain',
      features: [
        'Automated root cause analysis',
        'MITRE ATT&CK mapping',
        'Threat intelligence enrichment',
        'Risk scoring and prioritization'
      ]
    },
    {
      title: 'Threat Intelligence',
      description: 'Global threat intelligence feeds with real-time IOC matching and enrichment.',
      icon: 'Shield',
      features: [
        '100+ threat feeds',
        'Real-time IOC blocking',
        'Attack surface monitoring',
        'Vulnerability correlation'
      ]
    },
    {
      title: 'Incident Response',
      description: 'Streamlined incident response with playbooks, automation, and collaboration tools.',
      icon: 'Headset',
      features: [
        'Automated playbooks',
        'Evidence collection',
        'Response automation',
        'Post-incident reporting'
      ]
    },
    {
      title: 'Attack Visualization',
      description: 'Visualize attack chains and understand the full scope of security incidents.',
      icon: 'Map',
      features: [
        'Attack path visualization',
        'Timeline reconstruction',
        'Asset relationship mapping',
        'Geospatial threat mapping'
      ]
    },
    {
      title: 'Security Analytics',
      description: 'Comprehensive analytics and reporting for security operations and compliance.',
      icon: 'BarChart3',
      features: [
        'Customizable dashboards',
        'Compliance reporting',
        'Trend analysis',
        'Executive reporting'
      ]
    }
  ];

  const getIconComponent = (iconName: string) => {
    const iconProps = { className: "h-5 w-5 text-cyber-blue shrink-0" };
    switch (iconName) {
      case 'Zap': return <Zap {...iconProps} />;
      case 'Brain': return <Brain {...iconProps} />;
      case 'Shield': return <Shield {...iconProps} />;
      case 'Headset': return <Headset {...iconProps} />;
      case 'Map': return <Map {...iconProps} />;
      case 'BarChart3': return <BarChart3 {...iconProps} />;
      default: return <Shield {...iconProps} />;
    }
  };

  return (
    <section className="relative z-10 pt-20 pb-24 bg-[#03070b] border-b border-panel-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 space-y-3">
          <span className="inline-flex items-center space-x-2 text-[10px] font-mono tracking-widest text-cyber-blue uppercase bg-cyber-blue-muted px-2.5 py-1 border border-cyber-blue/20 rounded">
            CORE PLATFORM
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight md:text-4xl">
            Designed for Modern Security Operations
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
            AegisSOC combines real-time SIEM, automated playbook response, and AI-driven mapping into a singular command workspace.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap, index) => (
            <div 
              key={index} 
              className="bg-panel border border-panel-border p-6 rounded-lg transition-all duration-300 hover:border-cyber-blue/25 hover:cyber-glow-blue flex flex-col justify-between"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded bg-cyber-blue-muted border border-cyber-blue/20 mb-5">
                  {getIconComponent(cap.icon)}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{cap.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed mb-6">{cap.description}</p>
              </div>
              
              <ul className="space-y-2 border-t border-panel-border/30 pt-4 text-xs font-mono text-zinc-500">
                {cap.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="h-1 w-1 bg-cyber-blue rounded-full shrink-0"></span>
                    <span className="text-zinc-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}