'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to hello@pulsynai.com via Resend
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className="text-lg font-bold text-white">Pulsyn</span>
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">&larr; Back to home</Link>
        </div>
      </header>

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in touch</h1>
            <p className="text-xl text-gray-400">Have questions? We'd love to hear from you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-center">
              <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-gray-400 text-sm">hello@pulsynai.com</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-center">
              <Phone className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Phone</h3>
              <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-center">
              <MapPin className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Location</h3>
              <p className="text-gray-400 text-sm">San Francisco, CA</p>
            </div>
          </div>

          {sent ? (
            <div className="bg-green-950/30 border border-green-800/50 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Message sent!</h2>
              <p className="text-gray-400">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  placeholder="Your company"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 h-32"
                  placeholder="How can we help?"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
