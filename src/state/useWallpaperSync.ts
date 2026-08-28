import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { setAccountActive } from '../lib/wallpaperSync';
import { syncCollectionFromAccount, resetCollectionSync } from '../lib/wallpaperCollection';

/**
 * Keeps the device-local wallpaper collection in sync with the account, exactly like the
 * streak: when signed in, enable account writes and merge the device's collection into the
 * account (one-time, idempotent), then read it back so the collection follows the user
 * across devices. When signed out, disable writes and arm the merge for the next sign-in.
 * Mount once (App). Fail-open: no account / no network just leaves the local collection.
 */
export function useWallpaperSync(): void {
  const auth = useAuth();
  useEffect(() => {
    if (auth.isSignedIn) {
      setAccountActive(true);
      void syncCollectionFromAccount();
    } else {
      setAccountActive(false);
      resetCollectionSync();
    }
  }, [auth.isSignedIn]);
}
