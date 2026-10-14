# Escrow Vault

A single-page escrow middleman directory. Next.js 14 (App Router) + TypeScript, styled with one plain stylesheet.

- Hero: **Secure Digital Escrow**, "Browse verified middlemen."
- 19 middlemen in a swipeable 3D card deck (`data/middlemen.ts`, unchanged)
- Contact buttons are real links to `https://t.me/<username>`
- Footer: **Designed By @claxen** links to `https://t.me/claxen`

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Render: Build `npm install && npm run build`, Start `npm start`.

## Profile photos

Put one image per middleman in `public/middlemen/`, named after the **name** (lowercase), not the Telegram username:

`fame.jpg`, `top.jpg`, `cry.jpg`, `ja.jpg`, `shib.jpg`, `scholar.jpg` ...

`.jpg`, `.jpeg`, `.png` and `.webp` are all tried, in that order. If none exist the card shows a tinted placeholder with the initial. The full list of names is in `public/middlemen/README.txt`.

## What is where

| File | What it does |
| --- | --- |
| `app/page.tsx` | Page order: Loader, Nav, Hero, Ribbon, Directory, How it works, Safety, Finale, Footer |
| `app/globals.css` | All styling (Tailwind is only kept for its reset and future utility classes) |
| `lib/swipeEngine.ts` | The card swipe: one position number, spring physics, rubber-band ends, no looping |
| `lib/scroll.ts` | Shared scroll listener that writes progress into CSS variables |
| `components/Deck.tsx` | Connects the engine to the counter, ghost name, ticks, buttons, tilt and the "choose" effect |
| `components/MiddlemanCard.tsx` | One card |
| `components/Loader.tsx` | 3D vault-door intro |
| `components/HowItWorks.tsx`, `Safety.tsx` | Steps and the five safety checks (editable text at the top of each file) |
| `components/Footer.tsx` | Fixed footer revealed as the page scrolls away |

## Motion

Loader (3D door split), hero (CSS 3D cards that follow the pointer), scroll reveals and a marquee, card tilt and glare, the cover-flow swipe, a "Locked in" moment when you press Contact, rings that turn with scroll, and a footer that is uncovered like a curtain. Everything animates transform/opacity only. There is no WebGL and no blur, and `prefers-reduced-motion` turns the motion off.

## Notes

The site is not affiliated with OGUsers or Telegram (the footer says so). Vouch counts come from `data/middlemen.ts`.
