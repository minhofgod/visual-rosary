import { useEffect, useState } from 'react';
import {
  getStreakStats, computeStatsFromDays, getLocalDays, getLocalTotal, type StreakStats,
} from '../lib/prayerStreak';
import { pushLocalDays, fetchServerDays } from '../lib/streakSync';
import { markStreakMerge } from '../lib/syncNotice';
import { useAuth } from './useAuth';

// Returns the streak stats. Renders the device-local streak instantly, then — if the
// user is signed in — merges the device's days into their account (one-time upsert,
// so pre-existing device streaks aren't lost) and reads the account back, so the
// streak follows the user across devices. Falls back to local-only when signed out.
export function useStreak(): StreakStats | null {
  const auth = useAuth();
  const [stats, setStats] = useState<StreakStats | null>(null);

  useEffect(() => {
    setStats(getStreakStats()); // local first — instant, no network

    if (!auth.isSignedIn) return;

    let cancelled = false;
    (async () => {
      const localDays = getLocalDays();
      // Read the account's existing days FIRST, so we can tell whether this device is
      // contributing anything new (a real local→account merge) vs. already in sync.
      const serverDays = await fetchServerDays();
      if (cancelled) return;
      const serverSet = new Set(serverDays);
      const newFromLocal = localDays.filter((d) => !serverSet.has(d));
      if (newFromLocal.length > 0) {
        await pushLocalDays(newFromLocal); // seed the account with this device's local-only history
        markStreakMerge(); // a genuine merge — arm the one-time "synced" confirmation
      }
      if (cancelled) return;
      const merged = Array.from(new Set([...localDays, ...serverDays]));
      setStats(computeStatsFromDays(merged, getLocalTotal()));
    })();

    return () => {
      cancelled = true;
    };
  }, [auth.isSignedIn]);

  return stats;
}
