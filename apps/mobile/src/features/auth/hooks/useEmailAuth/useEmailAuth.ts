import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { LoginForm, RegisterForm } from '../../schemas';

/** Hook for email/password authentication with Supabase */
const useEmailAuth = () => {
  const login = useMutation({
    mutationFn: async ({ email, password }: LoginForm) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
  });

  const register = useMutation({
    mutationFn: async ({ email, password, displayName }: RegisterForm) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;

      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          display_name: displayName,
        });
      }

      return data;
    },
  });

  return { login, register };
};

export default useEmailAuth;
