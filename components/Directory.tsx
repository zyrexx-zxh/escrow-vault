'use client';

import { motion } from 'framer-motion';
import { middlemen, parseCount, parseFee } from '@/data/middlemen';
import { EASE } from '@/lib/motion';
import Deck from './Deck';
import { ShieldCheck } from './icons';

const LOWEST_FEE = Math.min(...middlemen.map((m) => parseFee(m.fee)));
const MOST_TELEGRAM = Math.max(...middlemen.map((m) => parseCount(m.telegram_vouches)));

const STATS = [
  { value: String(middlemen.length), label: 'Middlemen listed' },
  { value: `${LOWEST_FEE}%`, label: 'Lowest fee' },
  { value: MOST_TELEGRAM.toLocaleString('en-US'), label: 'Most Telegram vouches' },
];

export default function Directory() {
  return (
    <section
      id="directory"
      className="relative scroll-mt-24 overflow-x-clip px-6 pb-12 pt-28 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-medium tracking-[0.25em] text-emerald-300/80">DIRECTORY</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Verified middlemen
          </h2>
          <p className="mt-4 text-white/60">
            Swipe through the deck, then reach your pick directly on Telegram.
          </p>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="glass-lite rounded-2xl px-3 py-4 text-center sm:px-5">
              <p className="text-2xl font-semibold tabular-nums text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[11px] leading-snug text-white/50 sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <Deck />

        <div className="glass-lite mx-auto mt-14 flex max-w-2xl items-start gap-3 rounded-2xl px-5 py-4 text-sm leading-relaxed text-white/60">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <p>
            Always check that the @username matches exactly before you send any funds. Impersonation
            is a common scam, and every Contact button links straight to that middleman&apos;s
            Telegram.
          </p>
        </div>
      </div>
    </section>
  );
}
