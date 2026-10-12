/**
 * Shared, mutable scroll progress (0 → 1 across the whole page).
 * GSAP ScrollTrigger writes to it; the R3F camera rig reads it every frame.
 * A plain object (not React state) so scrolling never triggers re-renders.
 */
export const scrollState = { progress: 0 };
