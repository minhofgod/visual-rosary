import { useEffect, useState } from 'react';
import { countNewRequests, getWallLastSeen } from '../lib/prayerWall';

/**
 * Number of new prayer requests (from other people) since this device last viewed the
 * wall. Only fetches while `active` is true — so the count is computed for the
 * post-rosary nudge, never eagerly on the cold landing page.
 */
export function useNewRequests(active: boolean): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    let cancelled = false;
    countNewRequests(getWallLastSeen()).then((n) => {
      if (!cancelled) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, [active]);
  return count;
}
