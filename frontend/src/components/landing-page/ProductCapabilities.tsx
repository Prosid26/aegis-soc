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

  return (
    <section className="relative z-10 pt-20 pb-24 bg-zinc-950">
      <div className="relative">
        <div className="absolute inset-0 -z-10">
          <div className="relative h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900"></div>
            <svg className="absolute inset-0 -z-10" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="noise" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect width="100" height="100" fill="url(#image)" />
                </pattern>
                <image id="image" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZyBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IiAwLjA1Ij48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iMiIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSI+PC9yZWN0PjxyZWN0IHg9IjQiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvcmVjdD48cmVzdCB4PSI2IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iOCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSI+PC9yZWN0PjxyZWN0IHg9IjEwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iMTIiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvcmVzdD48cmVzdCB4PSIxNCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSI+PC9yZWN0PjxyZWN0IHg9IjE2IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iMTgiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvcmVzdD48cmVzdCB4PSIyMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSI+PC9yZWN0PjxyZWN0IHg9IjIyIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iMjQiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvcmVzdD48cmVzdCB4PSIyNiIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSI+PC9yZWN0PjxyZWN0IHg9IjI4IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iMzAiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvcmVzdD48cmVzdCB4PSIzMiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iMzQiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvcmVzdD48cmVzdCB4PSIzNiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iMzgiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvcmVzdD48cmVzdCB4PSI0MCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSI+PC9yZWN0PjxyZWN0IHg9IjQyIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iNDQiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvcmVzdD48cmVzdCB4PSI0NiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iNDgiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvcmVzdD48cmVzdCB4PSI1MCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSI+PC9yZWN0PjxyZWN0IHg9IjUyIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iNTQiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvcmVzdD48cmVzdCB4PSI1NiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3JlY3Q+PHJlY3QgeD0iNTgiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvcmVzdD48cmVzdCB4PSI2MCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSI+PC9yZWN0Pg==" />
              </defs>
              <rect width="100" height="100" fill="url(#noise)" />
            </svg>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Product Capabilities</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap, index) => (
              <div key={index} className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 p-6 hover:border-zinc-700/70 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary mb-4">
                  {/* Using Lucide icons - we'll map the icon name to the actual component */}
                  <span className="text-xl">{getIcon(cap.icon)}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{cap.title}</h3>
                <p className="text-zinc-300 mb-4">{cap.description}</p>
                <ul className="space-y-2 text-zinc-400 text-sm">
                  {cap.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="flex h-3 w-3 items-center justify-center rounded-sm bg-primary/20 text-primary shrink-0">
                        +
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper function to return icon text (in a real app, we'd use Lucide icons)
function getIcon(iconName: string): string {
  const iconMap: Record<string, string> = {
    Zap: '⚡',
    Brain: '🧠',
    Shield: '🛡️',
    Headset: '🎧',
    Map: '🗺️',
    BarChart3: '📊'
  };
  return iconMap[iconName] || '•';
}