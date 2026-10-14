'use client';

import { useEffect, useRef } from 'react';
import { middlemen } from '@/data/middlemen';
import { trackVar } from '@/lib/scroll';

const NAMES = middlemen.map((m) => `${m.name} ${m.fee}`);
const PHRASES = ['Funds held safely', 'Verify the username', 'One group chat', 'Release on delivery', 'No rush, ever'];

function BandSet({ items }: { items: string[] }) {
  return (
    <div className="band__set">
      {items.map((t, i) => (
        <span key={i}>
          {t}
          <b aria-hidden="true">✦</b>
        </span>
      ))}
    </div>
  );
}

/** Two crossing marquee bands. The bands drift sideways as you scroll past, and loop on their own. */
export default function Ribbon() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    return trackVar(root.current, 'view');
  }, []);

  return (
    <section ref={root} className="ribbon" aria-hidden="true">
      <div className="band band--a">
        <div className="band__move band__move--a">
          <div className="band__track">
            <BandSet items={NAMES} />
            <BandSet items={NAMES} />
          </div>
        </div>
      </div>
      <div className="band band--b">
        <div className="band__move band__move--b">
          <div className="band__track band__track--rev">
            <BandSet items={PHRASES} />
            <BandSet items={PHRASES} />
          </div>
        </div>
      </div>
    </section>
  );
}
