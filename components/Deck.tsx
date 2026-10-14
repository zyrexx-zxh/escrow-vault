'use client';

import { useEffect, useRef } from 'react';
import type { Middleman } from '@/data/middlemen';
import { canHover, prefersReducedMotion } from '@/lib/app';
import { decodeText } from '@/lib/decode';
import { SwipeEngine } from '@/lib/swipeEngine';
import { ChevronLeft, ChevronRight } from './icons';
import MiddlemanCard from './MiddlemanCard';

const pad = (n: number) => String(n).padStart(2, '0');
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * The swipeable deck. React renders the markup once; the SwipeEngine owns every card's position afterwards,
 * and this component only mirrors the active index into the counter, the ghost name, the ticks and the
 * buttons by writing to the DOM directly (so dragging never triggers a React re-render).
 */
export default function Deck({ items }: { items: Middleman[] }) {
  const root = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const curRef = useRef<HTMLElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const engineRef = useRef<SwipeEngine | null>(null);

  useEffect(() => {
    const rootEl = root.current;
    const stage = stageRef.current;
    if (!rootEl || !stage) return;

    const cards = Array.from(stage.querySelectorAll<HTMLElement>('[data-card]'));
    const ticks = Array.from(rootEl.querySelectorAll<HTMLElement>('[data-tick]'));
    const n = cards.length;
    const reduced = prefersReducedMotion();

    let cancelDecode: (() => void) | null = null;
    let chosenTimer = 0;
    let dealRaf = 0;

    /* ───────── mirror the active index into the UI ───────── */
    const apply = (idx: number, animate: boolean) => {
      if (curRef.current) {
        curRef.current.textContent = pad(idx + 1);
        if (animate && !reduced) {
          curRef.current.classList.remove('bump');
          void curRef.current.offsetWidth; // restart the CSS animation
          curRef.current.classList.add('bump');
        }
      }
      if (prevRef.current) prevRef.current.disabled = idx === 0;
      if (nextRef.current) nextRef.current.disabled = idx === n - 1;

      ticks.forEach((t, i) => {
        t.classList.toggle('is-active', i === idx);
        if (i === idx) t.setAttribute('aria-current', 'true');
        else t.removeAttribute('aria-current');
      });

      cards.forEach((c, i) => {
        const on = i === idx;
        c.setAttribute('aria-hidden', on ? 'false' : 'true');
        c.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', on ? '0' : '-1'));
      });

      if (ghostRef.current) {
        cancelDecode?.();
        cancelDecode = null;
        const label = items[idx].name.toUpperCase();
        if (animate && !reduced) cancelDecode = decodeText(ghostRef.current, label, 460);
        else ghostRef.current.textContent = label;
      }
    };

    const clearChosen = () => {
      window.clearTimeout(chosenTimer);
      stage.classList.remove('is-choosing');
      stage.querySelectorAll<HTMLElement>('.mm.is-chosen').forEach((c) => {
        c.classList.remove('is-chosen');
        const label = c.querySelector<HTMLElement>('.mm__cta-label');
        if (label?.dataset.label) label.textContent = label.dataset.label;
      });
    };

    /* ───────── engine ───────── */
    const engine = new SwipeEngine({
      stage,
      cards,
      onIndex: (idx) => {
        clearChosen();
        apply(idx, true);
      },
      onSettle: (idx) => {
        if (liveRef.current) liveRef.current.textContent = `${items[idx].name}, ${idx + 1} of ${n}`;
      },
    });
    engineRef.current = engine;
    apply(0, false);

    /* ───────── intro: the stacked deck deals out when it scrolls into view ───────── */
    let io: IntersectionObserver | null = null;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      engine.setSpread(1);
    } else {
      engine.setSpread(0);
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io?.disconnect();
          const t0 = performance.now();
          const D = 1150;
          const step = (now: number) => {
            const t = Math.min(1, (now - t0) / D);
            engine.setSpread(easeOutCubic(t));
            if (t < 1) dealRaf = requestAnimationFrame(step);
          };
          dealRaf = requestAnimationFrame(step);
        },
        { threshold: 0.25 },
      );
      io.observe(stage);
    }

    /* ───────── choose + focus (event delegation) ───────── */
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest<HTMLElement>('[data-card]');
      if (!card) return;
      const idx = Number(card.dataset.index);

      if (idx !== engine.getIndex()) {
        // a neighbouring card: bring it to the front instead of following its link
        e.preventDefault();
        engine.goTo(idx);
        return;
      }

      if (target.closest('a[data-contact]')) {
        // the link still opens Telegram; we only add the "locked in" moment around it
        clearChosen();
        card.classList.add('is-chosen');
        stage.classList.add('is-choosing');
        const label = card.querySelector<HTMLElement>('.mm__cta-label');
        if (label) label.textContent = 'Opening Telegram…';
        if ('vibrate' in navigator) navigator.vibrate(18);
        chosenTimer = window.setTimeout(clearChosen, 2300);
      }
    };
    stage.addEventListener('click', onClick);

    /* ───────── desktop tilt + glare on the front card ───────── */
    let onMove: ((e: PointerEvent) => void) | null = null;
    let onLeave: (() => void) | null = null;
    if (canHover() && !reduced) {
      const reset = () => {
        stage.querySelectorAll<HTMLElement>('.mm__inner').forEach((el) => {
          el.style.removeProperty('--rx');
          el.style.removeProperty('--ry');
        });
      };
      onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || stage.classList.contains('is-dragging')) return;
        const inner = stage.querySelector<HTMLElement>('.mm.is-active .mm__inner');
        if (!inner) return;
        const r = inner.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        if (px < 0 || px > 1 || py < 0 || py > 1) {
          reset();
          return;
        }
        inner.style.setProperty('--rx', `${((0.5 - py) * 9).toFixed(2)}deg`);
        inner.style.setProperty('--ry', `${((px - 0.5) * 11).toFixed(2)}deg`);
        inner.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        inner.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      };
      onLeave = reset;
      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerleave', onLeave);
    }

    return () => {
      window.clearTimeout(chosenTimer);
      cancelAnimationFrame(dealRaf);
      cancelDecode?.();
      io?.disconnect();
      stage.removeEventListener('click', onClick);
      if (onMove) stage.removeEventListener('pointermove', onMove);
      if (onLeave) stage.removeEventListener('pointerleave', onLeave);
      engine.destroy();
      engineRef.current = null;
    };
  }, [items]);

  return (
    <div ref={root} className="deck" data-reveal="fade">
      <div className="deck__ghost" aria-hidden="true">
        <span ref={ghostRef}>{items[0].name.toUpperCase()}</span>
      </div>

      <div
        ref={stageRef}
        className="deck__stage"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Verified middlemen. Use the left and right arrow keys, or swipe, to browse."
      >
        {items.map((m, i) => (
          <MiddlemanCard key={m.name + m.username} m={m} index={i} total={items.length} />
        ))}
      </div>

      <div className="deck__ui">
        <button
          ref={prevRef}
          type="button"
          className="deck__btn"
          aria-label="Previous middleman"
          onClick={() => engineRef.current?.prev()}
        >
          <ChevronLeft width={22} height={22} />
        </button>
        <p className="deck__count" aria-hidden="true">
          <b ref={curRef}>01</b>
          <span>/ {pad(items.length)}</span>
        </p>
        <button
          ref={nextRef}
          type="button"
          className="deck__btn"
          aria-label="Next middleman"
          onClick={() => engineRef.current?.next()}
        >
          <ChevronRight width={22} height={22} />
        </button>
      </div>

      <div className="deck__ticks">
        {items.map((m, i) => (
          <button
            key={m.name + m.username}
            type="button"
            data-tick
            className="tick"
            aria-label={`Go to ${m.name}`}
            onClick={() => engineRef.current?.goTo(i)}
          >
            <i />
          </button>
        ))}
      </div>

      <p className="deck__hint" aria-hidden="true">
        Swipe or drag the cards
      </p>
      <p ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
}
