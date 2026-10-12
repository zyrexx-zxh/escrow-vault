'use client';

import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { parseFee, type Middleman } from '@/data/middlemen';
import { EASE } from '@/lib/motion';
import { Send, User } from './icons';

function feeStyle(fee: string) {
  const n = parseFee(fee);
  if (n <= 2) return 'border-emerald-300/40 bg-emerald-400/20 text-emerald-100';
  if (n <= 3) return 'border-cyan-300/40 bg-cyan-400/20 text-cyan-100';
  return 'border-white/20 bg-white/10 text-white/80';
}

/**
 * Profile image placeholder: a gradient ring + silhouette, tinted per middleman.
 * To use real photos, replace the <User /> icon below with an <img> or next/image.
 */
function Avatar({ username }: { username: string }) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = (hash * 31 + username.charCodeAt(i)) % 360;
  const hue = 150 + (hash % 80);

  return (
    <div
      className="h-14 w-14 shrink-0 rounded-full p-[2px]"
      style={{
        background: `conic-gradient(from 140deg, hsl(${hue} 90% 60%), hsl(${hue + 50} 90% 60%), hsl(${hue} 90% 60%))`,
      }}
    >
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full"
        style={{
          background: `linear-gradient(145deg, hsl(${hue} 55% 22%), hsl(${hue + 30} 60% 8%))`,
        }}
      >
        <User className="h-6 w-6 text-white/70" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const unlisted = value === 'Not listed';
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">{label}</dt>
      <dd
        className={`mt-1.5 tabular-nums ${
          unlisted ? 'text-sm italic text-white/40' : 'text-lg font-semibold text-white'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function MiddlemanCard({ m, index }: { m: Middleman; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Pointer position inside the card, 0 → 1
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [10, -10]), {
    stiffness: 220,
    damping: 22,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-12, 12]), {
    stiffness: 220,
    damping: 22,
    mass: 0.6,
  });

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    px.set(x);
    py.set(y);
    // Drives the glare + gradient-border highlight in globals.css
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  };

  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 4) * 0.07 }}
      style={{ perspective: '1100px' }}
    >
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.025 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="tilt-card group relative rounded-[28px]"
      >
        {/* frosted glass plate with gradient border */}
        <div className="glass-plate gradient-border absolute inset-0 rounded-[28px]" />

        {/* pointer-following glare */}
        <div className="card-glare pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* content floats above the glass in 3D */}
        <div
          className="relative p-6"
          style={{ transform: 'translateZ(36px)', transformStyle: 'preserve-3d' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3.5" style={{ transform: 'translateZ(14px)' }}>
              <Avatar username={m.username} />
              <div className="min-w-0">
                <h3 className="truncate text-xl font-semibold capitalize text-white">{m.name}</h3>
                <p className="truncate font-mono text-[13px] text-white/50">@{m.username}</p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${feeStyle(m.fee)}`}
            >
              {m.fee} fee
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Telegram vouches" value={m.telegram_vouches} />
            <Stat label="OGU vouches" value={m.ogu_vouches} />
          </dl>

          <div className="mt-5" style={{ transform: 'translateZ(18px)' }}>
            <a
              href={`https://t.me/${m.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold text-emerald-50 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
            >
              <Send className="relative z-10 h-4 w-4 shrink-0" />
              <span className="relative z-10 truncate">Contact @{m.username}</span>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
