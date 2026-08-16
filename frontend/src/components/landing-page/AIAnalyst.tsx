export default function AIAnalyst() {
  const investigationSteps = [
    { id: 1, title: 'Correlating Events', description: 'Analyzing 2,487 related security events', status: 'complete' },
    { id: 2, title: 'Checking Asset Criticality', description: 'Assessing impact on critical infrastructure', status: 'complete' },
    { id: 3, title: 'Temporal Analysis', description: 'Building attack timeline and sequencing', status: 'complete' },
    { id: 4, title: 'Threat Intelligence Lookup', description: 'Checking indicators against global feeds', status: 'complete' },
    { id: 5, title: 'MITRE ATT&CK Mapping', description: 'Mapping observed tactics to framework', status: 'complete' },
    { id: 6, title: 'Risk Calculation', description: 'Computing probability and impact scores', status: 'in-progress' },
    { id: 7, title: 'Generating Recommendations', description: 'Creating prioritized action plan', status: 'pending' },
  ];

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
                  <p className="text-2xl font-bold text-red-500">94/100</p>
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-400">Severity:</p>
                  <p className="text-2xl font-bold text-red-500">CRITICAL</p>
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-400">Likely Technique:</p>
                  <p className="text-xl font-semibold text-blue-400">T1110 - Brute Force</p>
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-400">Confidence:</p>
                  <p className="text-2xl font-bold text-blue-400">91%</p>
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
      </div>
    </section>
  );
}