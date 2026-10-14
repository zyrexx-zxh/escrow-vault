'use client';

import { useEffect, useRef, useState } from 'react';
import { v } from '@/lib/css';

/** Tried in order: public/middlemen/<name>.jpg, .jpeg, .png, .webp, then a tinted placeholder. */
const EXTS = ['jpg', 'jpeg', 'png', 'webp'] as const;

function hueOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

export default function Portrait({ name }: { name: string }) {
  const key = name.trim().toLowerCase();
  const [ext, setExt] = useState(0);
  const img = useRef<HTMLImageElement>(null);

  // If the image already failed (or finished) before React attached its handlers, catch up here.
  useEffect(() => {
    const el = img.current;
    if (!el || !el.complete) return;
    if (el.naturalWidth > 0) el.classList.add('is-loaded');
    else setExt((e) => (e === 0 ? 1 : e));
  }, []);

  const failed = ext >= EXTS.length;

  return (
    <div className="portrait" style={v({ '--h': hueOf(key) })}>
      <div className="portrait__ph" aria-hidden="true">
        <span>{key.charAt(0).toUpperCase()}</span>
      </div>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={img}
          key={ext}
          className="portrait__img"
          src={`/middlemen/${encodeURIComponent(key)}.${EXTS[ext]}`}
          alt={`${name} profile photo`}
          draggable={false}
          decoding="async"
          onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
          onError={() => setExt((e) => e + 1)}
        />
      )}
    </div>
  );
}
