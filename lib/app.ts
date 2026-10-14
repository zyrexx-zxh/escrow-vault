/**
 * Tiny coordination so the hero intro waits for the loader to open.
 * (Plain module state, not React state, so nothing re-renders.)
 */
type Cb = () => void;

let ready = false;
const waiting: Cb[] = [];

export function markReady(): void {
  if (ready) return;
  ready = true;
  waiting.splice(0).forEach((cb) => cb());
}

/** Runs cb once the loader has opened (immediately if it already has). Returns an unsubscribe. */
export function whenReady(cb: Cb): () => void {
  if (ready) {
    cb();
    return () => {};
  }
  waiting.push(cb);
  return () => {
    const i = waiting.indexOf(cb);
    if (i >= 0) waiting.splice(i, 1);
  };
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function canHover(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}
