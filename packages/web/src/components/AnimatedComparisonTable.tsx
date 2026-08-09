'use client'

import { motion } from 'framer-motion'

interface ComparisonRow {
  feature: string
  pulsyn: string
  fivetran: string
  airbyte: string
  debezium: string
}

interface AnimatedComparisonTableProps {
  rows: ComparisonRow[]
}

export default function AnimatedComparisonTable({ rows }: AnimatedComparisonTableProps) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-4 text-white text-center"
        >
          Why teams switch to Pulsyn
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-gray-400 text-lg mb-12 text-center"
        >
          Honest comparison. No cherry-picking.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="overflow-x-auto"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 text-gray-400 font-medium">Feature</th>
                <th className="text-center py-3 text-cyan-400 font-semibold">Pulsyn</th>
                <th className="text-center py-3 text-gray-400 font-medium">Fivetran</th>
                <th className="text-center py-3 text-gray-400 font-medium">Airbyte</th>
                <th className="text-center py-3 text-gray-400 font-medium">Debezium</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 text-gray-300">{row.feature}</td>
                  <td className="py-3 text-center text-cyan-400 font-semibold">{row.pulsyn}</td>
                  <td className="py-3 text-center text-gray-400">{row.fivetran}</td>
                  <td className="py-3 text-center text-gray-400">{row.airbyte}</td>
                  <td className="py-3 text-center text-gray-400">{row.debezium}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  )
}
