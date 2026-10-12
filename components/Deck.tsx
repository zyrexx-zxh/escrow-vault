'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  type PanInfo,
} from 'framer-motion';
import { middlemen } from '@/data/middlemen';
import { PX, mod, wrapDelta } from '@/lib/deck';
import { scrollState } from '@/lib/scrollState';
import MiddlemanCard from './MiddlemanCard';
import { ArrowLeft, ArrowRight } from './icons';

const N = middlemen.length;

/**
 * Swipe deck.
 * One number (`pos`, in cards) drives everything: dragging changes it directly, releasing springs
 * it to the nearest card with the flick velocity. Each card derives its position, tilt, scale and
 * fade from `pos`, so every frame of a swipe is continuous and fully interruptible.
 */
export default function Deck() {
  const pos = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  const blockClick = useRef(false);
  const startPos = useRef(0);
  const anim = useRef<ReturnType<typeof animate> | null>(null);
  const wheelAt = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.6 });

  // keep the 3D scene and the UI in sync with the deck
  useMotionValueEvent(pos, 'change', (v) => {
    scrollState.deck = v;
    setActive(mod(Math.round(v), N));
  });

  useEffect(() => {
    return () => {
      scrollState.deck = 0;
    };
  }, []);

  const goTo = useCallback(
    (target: number, velocity = 0) => {
      anim.current?.stop();
      anim.current = animate(pos, target, {
        type: 'spring',
        stiffness: 170,
        damping: 22,
        mass: 0.9,
        velocity,
      });
    },
    [pos],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      setTouched(true);
      goTo(Math.round(pos.get()) + dir);
    },
    [goTo, pos],
  );

  const select = useCallback(
    (index: number) => {
      const cur = Math.round(pos.get());
      const delta = wrapDelta(index - cur, N);
      if (delta === 0) return;
      setTouched(true);
      goTo(cur + delta);
    },
    [goTo, pos],
  );

  // One small nudge the first time the deck scrolls into view, so people know it moves
  useEffect(() => {
    if (!inView) return;
    anim.current = animate(pos, [0, 0.2, 0], { duration: 1.5, ease: 'easeInOut', delay: 0.5 });
    return () => anim.current?.stop();
  }, [inView, pos]);

  const onPanStart = () => {
    anim.current?.stop();
    startPos.current = pos.get();
    blockClick.current = false;
    setTouched(true);
  };

  const onPan = (_e: unknown, info: PanInfo) => {
    pos.set(startPos.current - info.offset.x / PX);
    if (Math.abs(info.offset.x) > 6) blockClick.current = true;
  };

  const onPanEnd = (_e: unknown, info: PanInfo) => {
    const start = Math.round(startPos.current);
    const vx = info.velocity.x;
    // project the flick forward a little, so a fast swipe can carry past the next card
    let target = Math.round(pos.get() - (vx / PX) * 0.25);
    if (target === start && Math.abs(info.offset.x) > 60) {
      target = start + (info.offset.x < 0 ? 1 : -1);
    }
    target = Math.max(start - 3, Math.min(start + 3, target));
    goTo(target, -vx / PX);
    window.setTimeout(() => {
      blockClick.current = false;
    }, 60);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    }
  };

  // Horizontal trackpad scroll also flips cards
  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 24) {
      const now = performance.now();
      if (now - wheelAt.current > 500) {
        wheelAt.current = now;
        step(e.deltaX > 0 ? 1 : -1);
      }
    }
  };

  // keep the active pill centred in the rail (horizontal only, never scrolls the page)
  useEffect(() => {
    const rail = railRef.current;
    const el = rail?.children[active] as HTMLElement | undefined;
    if (!rail || !el) return;
    rail.scrollTo({
      left: el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2,
      behavior: 'smooth',
    });
  }, [active]);

  const current = middlemen[active];

  return (
    <div className="mt-12">
      <motion.div
        ref={wrapRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Middlemen. Swipe, drag, or use the arrow keys."
        tabIndex={0}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
        style={{ touchAction: 'pan-y' }}
        className="relative mx-auto h-[min(68svh,540px)] min-h-[470px] w-[min(84vw,360px)] cursor-grab select-none overscroll-x-contain outline-none active:cursor-grabbing"
      >
        {middlemen.map((m, i) => (
          <MiddlemanCard
            key={m.username}
            m={m}
            index={i}
            total={N}
            pos={pos}
            active={i === active}
            blockClick={blockClick}
            onSelect={select}
          />
        ))}
      </motion.div>

      {/* controls */}
      <div className="mx-auto mt-24 flex max-w-sm items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous middleman"
          className="glass-lite flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="text-center" aria-live="polite">
          <p className="font-mono text-sm tabular-nums text-white">
            {String(active + 1).padStart(2, '0')}
            <span className="text-white/40"> / {String(N).padStart(2, '0')}</span>
          </p>
          <p className="mt-1 flex h-4 items-center justify-center gap-1.5 text-[11px] tracking-[0.2em] text-white/45">
            {touched ? (
              <span className="uppercase">{current.name}</span>
            ) : (
              <>
                <span>SWIPE</span>
                <ArrowRight className="h-3 w-3 animate-nudge" />
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next middleman"
          className="glass-lite flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* quick jump rail */}
      <div
        ref={railRef}
        className="no-scrollbar relative mx-auto mt-8 flex max-w-2xl gap-2 overflow-x-auto px-2 py-1"
      >
        {middlemen.map((m, i) => (
          <button
            key={m.username}
            type="button"
            onClick={() => select(i)}
            aria-current={i === active}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium capitalize transition ${
              i === active
                ? 'bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/40'
                : 'text-white/55 hover:bg-white/10 hover:text-white'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
}
