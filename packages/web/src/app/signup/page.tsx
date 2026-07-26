'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PulsynLogoFull } from '@/components/PulsynLogo';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In production, this would call a real auth API
      // For now, simulate signup and store API key
      const apiKey = `pk_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('pulsyn_api_key', apiKey);
      localStorage.setItem('pulsyn_user', JSON.stringify({
        name: form.name,
        email: form.email,
        company: form.company,
      }));

      // Create subscription
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      await fetch(`${API_URL}/api/billing/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: `org-${Date.now()}`,
          planId: 'starter',
          email: form.email,
          name: form.name,
        }),
      }).catch(() => {
        // Billing may not be configured — that's OK for dev
      });

      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/"><PulsynLogoFull size={32} /></Link>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500 focus:ring-1 focus:ring-pulsyn-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500 focus:ring-1 focus:ring-pulsyn-500"
                placeholder="john@company.com"
                required
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1.5">
                Company
              </label>
              <input
                id="company"
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500 focus:ring-1 focus:ring-pulsyn-500"
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500 focus:ring-1 focus:ring-pulsyn-500"
                placeholder="••••••••"
                minLength={8}
                required
              />
              <p className="text-gray-500 text-xs mt-1">Must be at least 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pulsyn-600 hover:bg-pulsyn-700 disabled:bg-pulsyn-800 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-pulsyn-500 hover:text-pulsyn-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="text-gray-500 text-xs text-center mt-6">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}
