'use client';

import { useEffect, useRef } from 'react';
import { v } from '@/lib/css';
import { trackVar } from '@/lib/scroll';
import Lines from './Lines';
import { Ban, Check, Clock, Package, Search, Shield, Users } from './icons';

const CHECKS = [
  {
    icon: Search,
    title: 'Verify the username',
    text: 'Match the @username against this directory before you send a single message. Impersonators copy names and photos.',
  },
  {
    icon: Users,
    title: 'Keep everyone in one group',
    text: 'Buyer, seller and middleman talk in the same chat. Be wary of anyone who wants to move the deal into private messages.',
  },
  {
    icon: Ban,
    title: 'Never pay around the middleman',
    text: 'Funds go to the middleman and nowhere else. A seller asking for a direct payment "to speed things up" is a red flag.',
  },
  {
    icon: Package,
    title: 'Check before you release',
    text: 'Test the item or access properly. Only confirm delivery once you are completely satisfied it is what you agreed.',
  },
  {
    icon: Clock,
    title: 'Ignore the pressure',
    text: 'Urgency, countdowns and "someone else is waiting" are how scams work. A real deal can wait while you double-check.',
  },
];

export default function Safety() {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!list.current) return;
    return trackVar(list.current, 'view');
  }, []);

  return (
    <section id="safety" className="safety">
      <div className="wrap safety__grid">
        <div className="safety__intro">
          <p className="eyebrow" data-reveal="up">
            03 &mdash; Trading safety
          </p>
          <h2 className="h2">
            <Lines lines={['Protect', 'your trade.']} accent={1} />
          </h2>
          <p className="lead" data-reveal="up" style={v({ '--d': 160 })}>
            Five quick checks that stop almost every scam. They take a minute and cost nothing.
          </p>

          <aside className="callout" data-reveal="up" style={v({ '--d': 240 })}>
            <span className="callout__icon">
              <Shield width={22} height={22} />
            </span>
            <p>
              <b>Rule of thumb:</b> if a deal feels rushed, slow it down. A genuine middleman never needs you to hurry and
              never asks for your passwords or login codes.
            </p>
          </aside>
        </div>

        <ol ref={list} className="checks">
          {CHECKS.map((c, i) => (
            <li key={c.title} className="check" data-reveal="check" style={v({ '--d': 60 + i * 40 })}>
              <span className="check__node">
                <Check width={22} height={22} strokeWidth={2.2} />
              </span>
              <div className="check__body">
                <p className="check__kicker">
                  <c.icon width={14} height={14} /> Check 0{i + 1}
                </p>
                <h3 className="check__title">{c.title}</h3>
                <p className="check__text">{c.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
