# Lần Hạt Mân Côi — Visual Rosary

A bilingual (Vietnamese / English) visual companion for praying the Rosary. Standalone
React + Vite web app, meant to be linked from the main "Hỏi Đáp Công Giáo" site.

## Running locally
```bash
npm install
npm run dev
```

## How it works
- `src/data/prayers.ts`, `mysteries.ts` — bilingual prayer texts and the 20 mysteries
  (Joyful, Sorrowful, Glorious, Luminous), sourced from
  [augustino.net/lan-hat-man-coi](https://augustino.net/lan-hat-man-coi) (Vietnamese)
  and standard traditional English texts.
- `src/data/sequence.ts` — expands one mystery set into the full ordered list of prayer
  steps (opening → 5 decades → closing), each tied to a specific physical bead.
- `src/data/beadPositions.ts` — computes the SVG bead layout geometrically (a 55-bead
  loop + a hanging tail of crucifix/large/3 small/centerpiece).
- `src/components/RosarySVG.tsx` — renders the bead string, highlights the current bead,
  and lets you tap any bead to jump to its prayer.
- `src/state/useRosary.ts` — navigation state (current step, next/prev/jump).

The Memorare is included in `prayers.ts` but not wired into the default sequence — it's
a traditional Marian prayer, not part of the standard daily Rosary recitation.

## Deploying

This builds to a plain static site (`dist/`), so it works the same way on any static host.

**Vercel** (recommended to start):
1. Push this repo to GitHub.
2. Import it in Vercel — it auto-detects Vite (`npm run build`, output dir `dist`). No
   config needed.

**Moving to Cloudflare Pages later:**
1. Connect the same GitHub repo in Cloudflare Pages.
2. Build command: `npm run build`. Output directory: `dist`.
3. Point DNS at Cloudflare instead of Vercel. No code changes required — the build
   output is host-agnostic static files either way.
