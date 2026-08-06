'use client';

import { useEffect, useState } from 'react';
import { PRICING_TIERS, formatPrice } from '@/lib/pricing';

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    // Try Express API first, fall back to local state
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== 'undefined' ? localStorage.getItem('pulsyn_api_key') : null;

    const fetchSubscription = async () => {
      if (API_URL && token) {
        try {
          const res = await fetch(`${API_URL}/api/billing/subscriptions/default`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setSubscription(data.data);
          }
        } catch {
          // API not available — use local state
        }
      }
      setLoading(false);
    };

    fetchSubscription();
  }, []);

  const handleCheckout = async (tierId: string) => {
    if (tierId === 'free') {
      window.location.href = '/signup';
      return;
    }

    setCheckoutLoading(tierId);
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId, billingPeriod: 'monthly' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading billing...</div>
      </div>
    );
  }

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
              <div className="text-gray-400">{subscription.plan?.priceFormatted || '$300/mo'}</div>
              <div className="text-sm text-gray-500 mt-1">Status: {subscription.status}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Period</div>
              <div className="text-sm">
                {new Date(subscription.currentPeriodStart || subscription.current_period_start).toLocaleDateString()} —{' '}
                {new Date(subscription.currentPeriodEnd || subscription.current_period_end).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 mb-4">No active subscription. Choose a plan to get started.</p>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRICING_TIERS.filter(t => !t.enterprise).map((tier) => {
          const isCurrent = subscription?.planId === tier.id;
          return (
            <div
              key={tier.id}
              className={`bg-gray-900/50 border rounded-xl p-6 ${
                isCurrent
                  ? 'border-blue-500 ring-1 ring-blue-500/30'
                  : tier.popular
                  ? 'border-blue-600'
                  : 'border-gray-800'
              }`}
            >
              {tier.popular && (
                <div className="text-xs font-medium text-blue-400 mb-2">Most Popular</div>
              )}
              {isCurrent && (
                <div className="text-xs font-medium text-green-400 mb-2">Current Plan</div>
              )}
              <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
              <div className="mb-4">
                {tier.enterprise ? (
                  <span className="text-3xl font-bold">Custom</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold">{formatPrice(tier.price)}</span>
                    {tier.price > 0 && <span className="text-gray-400">/mo</span>}
                  </>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                <li className="text-sm flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{tier.features.pipelines === -1 ? 'Unlimited' : tier.features.pipelines} pipelines</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{tier.features.rowsPerDay === -1 ? 'Unlimited' : `${(tier.features.rowsPerDay / 1000).toFixed(0)}K`} rows/day</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{tier.features.connectors === -1 ? 'All connectors' : tier.features.connectors} connectors</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{tier.features.latency} latency</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{tier.features.support} support</span>
                </li>
                {tier.features.aiMapping && (
                  <li className="text-sm flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>AI-powered schema mapping</span>
                  </li>
                )}
                {tier.features.sso && (
                  <li className="text-sm flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>SSO / SAML</span>
                  </li>
                )}
              </ul>
              {!isCurrent && (
                <button
                  onClick={() => handleCheckout(tier.id)}
                  disabled={checkoutLoading === tier.id}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    tier.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {checkoutLoading === tier.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : tier.enterprise ? (
                    'Contact Sales'
                  ) : tier.price === 0 ? (
                    'Get Started Free'
                  ) : (
                    `Subscribe — ${formatPrice(tier.price)}/mo`
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Enterprise */}
      <div className="mt-8 bg-gray-900/50 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p className="text-gray-400 mt-1">Custom pricing for large organizations. Dedicated support, SLA, on-prem deployment.</p>
          </div>
          <a
            href="/contact"
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg text-sm font-medium transition-colors"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
}
