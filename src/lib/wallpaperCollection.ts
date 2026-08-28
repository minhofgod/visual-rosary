import { WALLPAPERS, MOODS, type Wallpaper, type MoodSlug, type WallpaperStyle, type Mood } from '../data/wallpapers';
import { pushEarned, fetchServerEarned, pushAvatar, fetchAvatar } from './wallpaperSync';
import { markWallpaperMerge } from './syncNotice';
import { localDateKey } from './prayerStreak';

// The wallpapers a user has collected (one per finished rosary) + which one is set as
// their community avatar. Device-local for now; a later step can merge this into the
// account on sign-in, exactly like the streak (useStreak / streakSync).

const KEY = 'rosary.wallpapers.v1';
// Where an unparseable collection is preserved instead of being silently overwritten.
const CORRUPT_KEY = 'rosary.wallpapers.v1.corrupt';

export interface WallpaperState {
  /** ids of collected wallpapers, oldest first (append order). */
  earned: string[];
  /** id of the wallpaper whose crop is the user's avatar, or null. */
  avatar: string | null;
  /** unopened gift credits — one per finished rosary, redeemed by keeping a wallpaper.
   * Banked at completion so quitting before picking never loses the reward. */
  pending: number;
  /** Local date (YYYY-MM-DD) a gift was last granted, or null. ONE GIFT PER DAY: praying a
   * second rosary the same day does not mint a second credit, which is what the kept screen's
   * "come back tomorrow" copy promises. Also closes the refresh loophole — the closing screen
   * keeps its step in the URL hash, so a remount would otherwise grant again with no praying. */
  lastGiftDay: string | null;
  /** An opened-but-unkept gift's frozen verse ref. Persisted so "Để sau" then reopening
   * resumes the SAME gift at the style chooser instead of re-rolling a new random verse
   * (which would be a preview-shopping loophole). Cleared when a card is kept. */
  giftRef: string | null;
}

export function loadCollection(): WallpaperState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<WallpaperState>;
      return {
        earned: Array.isArray(p.earned) ? p.earned.filter((x) => typeof x === 'string') : [],
        avatar: typeof p.avatar === 'string' ? p.avatar : null,
        pending: typeof p.pending === 'number' && p.pending > 0 ? Math.floor(p.pending) : 0,
        giftRef: typeof p.giftRef === 'string' ? p.giftRef : null,
        lastGiftDay: typeof p.lastGiftDay === 'string' ? p.lastGiftDay : null,
      };
    }
  } catch {
    // Corrupt or unreadable. Returning empty here means the very next write OVERWRITES whatever
    // was there — for a signed-out person that is their whole collection, gone unrecoverably.
    // Stash the raw value first so it can be recovered by hand; a signed-in person also gets
    // theirs back from the account on the next sync.
    try {
      const raw = localStorage.getItem(KEY);
      if (raw && !localStorage.getItem(CORRUPT_KEY)) localStorage.setItem(CORRUPT_KEY, raw);
    } catch {
      /* storage fully unavailable — nothing to preserve */
    }
  }
  return { earned: [], avatar: null, pending: 0, giftRef: null, lastGiftDay: null };
}

export function saveCollection(state: WallpaperState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage disabled — session-only */
  }
}

// ---- Shared reactive store --------------------------------------------------
// One in-memory copy of the collection with a subscriber list, so every component
// (the profile gallery and the reward modal it renders, or the picker) sees the same
// state and re-renders together — no stale second hook instance. Persisted to
// localStorage on every write; kept in sync across tabs via the 'storage' event.

let current: WallpaperState = loadCollection();
const listeners = new Set<() => void>();

function commit(next: WallpaperState): void {
  current = next;
  saveCollection(next);
  listeners.forEach((l) => l());
}

export function subscribeCollection(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Stable snapshot for useSyncExternalStore — same reference until a write happens. */
export function getCollectionSnapshot(): WallpaperState {
  return current;
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      current = loadCollection();
      listeners.forEach((l) => l());
    }
  });
}

