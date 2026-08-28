import { useSyncExternalStore } from 'react';
import {
  subscribeCollection,
  getCollectionSnapshot,
  claimGift,
  setAvatarId,
  setGiftRef,
} from '../lib/wallpaperCollection';

/**
 * React state over the device-local wallpaper collection (earned ids, chosen avatar, and
 * un-opened gift credits). Backed by a shared external store so every mounted instance —
 * the profile gallery and the reward modal it renders — stays in sync and re-renders
 * together. Device-local for now; a later step can merge it into the account on sign-in,
 * exactly like the streak (useStreak / streakSync).
 */
export function useWallpaperCollection() {
  const state = useSyncExternalStore(subscribeCollection, getCollectionSnapshot);
  return {
    earned: state.earned,
    avatar: state.avatar,
    pending: state.pending,
    /** An opened-but-unkept gift's frozen verse ref (resume the same gift on reopen). */
    giftRef: state.giftRef,
    /** Redeem one credit into a kept wallpaper. */
    claim: claimGift,
    /** Set or clear the community avatar. */
    setAvatar: setAvatarId,
    /** Freeze/clear the opened gift's verse ref. */
    setGiftRef,
  };
}
