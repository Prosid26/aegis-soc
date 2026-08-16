export default function TestPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-6">
          AegisSOC Frontend
        </h1>
        <p className="text-zinc-300 mb-8">
          Frontend is working correctly!
        </p>
        <a href="/dashboard" className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}