/** Bank one gift credit — called when a rosary is completed, so the reward is earned at
 * completion (quitting before picking never loses it). Returns the new pending total.
 *
 * ONE GIFT PER DAY (Minh, 2026-08-27). A second rosary the same day is still counted by the
 * streak and the public counter, but earns no second card: the kept screen promises "come back
 * tomorrow", and per-rosary credits made the collection farmable — the closing step lives in the
 * URL hash, so refreshing that screen remounts with `isComplete` already true and used to mint a
 * credit with no praying at all. Day-keyed on the DEVICE's local date, matching the streak. */
export function grantGift(): number {
  const today = localDateKey();
  if (current.lastGiftDay === today) return current.pending;
  commit({ ...current, pending: current.pending + 1, lastGiftDay: today });
  return current.pending;
}

/** Redeem one credit into a kept wallpaper (no-op if already owned; pending floors at 0).
 * Clears the in-progress gift ref — the gift is now completed. */
export function claimGift(id: string): void {
  if (current.earned.includes(id)) {
    if (current.giftRef !== null) commit({ ...current, giftRef: null });
    return;
  }
  commit({ ...current, earned: [...current.earned, id], pending: Math.max(0, current.pending - 1), giftRef: null });
  void pushEarned([id]); // no-op when signed out (fail-open)
}

/** Freeze (or clear) the opened gift's verse ref, so reopening resumes the same gift. */
export function setGiftRef(ref: string | null): void {
  if (current.giftRef === ref) return;
  commit({ ...current, giftRef: ref });
}

/** Set (or clear) the wallpaper used as the community avatar. */
export function setAvatarId(id: string | null): void {
  commit({ ...current, avatar: id });
  void pushAvatar(id); // no-op when signed out (fail-open)
}

// ---- Account sync (mirrors useStreak's merge-on-sign-in) --------------------
// One-time per page load: seed the account with this device's collection, read the
// account back, and merge (union of earned; avatar prefers the local choice, else the
// account's). Pending credits stay device-local. Guarded so multiple mounted hooks
// don't each run it.
let syncStarted = false;

export async function syncCollectionFromAccount(): Promise<void> {
  if (syncStarted) return;
  syncStarted = true;
  const local = current;
  // Read the account's existing collection FIRST, so we can tell whether this device holds
  // cards the account doesn't (a real local→account merge) vs. already in sync.
  const [serverEarned, serverAvatar] = await Promise.all([fetchServerEarned(), fetchAvatar()]);
  const serverSet = new Set(serverEarned);
  const newFromLocal = local.earned.filter((id) => !serverSet.has(id));
  if (newFromLocal.length > 0) {
    await pushEarned(newFromLocal); // seed the account with this device's local-only cards
    markWallpaperMerge(); // a genuine merge — arm the one-time "synced" confirmation
  }
  if (local.avatar) await pushAvatar(local.avatar);
  const mergedEarned = Array.from(new Set([...current.earned, ...serverEarned]));
  const avatar = current.avatar ?? serverAvatar;
  commit({ ...current, earned: mergedEarned, avatar });
}

/** Allow the merge to run again after a sign-out → sign-in. */
export function resetCollectionSync(): void {
  syncStarted = false;
}

export function wallpaperById(id: string): Wallpaper | undefined {
  return WALLPAPERS.find((w) => w.id === id);
}

/** Collected wallpapers, newest last (matches append order). */
export function earnedWallpapers(earned: string[]): Wallpaper[] {
  return earned.map(wallpaperById).filter((w): w is Wallpaper => Boolean(w));
}

/** Wallpapers in a mood the user has NOT collected yet (the claim pool). */
export function unownedInMood(mood: MoodSlug, earned: string[]): Wallpaper[] {
  return WALLPAPERS.filter((w) => w.mood === mood && !earned.includes(w.id));
}

/** Styles that still have an un-owned wallpaper in this mood (drives the style toggle). */
export function unownedStyles(mood: MoodSlug, earned: string[]): WallpaperStyle[] {
  return [...new Set(unownedInMood(mood, earned).map((w) => w.style))];
}

/** Moods that still have at least one un-owned wallpaper (the reward picker's chips). */
export function moodsWithNew(earned: string[]): Mood[] {
  return MOODS.filter((m) => unownedInMood(m.slug, earned).length > 0);
}

/** Total distinct wallpapers in the whole catalog (for the gallery's "X / total"). */
export const TOTAL_WALLPAPERS = WALLPAPERS.length;
