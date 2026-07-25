import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pulsyn vs Confluent — Simple CDC vs Kafka Platform',
  description: 'Compare Pulsyn vs Confluent for real-time data streaming. Pulsyn is CDC-first with no Kafka dependency. Confluent is a full Kafka platform.',
};

export default function ConfluentComparison() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-pulsyn-500">Pulsyn</Link>
          <Link href="/signup" className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Start Free Trial</Link>
        </div>
      </header>

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pulsyn-950/50 border border-pulsyn-800 rounded-full px-4 py-1.5 mb-6">
            <span className="text-pulsyn-400 text-sm font-medium">Comparison</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Pulsyn vs Confluent</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Confluent is a $9B Kafka platform. Pulsyn is a focused CDC tool. 
            Different scales, different use cases.
          </p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-pulsyn-950/30 border border-pulsyn-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">When to Choose Each</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div>
                <h3 className="text-lg font-semibold text-pulsyn-400 mb-3">Choose Confluent when:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• You need a full event streaming platform</li>
                  <li>• You're already running Kafka in production</li>
                  <li>• You need stream processing (Flink/ksqlDB)</li>
                  <li>• Budget is $10,000+/month</li>
                  <li>• You have a dedicated Kafka team</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3">Choose Pulsyn when:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• You only need database CDC (not full streaming)</li>
                  <li>• You want simple setup without Kafka</li>
                  <li>• Budget matters ($0-2,000/month)</li>
                  <li>• You want API/CLI/MCP access</li>
                  <li>• You need self-hosted deployment</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Cost Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Confluent Basic</div>
                <div className="text-3xl font-bold">$385+</div>
                <div className="text-gray-400">/month</div>
                <div className="text-sm text-gray-500 mt-2">+ usage fees</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Confluent Standard</div>
                <div className="text-3xl font-bold">$895+</div>
                <div className="text-gray-400">/month</div>
                <div className="text-sm text-gray-500 mt-2">+ usage fees</div>
              </div>
              <div className="text-center bg-pulsyn-950/30 border border-pulsyn-800 rounded-xl py-6">
                <div className="text-sm text-pulsyn-400 mb-2">Pulsyn Pro</div>
                <div className="text-3xl font-bold text-pulsyn-400">$300</div>
                <div className="text-gray-400">/month</div>
                <div className="text-sm text-green-400 mt-2">flat rate, no usage fees</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Don't need a full Kafka platform?</h2>
          <p className="text-gray-400 text-lg mb-8">Get the CDC you need without the infrastructure you don't.</p>
          <Link href="/signup" className="inline-block bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">Start Free Trial</Link>
        </div>
      </section>
    </main>
  );
}
