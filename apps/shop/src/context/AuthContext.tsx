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
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { queryClient } from '@/lib/queryClient';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  roles: UserRole[];
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Safely extract roles from a session's app_metadata. */
const extractRoles = (session: Session | null): UserRole[] => {
  const parsed = UserRolesArraySchema.safeParse(
    session?.user?.app_metadata?.roles,
  );
  return parsed.success ? parsed.data : [];
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    queryClient.clear();
    setSession(null);
  };

  const refreshSession = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.refreshSession();
      if (data.session) {
        setSession(data.session);
      }
    } catch {
      setSession(null);
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
