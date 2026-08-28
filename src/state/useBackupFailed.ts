import { useSyncExternalStore } from 'react';
import { subscribeBackupFailed, getBackupFailed } from '../lib/wallpaperSync';

/**
 * True when the last attempt to back the collection up to the account failed. The sync layer is
 * fail-open, so without this the person is never told — their collection would look saved while
 * living only on this device. Read by the gallery to show a plain warning.
 */
export function useBackupFailed(): boolean {
  return useSyncExternalStore(subscribeBackupFailed, getBackupFailed, () => false);
}
