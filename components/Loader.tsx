'use client';

import { useEffect, useRef } from 'react';
import { markReady, prefersReducedMotion } from '@/lib/app';
import { Lock } from './icons';

/**
 * Intro: a vault door that counts up, then swings open in 3D to reveal the page.
 * The count is cosmetic but never faster than the real load: it parks at 90% until the page and fonts are ready.
 * Failsafes: a timer force-opens it, and a CSS animation hides it even if JavaScript never runs.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const html = document.documentElement;
    const reduced = prefersReducedMotion();
    const MIN = reduced ? 400 : 1700; // shortest the intro will run (ms)
    const MAX = 6500; // longest we wait for the page before opening anyway

    html.classList.add('is-loading');

    let raf = 0;
    let opened = false;
    let pageReady = document.readyState === 'complete';
    let fontsReady = !document.fonts;
    const timers: number[] = [];
    const t0 = performance.now();

    const onLoad = () => {
      pageReady = true;
    };
    if (!pageReady) window.addEventListener('load', onLoad, { once: true });
    document.fonts?.ready.then(() => {
      fontsReady = true;
    });

    const open = () => {
      if (opened) return;
      opened = true;
      cancelAnimationFrame(raf);
      if (num.current) num.current.textContent = '100';
      if (bar.current) bar.current.style.transform = 'scaleX(1)';
      el.classList.add('is-open');
      // the page starts revealing while the doors are still swinging
      timers.push(
        window.setTimeout(
          () => {
            html.classList.remove('is-loading');
            markReady();
          },
          reduced ? 0 : 520,
        ),
      );
      timers.push(window.setTimeout(() => el.classList.add('is-gone'), reduced ? 450 : 1700));
    };

    const tick = (now: number) => {
      const t = now - t0;
      const loaded = pageReady && fontsReady;
      const lin = Math.min(1, t / MIN);
      const eased = 1 - Math.pow(1 - lin, 3);
      const cap = loaded || t > MAX ? 1 : 0.9;
      const p = Math.min(cap, eased);
      if (num.current) num.current.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (p >= 1) {
        timers.push(window.setTimeout(open, 180)); // a beat on 100
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    timers.push(window.setTimeout(open, 9000)); // hard failsafe

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('load', onLoad);
      html.classList.remove('is-loading');
    };
  }, []);

  return (
    <div ref={root} className="loader" aria-hidden="true">
      <div className="loader__door loader__door--l">
        <i />
      </div>
      <div className="loader__door loader__door--r">
        <i />
      </div>
      <div className="loader__core">
        <div className="loader__mark">
          <Lock width={26} height={26} />
        </div>
        <p className="loader__label">Escrow Vault</p>
        <p className="loader__count">
          <span ref={num}>000</span>
          <em>%</em>
        </p>
        <span className="loader__bar">
          <span ref={bar} />
        </span>
      </div>
    </div>
  );
}
