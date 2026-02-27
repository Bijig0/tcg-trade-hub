import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type PropsWithChildren,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { UserRolesArraySchema, type UserRole } from '@tcg-trade-hub/database';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  roles: UserRole[];
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const isDev = import.meta.env.DEV;

/** Lazily import the Supabase client only on the browser. */
const getClient = async () => {
  const { getSupabaseBrowserClient } = await import('@/lib/supabase.client');
  return getSupabaseBrowserClient();
};

/** Safely extract roles from a session's app_metadata. */
const extractRoles = (session: Session | null): UserRole[] => {
  const parsed = UserRolesArraySchema.safeParse(
    session?.user?.app_metadata?.roles,
  );
  return parsed.success ? parsed.data : [];
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(!isDev);

  useEffect(() => {
    if (isDev) return;
    if (typeof window === 'undefined') return;

    let subscription: { unsubscribe: () => void } | null = null;

    getClient()
      .then((supabase) => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setIsLoading(false);
        });

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          setIsLoading(false);
        });
        subscription = data.subscription;
      })
      .catch(() => {
        setIsLoading(false);
      });

    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = await getClient();
    await supabase.auth.signOut();
    setSession(null);
  };

  const refreshSession = useCallback(async () => {
    const supabase = await getClient();
    const { data } = await supabase.auth.refreshSession();
    if (data.session) {
      setSession(data.session);
    }
  }, []);

  const roles = extractRoles(session);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        roles,
        isLoading,
        signOut,
        refreshSession,
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
