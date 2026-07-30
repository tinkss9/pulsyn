'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PulsynLogoFull } from '@/components/PulsynLogo';

export default function LoginPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid API key');
        return;
      }

      localStorage.setItem('pulsyn_api_key', apiKey);
      localStorage.setItem('pulsyn_user', JSON.stringify(data.data));
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><PulsynLogoFull size={32} /></Link>
          <p className="text-gray-400 mt-2">Sign in with your API key</p>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 mt-2 inline-block">&larr; Back to home</Link>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1.5">
                API Key
              </label>
              <input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500 focus:ring-1 focus:ring-pulsyn-500 font-mono text-sm"
                placeholder="pulsyn_..."
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">
                You received an API key when you signed up. It starts with <code className="text-gray-400">pulsyn_</code>.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pulsyn-600 hover:bg-pulsyn-700 disabled:bg-pulsyn-800 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-pulsyn-500 hover:text-pulsyn-400">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
