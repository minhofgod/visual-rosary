# Visual Rosary — Progress Log

Running log of where we are, so any session can pick up quickly. Newest first.
For architecture/infra details see the README and `src/` — this file is just the
"what's done / what's next" narrative.

> **⏰ OPEN FOLLOW-UPS — remind Minh (he asked to be nudged, 2026-08-14):**
> - **Google Play (free app):** the PWA is now install-ready (SW + manifest + iOS
>   tags + privacy page). Remaining, Minh's side: create a Play Developer account
>   ($25 one-time + ID verification); a personal account needs a 12-tester / 14-day
>   closed test. Then run dockinhmancoi.com through **PWABuilder** (or Bubblewrap) to
>   get the `.aab` + signing SHA-256 → send it to me and I add
>   `public/.well-known/assetlinks.json`. Privacy URL for the listing:
>   `https://dockinhmancoi.com/privacy.html`.
> - **Search Console:** confirm the sitemap was submitted (`sitemap.xml`) and the
>   homepage "Request indexing" was done. Domain property was verified via GoDaddy's
>   auto-TXT on 2026-08-14. Check the Performance report ~1 week later (≈2026-08-21).
> - **Backlink:** add a link from the main *Hỏi Đáp Công Giáo* site to
>   dockinhmancoi.com (anchor "đọc Kinh Mân Côi" / "cách lần hạt Mân Côi") — biggest
>   off-page lever for the new domain.
> - **Optional SEO/perf (not started):** code-split the ~750 KB JS bundle; compress
>   the large bead images (some ~1.4 MB); per-route titles/meta for the 4 mystery pages.

## Current state (2026-08-13)

Feature-complete and deployed on Vercel (`dockinhmancoi.com`). Working tree clean.
Bilingual (VI/EN) visual Rosary: pick a mystery set on the landing page, then step
through the full sequence one prayer per screen with a bead rail, per-bead public-
domain artwork, scripture verses, and a settings panel.

### Recently completed
- **Service worker neutralized + menu polish (2026-08-25)** —
  (a) **SW kill-switch**: `public/sw.js` is now a self-unregistering worker that clears
  Cache Storage (NOT localStorage — streaks preserved) and `main.tsx` no longer registers
  a SW. Fixes stale-cache "unstyled page" after rapid deploys; heals stuck devices on
  next load(s). (b) **Wall boxes opaque**: `.pw-post`/`.pw-signin-prompt`/`.pw-card`/
  `.pw-pinned` bumped 0.55→0.85 bg + blur 6px for readability over the art. (c) **Sign out
  in the menu**: `SettingsPanel` gained granular section flags (`showReturnHome`,
  `showFontSize`, `showReadingLayout`) + an auto sign-out (AppHeader passes
  `isSignedIn`/`onSignOut` from `useAuth`). (d) **Wall settings** now show Language + Font
  size + Return Home only; the wall applies `--font-scale` to `.pw-body`/`.pw-pinned-body`
  so text size works there too.
- **Prayer wall launched in production (2026-08-25)** — removed the `import.meta.env.DEV`
  gates (route in `App.tsx`, landing link in `PickerPage.tsx`); the wall (`/y-cau-nguyen`)
  is now public. Also: (a) a **pinned welcome card** from Minh at the top of the wall
  (`.pw-pinned`, static UI — not a DB post; explains the wall + anonymity + naming, VI/EN);
  (b) a new **"Cần lời cầu nguyện / Needs prayer"** sort that surfaces least-prayed requests
  first — `WallSort` gains `'needs'`, and `get_prayer_wall` in `supabase/community-schema.sql`
  orders `prayed_count asc` for it (**Minh must re-run that function in Supabase**; until then
  'needs' degrades to newest); (c) removed the **Sign out** button from the post box (mistake
  risk) — sign-out now lives only on the profile page; (d) the wall header now uses the shared
  `AppHeader` (profile + settings menu) like every other page.
