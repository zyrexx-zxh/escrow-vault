'use client';

import { useEffect } from 'react';
import { prefersReducedMotion, whenReady } from '@/lib/app';

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function countUp(el: HTMLElement): void {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target)) return;
  const suffix = el.dataset.suffix ?? '';
  const t0 = performance.now();
  const D = 1500;
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / D);
    el.textContent = Math.round(target * easeOutExpo(t)).toLocaleString('en-US') + suffix;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * Scroll-triggered reveals. Anything marked [data-reveal] fades/rises in when it enters the viewport;
 * [data-count] numbers count up. Hidden "before" states only exist once this has run (html.fx), so with
 * JavaScript off, or reduced motion on, every piece of content simply shows.
 * Elements already on screen wait for the loader to open before they play.
 */
export default function ScrollFX() {
  useEffect(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    const html = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));

    counters.forEach((c) => {
      c.textContent = '0' + (c.dataset.suffix ?? '');
    });
    html.classList.add('fx');

    let loaderDone = false;
    const waiting: HTMLElement[] = [];

    const show = (el: HTMLElement) => {
      el.classList.add('is-in');
      if (el.matches('[data-count]')) countUp(el);
      el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          if (loaderDone) show(e.target as HTMLElement);
          else waiting.push(e.target as HTMLElement);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));

    const off = whenReady(() => {
      loaderDone = true;
      waiting.splice(0).forEach(show);
    });

    return () => {
      io.disconnect();
      off();
    };
  }, []);

  return null;
}
