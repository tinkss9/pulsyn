'use client';

import { useEffect, useState } from 'react';

interface SecurityEvent {
  id: number;
  event_type: string;
  api_key_id: string;
  ip_address: string;
  endpoint: string;
  method: string;
  details: any;
  created_at: string;
}

interface BlockedIp {
  id: number;
  ip_address: string;
  reason: string;
  blocked_by: string;
  failure_count: number;
  blocked_at: string;
  expires_at: string;
  status: string;
}

interface SecuritySummary {
  events: { event_type: string; count: string; last_seen: string }[];
  blockedIps: number;
}

export default function SecurityDashboard() {
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIp[]>([]);
  const [failures, setFailures] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'blocked' | 'failures'>('overview');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-67qhpgy5i-1inai.vercel.app';

  const fetchWithAuth = async (url: string) => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.status === 401) {
      setError('Invalid API key');
      setAuthenticated(false);
      return null;
    }
    if (res.status === 429) {
      setError('Rate limit exceeded. Please wait.');
      return null;
    }
    return res.json();
  };

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [summaryRes, eventsRes, blockedRes, failuresRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/api/security?type=summary`),
        fetchWithAuth(`${API_URL}/api/security?type=recent&limit=50`),
        fetchWithAuth(`${API_URL}/api/blocked?status=active`),
        fetchWithAuth(`${API_URL}/api/security?type=failures&limit=50`),
      ]);

      if (summaryRes?.data) setSummary(summaryRes.data);
      if (eventsRes?.data) setRecentEvents(eventsRes.data.items || []);
      if (blockedRes?.data) setBlockedIps(blockedRes.data.blockedIps || []);
      if (failuresRes?.data) setFailures(failuresRes.data.items || []);

      setAuthenticated(true);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey) {
      loadData();
    }
  };

  const unblockIp = async (ip: string) => {
    if (!confirm(`Unblock ${ip}?`)) return;

    await fetch(`${API_URL}/api/blocked?ip=${encodeURIComponent(ip)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    loadData();
  };

  const blockIp = async (ip: string) => {
    const reason = prompt('Reason for blocking:');
    if (!reason) return;

    await fetch(`${API_URL}/api/blocked`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip, reason, durationHours: 24 }),
    });
    loadData();
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'auth_success': return 'text-green-400';
      case 'auth_failure': return 'text-yellow-400';
      case 'invalid_key': return 'text-orange-400';
      case 'rate_limit_exceeded': return 'text-red-400';
      case 'suspicious_activity': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'auth_success': return '✓';
      case 'auth_failure': return '⚠';
      case 'invalid_key': return '✗';
      case 'rate_limit_exceeded': return '⊘';
      case 'suspicious_activity': return '⛔';
      default: return '•';
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2">Security Dashboard</h1>
          <p className="text-gray-400 text-sm mb-6">Enter your API key to access the security dashboard</p>

          {error && (
            <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="pk_..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Security Dashboard</h1>
            <p className="text-gray-400">Monitor authentication, rate limits, and blocked IPs</p>
          </div>
          <button
            onClick={loadData}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'events', 'blocked', 'failures'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && summary && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <div className="text-3xl font-bold text-green-400">
                      {summary.events.find(e => e.event_type === 'auth_success')?.count || '0'}
                    </div>
                    <div className="text-gray-400 text-sm">Successful Auths (24h)</div>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <div className="text-3xl font-bold text-yellow-400">
                      {summary.events.find(e => e.event_type === 'auth_failure')?.count || '0'}
                    </div>
                    <div className="text-gray-400 text-sm">Auth Failures (24h)</div>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <div className="text-3xl font-bold text-red-400">
                      {summary.events.find(e => e.event_type === 'invalid_key')?.count || '0'}
                    </div>
                    <div className="text-gray-400 text-sm">Invalid Keys (24h)</div>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <div className="text-3xl font-bold text-orange-400">{summary.blockedIps}</div>
                    <div className="text-gray-400 text-sm">Blocked IPs</div>
                  </div>
                </div>

                {/* Event Breakdown */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Event Breakdown (24h)</h2>
                  <div className="space-y-3">
                    {summary.events.map((event) => (
                      <div key={event.event_type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={getEventColor(event.event_type)}>
                            {getEventIcon(event.event_type)}
                          </span>
                          <span className="text-sm">{event.event_type}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-400">
                            {new Date(event.last_seen).toLocaleTimeString()}
                          </span>
                          <span className="font-mono text-sm">{event.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">IP</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Endpoint</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Details</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Time</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.map((event) => (
                      <tr key={event.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-4">
                          <span className={getEventColor(event.event_type)}>
                            {getEventIcon(event.event_type)} {event.event_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{event.ip_address}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{event.endpoint}</td>
                        <td className="py-3 px-4 text-sm text-gray-400 max-w-xs truncate">
                          {JSON.stringify(event.details)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {new Date(event.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {event.event_type !== 'auth_success' && (
                            <button
                              onClick={() => blockIp(event.ip_address)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Block
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Blocked IPs Tab */}
            {activeTab === 'blocked' && (
              <div className="space-y-4">
                {blockedIps.length === 0 ? (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
                    No blocked IPs
                  </div>
                ) : (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">IP</th>
                          <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Reason</th>
                          <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Failures</th>
                          <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Blocked At</th>
                          <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Expires</th>
                          <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blockedIps.map((ip) => (
                          <tr key={ip.id} className="border-b border-gray-800/50">
                            <td className="py-3 px-4 font-mono text-sm">{ip.ip_address}</td>
                            <td className="py-3 px-4 text-sm text-gray-300">{ip.reason}</td>
                            <td className="py-3 px-4 text-sm">{ip.failure_count}</td>
                            <td className="py-3 px-4 text-sm text-gray-400">
                              {new Date(ip.blocked_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-400">
                              {ip.expires_at ? new Date(ip.expires_at).toLocaleString() : 'Never'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-sm ${
                                ip.status === 'active' ? 'text-red-400' : 'text-gray-400'
                              }`}>
                                {ip.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => unblockIp(ip.ip_address)}
                                className="text-green-400 hover:text-green-300 text-sm"
                              >
                                Unblock
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Failures Tab */}
            {activeTab === 'failures' && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">IP</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Endpoint</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Reason</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Time</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failures.map((event) => (
                      <tr key={event.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-4">
                          <span className={getEventColor(event.event_type)}>
                            {getEventIcon(event.event_type)} {event.event_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{event.ip_address}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{event.endpoint}</td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {event.details?.reason || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {new Date(event.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => blockIp(event.ip_address)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Block
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
