import { supabase } from './supabaseClient';
import { localDateKey } from './prayerStreak';

// Server-side prayer-day sync for signed-in users. Days are stored per account in
// public.user_prayer_days (see supabase/streak-sync.sql), so the streak + heatmap
// follow the user across devices. All calls are fail-open — a sync hiccup never
// breaks the (device-local) streak, which remains the source of truth offline.

/** Merge the device's local days into the account (idempotent — dedupes on conflict). */
export async function pushLocalDays(days: string[]): Promise<void> {
  if (!supabase || days.length === 0) return;
  const rows = days.map((day) => ({ day }));
  const { error } = await supabase
    .from('user_prayer_days')
    .upsert(rows, { onConflict: 'user_id,day', ignoreDuplicates: true });
  if (error) console.error('pushLocalDays failed', error);
}

/** Record today for the signed-in user (no-op if the day is already recorded). */
export async function recordDayServer(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('user_prayer_days')
    .upsert([{ day: localDateKey() }], { onConflict: 'user_id,day', ignoreDuplicates: true });
  if (error) console.error('recordDayServer failed', error);
}

/** Fetch all prayed days for the signed-in user (RLS returns only their own). */
export async function fetchServerDays(): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('user_prayer_days').select('day');
  if (error) {
    console.error('fetchServerDays failed', error);
    return [];
  }
  return (data ?? []).map((r) => r.day as string);
}