- **Prayer wall anonymity note (2026-08-25)** — added a persistent `.pw-anon-note`
  line under the hero ("🔒 Mọi ý cầu nguyện đều được đăng ẩn danh — tên của bạn không
  hiển thị." / EN) so posters know their name is never shown. (Wall is still dev-only.)
- **Font size control (2026-08-25)** — new "Cỡ chữ / Font size" control in the settings
  menu (three "A" glyphs: Nhỏ/Small ×0.85, Vừa/Normal ×1, Lớn/Large ×1.15). Normal = the
  original size. Adds `fontScale: number` to `useSettings` (localStorage,
  device-local). `ReadingPage` sets `--font-scale` inline on `.reading-screen`; the
  reading-text font-sizes in `App.css` are wrapped in `calc(... * var(--font-scale))`
  (default `--font-scale: 1` in `index.css`). The prayer/meditation `Modal` renders inside
  `.reading-screen`, so it scales too via the cascade. Only reading text uses the variable,
  so landing/profile are unaffected.
- **Fix: settings menu rendered behind profile content (2026-08-25)** — the menu
  (`SettingsPanel`) is nested inside `<header className="reading-header">` (z-index 2);
  on the profile page `.pf-main` also has `z-index: 2` and comes later in the DOM, so
  it painted over the header's stacking context and the menu's own `z-index: 10` (trapped
  in that context) couldn't rise above it. Fixed by rendering `SettingsPanel` through a
  `createPortal(..., document.body)` so the modal always mounts at body level, above all
  page content, regardless of which header nests it. Verified on landing/reading/profile
  at mobile + desktop (hit-test: language buttons are topmost/clickable).
- **Unified header: profile + settings on every page (2026-08-25)** — new shared
  `src/components/AppHeader.tsx` renders a left slot (wordmark or back button), an
  optional centered slot (the mystery name while praying), and a consistent
  **[profile] + [☰ menu]** pair on the right. `PickerPage`, `ReadingPage`, and
  `ProfilePage` all use it. The `VI · EN · VI+EN` toggle moved **inside** the menu
  (`SettingsPanel`, now with a "Ngôn ngữ / Language" group at the top) instead of
  being a standalone header control. `SettingsPanel`'s `settings`/`onChange` are now
  optional: on the landing/profile the menu shows just Language; on the reading page
  it also shows Return Home + bead/display options. The profile button is hidden on
  the profile page itself (`showProfile={false}`). `LangToggle` is still used by the
  (hidden) `PrayerWallPage`.
- **Persistent profile/sign-in entry point (2026-08-25)** — added a round profile
  button to the landing header (`PickerPage`) that navigates to `/ho-so`. Shows the
  signed-in Google avatar when available, otherwise a generic person-circle icon.
  This is the first always-visible door to sign-in/profile — previously the profile
  was only reachable via the streak card's "Xem cả năm" link (which needs an existing
  streak) and sign-in only lived on the (hidden) wall. Styles: `.landing-profile-btn`
  / `.landing-profile-avatar` in `App.css`. (Now folded into `AppHeader`, above.)
- **Accounts live in production + streak↔account sync (2026-08-24)** — sign-in is now
  reachable in production via a "Đăng nhập để lưu chuỗi ngày / Sign in to save your
  streak" button on the profile (`ProfilePage`), decoupled from the (still-hidden)
  wall. Streak sync: new table `public.user_prayer_days` ([`supabase/streak-sync.sql`](supabase/streak-sync.sql),
  Minh runs it) + `src/lib/streakSync.ts`. `useStreak` now merges device days into the
  account on sign-in (upsert — preserves existing device streaks) and reads them back,
  so the streak/heatmap follow the user across devices; `ReadingPage` records each
  completion to the account when signed in. Days-only sync (streak + heatmap); "total"
  stays device-local. Sign-in `redirectTo` now returns to the current page. The profile
  also explains that a signed-out streak is device-only and can be lost, encourages
  sign-in for cross-device sync (keeping the current streak), and shows "✓ Synced" once
  signed in.
- **Profile page (`/ho-so`) with year heatmap** — `ProfilePage` shows the Google
  avatar + name (when signed in), the current/longest streak + total, and a
  **year-long "rosary heatmap"** (GitHub-contribution style, ~53 weeks) of days
  prayed. Reached via a "Xem cả năm / View full year" link on the landing streak
  card. **Device-local for now** (uses `prayerStreak`'s `prayedDays`; no server
  sync) and **production-ready** (not dev-gated) — degrades to a streak view with
  the 🙏 fallback avatar when not signed in. Future upgrade: persist per-account so
  it syncs across devices (would need a small Supabase table + per-user logging).
