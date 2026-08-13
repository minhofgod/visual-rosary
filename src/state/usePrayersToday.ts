import { useEffect, useState } from 'react';
import { getPrayersToday } from '../lib/prayerStats';
import { isFeatureEnabled } from '../lib/featureFlags';

const FLAG_KEY = 'prayer_counter';

// null: not yet loaded, or the feature is switched off remotely — either way,
// callers should render nothing rather than a loading state for this widget.
export function usePrayersToday() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    isFeatureEnabled(FLAG_KEY).then((enabled) => {
      if (cancelled || !enabled) return;
      getPrayersToday().then((n) => {
        if (!cancelled) setCount(n);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return count;
}
