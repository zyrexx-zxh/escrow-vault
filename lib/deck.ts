/** Pixels of finger/mouse travel that equal one card. */
export const PX = 380;

export function mod(v: number, n: number): number {
  return ((v % n) + n) % n;
}

/** Shortest signed distance on a loop of n items, in the range (-n/2, n/2]. */
export function wrapDelta(v: number, n: number): number {
  let r = mod(v, n);
  if (r > n / 2) r -= n;
  return r;
}

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}
