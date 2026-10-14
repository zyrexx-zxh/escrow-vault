/**
 * One shared scroll/resize listener, coalesced to one callback per animation frame.
 * Components read a progress number (0..1) for an element and write it to a CSS variable;
 * all the actual motion lives in CSS (transform / opacity only), so scrolling stays on the compositor's good side.
 */

export type TrackMode =
  | 'view' //   0 when the element's top enters the bottom of the screen, 1 when its bottom leaves the top
  | 'sticky' // 0 when the element's top reaches the top of the screen, 1 when its bottom reaches the bottom
  | 'exit' //   0 while the element sits at the top of the page, 1 once it has scrolled fully away
  | 'reveal'; // 0 when the element's top enters the bottom of the screen, 1 when it is fully in view

type Sub = (vh: number) => void;

const subs = new Set<Sub>();
let queued = false;
let bound = false;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

function run(): void {
  queued = false;
  const vh = window.innerHeight;
  subs.forEach((s) => s(vh));
}

function queue(): void {
  if (queued) return;
  queued = true;
  requestAnimationFrame(run);
}

export function subscribeScroll(sub: Sub): () => void {
  subs.add(sub);
  if (!bound) {
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    bound = true;
  }
  sub(window.innerHeight);
  return () => {
    subs.delete(sub);
  };
}

export function progressOf(el: Element, mode: TrackMode, vh: number): number {
  const r = el.getBoundingClientRect();
  switch (mode) {
    case 'sticky': {
      const span = r.height - vh;
      return span > 0 ? clamp01(-r.top / span) : clamp01((vh - r.top) / (vh + r.height));
    }
    case 'exit':
      return clamp01(-r.top / Math.max(1, r.height));
    case 'reveal':
      return clamp01((vh - r.top) / Math.max(1, r.height));
    default:
      return clamp01((vh - r.top) / (vh + r.height));
  }
}

/** Keeps `el`'s CSS variable `name` in sync with its scroll progress. Returns an unsubscribe. */
export function trackVar(el: HTMLElement, mode: TrackMode, name = '--p'): () => void {
  let last = -1;
  return subscribeScroll((vh) => {
    const p = Math.round(progressOf(el, mode, vh) * 1000) / 1000;
    if (p !== last) {
      last = p;
      el.style.setProperty(name, String(p));
    }
  });
}
