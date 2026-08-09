'use client'

import { motion } from 'framer-motion'
import CountUp from './CountUp'

interface AnimatedStatsProps {
  stats: Array<{
    value: string | number
    label: string
    prefix?: string
    suffix?: string
    decimals?: number
  }>
}

export default function AnimatedStats({ stats }: AnimatedStatsProps) {
  return (
    <section className="py-12 px-6 border-y border-white/5">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {typeof stat.value === 'number' ? (
                <CountUp
                  end={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              ) : (
                stat.value
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
