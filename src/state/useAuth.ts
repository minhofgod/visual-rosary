import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// Wraps Supabase Auth. Sign-in is only needed to POST a prayer request; reading the
// wall and praying for others stay open to everyone. Google + email magic link now;
// Apple slots in later (the redirect handling is provider-agnostic).
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Return to whatever page the user signed in from (profile, wall, …).
  const redirectTo = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : undefined;

  return {
    session,
    user: session?.user ?? null,
    isSignedIn: !!session,
    loading,
    /** available only when Supabase is configured */
    enabled: !!supabase,
    signInWithGoogle: () =>
      supabase?.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } }),
    /** sends a passwordless magic link to the given email */
    signInWithEmail: (email: string) =>
      supabase?.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } }),
    signOut: () => supabase?.auth.signOut(),
  };
}
