'use client';

import { useEffect, useRef } from 'react';
import { v } from '@/lib/css';
import { subscribeScroll } from '@/lib/scroll';
import Lines from './Lines';
import { Handshake, Lock, Package, Search, Shield } from './icons';

const STEPS = [
  {
    icon: Search,
    title: 'Pick a middleman',
    text: 'Browse the directory and compare fees and vouch history. Choose someone whose track record fits the size of your deal.',
    tag: 'Compare fees and vouches',
  },
  {
    icon: Handshake,
    title: 'Agree the terms',
    text: 'Open the middleman on Telegram, check that the username matches this page, and settle the price, the item and who covers the fee.',
    tag: 'Everyone in one group chat',
  },
  {
    icon: Lock,
    title: 'Funds are held',
    text: 'The buyer pays the middleman, never the seller directly. The middleman confirms the payment has arrived before anything moves.',
    tag: 'Buyer pays the middleman',
  },
  {
    icon: Package,
    title: 'Deliver, then release',
    text: 'The seller hands over the goods or access. Once the buyer has checked everything works, the middleman releases the funds.',
    tag: 'Release only after checking',
  },
];

/** Four cards that stack on top of each other as you scroll; each one shrinks and darkens as the next covers it. */
export default function HowItWorks() {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const steps = Array.from(ol.querySelectorAll<HTMLElement>('.step'));
    const last: number[] = steps.map(() => -1);

    return subscribeScroll(() => {
      steps.forEach((el, i) => {
        const next = steps[i + 1];
        let cover = 0;
        if (next) {
          const a = el.getBoundingClientRect();
          const b = next.getBoundingClientRect();
          // 0 while the next card is a full card away, 1 once it is lying on top of this one
          cover = Math.max(0, Math.min(1, 1 - (b.top - a.top - 14) / Math.max(1, a.height * 0.85)));
        }
        const q = Math.round(cover * 1000) / 1000;
        if (q !== last[i]) {
          last[i] = q;
          el.style.setProperty('--cover', String(q));
        }
      });
    });
  }, []);

  return (
    <section id="how" className="how">
      <div className="wrap how__grid">
        <div className="how__intro">
          <p className="eyebrow" data-reveal="up">
            02 &mdash; How it works
          </p>
          <h2 className="h2">
            <Lines lines={['Four steps.', 'No guesswork.']} accent={1} />
          </h2>
          <p className="lead" data-reveal="up" style={v({ '--d': 160 })}>
            A middleman is a neutral third party who holds the money while the deal happens, so neither side has to trust
            the other blindly.
          </p>

          <aside className="note" data-reveal="up" style={v({ '--d': 240 })}>
            <span className="note__icon">
              <Shield width={22} height={22} />
            </span>
            <p>
              Middlemen here are community-vetted, but every trade is still your responsibility. Take a minute to read the
              safety tips before you send anything.
            </p>
            <a href="#safety" className="btn btn--ghost btn--sm">
              Trading safety tips
            </a>
          </aside>
        </div>

        <ol ref={list} className="how__stack">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step" style={v({ '--i': i })}>
              <div className="step__card">
                <span className="step__no" aria-hidden="true">
                  0{i + 1}
                </span>
                <span className="step__icon">
                  <s.icon width={24} height={24} />
                </span>
                <p className="step__kicker">Step 0{i + 1}</p>
                <h3 className="step__title">{s.title}</h3>
                <p className="step__text">{s.text}</p>
                <p className="step__tag">{s.tag}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
