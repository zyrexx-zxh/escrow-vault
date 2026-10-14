'use client';

import { useEffect, useRef } from 'react';
import { v } from '@/lib/css';
import { subscribeScroll, progressOf } from '@/lib/scroll';

const WORD = 'ESCROW'.split('');

/**
 * The footer is fixed to the bottom of the screen and sits *behind* the page. The page ends with rounded
 * corners and scrolls up like a curtain to uncover it, and the big word flips up as it is revealed.
 */
export default function Footer() {
  const spacer = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLElement>(null);

  useEffect(() => {
    let last = -1;
    return subscribeScroll((vh) => {
      if (!spacer.current || !foot.current) return;
      const p = Math.round(progressOf(spacer.current, 'reveal', vh) * 1000) / 1000;
      if (p !== last) {
        last = p;
        foot.current.style.setProperty('--fp', String(p));
      }
    });
  }, []);

  return (
    <>
      <div ref={spacer} className="footer-spacer" aria-hidden="true" />
      <footer ref={foot} className="footer">
        <div className="footer__main wrap">
          <p className="footer__word" aria-hidden="true">
            {WORD.map((c, i) => (
              <span key={i} style={v({ '--i': i })}>
                {c}
              </span>
            ))}
          </p>

          <div className="footer__cols">
            <p className="footer__tag">Browse verified middlemen. Trade with a neutral third party holding the funds.</p>
            <nav className="footer__nav" aria-label="Footer">
              <a href="#directory">Directory</a>
              <a href="#how">How it works</a>
              <a href="#safety">Trading safety</a>
              <a href="#top">Back to top</a>
            </nav>
          </div>
        </div>

        <div className="footer__base wrap">
          <p className="footer__legal">
            Escrow Vault is an independent community directory. It is not affiliated with OGUsers or Telegram. Vouch counts
            and fees are reported by each middleman and can change, so always confirm the username and the terms before you
            send anything. Nothing here is financial or legal advice.
          </p>
          <p className="footer__credit">
            <a href="https://t.me/claxen" target="_blank" rel="noopener noreferrer">
              Designed By @claxen
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
