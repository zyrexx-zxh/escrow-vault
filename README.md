# Escrow Vault — immersive 3D middleman directory

Next.js 14 (App Router) · Tailwind CSS · React Three Fiber + drei + postprocessing · GSAP ScrollTrigger · Framer Motion

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build: `npm run build && npm start`

Requires Node 18.17+ (Node 20+ recommended).

## What's inside

| Path | What it does |
| --- | --- |
| `components/Scene.tsx` | Fixed full-screen R3F canvas: dark-metal vault, glowing rings, procedural studio lighting, bloom, and the scroll-driven camera path |
| `components/ScrollDriver.tsx` | GSAP ScrollTrigger writes page scroll progress (0 → 1) that the camera rig reads each frame |
| `components/Hero.tsx` | "Secure Digital Escrow" hero + "Browse verified middlemen." |
| `components/MiddlemanCard.tsx` | Glass card with 3D hover tilt, gradient border, stats grid, and the `t.me` contact button |
| `components/Directory.tsx` | Grid, search, sort and the stats strip |
| `components/Footer.tsx` | "Designed By @claxen" → https://t.me/claxen |
| `data/middlemen.ts` | The middleman JSON — edit here to add or change entries |
| `app/globals.css` | Glassmorphism, gradient borders, glare and button styles |

## Customising

- **Profile photos:** the avatar in `MiddlemanCard.tsx` is a placeholder. Replace the `<User />` icon with an `<img>`/`next/image`.
- **Camera path:** edit the `CAM_PATH` points in `Scene.tsx`.
- **Colours:** emerald/blue glows are `EMERALD` / `BLUE` in `Scene.tsx` and the `rgba(16, 242, 165, …)` values in `globals.css`.
- **Performance on weak devices:** lower `dpr` on the `<Canvas>`, reduce `Sparkles` counts, or remove `<Bloom>`.
