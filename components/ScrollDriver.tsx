'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollState } from '@/lib/scrollState';

/**
 * Tweens scrollState.progress from 0 → 1 over the full page scroll.
 * `scrub` makes GSAP ease toward the scroll position, which gives the camera its silky feel.
 */
export default function ScrollDriver() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // gsap.context collects the tween + ScrollTrigger so one revert() cleans up both
    const ctx = gsap.context(() => {
      gsap.to(scrollState, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
      });
    });

    // Page height changes as cards settle, so re-measure a little later and on load.
    const refresh = () => ScrollTrigger.refresh();
    const timer = window.setTimeout(refresh, 600);
    window.addEventListener('load', refresh);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, []);

  return null;
}
