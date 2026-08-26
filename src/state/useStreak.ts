import { useEffect, useState } from 'react';
import {
  getStreakStats, computeStatsFromDays, getLocalDays, getLocalTotal, type StreakStats,
} from '../lib/prayerStreak';
import { pushLocalDays, fetchServerDays } from '../lib/streakSync';
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
      await pushLocalDays(localDays); // seed the account with this device's history
      const serverDays = await fetchServerDays();
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
