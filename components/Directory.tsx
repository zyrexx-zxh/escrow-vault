'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { middlemen, parseCount, parseFee } from '@/data/middlemen';
import { EASE } from '@/lib/motion';
import MiddlemanCard from './MiddlemanCard';
import { Search, ShieldCheck } from './icons';

type SortKey = 'default' | 'fee' | 'telegram' | 'ogu';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'default', label: 'Default' },
  { key: 'fee', label: 'Lowest fee' },
  { key: 'telegram', label: 'Telegram vouches' },
  { key: 'ogu', label: 'OGU vouches' },
];

const LOWEST_FEE = Math.min(...middlemen.map((m) => parseFee(m.fee)));
const MOST_TELEGRAM = Math.max(...middlemen.map((m) => parseCount(m.telegram_vouches)));

const STATS = [
  { value: String(middlemen.length), label: 'Middlemen listed' },
  { value: `${LOWEST_FEE}%`, label: 'Lowest fee' },
  { value: MOST_TELEGRAM.toLocaleString('en-US'), label: 'Most Telegram vouches' },
];

export default function Directory() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('default');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, '');
    const out = middlemen.filter(
      (m) => !q || m.name.toLowerCase().includes(q) || m.username.toLowerCase().includes(q),
    );
    if (sort === 'fee') out.sort((a, b) => parseFee(a.fee) - parseFee(b.fee));
    if (sort === 'telegram')
      out.sort((a, b) => parseCount(b.telegram_vouches) - parseCount(a.telegram_vouches));
    if (sort === 'ogu') out.sort((a, b) => parseCount(b.ogu_vouches) - parseCount(a.ogu_vouches));
    return out;
  }, [query, sort]);

  return (
    <section id="directory" className="relative scroll-mt-24 px-6 pb-12 pt-28 sm:px-10 lg:px-16">
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
            Compare fees and vouches, then reach your pick directly on Telegram.
          </p>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-2xl px-3 py-4 text-center sm:px-5">
              <p className="text-2xl font-semibold tabular-nums text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[11px] leading-snug text-white/50 sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* search + sort (sticks under the nav on larger screens) */}
        <div className="relative z-40 mt-12 sm:sticky sm:top-[76px]">
          <div className="glass flex flex-col gap-3 rounded-3xl p-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block sm:w-72">
              <span className="sr-only">Search middlemen</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or @username"
                className="w-full rounded-2xl border border-white/10 bg-black/30 py-2.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-emerald-300/50 focus:bg-black/40"
              />
            </label>

            <div role="group" aria-label="Sort middlemen" className="flex flex-wrap gap-1.5">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSort(s.key)}
                  aria-pressed={sort === s.key}
                  className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
                    sort === s.key
                      ? 'bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/40'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((m, i) => (
            <MiddlemanCard key={m.username} m={m} index={i} />
          ))}
        </div>

        {list.length === 0 && (
          <p className="mt-16 text-center text-white/50">No middlemen match “{query}”.</p>
        )}

        <div className="glass mx-auto mt-14 flex max-w-2xl items-start gap-3 rounded-2xl px-5 py-4 text-sm leading-relaxed text-white/60">
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
