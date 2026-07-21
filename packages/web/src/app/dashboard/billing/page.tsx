'use client';

import { useEffect, useState } from 'react';

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');

    Promise.all([
      fetch(`${API_URL}/api/billing/subscriptions/default`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null),
      fetch(`${API_URL}/api/billing/plans`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .catch(() => ({ data: [] })),
    ]).then(([sub, plansData]) => {
      setSubscription(sub?.data || null);
      setPlans(plansData.data || []);
      setLoading(false);
    });
  }, []);

  const handleUpgrade = async (planId: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');
    const user = JSON.parse(localStorage.getItem('pulsyn_user') || '{}');

    const res = await fetch(`${API_URL}/api/billing/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ planId, email: user.email || 'user@example.com', organizationId: 'default' }),
    });
    const data = await res.json();
    if (data.data?.url) {
      window.open(data.data.url, '_blank');
    }
  };

  if (loading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-gray-400 mt-1">Manage your subscription and payment</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
        {subscription ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{subscription.plan?.name || subscription.planId}</div>
              <div className="text-gray-400">{subscription.plan?.priceFormatted || '$99/mo'}</div>
              <div className="text-sm text-gray-500 mt-1">Status: {subscription.status}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Period</div>
              <div className="text-sm">
                {new Date(subscription.currentPeriodStart).toLocaleDateString()} — {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 mb-4">No active subscription. Choose a plan to get started.</p>
          </div>
        )}
      </div>

      {/* Plans */}
      <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          return (
            <div
              key={plan.id}
              className={`bg-gray-900/50 border rounded-xl p-6 ${
                isCurrent ? 'border-pulsyn-600' : 'border-gray-800'
              }`}
            >
              {isCurrent && (
                <div className="text-xs font-medium text-pulsyn-400 mb-2">Current Plan</div>
              )}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.priceFormatted}</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
              <ul className="space-y-2 mb-6">
                <li className="text-sm flex items-center gap-2">
                  <span className="text-pulsyn-500">✓</span>
                  <span>{plan.features?.maxPipelines === 999 ? 'Unlimited' : plan.features?.maxPipelines} pipeline{plan.features?.maxPipelines !== 1 ? 's' : ''}</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <span className="text-pulsyn-500">✓</span>
                  <span>{(plan.features?.maxRowsPerDay || 0).toLocaleString()} rows/day</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <span className="text-pulsyn-500">✓</span>
                  <span>{plan.features?.masking ? 'In-flight masking' : 'Basic replication'}</span>
                </li>
              </ul>
              {!isCurrent && (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className="w-full bg-pulsyn-600 hover:bg-pulsyn-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {subscription ? 'Upgrade' : 'Get Started'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
