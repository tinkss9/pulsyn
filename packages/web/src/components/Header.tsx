'use client';

import Link from 'next/link';
import { PulsynLogoFull } from './PulsynLogo';

// Shared header for all pages
export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <PulsynLogoFull size={32} />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="/#connectors" className="text-sm text-gray-400 hover:text-white transition-colors">Connectors</a>
          <a href="/#ai" className="text-sm text-gray-400 hover:text-white transition-colors">AI</a>
          <a href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
          <a href="/demo" className="text-sm text-gray-400 hover:text-white transition-colors">Demo</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
          <Link href="/signup" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all">
            Start Free
          </Link>
        </div>
      </div>
    </header>
  );
}
