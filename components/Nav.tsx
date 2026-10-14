'use client';

import { useEffect, useRef, useState } from 'react';
import { v } from '@/lib/css';
import { subscribeScroll } from '@/lib/scroll';
import { ArrowUpRight, Lock } from './icons';

const LINKS = [
  { href: '#directory', id: 'directory', label: 'Directory' },
  { href: '#how', id: 'how', label: 'How it works' },
  { href: '#safety', id: 'safety', label: 'Safety' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const header = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const openRef = useRef(false);
  openRef.current = open;

  // hide on scroll down, show on scroll up, progress bar
  useEffect(() => {
    let lastY = window.scrollY;
    return subscribeScroll(() => {
      const el = header.current;
      if (!el) return;
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) > 6) {
        el.classList.toggle('is-hidden', dy > 0 && y > 220 && !openRef.current);
        lastY = y;
      }
      el.classList.toggle('is-scrolled', y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max).toFixed(4) : 0})`;
    });
  }, []);

  // which section is on screen
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    LINKS.forEach((l) => {
      const s = document.getElementById(l.id);
      if (s) io.observe(s);
    });
    return () => io.disconnect();
  }, []);

  // mobile menu: lock page scroll, close on Escape
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header ref={header} className="nav">
        <div className="nav__in">
          <a href="#top" className="brand" onClick={close} aria-label="Escrow Vault, back to top">
            <span className="brand__mark">
              <Lock width={16} height={16} />
            </span>
            <span className="brand__name">Escrow Vault</span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            {LINKS.map((l) => (
              <a key={l.id} href={l.href} className={active === l.id ? 'is-active' : undefined}>
                {l.label}
              </a>
            ))}
          </nav>

          <a href="#directory" className="btn btn--primary btn--sm nav__cta">
            Find a middleman
          </a>

          <button
            type="button"
            className={`burger${open ? ' is-open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((o) => !o)}
          >
            <i />
            <i />
          </button>
        </div>
        <span ref={bar} className="nav__bar" aria-hidden="true" />
      </header>

      <div id="menu" className={`menu${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <nav className="menu__nav" aria-label="Mobile">
          {LINKS.map((l, i) => (
            <a key={l.id} href={l.href} onClick={close} style={v({ '--i': i })}>
              <span>0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#directory" className="btn btn--primary btn--lg menu__cta" onClick={close}>
          Browse middlemen <ArrowUpRight width={20} height={20} />
        </a>
      </div>
    </>
  );
}
