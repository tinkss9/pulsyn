'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    pipelines: 0,
    connectors: 0,
    rowsPerSecond: 0,
    totalRows: 0,
    errors: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');

    Promise.all([
      fetch(`${API_URL}/api/pipelines`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${API_URL}/api/connectors`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([pipelines, connectors]) => {
      const pipelineData = pipelines.data || [];
      const runningPipelines = pipelineData.filter((p: any) => p.status === 'running');
      const totalRows = pipelineData.reduce((sum: number, p: any) => sum + (p.stats?.rowsRead || 0), 0);
      const rowsPerSecond = runningPipelines.reduce((sum: number, p: any) => sum + (p.stats?.rowsPerSecond || 0), 0);
      const errors = pipelineData.reduce((sum: number, p: any) => sum + (p.stats?.errors || 0), 0);

      setStats({
        pipelines: pipelineData.length,
        connectors: (connectors.data || []).length,
        rowsPerSecond,
        totalRows,
        errors,
      });
    });
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">Monitor your CDC pipelines and connectors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <StatCard title="Pipelines" value={stats.pipelines} link="/dashboard/pipelines" />
        <StatCard title="Connectors" value={stats.connectors} link="/dashboard/connectors" />
        <StatCard title="Rows/Second" value={stats.rowsPerSecond} format="number" />
        <StatCard title="Total Rows" value={stats.totalRows} format="number" />
        <StatCard title="Errors" value={stats.errors} variant={stats.errors > 0 ? 'error' : 'default'} />
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/pipelines"
            className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Create Pipeline
          </Link>
          <Link
            href="/dashboard/connectors"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add Connector
          </Link>
          <a
            href="/docs"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Documentation
          </a>
          <a
            href="/api/docs"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            API Reference
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <Step
            number={1}
            title="Create a connector"
            description="Connect to your source and target databases"
            href="/dashboard/connectors"
          />
          <Step
            number={2}
            title="Create a pipeline"
            description="Configure which tables to replicate"
            href="/dashboard/pipelines"
          />
          <Step
            number={3}
            title="Start replication"
            description="Begin real-time CDC replication"
            href="/dashboard/pipelines"
          />
          <Step
            number={4}
            title="Monitor & scale"
            description="Track metrics and add more pipelines"
            href="/dashboard/usage"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  format,
  variant,
  link,
}: {
  title: string;
  value: number;
  format?: 'number';
  variant?: 'default' | 'error';
  link?: string;
}) {
  const formatted = format === 'number' ? value.toLocaleString() : String(value);

  const content = (
    <div className={`bg-gray-900/50 border rounded-xl p-4 ${
      variant === 'error' && value > 0
        ? 'border-red-800'
        : 'border-gray-800'
    }`}>
      <div className="text-sm text-gray-400">{title}</div>
      <div className={`text-2xl font-bold mt-1 ${
        variant === 'error' && value > 0 ? 'text-red-400' : 'text-white'
      }`}>
        {formatted}
      </div>
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }
  return content;
}

function Step({
  number,
  title,
  description,
  href,
}: {
  number: number;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="flex items-start gap-4 group">
      <div className="w-8 h-8 bg-pulsyn-950/50 border border-pulsyn-800 rounded-full flex items-center justify-center text-sm font-bold text-pulsyn-400 group-hover:bg-pulsyn-600 group-hover:text-white transition-colors">
        {number}
      </div>
      <div>
        <h3 className="font-medium group-hover:text-pulsyn-400 transition-colors">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </Link>
  );
}
