import { useEffect, useState } from 'react';
import { getStreakStats, type StreakStats } from '../lib/prayerStreak';

// Reads the device-local streak once on mount. Completions are recorded on the
// reading screen, so by the time the landing page mounts (or re-mounts after a
// rosary) this reflects the latest state. null until read, so callers can render
// nothing during the (synchronous, but effect-deferred) first tick.
export function useStreak(): StreakStats | null {
  const [stats, setStats] = useState<StreakStats | null>(null);
  useEffect(() => {
    setStats(getStreakStats());
  }, []);
  return stats;
}
