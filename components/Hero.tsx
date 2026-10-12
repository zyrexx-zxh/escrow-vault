'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { ArrowRight } from './icons';

const WORDS = ['Secure', 'Digital', 'Escrow'];

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -90]);
  const opacity = useTransform(scrollY, [0, 520], [1, 0]);

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-end px-6 pb-28 pt-28 sm:px-10 lg:items-center lg:px-16 lg:pb-24"
    >
      <motion.div style={{ y, opacity }} className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="glass-lite mb-7 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-medium tracking-wide text-white/80"
          >
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-400" />
            Middleman directory
          </motion.div>

          <h1 className="text-[clamp(3.2rem,9vw,7.5rem)] font-semibold leading-[0.95] tracking-tight text-white">
            {WORDS.map((word, i) => (
              <span key={word} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className={`inline-block ${i === 1 ? 'text-gradient' : ''}`}
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.25 + i * 0.12 }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.75 }}
            className="mt-6 text-lg text-white/60 sm:text-xl"
          >
            Browse verified middlemen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <a
              href="#directory"
              className="contact-btn relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-emerald-50"
            >
              <span className="relative z-10">Browse middlemen</span>
              <ArrowRight className="relative z-10 h-4 w-4" />
            </a>
            <a
              href="#how"
              className="glass-lite rounded-full px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              How it works
            </a>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[11px] tracking-[0.25em] text-white/40 sm:flex"
      >
        <span>SCROLL</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/10">
          <span className="absolute inset-x-0 top-0 h-4 animate-scroll-hint bg-gradient-to-b from-transparent via-emerald-300 to-transparent" />
        </span>
      </motion.div>
    </section>
  );
}
