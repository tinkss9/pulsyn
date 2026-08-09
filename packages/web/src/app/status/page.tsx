import Header from '@/components/Header';

export const metadata = {
  title: 'Pulsyn Status',
  description: 'Pulsyn platform and connector certification status.',
};

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Pulsyn Status</h1>
          <p className="text-gray-400 mb-8">
            Last updated: August 9, 2026
          </p>

          <div className="space-y-6">
            {/* Platform Status */}
            <div className="p-6 rounded-xl border border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <h2 className="text-lg font-semibold">Platform Services</h2>
              </div>
              <p className="text-gray-300">Operational</p>
              <p className="text-sm text-gray-500 mt-2">
                Core CDC engine, API, CLI, and MCP server are functional.
              </p>
            </div>

            {/* Certification Status */}
            <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <h2 className="text-lg font-semibold">Connector Certification</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Certified</span>
                  <span className="text-green-400 font-semibold">320 connectors</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Lane B (Databases)</span>
                  <span className="text-cyan-400 font-semibold">19 connectors</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Lane A (SaaS)</span>
                  <span className="text-blue-400 font-semibold">301 connectors</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">90%+ Pass Rate</span>
                  <span className="text-purple-400 font-semibold">292 connectors</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Methodology: Vitest live API tests + Docker database tests<br/>
                See <a href="/certification" className="underline hover:text-gray-400">/certification</a> for full details.
              </p>
            </div>

            {/* Demo Status */}
            <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <h2 className="text-lg font-semibold">Demo Environment</h2>
              </div>
              <p className="text-gray-300">
                The demo at /demo uses simulated data for illustration purposes.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                For real connectors, sign up and connect your own databases.
              </p>
            </div>

            {/* Pre-Production Notice */}
            <div className="p-6 rounded-xl border border-white/10 bg-white/5">
              <h2 className="text-lg font-semibold mb-3">Pre-Production Notice</h2>
              <p className="text-gray-300 mb-3">
                Pulsyn is currently in pre-production. The core CDC engine works and has passing tests, 
                but we have not yet completed production benchmarking or full integration testing.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Core CDC engine: Functional</li>
                <li>• API/CLI/MCP: Functional</li>
                <li>• Database connectors: Integration tested</li>
                <li>• SaaS connectors: API endpoints verified, integration tests pending</li>
                <li>• Benchmark engine: Simulated (real benchmarks coming soon)</li>
                <li>• Production deployment: Not yet available</li>
              </ul>
            </div>

            {/* Competition */}
            <div className="p-6 rounded-xl border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <h2 className="text-lg font-semibold">Replication Race Competition</h2>
              </div>
              <p className="text-gray-300">Coming Soon</p>
              <p className="text-sm text-gray-500 mt-2">
                We're building the competition infrastructure — real benchmark engine, 
                transparent metrics, Docker-based isolation. Register for early access at /competition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
