import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserRow } from '@tcg-trade-hub/database';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserRow | null;
  isLoading: boolean;
  isOnboarded: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    setProfile(data);
  };

  const refreshProfile = async () => {
    if (session?.user.id) {
      await fetchProfile(session.user.id);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const applySessionState = async (newSession: Session | null) => {
      if (!isMounted) return;

      setSession(newSession);

      if (!newSession?.user.id) {
        setProfile(null);
        return;
      }

      try {
        await fetchProfile(newSession.user.id);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        if (isMounted) {
          setProfile(null);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Avoid awaiting Supabase queries inside this callback; it can stall auth init on cold start.
      if (event === 'INITIAL_SESSION') {
        return;
      }
      void applySessionState(newSession);
    });

    void (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        await applySessionState(data.session);
      } catch (error) {
        console.error('Failed to initialize auth session:', error);
        if (isMounted) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const isOnboarded = profile !== null && profile.preferred_tcgs.length > 0;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isLoading,
        isOnboarded,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