- **Counter resets at Vietnam midnight, not UTC** — updated the `get_prayers_today()`
  SQL function (in Supabase) to use `Asia/Ho_Chi_Minh` for the day boundary, so the
  "Rosaries Prayed Today" count resets at VN midnight. Server-side only; the SQL is in
  the chat + memory. (Client comment in `prayerStats.ts` updated to match.)
- **Always show the "Rosaries Prayed Today" counter** — removed the earlier
  ">10" gate in `PickerPage`, so the real count shows even when low (incl. 0).
  (Reverses the earlier "hide until >10" decision, per Minh's request.)
- **Community wall gated to DEV-ONLY (2026-08-21)** — the wall link + `/y-cau-nguyen`
  route are wrapped in `import.meta.env.DEV`, so they're **hidden in production** (a
  catch-all route redirects any direct hit to `/`). Reason: Google sign-in broke
  after activating the Supabase **custom domain** (`auth.dockinhmancoi.com` returns
  Cloudflare 1016/530 — provisioning stalled), which forced the OAuth callback onto
  the not-yet-serving domain. To re-launch: remove/fix the custom domain (or drop it
  and keep the free app-name branding) so sign-in works on the `supabase.co` callback,
  then remove the `import.meta.env.DEV` gates in `App.tsx` + `PickerPage.tsx`.
