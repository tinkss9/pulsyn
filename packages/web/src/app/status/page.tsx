export const metadata = {
  title: 'Pulsyn Status',
  description: 'Pulsyn platform and connector certification status.',
};

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Pulsyn Status</h1>
        <p className="text-gray-400 mb-8">
          Last updated: {new Date().toISOString()}
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold mb-2">Platform Services</h2>
            <p className="text-gray-300">Operational</p>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold mb-2">Connector Certification</h2>
            <p className="text-gray-300">
              In progress. We are running the certification system against our connector catalog and will publish pass/fail metrics as results are verified.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold mb-2">Demo Data</h2>
            <p className="text-gray-300">
              The live demo at /demo uses simulated data for illustration purposes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
