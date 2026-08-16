import { Card } from '@/components/ui/card';

export default function Incidents() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span className="text-primary">Aegis</span> SOC Incidents
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Active Incidents</h2>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Search incidents..."
                className="bg-zinc-800/50 border border-zinc-700 rounded px-4 py-2 text-zinc-200 w-48"
              />
              <button className="flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                New Incident
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mock incident cards */}
          {[1, 2, 3].map((incident) => (
            <Card key={incident} className="hover:border-zinc-700/70 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 flex-shrink-0">
                  ⚠️
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">Brute Force Attack on Domain Controller</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">HIGH</span>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    Multiple failed authentication attempts followed by successful login indicating possible brute force attack
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-zinc-500">
                    <span>Status: <span className="text-white">INVESTIGATING</span></span>
                    <span>Assigned to: <span className="text-white">analyst@aegis-soc.com</span></span>
                    <span>Risk Score: <span className="text-white">85/100</span></span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-800/30">
                <div className="flex items-center space-x-4">
                  <button className="flex h-9 items-center justify-center rounded-md bg-zinc-800/50 px-3 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">
                    View Details
                  </button>
                  <button className="flex h-9 items-center justify-center rounded-md bg-zinc-800/50 px-3 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">
                    Add Note
                  </button>
                  <button className="flex h-9 items-center justify-center rounded-md bg-zinc-800/50 px-3 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">
                    Change Status
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}