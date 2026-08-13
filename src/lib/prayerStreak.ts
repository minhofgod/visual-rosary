// Device-local prayer streak — no account, no server. Tracks which local-calendar
// days a rosary was completed on this device, plus a running total, in
// localStorage. Kept deliberately simple and fail-open (private-mode / disabled
// storage just yields an empty streak). The shape is designed so a future
// Supabase-Auth account can adopt the same data later without a rewrite.

const STORE_KEY = 'rosary.streak.v1';
const SESSION_GUARD_PREFIX = 'rosary.streak.logged.';

export interface StreakStats {
  total: number; // total rosaries completed on this device
  currentStreak: number; // consecutive days ending today (or yesterday)
  longestStreak: number;
  prayedToday: boolean;
  recentDays: { date: string; prayed: boolean }[]; // last 7 days, oldest → newest
  prayedDays: string[]; // all local YYYY-MM-DD days prayed (for the month calendar)
}

interface Stored {
  total: number;
  days: string[]; // unique local YYYY-MM-DD
}

/** Local-calendar day key (not UTC) — a personal streak follows the user's own day. */
function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return localDateKey(dt);
}

function read(): Stored {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { total: 0, days: [] };
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { total: 0, days: [] };
    const total = typeof parsed.total === 'number' ? parsed.total : 0;
    const days = Array.isArray(parsed.days) ? parsed.days.filter((x: unknown): x is string => typeof x === 'string') : [];
    return { total, days };
  } catch {
    return { total: 0, days: [] };
  }
}

function write(state: Stored): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // storage full / disabled (private mode) — the streak is a nice-to-have.
  }
}

/**
 * Mark today as prayed and bump the total. Guarded once per mystery per tab
 * session (mirroring the server-side counter) so refreshing the closing screen
 * doesn't double-count.
 */
export function recordCompletionLocal(mysteryKey: string): void {
  const guard = `${SESSION_GUARD_PREFIX}${mysteryKey}`;
  try {
    if (sessionStorage.getItem(guard)) return;
    sessionStorage.setItem(guard, '1');
  } catch {
    // sessionStorage unavailable — fall through and record anyway.
  }
  const state = read();
  const today = localDateKey();
  state.total += 1;
  if (!state.days.includes(today)) state.days.push(today);
  write(state);
}

function computeStreaks(daySet: Set<string>): { current: number; longest: number } {
  // Current streak: the run of consecutive days ending today — or ending
  // yesterday if today isn't prayed yet, so it doesn't visibly reset mid-day.
  const today = localDateKey();
  let anchor: string | null = null;
  if (daySet.has(today)) anchor = today;
  else if (daySet.has(addDays(today, -1))) anchor = addDays(today, -1);

  let current = 0;
  if (anchor) {
    let cursor: string = anchor;
    while (daySet.has(cursor)) {
      current++;
      cursor = addDays(cursor, -1);
    }
  }

  // Longest streak: longest run of consecutive days across the whole history.
  const sorted = [...daySet].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    run = prev && addDays(prev, 1) === day ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = day;
  }

  return { current, longest };
}

export function getStreakStats(): StreakStats {
  const state = read();
  const daySet = new Set(state.days);
  const { current, longest } = computeStreaks(daySet);
  const today = localDateKey();
  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6); // oldest → newest, ending today
    return { date, prayed: daySet.has(date) };
  });
  return {
    total: state.total,
    currentStreak: current,
    longestStreak: longest,
    prayedToday: daySet.has(today),
    recentDays,
    prayedDays: [...daySet].sort(),
  };
}
