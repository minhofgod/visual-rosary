import { supabase } from './supabaseClient';

// Data layer for the prayer-request wall. All reads/actions go through the SQL
// functions defined in supabase/community-schema.sql, which keep posters anonymous
// (the client never receives a user_id) and enforce moderation server-side.

export interface WallItem {
  id: string;
  body: string;
  prayed_count: number;
  created_at: string;
  is_mine: boolean;
  prayed_by_me: boolean;
}

export type WallSort = 'new' | 'prayed' | 'needs';

/** Reads the wall (open to everyone). Returns [] if Supabase isn't configured. */
export async function getWall(sort: WallSort = 'new', limit = 30, offset = 0): Promise<WallItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('get_prayer_wall', { p_sort: sort, p_limit: limit, p_offset: offset });
  if (error) {
    console.error('getWall failed', error);
    return [];
  }
  return (data ?? []) as WallItem[];
}

/** Posts a new request (requires sign-in; enforced by RLS). Returns the new id. */
export async function createRequest(body: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('prayer_requests').insert({ body: body.trim() }).select('id').single();
  if (error) throw error;
  return data?.id ?? null;
}

/** Records a prayer for a request → returns the new count. */
export async function prayForRequest(requestId: string): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('pray_for_request', { p_request_id: requestId });
  if (error) {
    console.error('prayForRequest failed', error);
    return null;
  }
  return typeof data === 'number' ? data : null;
}

/** Files a report against a request (auto-hides after a few reports, server-side). */
export async function reportRequest(requestId: string, reason?: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc('report_request', { p_request_id: requestId, p_reason: reason ?? null });
  if (error) {
    console.error('reportRequest failed', error);
    return false;
  }
  return true;
}

/** Blocks the (anonymous) poster of a request so their posts vanish from your feed. */
export async function blockPoster(requestId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc('block_poster', { p_request_id: requestId });
  if (error) {
    console.error('blockPoster failed', error);
    return false;
  }
  return true;
}

/** The signed-in user's own requests (for managing/deleting them). */
export async function getMyRequests(): Promise<WallItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('prayer_requests')
    .select('id, body, prayed_count, created_at, status')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getMyRequests failed', error);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    body: r.body,
    prayed_count: r.prayed_count,
    created_at: r.created_at,
    is_mine: true,
    prayed_by_me: false,
  }));
}

/** Deletes one of the user's own requests (RLS allows deleting only your own). */
export async function deleteRequest(requestId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('prayer_requests').delete().eq('id', requestId);
  if (error) {
    console.error('deleteRequest failed', error);
    return false;
  }
  return true;
}

// ---- "New since last visit" badge -----------------------------------------
// Device-local: we remember when this device last looked at the wall, and count how
// many requests (from other people) have appeared since. Deliberately per-device and
// never surfaced on the cold landing page — it's a gentle "there's news" hint, not a
// to-do the user is made to feel behind on.

const WALL_LAST_SEEN_KEY = 'rosary.wall.lastSeen';

/** ISO timestamp of when this device last viewed the wall (null if never). */
export function getWallLastSeen(): string | null {
  try {
    return localStorage.getItem(WALL_LAST_SEEN_KEY);
  } catch {
    return null;
  }
}

/** Marks the wall as seen right now, so the "new" count resets to zero. */
export function markWallSeen(): void {
  try {
    localStorage.setItem(WALL_LAST_SEEN_KEY, new Date().toISOString());
  } catch {
    /* private mode / storage disabled */
  }
}

/**
 * How many new, visible requests from OTHER people have appeared since `since`.
 * Returns 0 when the device has never opened the wall (so a first-timer isn't shown a
 * backlog). Mirrors get_prayer_wall's visibility/blocking filters server-side.
 */
export async function countNewRequests(since: string | null): Promise<number> {
  if (!supabase || !since) return 0;
  const { data, error } = await supabase.rpc('count_new_requests', { p_since: since });
  if (error) {
    console.error('countNewRequests failed', error);
    return 0;
  }
  return typeof data === 'number' ? data : 0;
}
