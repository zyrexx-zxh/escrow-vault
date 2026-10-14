'use client';

import { useEffect, useRef } from 'react';
import { canHover, prefersReducedMotion } from '@/lib/app';
import { v } from '@/lib/css';
import { trackVar } from '@/lib/scroll';
import { ArrowRight } from './icons';
import Lines from './Lines';

const RINGS = [0, 1, 2, 3, 4];

/** The closing section: tilted rings that turn as you scroll, and a call-to-action that leans toward the pointer. */
export default function Finale() {
  const section = useRef<HTMLElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = section.current;
    const btn = cta.current;
    if (!el) return;
    const off = trackVar(el, 'view');

    let onMove: ((e: PointerEvent) => void) | null = null;
    let onLeave: (() => void) | null = null;
    if (btn && canHover() && !prefersReducedMotion()) {
      onMove = (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) > 190) {
          onLeave?.();
          return;
        }
        btn.style.setProperty('--tx', `${(dx * 0.22).toFixed(1)}px`);
        btn.style.setProperty('--ty', `${(dy * 0.3).toFixed(1)}px`);
      };
      onLeave = () => {
        btn.style.setProperty('--tx', '0px');
        btn.style.setProperty('--ty', '0px');
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
    }

    return () => {
      off();
      if (onMove) el.removeEventListener('pointermove', onMove);
      if (onLeave) el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section ref={section} className="finale">
      <div className="finale__rings" aria-hidden="true">
        {RINGS.map((k) => (
          <i key={k} style={v({ '--k': k, '--dir': k % 2 ? -1 : 1 })} />
        ))}
      </div>

      <div className="wrap finale__in">
        <p className="eyebrow" data-reveal="up">
          04 &mdash; Ready when you are
        </p>
        <h2 className="finale__title">
          <Lines lines={['Trade with', 'confidence.']} accent={1} />
        </h2>
        <p className="lead finale__lead" data-reveal="up" style={v({ '--d': 160 })}>
          Pick a middleman, verify the username, and let a neutral third party hold the funds.
        </p>
        <div data-reveal="up" style={v({ '--d': 260 })}>
          <a ref={cta} href="#directory" className="btn btn--primary btn--xl magnet">
            <span>Browse middlemen</span>
            <ArrowRight width={22} height={22} />
          </a>
        </div>
      </div>
    </section>
  );
}
