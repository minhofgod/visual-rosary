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

## 2026-08-28 — Pre-push audit: how a collection can be lost

Minh: "the most important thing is the user's collection — we don't want them to lose any." Audited
every loss path. Ranked, with what protects each:

1. **Signed-out person clears browser data / changes device — TOTAL LOSS, unrecoverable.** By far the
   likeliest. Inherent to a device-local collection; the only protections are signing in and the
   downloaded image itself. The gallery note already says both. No code fix exists for this one.
2. **Sync silently broken for signed-in users.** Every call in `wallpaperSync.ts` is fail-open and
   reports only via `console.error`, so a collection that never reaches the server looks *identical*
   to one that does. **The client path has never been run against the live tables** — the SQL was
   created 27-08 and Minh is signed out. Statically the client matches the schema (omitted `user_id`
   takes the `auth.uid()` default; the PK backs the `onConflict` targets; RLS insert/update policies
   permit both writes) but that is not a runtime test. **Needs Minh: sign in locally, keep a card,
   confirm a row lands in `user_wallpapers`.**
3. **Corrupt/unreadable localStorage — FIXED today.** `loadCollection()` caught the parse error and
   returned an empty state, so the next write overwrote the original — destroying data that was
   possibly recoverable. It now stashes the raw value under `rosary.wallpapers.v1.corrupt` first.
4. **Catalog drops a shipped id — FIXED 28-08** by the generator ratchet (see the entry below).
5. **Account deleted** — `on delete cascade`, intended.

Reassuring findings: nothing in the app ever REMOVES from `earned` (claim only appends); the merge in
`syncCollectionFromAccount()` is a union in both directions, never a replace; and it re-pushes
local-only ids on every page load, so a single failed `pushEarned` self-heals on the next visit.

**BUILT (Minh said yes):** a failed backup is now surfaced instead of only logged. `wallpaperSync.ts`
tracks `backupFailed` (set by the EARNED-set calls only — the avatar is a preference, not data worth
warning about; cleared on sign-out, where "not backed up" is expected), exposed through
`useBackupFailed()` and shown in the gallery as an amber note: *"⚠ Chưa lưu được bộ sưu tập lên tài
khoản — hiện chỉ có trên máy này…"* with the advice to reload and, failing that, download the images.
It **outranks the "✓ synced" note**, so nobody is told they're safe while the last save failed.

**✅ SYNC CONFIRMED WORKING (Minh, 2026-08-28).** He signed in locally and the gallery showed
*"✓ Bộ sưu tập đã đồng bộ với tài khoản"* with no ⚠ warning. That is a real pass in both directions:
`fetchServerEarned()` ran first and returned cleanly, then `pushEarned()` inserted his 8 cards with no
error — so the `auth.uid()` default, the PK conflict target and the RLS policies all behave as
written. Worth noting the ✓ alone would NOT have proved it: `pushEarned` is fail-open, so
`markWallpaperMerge()` fires even on failure — it is the new ⚠ warning outranking the ✓ that makes the
green note trustworthy. **Confirmed server-side too:** `user_wallpapers` holds exactly 8 rows, one per
card, all under one `user_id` with an identical `earned_at` (the single batch insert from the merge),
and every id matches his local collection. Those rows are exactly what the ratchet protects — one of
them, `robin-sunset-cinematic-01`, is the card the ratchet test caught. **Read-back confirmed as
well** — a private window signed into the same account showed all 8 cards with no local data present,
so the merge works in both directions and the cross-device promise holds end to end.

Useful side effect: Minh's sync test reported its own result. Signing in with 8 local
cards is a genuine merge, so a working sync shows the ✓ note and a broken one shows the ⚠ warning —
no DevTools or dashboard needed either way.

Verified signed-out: gallery renders, no console errors, the device-local note still shows and the
warning correctly does not. The warning path itself needs a signed-in session to exercise.

## 2026-08-28 — Pre-push checks + copy corrections

- Full production build clean: tsc 0, oxlint 0, `vite build` OK, `inject-guide` OK, **66** wallpapers
  + 66 avatars emitted. `public/wallpapers` is now **23 MB** (was 17), `public/avatars` 1.4 MB.
- **Copy was inaccurate about styles.** `CHANGELOG.md` claimed "3 phong cách **cho mỗi câu Lời Chúa**"
  — false: the real distribution is **14 verses with 1 style, 23 with 2, 1 with 3**. Both the
  CHANGELOG and the user-facing `updates.ts` line now read "ba phong cách ảnh … tuỳ theo câu Lời
  Chúa" (three art styles, depending on the verse). The CHANGELOG's internal note ("52 đã lên app,
  14 câu chờ") was stale and now says 66 with the rule dropped.
- `dist/` is gitignored; the 23 MB of wallpapers under `public/` are not, and will be committed —
  that is required, since Vercel builds from the repo.

## 2026-08-28 — Ratchet, ≥2-styles rule dropped (52 → 66 cards), "Đã có" style chooser

