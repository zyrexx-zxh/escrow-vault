'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollState } from '@/lib/scrollState';

/**
 * Maps page scroll to scrollState.progress (0 → 1). The 3D camera smooths it per frame,
 * so no extra scrub smoothing is needed here.
 */
export default function ScrollDriver() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // The mobile address bar collapsing fires resize events; without this the page re-measures
    // and the camera visibly jumps.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const ctx = gsap.context(() => {
      gsap.to(scrollState, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    const timer = window.setTimeout(refresh, 800);
    window.addEventListener('load', refresh);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, []);

  return null;
}
