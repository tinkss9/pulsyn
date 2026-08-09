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
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      // Show the API key — it's only shown once
      setApiKey(data.data.apiKey);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // After signup, show the API key
  if (apiKey) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/"><PulsynLogoFull size={32} /></Link>
            <p className="text-gray-400 mt-2">Account created!</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
            <div className="bg-amber-950/30 border border-amber-800 rounded-lg p-4 mb-6">
              <p className="text-amber-400 text-sm font-medium mb-2">Save your API key now</p>
              <p className="text-amber-300/80 text-xs">This key is shown only once. Store it securely.</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <code className="text-green-400 text-sm break-all font-mono">{apiKey}</code>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg font-medium transition-colors mb-3"
            >
              Copy to Clipboard
            </button>

            <button
              onClick={() => {
                localStorage.setItem('pulsyn_api_key', apiKey);
                localStorage.setItem('pulsyn_user', JSON.stringify({ name: form.name, email: form.email }));
                router.push('/dashboard');
              }}
              className="w-full bg-pulsyn-600 hover:bg-pulsyn-700 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><PulsynLogoFull size={32} /></Link>
          <p className="text-gray-400 mt-2">Create your account</p>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 mt-2 inline-block">&larr; Back to home</Link>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Honeypot field — hidden from humans, catches bots */}
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

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