- **RATCHET in `scripts/gen-wallpapers.py` — a shipped id is never un-shipped.** The script was
  stateless: it recomputed everything from CREDITS each run and pruned whatever no longer qualified.
  Since `user_wallpapers` now persists collections and the app resolves kept cards by id,
  a routine CREDITS edit could delete cards out of real collections with no error — and
  `earnedWallpapers()` filters unresolvable ids silently, so nobody would see it happen. The likely
  trigger is spelling, not deletion: "paper cut-out" + "papercut" on one verse read as 2 styles until
  someone normalises them. Session 1 reports doing exactly that class of edit twice (`knight` →
  `cinematic` on 7 rows, `paper cut-out` → `papercut` on 14) — harmless pre-launch, destructive after.
  Shipped ids are now read back from the previous `wallpapers.ts` and always re-emitted; a shipped id
  whose CREDITS row has vanished **fails the build loudly** instead of being deleted.
  **Proved it, didn't assume it:** simulated a style normalisation on Mt 6:26 → the run reported
  `RATCHET kept 2 already-shipped card(s)` (`bird-providence-papercut-01`, `robin-sunset-cinematic-01`
  — the second is in Minh's own collection) and stayed at 52 cards where it would have dropped to 50.
  CREDITS restored byte-identical afterwards (md5 + file-list verified).
- **≥2-STYLES RULE DROPPED (Minh, 2026-08-28) — catalog 52 → 66.** It existed so every gift offered a
  real style choice, but held 14 finished cards invisible; the ratchet is what makes single-style
  verses safe now (they can no longer be silently un-shipped). All 14 formerly-held verses are live.
  The 09-02 Firefly batch is now an enhancement, not a gate.
- **Style chooser shows an owned style as "ĐÃ CÓ"** (Minh's design): `giftCards` now holds ALL of the
  frozen verse's cards, owned included; owned styles render dimmed + disabled with the badge, so when
  a verse gains a second style later it's clear why only one is pickable. Only un-owned cards can be
  kept. A verse with **one** style skips the chooser entirely (and no longer shows a dead
  "← Đổi phong cách" button — caught in the live walkthrough).
- **🔴 Correction to yesterday's preview-crop fix — it was NOT working.** `.wr-zoomable { width:100% }`
  is declared after `.wr-preview { width:auto }` at equal specificity, so it won and the aspect-ratio
  was ignored: the real previews still cropped. My earlier "100% visible" check measured a *detached*
  element that lacked `wr-zoomable`, so it never reproduced the real conditions. Pinned with
  `.wr-preview.wr-zoomable { width: auto }` and re-measured **in place**: box ratio 0.462 = card ratio
  0.462, 100% visible. Lesson: measure the element as rendered, not a synthetic copy of it.
- Verified in the live app at 390×820 (both cases screenshotted), tsc + oxlint clean. Minh's local
  collection was snapshotted before the walkthrough and restored exactly (pending 1, giftRef null,
  8 earned, avatar unchanged); he is signed out, so nothing reached Supabase.

## 2026-08-27 — Local-review fixes: preview crop + a gift-farming loophole

From Minh's local review of the wallpaper feature.

- **Preview crop was viewport-dependent (reported: the Tv 23:5 chalice showed as dark arches).**
  `.wr-preview img` was `height: min(300px, 40vh)` over a `width: 210px` box, so on a SHORT window
  `40vh` won and the visible slice of the card shrank to roughly the top 40% — clipping any subject
  sitting low in the frame. On a tall screen the same code looked fine, which is why it read as
  inconsistent rather than simply "too tight". **Fix:** the preview is now sized by HEIGHT and carries
  the card's own aspect ratio (`height: min(440px, 52vh); aspect-ratio: 1080/2340`), so a short screen
  makes the preview *smaller* instead of cropping deeper — and nothing is cropped at all: the person
  sees the whole wallpaper they are choosing. Verified by measuring the live box at 900/640/500 px
  viewport heights: 100% of the card visible at each, width scaling 203 → 154 → 120 px.
- **🔴 Gift-farming loopholes found and closed. RULE NOW: ONE GIFT PER DAY** (Minh's call, 2026-08-27
  — it matches the kept screen's "Hãy quay lại ngày mai" copy and protects the collection's scarcity).
  Three distinct holes, all now shut:
  1. `grantGift()` was guarded only by a `useRef` (per component mount). The closing screen keeps its
     step in the URL hash, so a **refresh or the back button remounted with `isComplete` already true
     and minted another credit, with no praying at all** — repeatable indefinitely. The prayer counter
     and streak were already immune via `sessionStorage` guards; the gift never got one.
  2. Minh's original question: a second mystery set the same day granted a second card, uncapped.
  3. Exposed while fixing the above — `rewardOpen` in `PickerPage` was set from `justFinished` alone,
     **never checking credits**. With a cap in place the modal would have opened on a creditless
     finish and still allowed a keep, making the cap toothless.
  **Fix:** `WallpaperState` gains `lastGiftDay`; `grantGift()` no-ops when it already equals today's
  local date key (shared `localDateKey()` from `prayerStreak`, so gift-day and streak-day agree). The
  post-finish reward now opens only when a credit was actually banked, and the profile's "Mở" entry
  was already `pending > 0`-gated — so both entry points require a real credit. A second rosary still
  counts for the streak and the public counter; it just earns no second card.
  **Known limit:** the cap is device-local (like `pending` itself), so a signed-in user on two devices
  could earn two in a day. Consistent with the existing design; not worth server enforcement yet.
- **NOT verified end-to-end on purpose:** exercising a real completion would `logPrayerCompletion()`
  into **live Supabase** (inflating the public "prayed today" + all-time counters with a fake rosary)
  and bump Minh's streak total. The guard is an 8-line mirror of two proven implementations; tsc +
  oxlint clean. Minh can confirm during review: finish a rosary, refresh the closing screen, and check
  the pending-gift count does not climb.
- **Copy needs no change** — "Hãy quay lại ngày mai … để nhận một món quà mới" is now literally true.

## 2026-08-27 — Pre-launch pass for the wallpaper update (privacy, lint, service worker)

Working through the launch checklist. **Minh ran `supabase/wallpaper-sync.sql`** (tables
`user_wallpapers` + `user_wallpaper_prefs` live), so sign-in sync is no longer a blocker.

- **Privacy policy — new "Ảnh nền Lời Chúa và ảnh đại diện" / "Scripture wallpapers and avatars"
  section** (VI + EN). It had **no mention of the feature at all**, while the feature stores per-user
  rows in two new Supabase tables. States what is stored (the list of earned wallpaper IDs + the
  chosen avatar id, never images), that signed-out collections stay on-device, and that avatars are
  app artwork only with **no personal photo upload**. The on-device paragraphs now list the
  collection. Needed for the Play data-safety form too.
- **Privacy policy — fixed a claim that was already false in production.** The intro said the app
  "requires no account and collects no personal information" and the NOT-collected list included
  "email", which the accounts release (2026-08-25) contradicted — the Accounts section three
  paragraphs later says we store your email. Both languages now scope the claim to signed-out use and
  point to the Accounts section. Last-updated bumped 14/08 → 27/08.
- **Lint restored to clean.** `WallpaperGallery.tsx` had a `react-hooks(rules-of-hooks)` error — a
  **false positive**: `useAsAvatar` is an ordinary handler, and the `use` prefix alone trips the rule.
  Renamed → `setAsAvatar`. (`npm run build` is only `tsc && vite build`, so this never blocked the
  deploy, but `npm run lint` was failing.) oxlint exit 0.
- **Service worker: `rosary-v2` → `rosary-v3`.** Cache-first is kept for all art. Stale-while-
  revalidate was implemented for `/wallpapers/` + `/avatars/` and then **reverted the same session**:
  SWR re-fetches on *every* request, and at ~450 KB per wallpaper (17 MB library) and up to 2.8 MB per
  bead image (126 MB, 200 files) that is a permanent mobile-data cost for a VN mobile-first audience —
  a bad trade against a rare, avoidable bug. **Root-cause rule instead, now written into `sw.js`:
  replacement art must get a NEW filename; never overwrite an existing one.** Art filenames are stable,
  not content-hashed, so an in-place overwrite pins the old picture on every device that cached it.
  Checked the exposure: the two historical in-place swaps (`e1f2452` mislabeled Crowning decade,
  `c17bcc8` gentler Carrying image) both predate the 08-25 kill-switch worker that wiped all caches, so
  **no user is stuck with stale art today** — the risk was prospective only. The v3 bump still gives
  this deploy a clean slate.
- **Verified:** tsc exit 0, oxlint exit 0, `vite build` clean (841 KB JS), `node --check public/sw.js`
  OK, v3 present in the built `sw.js`, 52 wallpapers emitted. In the browser: the
  policy renders both new sections, and `/ho-so` renders the gallery (8/52, avatar intact) with no
  console errors. **Not verified:** service-worker runtime — the preview browser refuses to register
  a SW ("unknown error when fetching the script"), so SWR behaviour is unexercised. Confirm on the
  deployed site via DevTools → Application → Service Workers (expect cache `rosary-v3`).
- **Ship date set to 28/08/2026** (Minh's call) in `src/data/updates.ts` and the CHANGELOG heading
  (was *Sắp ra mắt*). Privacy last-updated stays 27/08 — that is when the text actually changed.
- **Still open before launch:** Minh's local end-to-end review; optional Threads promo cards.
  Note there are **no `import.meta.env.DEV` gates** on this feature — `git push` *is* the launch.

## 2026-08-27 — Library reconciliation (coordinator ↔ session 1), no code change

- **Counts re-verified from disk, not from the log:** `pairing-status.py` reports **66 cards / 38
  verses** (cinematic 36, papercut 27, renaissance 3), **24 paired**, **14 cinematic-only**; CREDITS =
  66 rows; `public/wallpapers/` = **52** JPGs. The 14-verse Firefly queue is unchanged and confirmed
  by both sessions. (Note: run the script with `PYTHONIOENCODING=utf-8` — it crashes on cp1252.)
- **Stale number retired:** earlier entries below say "28 verses still pending". Correct figure is
  **15 verses with no art at all** (session 1's number — my first pass said 18 by counting 3 rows that
  already have cinematic cards; those belong to the pairing queue, not the no-art queue).
  Verses-with-art **38 / ~60**.
- **Gap found in `AI Art/BUILD-STATUS.md`:** only 3 of the 14 cinematic-only verses have a
  "papercut still open" row (Pl 4:13, 2 Tm 4:7, 2 Cr 12:9); the other 11 have no row at all, so the
  table alone sizes the 09-02 Firefly batch at 3 instead of 14. **Fixed by session 1 at the root:** the
  pending table now means one thing only — *verses with no art in any style* (22 → 15 rows, all 7
  art-bearing rows removed) — and pairing lives solely in `pairing-status.py`, which gained a
  **HELD BACK** section that names the 14-verse Firefly queue outright instead of leaving it inferred.
  It also fixed the cp1252 crash (stdout reconfigured to UTF-8 at import), so the script now runs under
  a plain `python` call.
- No code touched; the wallpaper feature remains LOCAL behind the ship gate.

## 2026-08-27 — In-app "Có gì mới" (What's new) + contact email + release dates

- **In-app What's-new panel**: `src/data/updates.ts` (single source, VN/EN, newest-first) +
  `WhatsNewModal` opened from a **"Có gì mới ✨" item in Settings**, with a **one-time "new" dot** on
  the header menu button (localStorage `rosary.updatesSeen` vs `LATEST_UPDATE_ID`; cleared on open).
  Verified on a clean tab: dot shows for a fresh viewer, modal lists 3 updates, dot clears after open.
- **Release dates confirmed by Minh:** Official launch **2026-08-22** (core online rosary), Community
  & accounts **2026-08-25** (login, streak, prayer wall, bigger text), Wallpaper update **upcoming**
  (dated 27-08 as a placeholder — set to the real ship date on deploy). Reflected in updates.ts +
  CHANGELOG.md.
- **Contact email changed** in `public/privacy.html` (VN + EN, link + mailto): minh.c.tran1992@gmail.com
  → **minhofgod512@gmail.com**.

## 2026-08-27 — Update log: CHANGELOG.md + Threads promo cards (in progress)

- **`CHANGELOG.md`** (VN, newest-first): documents the Ảnh nền Lời Chúa update (upcoming/local) + the
  Aug 26–27 follow-ups + the Aug 25 community update. Meant to double as a Threads-post source.
- **Threads promo cards** for the wallpaper update — matching the existing `Threads Mockups/` set
  (2026-08-25, 6 cards, "✨ TÍNH NĂNG MỚI" template: gold serif headline + 3 feature bullets + phone
  mockup + dockinhmancoi.com, 2160×2700). First card built (headline "Ảnh Nền Lời Chúa", phone shows a
  wallpaper) via `scratchpad/gen-threads-card.py`. Pending Minh's style OK, then: build the rest +
  export high-res PNGs (originals were PNGs — likely via Adobe Express HTML import).

## 2026-08-27 — Reward polish + save-protection + site-wide total-rosaries

- **Long-press "Save image" deterrence** on PREVIEWS (style chooser, variant browse, and their zoom) —
  `.no-save` (`-webkit-touch-callout/-user-drag/-user-select: none`) + `onContextMenu` prevent, and a
  `protect` prop on `ImageZoomViewer`. Kept/owned cards (kept screen, gallery) stay savable — that's
  the point. Deterrence only (screenshots can't be blocked); noted to Minh.
- **Kept-screen layout:** "Để sau" is a ghost (non-highlighted) button with a smaller second line
  "tải ảnh trong bộ sưu tập"; "come back tomorrow" sits below it. **Preview cropped** to
  `min(300px,40vh)` (art at top, 🔍 for the full verse) so preview + buttons + note fit one screen
  without scrolling (verified: sheet 597px < 812px viewport).
- **Site-wide all-time total rosaries** on the landing, under "prayed today" ("Tổng cộng N chuỗi Mân
  Côi", the **number in gold + bold** to match the day count). New `getPrayersTotal()` +
  `usePrayersTotal()`, gated by the same `prayer_counter` flag. `supabase/prayer-total.sql`
  (`get_prayers_total()` RPC) is **live** — verified showing the real total (141) in preview.

## 2026-08-27 — Reward rebuilt: verse-first, lock-forward picker (no preview-shopping)

- **`WallpaperReward` rebuilt** as a lock-forward flow so a person only ever previews ONE verse:
  mood → **open freezes a RANDOM verse + locks mood** → **pick that verse's style** (previews are the
  same verse in each style) → **browse that verse+style's variants** (‹1/N›, arrows only when >1 of
  the same verse+style, e.g. the 3 Good Shepherd papercuts) → keep. Style is switchable within the
  verse (← Đổi phong cách) and each card zooms (appreciate before choosing) — that's not shopping
  (same verse). Only mood+verse are hard-locked.
- **Preview-shopping loophole closed:** "Để sau" no longer re-rolls. The opened gift's verse is
  persisted as `giftRef` in the collection store (`wallpaperCollection.ts`); reopening resumes at the
  **style chooser for the same verse**, never the mood picker; keeping clears `giftRef` + decrements
  pending. New standing rule in memory [[feedback-no-preview-shopping]]. Verified full cycle in preview.
- **Kept screen tidy:** "Để sau — tải ảnh trong bộ sưu tập" is now a **ghost button** (not the gold
  primary), with the "come back tomorrow" note **below** it.
- tsc clean. LOCAL only.

## 2026-08-27 — 6 new cinematic verses filed → library 66 (14 held back)

- Session 1 filed the 6; library **66 cards / 38 verses** (cinematic 36, papercut 27, renaissance 3).
  App catalog stays **52** — the 6 are single-style so they join the held-back set (**now 14**).
- **SCOPE / BOTTLENECK (flagged by session 1, important):** 14 of 66 cards are built-but-invisible
  (single-style, held by the ≥2 rule). The Firefly papercut queue is now **14**: 2 Cr 12:9, 2 Tm 4:7,
  Ep 6:11, Ga 14:6, Ga 3:16, Gs 1:9, Kh 21:4, Pl 4:13, Rm 15:13, Rm 1:16, Tv 23:2, Tv 23:4, Tv 55:23,
  Tv 8:5. Each new single-style cinematic widens this gap. Decision for Minh: run a Firefly papercut
  batch to unlock them, or pause single-style cinematics until it catches up. Verses-with-art 38 / ~60.
- **DECISION (Minh, 2026-08-27): Firefly credits are out until 2026-09-02** — the 14 papercut twins
  are on hold until then. Meantime: **pause new single-style cinematics** so the held-back shelf
  doesn't grow. Prompts for the 14 papercut twins to be written when credits refresh.

## 2026-08-27 — Routed 6 new character-forward cinematic verses (verified text)

- Six new knight/character cinematic images approved + routed to session 1: Kh 21:4 (sorrowful),
  Rm 15:13 (hope), Ga 14:6 (faith), Tv 55:23 (weary), Gs 1:9 (strength, #21930), Rm 1:16 (faith,
  #02711 banner). NEW verses (no twin) → verse text **verified against CGKPV** + warmed (ngươi→con
  on Gs 1:9; CHÚA→Chúa on Tv 55:23; narration/section-heading fragments dropped; Gs 1:9 + Rm 1:16
  lightly condensed). All single-style → **held back by the push rule** until they get papercut twins.
- Is 41:10 (rescuing grip) still pending — Minh re-rolling the hands.

## 2026-08-27 — Push rule (≥2 styles), wall nudge, empty-moods-to-bottom, back-arrow fix

- **RULE: only push a verse with ≥2 style choices.** `gen-wallpapers.py` now runs two-pass: reads all
  CREDITS, holds back any verse with <2 distinct styles, writes JPGs + catalog only for the rest, and
  **prunes orphan JPGs** from public/. Catalog 60 → **52** (held back: 2 Cr 12:9, 2 Tm 4:7, Ep 6:11,
  Ga 3:16, Pl 4:13, Tv 23:2, Tv 23:4, Tv 8:5 — the 8 cinematic-only verses awaiting Firefly papercut).
- **Prayer-wall nudge on the profile** (`ProfilePage` + `.pf-wall-nudge`): a gentle "Cầu nguyện cho một
  người?" card between the stats and the calendar, with the new-requests red badge (`useNewRequests`).
  This is how post-rosary users (who now land on the collection after Save) still find the wall — no
  competing buttons, per the earlier discussion.
- **Collection: empty moods sink to the bottom** — started moods first (happy→sad), `0/N` moods last.
- **Back-arrow fix**: `.icon-button-back svg { transform: rotate(90deg) }` was turning the left-arrow
  SVG into an up-arrow on Profile/Admin/PrayerWall. Removed the rotate → all three point left again.
- tsc clean, verified in preview. LOCAL only.
- **Dashboard fix (follow-on):** the push rule's orphan-pruning deletes held-back jpgs from
  `public/wallpapers/`, which the dashboard had been reading — so held-back verses lost their
  thumbnails. `gen-dashboard.py` now sources thumbnails from the full `cards/` library (via the
  CREDITS `card` column) with a public/ fallback, and its by-verse status shows push state
  (✓ đã push ≥2 kiểu vs giữ lại · chờ kiểu 2).

## 2026-08-27 — Moods reordered happy→sad + collection tile-size control

- **Mood order changed to happy → heavy** (hope, peace, faith, strength, unloved, small, weary,
  anxious, lonely, sorrowful, repentance) in `scripts/gen-wallpapers.py` (source of `MOODS`) and
  mirrored in `scripts/gen-dashboard.py`; regenerated. Drives both the "what do you need today?"
  picker and the collection scoreboard, so both now open on the uplifting feelings.
- **Collection tile-size control** (`WallpaperGallery`): a 3-button segmented control (large / medium
  / small = 2 / 3 / 4 columns) with grid-density icons; choice remembered per device
  (`localStorage rosary.wpGrid`, default medium). CSS `.pf-wp-grid.g-{lg,md,sm}`. Verified in preview.
  tsc clean. LOCAL only.

## 2026-08-27 — Collection grouped by mood ("collect them all" scoreboard, Option 1)

- `WallpaperGallery` now groups the collection **by mood**: global `X / 60` bar at top, then each of
  the 11 moods with its own `earned / total` count + progress bar, and the collected art shown under
  moods you've started. **Option 1 (counts only)** per Minh — no locked slots/silhouettes (the gentle
  version); un-started moods show `0/N` with an empty bar. Data-driven from `MOODS` + `WALLPAPERS`;
  tap a tile → viewer (with the new pinch-zoom). tsc clean, verified in preview. LOCAL only.
  - Open question for Minh: keep all 11 moods listed (full scoreboard) or hide `0/N` un-started ones
    for a tighter view — currently shows all.

## 2026-08-27 — Full-screen pinch/zoom wallpaper viewer

- New `src/components/ImageZoomViewer.tsx`: tap a wallpaper → it fills the screen on black with
  **pinch-to-zoom** (mobile), drag-to-pan when zoomed, **double-tap / double-click** to toggle 1×↔2.5×,
  wheel-zoom on desktop, × or backdrop-tap (at 1×) to close. Owns the gestures via `touch-action:none`
  so the browser's native page pinch doesn't fight it; portalled at z-3500 above every sheet/modal.
- Wired into (a) the **collection gallery** large view (the preview is now a `.wr-zoomable` button with a
  🔍 hint) and (b) the **reward's kept/save screen** (tap the earned card to inspect it). Verified in the
  preview: tap→full-screen, double-click→2.5×, ×→close, no console errors. tsc clean. LOCAL only.

## 2026-08-27 — "Synced" notes made one-time (profile streak + wallpaper collection)

- The permanent **"✓ Đã đồng bộ với tài khoản"** confirmations (streak note in `ProfilePage`,
  collection note in `WallpaperGallery`) were showing forever for every signed-in user. Made each
  a **one-time reassurance**: shown once per device on the first signed-in visit (right after the
  local→account sync), then not again — via `localStorage` flags `rosary.syncNoteSeen` (streak) and
  `rosary.wpSyncNoteSeen` (collection), one per note so each shows once in its own section. The
  signed-**out** "sign in to sync / could be lost" warnings are unchanged (still a useful nudge).
  Fail-open if storage is disabled (shows once, harmless). tsc clean. LOCAL only.
  - **Now gated on a REAL merge** (Minh's call): the note fires only when device-only data actually
    synced up — never for a fresh account with nothing to merge. New `src/lib/syncNotice.ts` holds the
    flags; `useStreak` and `syncCollectionFromAccount` now **fetch the account's existing data first**,
    compute the local-only rows, and call `markStreakMerge()` / `markWallpaperMerge()` only when they
    genuinely pushed new rows. The profile/gallery call `consume*SyncNote()` (re-checked when stats /
    `earned` update after the async merge), which returns true exactly once then remembers it. Fail-open.
- **Removed the profile's "Đăng xuất / Sign out" button** (under the avatar/name). Sign-out already
  lives in Settings (the header gear → `SettingsPanel`, wired via `onSignOut`), so it was redundant.
  Kept the signed-out "Sign in to save your streak" prompt (Settings has no sign-in). tsc clean.

## 2026-08-27 — Two more renaissance twins → catalog 60; dashboard pairing fixed for 3 styles

- **Catalog → 60.** Lc 15:20 (Prodigal embrace) and Mc 10:14 (Jesus + children) got **renaissance
  (Cổ điển)** twins — closing the papercut-**only** queue to 0. Renaissance cards now 3, all on the
  DARK template (measured: light template scored 2.1–2.2:1, unreadable — template-by-measurement rule).
- **Dashboard pairing logic fixed** (`scripts/gen-dashboard.py`): it still defined "paired" as
  papercut+cinematic specifically, so it mislabeled the renaissance twins as "missing cinematic."
  Now style-count-aware (≥2 distinct styles = paired), with a Cổ điển column + per-style counts.
- **Accurate coverage (correcting an earlier overstatement): NOT every verse has 2 styles yet.**
  24/32 verses have ≥2 styles; **8 verses are still cinematic-only** and need **Firefly papercut**
  twins (2 Cr 12:9, 2 Tm 4:7, Ep 6:11, Ga 3:16, Pl 4:13, Tv 23:2, Tv 23:4, Tv 8:5) — blocked on the
  generator, not prompts. Separately, **28 planned verses are still fully `pending`** (no art of any
  style): the 32 verses with art are ~half of the ~60 originally planned. Everything still LOCAL.

## 2026-08-27 — Cinematic queue cleared + new "Cổ điển" (renaissance) style + catalog to 58

- **8 new cards, catalog → 58.** Six cinematic still-life/nature twins closed the papercut-only
  gaps (1 Pr 3:15 lantern, Lc 12:7 sparrows, Mt 6:26 robin, Pl 4:6-7 folded hands+lily, Tv 139:14
  seedling, Tv 23:1 faceless Good Shepherd) + two Is 49:15 Madonna & Child (photoreal + Renaissance).
  Coverage now **22/32 verses paired**; only 2 papercut-only left (Lc 15:20, Mc 10:14 — the
  figure-heavy holds). Remaining real gap = 8 cinematic-only verses needing Firefly papercut twins.
- **New third style `renaissance` ("Cổ điển" / "Classical")** wired end-to-end for the Renaissance
  Madonna: `WallpaperStyle` type (gen-wallpapers.py + wallpapers.ts), the reward/picker `STYLE_LABEL`,
  the dashboard badge. tsc clean, no console errors. Is 49:15 now offers three styles. **Faces are
  inherent to renaissance** (the faceless rule doesn't apply to it; it still holds for cinematic).
- **Marian face exception:** Minh chose to allow Mary's face in the *photoreal cinematic* Madonna
  (normally cinematic keeps sacred faces faceless). Recorded so it's not re-flagged as a QA miss.
- **Two pipeline rules banked** (from the compositor): (1) **wider framing + retained shallow DOF**
  for still-life cinematic makes them read as composed shots, not tight stock crops (Minh's steer —
  applied to the bird/sparrows/hands and it worked). (2) **Choose the card template by MEASURING the
  art's lower third, never by the style token** — the renaissance Madonna's ochre lower third scored
  1.27:1 for dark ink (unreadable) so it went on the DARK template (10.27:1), not the light one I'd
  assumed. Style = how the art looks; template = only whether the verse is legible.
- **Mary character reference (new workflow):** locked a canonical Mary — young Middle-Eastern woman,
  natural undyed oatmeal-linen robe under a soft dusty-blue mantle, faint golden halo. Built via an
  artlist.io **character reference sheet** (Nano Banana **Pro** @ 16:9 for the sheet — its bottom-fade
  doesn't matter on a horizontal reference; up to 14 refs; "Match exactly"), then generate the actual
  vertical cards with **Nano Banana 2** using the sheet as reference. Reuse for all future Marian cards.
- Local dashboard regenerated to 58 (`AI Art/library-dashboard.html`). Everything still LOCAL.

## 2026-08-27 — Local library dashboard + catalog to 49 + streak calendar 30/365 toggle

- **Local library dashboard** (`scripts/gen-dashboard.py` → `AI Art/library-dashboard.html`):
  a self-contained HTML page (base64 thumbnails, ~3.2 MB) that shows the whole wallpaper
  collection two ways — **by tâm tình/mood** (all cards with thumbnails) and **by verse**
  (each verse's papercut/cinematic thumbs + what's missing), with summary counts. Re-run the
  script to refresh. Delivered to Minh. Reads CREDITS.csv + `public/wallpapers/` thumbs.
- **Catalog regenerated to 49.** Session 1 filed the 4 approved cinematic twins (Is 40:31,
  Tv 119:105, Ga 16:22, Tv 23:5) and retired 1 Pr 3:15; ran `gen-wallpapers.py` → 49
  wallpapers/avatars + `wallpapers.ts`. Coverage now: 32 verses, 14 paired both styles.
- **The runed gate → APPROVED as Ga 10:9.** Minh regenerated the archway and overwrote the
  rejected `…71238.png` in place. QA'd the stonework close-up: Elder Futhark runes gone, plain
  stone, no baked-in lettering; knight from behind (faceless), warm light through the gate,
  dark calm lower third. Routed to Session 1 to build as the **Ga 10:9 cinematic twin** (dark
  template, reuse Ga10-open-door-papercut's verse + `hope` mood). → will be card #50. NB the
  earlier "Ep 6:11 twin" label for this file was a mislabel; Ep 6:11 still needs a Firefly
  papercut twin.
- **Profile streak calendar — monthly default + 30/365 toggle** (`ProfilePage.tsx`, `App.css`).
  The year-long GitHub heatmap now defaults to a **30-day (monthly)** view with a `30 ngày /
  365 ngày` segmented toggle (title switches "Một tháng/năm cầu nguyện"). Monthly renders a
  **real labelled calendar** — weekday headers (CN–T7) + day numbers + today ring, reusing the
  StreakCard month styles, centered — not a bare block of squares (Minh: "no context, we don't
  know what that is"). Yearly keeps the wide heatmap. Verified in local preview. **Ships together
  with the wallpaper feature** after Minh's local review — NOT pushed.

## 2026-08-27 — Wallpaper catalog generator fix (app was stuck at 22/39)

- **Blocker (found by the compositor session):** `scripts/gen-wallpapers.py` hard-failed
  (SystemExit) so the app's `src/data/wallpapers.ts` was stale at 22 cards while the AI Art
  library had grown to 39. Cause: `find_card` inferred the card filename from ref+style+NN,
  which became ambiguous once we added a 2nd verse from the same book+chapter (Tv 23:5 beside
  Tv 23:1) and a 2nd papercut variant on one verse (Mt 11:28). It failed loudly (never
  mis-paired a verse with wrong art — good).
- **Fix:** `find_card` now (a) PREFERS an explicit `card` column in CREDITS.csv (unambiguous;
  the compositor is populating it), and (b) falls back to inference with a **subject-slug
  disambiguation** that resolves the 4 collisions. Regenerated: **39 wallpapers + 39 avatars +
  wallpapers.ts, tsc clean**, pairing spot-checked (good-shepherd → Tv 23:1, correct). App now
  serves all 39. Still LOCAL — nothing pushed (ship gate holds; this makes Minh's eventual
  local review show the real 39-card build with every style toggle).
- Delivery size confirmed fine: shipped JPEGs ~344 KB each, all 39 ≈ 13 MB (the 319 MB in
  `cards/` is the archive). 28 verses still `pending` (no art) — roadmap has batches left.

## 2026-08-27 — Prayer wall: 4 more intercessions (now 8)

- Added 4 bilingual intercessions to `src/data/intercessions.ts` (the "🙏 Praying for you"
  card's rotating set) — grounded in authentic VN Catholic prayer language after searching
  Vietnamese diocese/prayer resources. New addressees fill gaps the first 4 (Father, Jesus,
  Lord, Mary) didn't cover: **Chúa Thánh Thần** (Holy Spirit — completes the Trinity),
  **Thánh Tâm Chúa Giêsu** (Sacred Heart), **Thánh Cả Giuse** (St. Joseph), **Các Thánh Nam
  Nữ** (Communion of Saints — "you are not alone"). Same register/length, VI-first, end "Amen".
  No push — awaiting Minh's review of the VN wording.

## 2026-08-26 — Scripture wallpaper reward: front-end code built (LOCAL ONLY)

- **Wallpaper feature CODE is now built and verified in the local dev server** — not
  pushed, not deployed. Ship gate stands: Minh reviews locally before anything ships
  ([[feedback-wallpaper-local-review]]).
- New files:
  - `src/data/wallpapers.ts` — typed catalog, auto-generated by `scripts/gen-wallpapers.py`
    (reads the AI Art library CREDITS.csv, downscales cards→`public/wallpapers/` and
    avatars→`public/avatars/`, emits the TS). 22 wallpapers, 11 moods, styles
    `papercut`|`cinematic`.
  - `src/lib/wallpaperCollection.ts` — localStorage state (`rosary.wallpapers.v1`) +
    selectors (earned list, un-owned claim pool per mood, moods-with-new).
  - `src/state/useWallpaperCollection.ts` — the hook (`earned`, `avatar`, `claim`, `setAvatar`).
  - `src/components/WallpaperReward.tsx` — the post-rosary gift, as a **wrapped surprise**:
    (1) pick a feeling ("Hôm nay bạn cần gì?") — free + reversible ("← Chọn cảm giác khác");
    (2) open a wrapped 🎁 — the card stays hidden until they choose to open it; (3) on open,
    see one card **per style** (Nhẹ nhàng / Điện ảnh) and keep **exactly one** — the others
    stay un-owned as future gifts. No browsing the catalog, no re-roll, and **no going back
    once opened**. Ends with a "come back tomorrow for another gift" note + save / set-as-avatar.
    Out-of-stock message when nothing new remains; skippable before opening.
  - `src/components/WallpaperGallery.tsx` — profile section "Ảnh nền của bạn": progress
    bar (n/22), tiles newest-first, avatar badge, tap→viewer (re-download / set avatar).
- Wired in: `PickerPage` opens the reward on `justFinished`; `ProfilePage` shows the gallery.
- **Verified locally:** reward flow (mood chips, sorrowful hidden when empty, style toggle,
  keep-claim stays on the claimed card), gallery (progress bar, tile, viewer, set-avatar
  persists + badge). `tsc --noEmit` clean.
- **Gift credits (banked rewards):** a finished rosary banks **one gift credit at
  completion** (`grantGift()` in ReadingPage, ref-guarded to once per prayed rosary), so
  quitting before picking never loses the reward. Redeeming a wallpaper spends a credit.
  The profile gallery shows a **"Bạn có N món quà chưa mở 🎁"** banner to open banked gifts
  anytime; the reward modal shows "Mở món quà tiếp theo (còn N)" when several are stacked,
  and out-of-stock **keeps** the credit for when new art ships. Credits are **forward-only**
  — existing users start at `pending: 0`, never backfilled from past rosaries. The
  collection is now a **shared external store** (`useSyncExternalStore`) so the gallery and
  the reward modal it renders stay in sync live (fixed a stale-second-instance bug).
- **Account sync (mirrors the streak):** the collection is NOT sign-in-gated — everyone gets
  the reward device-local (no login wall at the moment of delight), and it **merges into the
  account on sign-in** so it follows the user across devices and survives a browser clear.
  New files: `supabase/wallpaper-sync.sql` (tables `user_wallpapers` [earned set, append-only]
  + `user_wallpaper_prefs` [avatar], RLS like `user_prayer_days` — **Minh runs this SQL**),
  `src/lib/wallpaperSync.ts` (push/fetch, fail-open, `accountActive` gate so signed-out writes
  never fire), `src/state/useWallpaperSync.ts` (mounted once in App: on sign-in, merge = union
  of local+server earned, avatar prefers local then server). Claims/avatar changes push to the
  account while signed in. **Pending credits stay device-local** (transient, not worth syncing).
  The gallery shows an honest note: signed-out → "saved on this device, sign in to keep it
  across devices (images you saved to your phone are never lost)"; signed-in → "✓ synced".
  Verified: signed-out note renders, no runtime errors on a clean load. **Sync itself is
  untested against the live DB** until Minh runs the migration + signs in on two devices.
- **Avatar display:** the chosen wallpaper avatar (a `/avatars/<id>.jpg` crop of the art) now
  shows in **two places** — the profile header (`.pf-avatar`) and the shared **AppHeader
  profile button** (`.landing-profile-btn`, visible on every page except the profile itself).
  Precedence: **wallpaper avatar → Google photo → icon/🙏**, so a deliberate art choice wins
  over the Google photo. NOT shown on the prayer wall — that surface is anonymous by design.
  Deliberately NOT on the share card (Minh's call).
- **Avatar gated to signed-in users (gentle nudge):** "Đặt làm ảnh đại diện" is a profile/
  identity action, so signed-out users get a sign-in prompt instead of setting it (the reward,
  keep, and Save all stay open to everyone). Reuses `SignInModal` with a new optional `lead`
  (avatar-context copy) + `elevated` prop. Two supporting fixes: `SignInModal`/`Modal` gained
  an optional backdrop `className`, and **`Modal` is now portaled to `<body>`** (`createPortal`)
  so its `position:fixed` backdrop always covers the viewport and can stack (`.modal-elevated`,
  z-3100) above the full-screen wallpaper overlays (z-3000) — previously a nested Modal was
  confined by the profile layout and rendered hidden behind the gallery viewer.
- **Papercut palette fix (corrected 2026-08-27):** the README house-style block was making
  single-object papercut subjects monochromatic. First fix (08-26) over-corrected by mandating
  a fixed rich palette on every image → colors came out **forced** (rainbow bird, mauve sun
  rings) = a new uniformity. Corrected principle: **natural local color** — color arises from
  what each element actually is (foliage green, fruit its ripe hue, sky golden-hour), warmth is
  the unifying *light* not a mandated set of papers, and most of the picture stays quiet. Avoid
  BOTH monochrome AND a forced rainbow (see `good-shepherd-papercut-01` = naturally colored).
  README block + Firefly recolor prompt rewritten to a light-touch, natural-color instruction.
  Minh triages which cards to redo.

## 2026-08-26 — Scripture wallpaper reward: plan + first 9 cards

- New feature in progress: a **post-rosary Scripture-wallpaper reward**. Warm **paper
  cut-out** art (Adobe Firefly, no text) + a verified/warmed CGKPV verse composited in.
  Model decided: **pick by mood** — "Hôm nay bạn cần gì? / What do you need today?" → a
  verse from the chosen feeling. **10 categories** (weary, anxious, lonely, sorrowful,
  unloved, small, peace, hope, strength, faith). Plus a **profile gallery** (re-download,
  synced like streaks) and an out-of-stock "more coming" message.
- Assets live in the shared **`..\AI Art\`** library (sibling of Catholic Images):
  `images/` (source art), `cards/` (finished wallpapers), `CREDITS.csv` (+ `mood`/`style`
  columns), `README.md`, and **`WALLPAPER-PLAN.md`** (the full taxonomy + verse lists).
  Compositing script: `scratchpad/build-card.js` (cream-extend + fade, auto verse
  placement below art, Source Serif 4 italic wt 600, 2160×4680). See memory
  [[reference-ai-art-library]].
- **Done — 9 cards:** Tv 23:1 ×3 variants, Is 49:15, Mt 11:28, Mt 6:26, Mt 28:20, Lc 12:7.
  **Next:** generate the non-done verses per category; then build the picker + profile
  gallery UI + the gift-after-rosary screen. (App code for this not started yet.) The
  **front-end UX is now spec'd** in `AI Art/WALLPAPER-PLAN.md` (mood picker → contextual
  style toggle → save/avatar; profile "Ảnh nền của bạn" gallery w/ progress + filters +
  locked-slots-OFF-by-default) with reference mockups in `AI Art/design/`. Two-session
  coordinator/worker build workflow + dark-card (knight) template also set up.

## 2026-08-26 — Rosary exit button: house icon + leave confirm

- The rosary (`ReadingPage`) header button was an odd-one-out: a circled down-arrow
  labelled "restart" (leftover from before the shared header), while wall/profile/admin
  use a left back-arrow. Replaced it with a proper **house icon**, label "Trang chủ /
  Home", and a **"Rời khỏi chuỗi Mân Côi? / Leave the rosary?" confirm** before leaving —
  a deliberate exit since you're mid-prayer. The other pages keep the plain back-arrow
  (leaving them isn't a big action), so the distinction is now intentional. NOTE:
  `.icon-button-back svg` applies `transform: rotate(90deg)` (for the arrow icons), so the
  house button uses plain `.icon-button` — don't add `icon-button-back` or it tips 90°.
- **Wallpaper reward — art direction change.** Dropped the dark public-domain oil
  paintings (great for reverence, wrong for a "feel-good" reward). New direction:
  original **designed** cards — warm light gradients, elegant serif Scripture
  (Cormorant Garamond), subtle light-ray/olive-sprig motifs, verified CGKPV text. Bright,
  consistent, no licensing. Sample built (`scratchpad/warm-card.html`, Mt 11:28). Plan:
  full set of 6 across warm palettes (dawn gold / morning blue / blush / sage / amber).

## 2026-08-26 — Admin link in settings + new-requests badge on wall title

- **Admin panel link in the settings menu, admins only.** New cached `useIsAdmin` hook
  (`state/useIsAdmin.ts`) — one `is_admin` RPC per session, not per page. `AppHeader`
  passes `isAdmin` to `SettingsPanel`, which renders a gold "🛡️ Trang quản trị / Admin
  panel" button → `/quan-tri` when true. Signed-out/non-admins see nothing; the page
  itself still self-gates server-side.
- **New-requests red badge also on the wall title** (in addition to the pill). Fixed a
  latent StrictMode/remount bug where the mount effect read *and* reset last-seen,
  zeroing the count — now captures last-seen once at first render.

## 2026-08-26 — Profile "your prayers" + new-requests badge

- **Profile now shows the signed-in user's own prayer requests** (`ProfilePage`) — a
  "Your prayer requests" section listing their posts with 🙏 counts + Delete, plus a
  note that on the wall they stay anonymous. Uses the existing `getMyRequests` /
  `deleteRequest` (RLS scopes reads to the owner), so it's private to them.
- **New-requests badge** — a red count of prayer requests from *others* since this
  device last viewed the wall. New RPC `count_new_requests(p_since)` in
  `community-schema.sql` (**Minh must run it in Supabase**); device-local last-seen in
  `prayerWall.ts`; shared `useNewRequests` hook. Shows: (1) as a red corner badge on the
  **post-rosary nudge** only (never on the cold landing — verified no RPC call there),
  (2) as a soft "N new since your last visit" pill atop the wall, which resets on view.

## 2026-08-26 — Admin members backfill + Mt 28:20 holy card

- **Members list only showed banned users.** Root cause: `profiles` rows are created
  by the `on_auth_user_created` trigger, which only fires for NEW sign-ups; accounts
  that authenticated before the trigger existed had no row, so `admin_list_members`
  (which already defaults to the "All" filter in the UI) couldn't see them — only
  banned users, whose rows exist because a ban writes them. Fix: added a one-time,
  re-runnable backfill to `supabase/admin.sql` (`insert into profiles select id from
  auth.users on conflict do nothing`) + a diagnostic count. Minh runs it in the
  Supabase SQL editor. No app-code change needed.
- **Holy-card wallpaper (Mt 28:20)** art swapped to Hofmann's *Head of Christ*
  (public domain, d. 1911), sourced from Wikimedia — warm frontal gaze, replaces the
  Grünewald crop that had grabbed a fallen soldier. 3 of 6 sample cards done.
- **TWA address bar — ROOT CAUSE FOUND & FIXED.** Never a cache issue. Via `adb`:
  Chrome logged `cr_WebAppLaunchHandler: Target url verification has been failed`. Pulled
  the actually-installed `base.apk` off the S24 and parsed its signing block — the app is
  now signed with classical cert `F1:E9:18:20:A3:EF:93:C5:…:08:34`, which was in NEITHER
  the assetlinks fingerprint list (`D4:5A…`, `4F:28…`). Play's app-signing key changed
  when the app was enrolled in **post-quantum / v3.2 ML-DSA hybrid signing** (the
  "Classical key or Post-quantum" prompt). Fix: added `F1:E9…` to
  `public/.well-known/assetlinks.json` (kept the old two as backups) → redeploy. After
  deploy, force-stop Chrome + app to re-verify.

## Current state (2026-08-13)

Feature-complete and deployed on Vercel (`dockinhmancoi.com`). Working tree clean.
Bilingual (VI/EN) visual Rosary: pick a mystery set on the landing page, then step
through the full sequence one prayer per screen with a bead rail, per-bead public-
domain artwork, scripture verses, and a settings panel.

### Recently completed
- **Admin moderation panel `/quan-tri` (2026-08-26)** — in-app wall moderation so Minh
  doesn't need the Supabase dashboard. New `supabase/admin.sql` (**Minh runs it**):
  `is_admin()` + SECURITY-DEFINER, admin-gated RPCs `admin_list_requests(filter)` (returns
  ALL requests incl. hidden/removed + user_id + report/prayed counts + poster ban/total),
  `admin_set_status(id,status)` (visible/hidden/removed), `admin_set_ban(user_id,bool)`.
  Frontend: `src/lib/admin.ts`, `src/pages/AdminPage.tsx` (route `/quan-tri`, production but
  self-gates via `amIAdmin()` — non-admins see "no access"). Filters: Reported/All/Visible/
  Hidden/Removed; per-post Hide/Remove/Restore + Ban/Unban poster. To activate: run admin.sql,
  then `update public.profiles set is_admin=true where id='<Minh's UUID>'`. Styles `.adm-*`.
  Still TODO (Minh wants both): **email alerts** on new/reported posts (needs a Resend acct +
  Supabase Edge Function / webhook; recipient email is configurable to any address).
- **App-store Step 1: PWA store-ready (2026-08-26)** — prep for wrapping the site as a
  Google Play (TWA) app first, iOS later via cloud-Mac ([[roadmap]] decision). (a) Re-added a
  proper versioned service worker `public/sw.js` (`rosary-v2`: network-first navigations so
  online users always get the latest deploy, cache-first immutable assets, old-cache cleanup,
  skipWaiting+claim) and re-registered it in `main.tsx` (PROD only). This replaces the
  kill-switch; everyone installs the clean v2 fresh, so the earlier stale-cache bug doesn't
  carry over. (b) Added a true **maskable icon** (`/logo/png/icon-maskable-{192,512}.png`,
  full-bleed brand bg + mark scaled into the safe zone) and pointed the manifest's `maskable`
  entries at it (were reusing the tight `any` icon, which would clip under Android's circle
  mask). (c) Staged `public/.well-known/assetlinks.json` (Digital Asset Links) with PLACEHOLDER
  package name `com.dockinhmancoi.twa` + fingerprint — **fill the real SHA-256 from Play Console
  after generating the package**. Next: Minh makes the $25 Play Console account; then PWABuilder
  → Android package → listing (reuse Threads mockups + raw screenshots) → Data Safety → submit.
- **Fix: total < streak after sign-in (2026-08-25)** — "Tổng số chuỗi" (`total`) is a
  device-local completion counter that isn't synced to the account, while the streak/heatmap
  merge in prayed *days* synced from the account. So a signed-in user could see total (e.g. 1)
  lower than their longest streak (e.g. 6). Fixed by displaying `Math.max(total, daySet.size)`
  in `computeStatsFromDays` — you can't pray N distinct days with fewer than N rosaries. Local-only
  users are unaffected (local total ≥ local day count).
- **Profile heatmap: no scrollbar on desktop (2026-08-25)** — the ~53-week heatmap
  (~739px) overflowed `.pf-main`'s 640px cap and showed a horizontal scrollbar even on
  wide desktops. Added a `@media (min-width: 900px)` rule widening `.pf-main` to 820px and
  setting `.pf-heatmap-scroll { overflow-x: visible }` so the full year fits without a
  scrollbar. Mobile keeps `overflow-x: auto` (scrolling the grid there is fine).
- **Post-rosary "pray for someone" nudge (2026-08-25)** — finishing a rosary
  (`ReadingPage` swipe-past-end) now navigates home with `{ state: { justFinished: true } }`;
  `PickerPage` then shows a **small dismissible bubble above the Prayer Requests button**
  (`.community-nudge`, with a ×) — "🙏 Cầu nguyện cho một người? / Pray for someone?".
  It sits inline in the flow (does NOT cover the streak), tapping it opens the wall
  (`/y-cau-nguyen`), the × closes it. History state is cleared after reading so a refresh
  won't re-trigger it. (Was briefly a full-screen modal; changed to this inline bubble.)
  Also: the collapsed "What is this page?" pill (`.pw-pinned-show`) is now right-aligned to
  match the Hide button.
- **Wall order + button readability (2026-08-25)** — moved the pinned welcome note (and its
  collapsed "What is this page?" pill) ABOVE the post/sign-in box, so the intro reads before
  the invitation to post. Made the wall's text buttons opaque so they're legible over the
  artwork: `.pw-sort button` now has a dark bg (active tab = solid gold), and `.pw-pinned-show`
  a dark bg with gold text.
- **Wall hero trimmed + dismissible pinned note (2026-08-25)** — the hero description
  (`.pw-lead` + `.pw-anon-note`) was redundant with Minh's pinned note, so it's removed
  (hero now = eyebrow + title only). The pinned card got a **Hide** button
  (`.pw-pinned-hide`); dismissing it is remembered per device via localStorage
  (`rosary.wall.pinnedHidden`), so it stays hidden across reloads. When hidden, a small
  gold "ⓘ Trang này là gì? / What is this page?" pill (`.pw-pinned-show`) takes its place
  and reopens the note (clearing the flag) — a clean Hide ↔ reopen toggle. (Account-level
  persistence not added — device localStorage suffices.)
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
