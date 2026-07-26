'use client';

import { useState } from 'react';
import { PRICING_TIERS, formatPrice, formatLimit } from '@/lib/pricing';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tierId: string) => {
    if (tierId === 'free') {
      window.location.href = '/signup';
      return;
    }

    setLoading(tierId);
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId, billingPeriod }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Start free. Scale as you grow. No hidden fees.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual (Save 20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-8 ${
                tier.popular
                  ? 'bg-blue-600 border-2 border-blue-400'
                  : tier.enterprise
                  ? 'bg-gray-800 border-2 border-purple-500'
                  : 'bg-gray-800 border border-gray-700'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-400 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              {tier.enterprise && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Enterprise
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-5xl font-bold text-white mb-2">
                  {billingPeriod === 'annual'
                    ? formatPrice(Math.round(tier.price * 0.8))
                    : formatPrice(tier.price)}
                  {tier.price > 0 && (
                    <span className="text-lg text-gray-400">/mo</span>
                  )}
                </div>
                {billingPeriod === 'annual' && tier.price > 0 && (
                  <p className="text-sm text-green-400">
                    Save ${Math.round(tier.price * 12 * 0.2)}/year
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {tier.features.pipelines === -1 ? 'Unlimited' : tier.features.pipelines} pipelines
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {formatLimit(tier.features.rowsPerDay, 'rows/day')}
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {tier.features.connectors === -1 ? 'All 763' : tier.features.connectors} connectors
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {tier.features.latency} latency
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {tier.features.support} support
                </li>
                {tier.features.aiMapping && (
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    AI-powered schema mapping
                  </li>
                )}
                {tier.features.sso && (
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    SSO / SAML
                  </li>
                )}
                {tier.features.onPrem && (
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    On-premises deployment
                  </li>
                )}
                {tier.features.dedicatedEngineer && (
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Dedicated engineer
                  </li>
                )}
              </ul>

              <button
                onClick={() => handleSubscribe(tier.id)}
                disabled={loading === tier.id}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  tier.popular
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : tier.enterprise
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {loading === tier.id ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  `Subscribe - ${formatPrice(tier.price)}/mo`
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-400">
                Yes! Upgrade or downgrade anytime. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                What happens if I exceed my limits?
              </h3>
              <p className="text-gray-400">
                We'll notify you and pause pipelines. Upgrade to continue syncing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-400">
                Yes, 30-day money-back guarantee on all paid plans.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-400">
                The Free plan is forever free. Paid plans have 14-day free trials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
