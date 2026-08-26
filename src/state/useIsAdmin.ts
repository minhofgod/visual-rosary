import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { amIAdmin } from '../lib/admin';

// Cache the admin check per user for the session, so the header on every page doesn't
// fire a fresh is_admin RPC on each navigation.
let cache: { uid: string; value: boolean } | null = null;

/** Whether the signed-in user is an admin (false while signed out or still checking). */
export function useIsAdmin(): boolean {
  const auth = useAuth();
  const uid = auth.user?.id ?? null;
  const [isAdmin, setIsAdmin] = useState<boolean>(() => (cache && cache.uid === uid ? cache.value : false));

  useEffect(() => {
    if (!uid) {
      setIsAdmin(false);
      return;
    }
    if (cache && cache.uid === uid) {
      setIsAdmin(cache.value);
      return;
    }
    let cancelled = false;
    amIAdmin().then((value) => {
      cache = { uid, value };
      if (!cancelled) setIsAdmin(value);
    });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return isAdmin;
}
