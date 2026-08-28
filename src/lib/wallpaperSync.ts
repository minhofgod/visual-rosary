import { supabase } from './supabaseClient';

// Server-side wallpaper-collection sync for signed-in users. Earned wallpapers live in
// public.user_wallpapers and the chosen avatar in public.user_wallpaper_prefs (see
// supabase/wallpaper-sync.sql), so the collection follows the user across devices. All
// calls are fail-open — a sync hiccup never breaks the (device-local) collection, which
// stays the source of truth offline. Pending gift credits are NOT synced (device-local).

// Gate for writes: true only while a user is signed in. Set by useWallpaperSync on auth
// change, so a claim/avatar change made signed-out doesn't fire a doomed request.
let accountActive = false;
export function setAccountActive(v: boolean): void {
  accountActive = v;
  if (!v) setBackupFailed(false); // signed out — "not backed up" is expected, not a fault
}

// Whether the last attempt to back the collection up to the account FAILED. These calls are
// fail-open by design (a sync hiccup must never break the local collection), but silence is
// dangerous here: a collection that never reaches the server looks identical to one that did,
// so a signed-in person could believe they are safe when they are not. The gallery reads this
// to say so plainly. Only the EARNED-set calls flip it — the avatar is a preference, not data
// worth warning about losing.
let backupFailed = false;
const failListeners = new Set<() => void>();

function setBackupFailed(v: boolean): void {
  if (backupFailed === v) return;
  backupFailed = v;
  failListeners.forEach((l) => l());
}

export function subscribeBackupFailed(cb: () => void): () => void {
  failListeners.add(cb);
  return () => {
    failListeners.delete(cb);
  };
}

export function getBackupFailed(): boolean {
  return backupFailed;
}

/** Merge the device's earned ids into the account (idempotent — dedupes on conflict). */
export async function pushEarned(ids: string[]): Promise<void> {
  if (!supabase || !accountActive || ids.length === 0) return;
  const rows = ids.map((wallpaper_id) => ({ wallpaper_id }));
  const { error } = await supabase
    .from('user_wallpapers')
    .upsert(rows, { onConflict: 'user_id,wallpaper_id', ignoreDuplicates: true });
  if (error) console.error('pushEarned failed', error);
  setBackupFailed(Boolean(error));
}

/** Fetch all earned wallpaper ids for the signed-in user (RLS returns only their own). */
export async function fetchServerEarned(): Promise<string[]> {
  if (!supabase || !accountActive) return [];
  const { data, error } = await supabase.from('user_wallpapers').select('wallpaper_id');
  if (error) {
    console.error('fetchServerEarned failed', error);
    setBackupFailed(true);
    return [];
  }
  setBackupFailed(false);
  return (data ?? []).map((r) => r.wallpaper_id as string);
}

/** Store (or clear) the chosen avatar for the signed-in user. */
export async function pushAvatar(avatarId: string | null): Promise<void> {
  if (!supabase || !accountActive) return;
  const { error } = await supabase
    .from('user_wallpaper_prefs')
    .upsert([{ avatar_id: avatarId, updated_at: new Date().toISOString() }], { onConflict: 'user_id' });
  if (error) console.error('pushAvatar failed', error);
}

/** Fetch the signed-in user's chosen avatar id (null if none). */
export async function fetchAvatar(): Promise<string | null> {
  if (!supabase || !accountActive) return null;
  const { data, error } = await supabase.from('user_wallpaper_prefs').select('avatar_id').maybeSingle();
  if (error) {
    console.error('fetchAvatar failed', error);
    return null;
  }
  return (data?.avatar_id as string | null) ?? null;
}