- **Community — prayer-request wall + accounts (BUILT; auth flow needs Minh's test)**
  — Supabase setup done (SQL run; Email + Google providers enabled; URL config).
  Built: `useAuth` (Google + magic link), `prayerWall.ts` data layer, route
  `/y-cau-nguyen` (`PrayerWallPage`), `PrayerRequestCard`, `SignInModal`, and the
  "🙏 Praying for you" `PrayingForYouModal` (rotating intercessions from
  `src/data/intercessions.ts` + refresh + Amen → records the prayer). Landing has a
  "🙏 Ý Cầu Nguyện" link. Privacy policy updated for accounts + user content.
  **Verified:** wall reads from live Supabase (get_prayer_wall RPC works, empty),
  sign-in modal renders, lint/tsc/build clean, no console errors. **Minh must test
  the authenticated flows** (Google/magic-link sign-in → post → pray → report/block)
  — I can't sign into his accounts. If Google sign-in errors, check the OAuth Client
  ID in Supabase is the real `.apps.googleusercontent.com` value.
  **Still to do:** Play data-safety form; before public launch set up Resend SMTP +
  publish the Google OAuth consent screen. Apple sign-in deferred ($99/yr).
  (Streak↔account sync was DROPPED 2026-08-14 — too few users to matter; the streak
  stays device-local and accounts are just for the wall.)
- **PWA / installable app (Play Store prep)** — the site was already installable via
  the manifest (that's the "Install app" prompt Minh saw). Made it app-store ready:
  a **service worker** (`public/sw.js`, registered prod-only in `main.tsx`; network-
  first navigations, cache-first hashed assets, offline app-shell fallback);
  **manifest polish** (`id`, `categories`, separate any/maskable icons); **iOS meta
  tags** (`apple-mobile-web-app-capable` etc. — Apple shows no auto prompt, users
  "Add to Home Screen"); a bilingual **privacy policy** at `/privacy.html` (Play
  requires one) linked from a new landing footer. Build-verified via temp outDir
  (files serve, manifest valid, SW + apple tags in the bundle); live SW registration
  couldn't be confirmed in the sandbox browser but works on real HTTPS. Next steps
  for Play in the follow-ups block above.
- **SEO — content guide + prerender** — added `src/components/HowToGuide.tsx`, a
  text-rich, crawlable Vietnamese-first article on the landing page (~900 words in
  VI): step-by-step "cách lần hạt Mân Côi", the full prayer texts, the 20 mysteries
  with their weekday schedule, and an FAQ (semantic h2/h3/h4). **Stage 2 (prerender):**
  the guide's content lives in shared pure data (`src/data/guideContent.ts`) driving
  both `<HowToGuide>` and `src/lib/renderGuideHtml.ts`; a postbuild step
  (`tsx scripts/inject-guide.ts`, added to `npm run build`) bakes the Vietnamese
  guide HTML into `dist/index.html` inside `#root`, so no-JS crawlers/link scrapers
  get the full text. React cleanly replaces it on mount (verified: no console
  warnings, single root child). Build tested via a temp outDir (local `vite build`
  is blocked by the Dropbox EPERM; the fresh temp dir avoids it). The inject step is
  fail-soft — any error logs and exits 0, so it can never break the deploy.
- **SEO — quick wins** — added `robots.txt` + `sitemap.xml`, keyword-tuned
  title/description ("cách lần hạt Mân Côi", "đọc Kinh Mân Côi"), a `keywords` meta,
  `og:image`/`twitter:image` (logo), and JSON-LD (WebSite + Organization + a HowTo
  mirroring the 10-step guide). NOTE: the decisive lever is still open — the site
  is a client-rendered SPA (crawlers get an empty `<div id="root">`), so the real
  fix is **prerendering to static HTML + a long-form Vietnamese "cách lần hạt" prose
  guide**. See the SEO plan discussed 2026-08-14.
- **Swipe past the end to finish** — on the final Hail, Holy Queen screen, a
  forward swipe/scroll/ArrowDown now returns to the home page (more intuitive than
  tapping the logo). A gentle "Vuốt lên để hoàn tất ↑ / Swipe up to finish" hint
  appears on that screen. Only the deliberate next-gesture triggers it (a tap does
  not); earlier steps are unchanged.
- **Resume where you left off** — the landing page now shows a gold "Tiếp tục nơi
  đã dừng / Continue where you left off" button (with the mystery set + current
  step) when a rosary is in progress. Device-local (`src/lib/resumeState.ts`,
  `useResume`); saved as you pray, cleared on completion, expires after 2 days.
- **Gentler Carrying-decade image** — `carrying-hail-mary-2` was Bosch's grotesque
  jeering-crowd *Christ Carrying the Cross*; replaced with Lorenzo Lotto's tender
  close-up (metadata updated in `beadImages.ts`).
- **Vietnamese meditation name fixes** — aligned place/person names in the
  meditations to the CGKPV spellings used in the verses: `Giệtsimani → Ghết-sê-ma-ni`,
  `Giođan → Gio-đan`, `Simon thành Xyrênê → Si-môn gốc Ky-rê-nê`. (Traditional
  devotional forms like Chúa Giêsu, Phêrô, Giuse, Isave left as-is — correct, and
  matching the mystery titles; they differ from the verses only by hyphenation.)
- **New brand logo (Claude Design)** — the landing wordmark's Ô in "MÂN CÔI" is now
  a rosary glyph (`src/components/RosaryO.tsx`): beaded ring + gold centerpiece +
  crucifix pendant, rotated 22° so the crucifix clears the letter. Added the full
  favicon/icon kit under `public/logo/`, wired the SVG favicon + favicon-32 +
  apple-touch-icon in `index.html`, added `public/manifest.webmanifest`
  (theme `#1a1310`) as a PWA foundation, and loaded Source Serif 4 weight 700.
  Source kit lives in `./Rosary diagram recreation/logo/` (has a README + rules).
- **Faith/hope/charity intention on the 3 opening Hail Marys** — each of the three
  opening Hail Mary screens now shows the virtue it's traditionally offered for
  ("Cầu cho được Đức Tin/Cậy/Mến" / "For an increase of Faith/Hope/Charity"), in
  gold above the prayer. Added `Step.intention` in `sequence.ts`, rendered in
  `PrayerCard`. Decade Hail Marys are unaffected.
- **Device-local prayer streak** — the landing page shows a 🔥 streak card
  (captioned "Your rosary streak" / "Chuỗi ngày lần hạt của bạn", with current &
  longest streak, total rosaries, a 7-day dot row, an expandable **month
  calendar**, and a **"keep it going" nudge** that changes based on whether
  you've prayed today) once at least one rosary has been prayed on the device. Saved in `localStorage` (no login),
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
1. ~~**Device-local streak**~~ — ✅ SHIPPED (streak, longest, total, 7-day row,
   month calendar, "keep it going" nudge). "Resume where you left off" also ✅ SHIPPED.
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
