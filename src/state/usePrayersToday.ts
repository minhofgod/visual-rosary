import { useEffect, useState } from 'react';
import { getPrayersToday, getPrayersTotal } from '../lib/prayerStats';
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

// All-time site total (companion to usePrayersToday). Same feature flag: off → null → render nothing.
export function usePrayersTotal() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    isFeatureEnabled(FLAG_KEY).then((enabled) => {
      if (cancelled || !enabled) return;
      getPrayersTotal().then((n) => {
        if (!cancelled) setCount(n);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return count;
}
