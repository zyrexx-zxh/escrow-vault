'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion';

const STEPS = [
  {
    n: '01',
    title: 'Choose a middleman',
    body: 'Compare fees and vouch counts, then open a chat with the one you trust.',
  },
  {
    n: '02',
    title: 'Agree on the terms',
    body: 'Confirm the deal, the price and the fee in the chat before any funds move.',
  },
  {
    n: '03',
    title: 'Funds held, then released',
    body: 'The middleman holds the payment until delivery is confirmed, then releases it to the seller.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-24 px-6 py-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-medium tracking-[0.25em] text-emerald-300/80">HOW IT WORKS</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            A neutral third party holds the funds.
          </h2>
          <p className="mt-4 text-white/60">Three simple steps from first message to release.</p>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
              className="glass-lite gradient-border rounded-3xl p-7"
            >
              <span className="font-mono text-sm text-emerald-300/80">{step.n}</span>
              <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/60">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
