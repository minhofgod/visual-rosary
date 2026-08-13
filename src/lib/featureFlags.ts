import { supabase } from './supabaseClient';

/**
 * Reads a boolean flag from the `feature_flags` table, so features can be
 * switched off remotely (e.g. from the Supabase dashboard) without a
 * redeploy. Fails open (returns `defaultValue`) if Supabase isn't configured,
 * the row doesn't exist yet, or the request errors — a flags outage should
 * never be what breaks the feature it's supposed to gate.
 */
export async function isFeatureEnabled(key: string, defaultValue = true): Promise<boolean> {
  if (!supabase) return defaultValue;
  const { data, error } = await supabase.from('feature_flags').select('enabled').eq('key', key).maybeSingle();
  if (error || !data) return defaultValue;
  return data.enabled;
}
