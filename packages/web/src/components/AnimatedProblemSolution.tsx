'use client'

import { motion } from 'framer-motion'

interface Item {
  text: string
  icon: string
}

interface AnimatedProblemSolutionProps {
  problems: Item[]
  solutions: Item[]
}

export default function AnimatedProblemSolution({ problems, solutions }: AnimatedProblemSolutionProps) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold mb-6 text-white"
            >
              Your data is 15 minutes old.
              <br />
              <span className="text-gray-500">Your competitors&apos; isn&apos;t.</span>
            </motion.h2>
            <div className="space-y-4">
              {problems.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3 bg-red-950/20 border border-red-900/30 rounded-lg px-4 py-3"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-bold mb-6 text-white"
            >
              Pulsyn fixes all four.
            </motion.h2>
            <div className="space-y-4">
              {solutions.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3 bg-green-950/20 border border-green-900/30 rounded-lg px-4 py-3"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
