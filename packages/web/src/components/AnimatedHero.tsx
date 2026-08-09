'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AnimatedHero() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_50%)]" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(8,8,12,0.7) 0%, rgba(8,8,12,0.3) 50%, transparent 100%)'
      }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 via-transparent to-[#0a0a0f]/80 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 rounded-full px-4 py-1.5 mb-8"
        >
          <motion.span
            className="relative flex h-2 w-2"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </motion.span>
          <span className="text-cyan-200 text-sm font-medium">Growing connector catalog</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1]"
          style={{ textShadow: '0 0 60px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.4)' }}
        >
          <span className="text-white">Real-time data.</span>
          <br />
          <motion.span
            className="text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ textShadow: '0 0 40px rgba(6,182,212,0.4), 0 2px 8px rgba(0,0,0,0.8)' }}
          >
            Zero latency.
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-xl text-white/80 max-w-2xl mx-auto mb-4 leading-relaxed"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
        >
          Real-time CDC. AI-powered schema mapping. Starting free.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/signup" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3.5 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-cyan-500/20 inline-block">
              Start Free →
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a href="/demo" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl text-lg font-medium transition-all inline-block">
              Try Demo
            </a>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-gray-400 text-sm"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          No credit card · Free forever · Growing catalog
        </motion.p>
      </div>
    </section>
  )
}
