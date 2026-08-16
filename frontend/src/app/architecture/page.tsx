export default function Architecture() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span className="text-primary">AegisSOC Architecture</span>
            System Overview
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">High-Level Architecture</h2>
          <p className="text-zinc-300 mb-8">
            AegisSOC follows a modular, microservices-based architecture designed for scalability,
            resilience, and real-time threat detection and response.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/30 p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Core Components</h3>
              <ul className="space-y-2 text-zinc-400">
                <li>• Event Ingestion Layer</li>
                <li>• Detection Engine</li>
                <li>• AI Security Analyst</li>
                <li>• Incident Management System</li>
                <li>• Threat Intelligence Integration</li>
                <li>• MITRE ATT&CK Mapper</li>
                <li>• Risk Scoring Engine</li>
                <li>• Dashboard & Visualization</li>
              </ul>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/30 p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Technology Stack</h3>
              <ul className="space-y-2 text-zinc-400">
                <li>• Frontend: Next.js 14, React, TypeScript, Tailwind CSS</li>
                <li>• Backend: Python 3.11, FastAPI, SQLAlchemy</li>
                <li>• Database: PostgreSQL with Redis caching</li>
                <li>• Messaging: Apache Kafka for event streaming</li>
                <li>• Infrastructure: Docker, Docker Compose</li>
                <li>• Deployment: Kubernetes ready</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Data Flow</h2>
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/30 p-6">
            <div className="space-y-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded flex items-center justify-center">
                  1
                </div>
                <h4 className="text-lg font-medium text-white ml-3">Event Ingestion</h4>
              </div>
              <p className="text-zinc-400">
                Security events are collected from various sources (firewalls, IDS/IPS, endpoints, cloud services)
                via agents, syslog, APIs, and cloud connectors.
              </p>

              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded flex items-center justify-center">
                  2
                </div>
                <h4 className="text-lg font-medium text-white ml-3">Processing & Storage</h4>
              </div>
              <p className="text-zinc-400">
                Events are normalized, enriched, and stored in the time-series database for analysis and
                long-term retention.
              </p>

              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded flex items-center justify-center">
                  3
                </div>
                <h4 className="text-lg font-medium text-white ml-3">Detection & Analysis</h4>
              </div>
              <p className="text-zinc-400">
                The detection engine applies correlation rules, statistical analysis, and machine learning
                to identify potential threats. The AI analyst investigates high-confidence alerts.
              </p>

              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded flex items-center justify-center">
                  4
                </div>
                <h4 className="text-lg font-medium text-white ml-3">Response & Visualization</h4>
              </div>
              <p className="text-zinc-400">
                Confirmed incidents are escalated for response, while dashboards provide real-time
                visibility into security posture and threats.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}