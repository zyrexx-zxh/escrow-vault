/**
 * Shared, mutable state read by the 3D scene every frame.
 * Plain object (not React state) so scrolling/swiping never triggers re-renders.
 *  - progress: page scroll, 0 → 1 (written by GSAP ScrollTrigger)
 *  - deck:     current position of the swipe deck, in cards (written by Deck)
 */
export const scrollState = { progress: 0, deck: 0 };
