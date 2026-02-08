import { useMutation } from '@tanstack/react-query';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type OAuthProvider = 'google' | 'apple';

/** Hook for OAuth sign-in with Google or Apple via Supabase */
const useOAuth = () => {
  const signIn = useMutation({
    mutationFn: async (provider: OAuthProvider) => {
      const redirectTo = makeRedirectUri({ scheme: 'tcg-trade-hub' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success') {
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (sessionError) throw sessionError;

          // Create profile if first sign-in
          if (sessionData.user) {
            const { data: existingProfile } = await supabase
              .from('users')
              .select('id')
              .eq('id', sessionData.user.id)
              .single();

            if (!existingProfile) {
              await supabase.from('users').insert({
                id: sessionData.user.id,
                email: sessionData.user.email ?? '',
                display_name:
                  sessionData.user.user_metadata?.['full_name'] ??
                  sessionData.user.user_metadata?.['name'] ??
                  sessionData.user.email?.split('@')[0] ??
                  'Trader',
                avatar_url: sessionData.user.user_metadata?.['avatar_url'] ?? null,
              });
            }
          }

          return sessionData;
        }
      }

      throw new Error('OAuth sign-in was cancelled or failed');
    },
  });

  return { signIn };
};

export default useOAuth;
