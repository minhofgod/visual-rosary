# Visual Rosary — Progress Log

Running log of where we are, so any session can pick up quickly. Newest first.
For architecture/infra details see the README and `src/` — this file is just the
"what's done / what's next" narrative.

## Current state (2026-08-13)

Feature-complete and deployed on Vercel (`dockinhmancoi.com`). Working tree clean.
Bilingual (VI/EN) visual Rosary: pick a mystery set on the landing page, then step
through the full sequence one prayer per screen with a bead rail, per-bead public-
domain artwork, scripture verses, and a settings panel.

### Recently completed
- **Device-local prayer streak** — the landing page shows a 🔥 streak card
  (current & longest streak, total rosaries, and a 7-day dot row) once at least
  one rosary has been prayed on the device. Saved in `localStorage` (no login),
  recorded when a rosary reaches its closing step (session-guarded against
  refresh double-counts), bilingual VI/EN. Files: `src/lib/prayerStreak.ts`,
  `src/state/useStreak.ts`, `src/components/StreakCard.tsx`. Designed so a future
  Supabase-Auth account can adopt the same data. First step of the roadmap below.
- **Fixed a mislabeled decade image** — `crowning-hail-mary-5` was byte-identical
  to `scourging-hail-mary-8` (Giotto's *Flagellation*), so the Crowning decade
  showed the wrong scene. Replaced with Fra Angelico's *Mocking of Christ* (San
  Marco, Cell 7) and corrected the artist/source in `beadImages.ts`.
- **Exported the image library** to a shared, repo-external folder
  `../Catholic Images/` (Dropbox sibling of this project): all 220 public-domain
  artworks under their original Wikimedia filenames + `CREDITS.csv` (per-site
  usage column "Visual Rosary Website") + a `README.md` with instructions for
  future sessions to reuse the library and source new images without duplicates.
- **How-to-pray diagram callout lines** — made all leader lines horizontal
  (each numbered badge pinned level with the bead it annotates) instead of some
  running diagonal; step 5 (joining bead) now drops a short **vertical** line
  straight down inside the loop onto the bead at its base.
- Downloadable **QR poster** in the Share modal.
- Anonymous **"Rosaries Prayed Today" counter** via Supabase — hidden until the
  day's total exceeds 10; gated by a `prayer_counter` feature flag; fail-open so a
  stats outage never breaks the app.
- **"How to pray" rosary diagram** on the landing page that responds to the
  VI/EN/both language toggle.
- Closing prayers consolidated onto one screen; Return Home moved into settings.
- Verse citations fixed; footer bar with Vietnamese book abbreviations.
- Prayer-modal sizing so long prayers fit without scrolling.

### Possible next steps (roadmap — from 2026-08-13 brainstorm)
Audience priority: **Vietnamese Catholics**. Accounts/login wanted eventually
(Supabase Auth) but **backburnered** — build personal features device-local first.
Prioritized directions: personal habit, audio/hands-free, community.
1. ~~**Device-local streak**~~ — ✅ SHIPPED (streak, longest, total, 7-day row).
   Still could add: a full month calendar view + "resume where you left off".
2. **Guided hands-free audio mode (VI first)** — recorded prayer audio, gentle
   auto-advance, soft bell between decades + Fatima prayer. (Partial quick win:
   bell/timer pacing before full audio exists.) Open: audio source.
3. **Community** — anonymous intention wall ("ý cầu nguyện") others can pray for,
   live "praying now" count. Builds on the existing prayer counter. Open: moderation.
4. **Later:** Supabase Auth accounts to sync streaks + own intentions.

## How to run
```bash
npm install
npm run dev      # vite dev server
npm run build    # tsc -b && vite build -> dist/
npm run lint     # oxlint
```
