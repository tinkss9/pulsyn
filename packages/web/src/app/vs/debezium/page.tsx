import Link from 'next/link';
import Header from '@/components/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pulsyn vs Debezium — Standalone CDC vs Kafka-dependent',
  description: 'Compare Pulsyn vs Debezium for change data capture. Pulsyn runs standalone with no Kafka dependency. Debezium requires Kafka Connect.',
};

export default function DebeziumComparison() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Header />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pulsyn-950/50 border border-pulsyn-800 rounded-full px-4 py-1.5 mb-6">
            <span className="text-pulsyn-400 text-sm font-medium">Comparison</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Pulsyn vs Debezium</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Debezium is the open-source CDC standard — but it requires Kafka. 
            Pulsyn gives you the same log-based CDC without the infrastructure overhead.
          </p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-pulsyn-950/30 border border-pulsyn-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">The Key Difference</h2>
            <p className="text-gray-300 text-lg mb-4">
              <strong>Debezium</strong> is a CDC engine that runs inside Kafka Connect. 
              To use it in production, you need: Kafka brokers, ZooKeeper, Kafka Connect workers, 
              schema registry, and monitoring. That's 5+ infrastructure components.
            </p>
            <p className="text-gray-300 text-lg mb-4">
              <strong>Pulsyn</strong> is a standalone CDC platform. One binary, one config, done. 
              Same log-based CDC technology, zero Kafka dependency.
            </p>
            <p className="text-gray-300 text-lg">
              <strong>Time to production:</strong> Debezium = days to weeks. Pulsyn = minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4 text-red-400">Debezium Requires</h3>
              <ul className="space-y-3 text-gray-300">
                <li>✗ Apache Kafka cluster (3+ brokers)</li>
                <li>✗ ZooKeeper ensemble</li>
                <li>✗ Kafka Connect workers</li>
                <li>✗ Schema Registry</li>
                <li>✗ Monitoring stack (Prometheus/Grafana)</li>
                <li>✗ No built-in UI or dashboard</li>
                <li>✗ No CLI tool</li>
                <li>✗ No API for pipeline management</li>
              </ul>
            </div>
            <div className="bg-gray-900/50 border border-green-900/50 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Pulsyn Includes</h3>
              <ul className="space-y-3 text-gray-300">
                <li>✓ Standalone — no Kafka needed</li>
                <li>✓ Built-in web dashboard</li>
                <li>✓ CLI with 35+ commands</li>
                <li>✓ REST API with OpenAPI spec</li>
                <li>✓ MCP server for AI agents</li>
                <li>✓ Checkpoint recovery</li>
                <li>✓ In-flight data masking</li>
                <li>✓ Connector certification</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">CDC without the Kafka headache</h2>
          <p className="text-gray-400 text-lg mb-8">Get production-grade CDC in minutes, not weeks.</p>
          <Link href="/signup" className="inline-block bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">Start Free Trial</Link>
        </div>
      </section>
    </main>
  );
}


