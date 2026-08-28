// The one-time "✓ your local progress was synced to your account" confirmation.
//
// It should appear ONLY when a real local→account merge actually moved device-only data up
// (e.g. you built a streak / collected wallpapers offline, then signed in) — not on every
// signed-in visit, and never for a fresh account that had nothing to merge. The sync layer
// calls mark*Merge() when it genuinely pushed local-only rows; the profile UI calls
// consume*SyncNote() which returns true exactly once (then remembers it was shown).
//
// State lives in localStorage so the "merged" signal survives the navigation from wherever
// the merge ran (often the landing page) to the profile where the note is shown. Fail-open:
// if storage is unavailable the note simply never shows, which is harmless.

const KEY = {
  streakMerged: 'rosary.streakMerged',
  streakSeen: 'rosary.streakSyncSeen',
  wpMerged: 'rosary.wpMerged',
  wpSeen: 'rosary.wpSyncSeen',
} as const;

function set(key: string): void {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // storage disabled (private mode) — the note is a nice-to-have
  }
}

function has(key: string): boolean {
  try {
    return Boolean(localStorage.getItem(key));
  } catch {
    return false;
  }
}

/** Record that a real local→account streak merge just happened. */
export function markStreakMerge(): void {
  set(KEY.streakMerged);
}

/** Record that a real local→account wallpaper-collection merge just happened. */
export function markWallpaperMerge(): void {
  set(KEY.wpMerged);
}

/** True the first time it's asked after a real streak merge; marks it shown so it won't repeat. */
export function consumeStreakSyncNote(): boolean {
  if (has(KEY.streakSeen) || !has(KEY.streakMerged)) return false;
  set(KEY.streakSeen);
  return true;
}

/** True the first time it's asked after a real collection merge; marks it shown so it won't repeat. */
export function consumeWallpaperSyncNote(): boolean {
  if (has(KEY.wpSeen) || !has(KEY.wpMerged)) return false;
  set(KEY.wpSeen);
  return true;
}
