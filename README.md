# Escrow Vault — immersive 3D middleman directory

Next.js 14 (App Router) · Tailwind CSS · React Three Fiber · GSAP ScrollTrigger · Framer Motion

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build: `npm run build && npm start` (Node 18.17+, 20+ recommended).

## Profile photos

Drop the photos into `public/middlemen/`, named after the middleman's **name** in lower-case:
`fame.jpg`, `beam.jpg`, `top.jpg`, `scholar.jpg` … (see `public/middlemen/README.txt` for the full list).
`.jpg` is tried first, then `.jpeg`, `.png`, `.webp`. A missing file shows a tinted placeholder.

## What's inside

| Path | What it does |
| --- | --- |
| `components/Scene.tsx` | Light R3F scene: dark-metal vault, two rings, glow, dust. Camera orbits on scroll. Auto-lowers quality on slow devices |
| `components/ScrollDriver.tsx` | GSAP ScrollTrigger writes page scroll progress for the camera |
| `components/Deck.tsx` | The swipe deck: drag / swipe / arrow keys / buttons / trackpad / quick-jump rail |
| `components/MiddlemanCard.tsx` | One card. Position, tilt, scale and fade are all derived from the deck position |
| `components/Directory.tsx` | Section header, stats, deck, safety note |
| `components/Footer.tsx` | "Designed By @claxen" → https://t.me/claxen |
| `data/middlemen.ts` | The middleman data — edit here |
| `lib/deck.ts` | Deck maths (loop wrap, drag distance per card) |

## Tuning the deck feel

- `PX` in `lib/deck.ts`: drag distance per card (smaller = more sensitive).
- `stiffness` / `damping` in `Deck.tsx` `goTo`: spring bounciness.
- The per-card `useTransform` lines in `MiddlemanCard.tsx` control the stack look and the fly-away motion.

## Performance notes

- Heavy backdrop blur is only used on the nav and on each card's info panel (over the photo), not over the live 3D canvas.
- No post-processing; the 3D bundle loads after the page has painted.
- On low-end devices the scene drops its pixel ratio and particles automatically.
