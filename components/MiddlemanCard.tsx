'use client';

import { memo, useState, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { parseFee, type Middleman } from '@/data/middlemen';
import { PX, clamp01, wrapDelta } from '@/lib/deck';
import { Send, User } from './icons';

/** Profile photos live in /public/middlemen/<name>.jpg (name lower-cased), e.g. fame.jpg */
const EXTS = ['jpg', 'jpeg', 'png', 'webp'] as const;

function hueFor(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 360;
  return 150 + (hash % 80);
}

function feeStyle(fee: string): string {
  const n = parseFee(fee);
  if (n <= 2) return 'border-emerald-300/40 bg-emerald-400/20 text-emerald-100';
  if (n <= 3) return 'border-cyan-300/40 bg-cyan-400/20 text-cyan-100';
  return 'border-white/20 bg-white/10 text-white/85';
}

/** Full-bleed profile photo, with a tinted placeholder when the image file is missing. */
function Portrait({ m }: { m: Middleman }) {
  const [attempt, setAttempt] = useState(0);
  const failed = attempt >= EXTS.length;
  const hue = hueFor(m.username);

  if (failed) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `radial-gradient(80% 60% at 50% 30%, hsl(${hue} 60% 24%), hsl(${hue + 30} 55% 7%))`,
        }}
      >
        <User className="h-20 w-20 -translate-y-8 text-white/25" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/middlemen/${m.name.toLowerCase()}.${EXTS[attempt]}`}
      alt={`${m.name} profile`}
      onError={() => setAttempt((a) => a + 1)}
      draggable={false}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const unlisted = value === 'Not listed';
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">{label}</dt>
      <dd
        className={`mt-1 tabular-nums ${
          unlisted ? 'text-sm italic text-white/45' : 'text-lg font-semibold text-white'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

interface Props {
  m: Middleman;
  index: number;
  total: number;
  /** Deck position in cards (float). Each card derives its own transform from it. */
  pos: MotionValue<number>;
  active: boolean;
  blockClick: MutableRefObject<boolean>;
  onSelect: (index: number) => void;
}

function MiddlemanCard({ m, index, total, pos, active, blockClick, onSelect }: Props) {
  // d = where this card sits relative to the front:
  //   0 = front, 1..3 = stacked behind, negative = flying away to the left / coming back
  const d = useTransform(pos, (v) => wrapDelta(index - v, total));
  const side = index % 2 === 0 ? 1 : -1;

  const x = useTransform(d, (v) => (v < 0 ? v * PX : v * 14 * side));
  const y = useTransform(d, (v) => (v < 0 ? -v * 34 : v * 40));
  const scale = useTransform(d, (v) => (v < 0 ? 1 + v * 0.08 : Math.max(0.78, 1 - v * 0.05)));
  const rotate = useTransform(d, (v) => (v < 0 ? v * 17 : v * 2.4 * side));
  const rotateY = useTransform(d, (v) => (v < 0 ? v * 30 : 0));
  const opacity = useTransform(d, (v) =>
    v < 0 ? clamp01(1 + (v + 0.2) / 0.8) : clamp01(1 - (v - 2.2)),
  );
  const zIndex = useTransform(d, (v) => (v < 0 ? 60 : Math.round(50 - v * 10)));
  const display = useTransform(d, (v) => (v < -1.02 || v > 3.25 ? 'none' : 'block'));
  const pointerEvents = useTransform(d, (v) => (v < -0.6 ? 'none' : 'auto'));
  const dim = useTransform(d, (v) => Math.min(0.7, Math.max(0, v) * 0.24));

  // Mouse tilt on the front card
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rx = useSpring(tx, { stiffness: 200, damping: 20, mass: 0.5 });
  const ry = useSpring(ty, { stiffness: 200, damping: 20, mass: 0.5 });

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || Math.abs(d.get()) > 0.3) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    tx.set((0.5 - py) * 12);
    ty.set((px - 0.5) * 14);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };

  const onLeave = () => {
    tx.set(0);
    ty.set(0);
  };

  return (
    <motion.article
      aria-hidden={!active}
      aria-label={`${m.name}, ${m.fee} fee`}
      style={{
        x,
        y,
        scale,
        rotate,
        rotateY,
        opacity,
        zIndex,
        display,
        pointerEvents,
        transformPerspective: 1000,
        willChange: 'transform',
      }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={() => {
        if (!blockClick.current) onSelect(index);
      }}
      className="tilt-card group absolute inset-0 select-none"
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
        className="relative h-full w-full"
      >
        {/* photo */}
        <div className="absolute inset-0 overflow-hidden rounded-[28px] bg-[#070a0e] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.9)]">
          <Portrait m={m} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/85" />
        </div>

        {/* pointer glare */}
        <div className="card-glare pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* top row */}
        <span className="absolute left-5 top-5 font-mono text-xs text-white/65">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span
          className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-0 ${feeStyle(
            m.fee,
          )}`}
        >
          {m.fee} fee
        </span>

        {/* frosted info panel */}
        <div className="deck-info absolute inset-x-3 bottom-3 rounded-3xl p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate text-2xl font-semibold capitalize text-white">{m.name}</h3>
            <p className="truncate font-mono text-[13px] text-white/55">@{m.username}</p>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-2.5">
            <Stat label="Telegram vouches" value={m.telegram_vouches} />
            <Stat label="OGU vouches" value={m.ogu_vouches} />
          </dl>

          <a
            href={`https://t.me/${m.username}`}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={active ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              // a swipe that started on the button must not open Telegram
              if (blockClick.current) e.preventDefault();
            }}
            className="contact-btn relative mt-3 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold text-emerald-50 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
          >
            <Send className="relative z-10 h-4 w-4 shrink-0" />
            <span className="relative z-10 truncate">Contact @{m.username}</span>
          </a>
        </div>

        {/* darkens cards further back in the stack */}
        <motion.div
          style={{ opacity: dim }}
          className="pointer-events-none absolute inset-0 rounded-[28px] bg-black"
        />

        <div className="gradient-border pointer-events-none absolute inset-0 rounded-[28px]" />
      </motion.div>
    </motion.article>
  );
}

export default memo(MiddlemanCard);
