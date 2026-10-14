const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+';

/**
 * Scrambles `el` and resolves it letter by letter into `finalText`.
 * Returns a cancel function that snaps straight to the final text.
 */
export function decodeText(el: HTMLElement, finalText: string, duration = 520): () => void {
  let raf = 0;
  const start = performance.now();
  const len = finalText.length;

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const reveal = Math.floor(t * len);
    let out = '';
    for (let i = 0; i < len; i++) {
      const ch = finalText[i];
      out += i < reveal || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = t < 1 ? out : finalText;
    if (t < 1) raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    el.textContent = finalText;
  };
}
