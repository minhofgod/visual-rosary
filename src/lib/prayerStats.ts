import { supabase } from './supabaseClient';
import { isFeatureEnabled } from './featureFlags';
import type { MysteryKey } from '../data/types';

const SESSION_KEY_PREFIX = 'rosary.logged.';
const FLAG_KEY = 'prayer_counter';

/**
 * Logs one completed rosary (anonymous — no accounts, just a running tally).
 * Guarded per browser tab session so a page refresh on the closing screen
 * doesn't double-count; not a hard server-side guarantee, just good enough
 * for a fun public counter. Skipped entirely if the 'prayer_counter' feature
 * flag is switched off in Supabase.
 */
export async function logPrayerCompletion(mysteryKey: MysteryKey): Promise<void> {
  if (!supabase) return;
  if (!(await isFeatureEnabled(FLAG_KEY))) return;

  const sessionKey = `${SESSION_KEY_PREFIX}${mysteryKey}`;
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, '1');

  const { error } = await supabase.from('prayer_completions').insert({ mystery_key: mysteryKey });
  if (error) {
    // Don't let a stats failure be user-visible — this is a nice-to-have, not core functionality.
    console.error('Failed to log prayer completion', error);
    sessionStorage.removeItem(sessionKey);
  }
}

/** Total completed rosaries logged today (Vietnam day, Asia/Ho_Chi_Minh), across all
 * mystery sets. The day boundary lives in the get_prayers_today() SQL function. */
export async function getPrayersToday(): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_prayers_today');
  if (error) {
    console.error('Failed to fetch prayers-today count', error);
    return null;
  }
  return typeof data === 'number' ? data : null;
}

/** All-time total of completed rosaries logged, across all mystery sets (get_prayers_total() SQL). */
export async function getPrayersTotal(): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_prayers_total');
  if (error) {
    console.error('Failed to fetch prayers-total count', error);
    return null;
  }
  return typeof data === 'number' ? data : null;
}
