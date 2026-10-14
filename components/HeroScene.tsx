'use client';

import { useEffect, useRef } from 'react';
import { middlemen, parseCount } from '@/data/middlemen';
import { canHover, prefersReducedMotion } from '@/lib/app';
import { v } from '@/lib/css';
import { trackVar } from '@/lib/scroll';
import Portrait from './Portrait';

// the three most-vouched middlemen, front card first
const TOP = [...middlemen].sort((a, b) => parseCount(b.telegram_vouches) - parseCount(a.telegram_vouches)).slice(0, 3);
const SLOTS = ['b', 'a', 'c'] as const;

/**
 * The hero's 3D stage: three cards floating in CSS perspective over a grid floor.
 * It follows the pointer (desktop) with a smoothed tilt and drifts back as the hero scrolls away.
 * Pure CSS 3D with transform/opacity only, no canvas, so there is nothing to flicker.
 */
export default function HeroScene() {
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scene.current;
    if (!el) return;

    const hero = el.closest<HTMLElement>('.hero');
    const offScroll = hero ? trackVar(hero, 'exit') : () => {};

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 2.4));
      ty = Math.max(-1, Math.min(1, ((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 2.4));
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty('--px', cx.toFixed(4));
      el.style.setProperty('--py', cy.toFixed(4));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
    };

    const live = canHover() && !prefersReducedMotion();
    if (live) window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      offScroll();
      cancelAnimationFrame(raf);
      if (live) window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div ref={scene} className="scene" data-reveal="scene" aria-hidden="true">
      <div className="scene__glow" />
      <div className="scene__floor">
        <div className="scene__grid" />
      </div>
      <div className="scene__rig">
        {TOP.map((m, i) => (
          <div key={m.name} className={`hc hc--${SLOTS[i]}`} style={v({ '--i': i })}>
            <div className="hc__in">
              <div className="hc__fl">
                <div className="hc__photo">
                  <Portrait name={m.name} />
                  <span className="hc__fee">{m.fee} fee</span>
                </div>
                <div className="hc__body">
                  <p className="hc__name">{m.name}</p>
                  <p className="hc__user">@{m.username}</p>
                  <p className="hc__stat">
                    <b>{m.telegram_vouches}</b> Telegram vouches
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
