import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const base = (p: P): P => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  ...p,
});

export const ArrowUpRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export const ArrowRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const ChevronLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="m15 5-7 7 7 7" />
  </svg>
);

export const ChevronRight = (p: P) => (
  <svg {...base(p)}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

/** `className="draw"` on the path lets CSS animate it drawing in. */
export const Check = (p: P) => (
  <svg {...base(p)}>
    <path className="draw" pathLength={1} d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const Shield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-3Z" />
    <path d="m9 12 2.2 2.2L15.5 9.8" />
  </svg>
);

export const Lock = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <path d="M12 14.5v2" />
  </svg>
);

export const Plane = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 4 3 11l6 2.5L11.5 20 21 4Z" />
    <path d="m9 13.5 5-4" />
  </svg>
);

export const Search = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4-4" />
  </svg>
);

export const Users = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="9" r="3.2" />
    <path d="M3.5 19c.6-3 2.7-4.7 5.5-4.7s4.9 1.7 5.5 4.7" />
    <path d="M16 6.2a3 3 0 0 1 0 5.6" />
    <path d="M17.5 14.6c1.7.5 2.7 2 3 4.4" />
  </svg>
);

export const Ban = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m6 6 12 12" />
  </svg>
);

export const Package = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2L12 3Z" />
    <path d="m4 7.2 8 4.3 8-4.3" />
    <path d="M12 11.5V21" />
  </svg>
);

export const Clock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const Handshake = (p: P) => (
  <svg {...base(p)}>
    <path d="m3 11 4-4 4 1 3-1 4 3 3 3" />
    <path d="m21 14-5 5-3-2-3 2-4-3-3-3" />
    <path d="m10 14 2 2" />
  </svg>
);
