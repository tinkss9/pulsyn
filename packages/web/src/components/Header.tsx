'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PulsynLogoFull } from './PulsynLogo';
import { Menu, X } from 'lucide-react';

// Shared header for all pages
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <PulsynLogoFull size={32} />
        </Link>
        
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="/#connectors" className="text-sm text-gray-400 hover:text-white transition-colors">Connectors</a>
          <a href="/#ai" className="text-sm text-gray-400 hover:text-white transition-colors">AI</a>
          <a href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
          <a href="/demo" className="text-sm text-gray-400 hover:text-white transition-colors">Demo</a>
        </nav>
        
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
          <Link href="/signup" className="hidden md:block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all">
            Start Free
          </Link>
          
          {/* Mobile hamburger */}
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0f] border-t border-white/5 px-6 py-4">
          <nav className="flex flex-col gap-4 mb-4">
            <a href="/#features" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="/#connectors" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-400 hover:text-white transition-colors">Connectors</a>
            <a href="/#ai" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-400 hover:text-white transition-colors">AI</a>
            <a href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="/demo" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-400 hover:text-white transition-colors">Demo</a>
          </nav>
          <div className="flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all text-center">
              Start Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
