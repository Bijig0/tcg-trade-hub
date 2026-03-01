import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { profileKeys } from '../../queryKeys';
import type { TcgType } from '@tcg-trade-hub/database';

type UpdateProfileParams = {
  display_name?: string;
  avatar_url?: string | null;
  radius_km?: number;
  preferred_tcgs?: TcgType[];
  auto_match?: boolean;
  location?: string;
};

/**
 * Hook that updates the current user's profile.
 *
 * On success, invalidates profile queries and calls refreshProfile
 * from the AuthProvider to keep the auth context in sync.
 */
const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async (params: UpdateProfileParams) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .upsert({ id: user.id, email: user.email!, display_name: user.email!.split('@')[0], ...params })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      await refreshProfile();
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message ?? 'Failed to update profile');
    },
  });
};

export default useUpdateProfile;
