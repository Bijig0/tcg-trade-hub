import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { chatKeys } from '../../queryKeys';

type UseConversationNicknameOptions = {
  conversationId: string;
  defaultNickname: string;
};

/**
 * Manages per-user conversation nicknames.
 *
 * Returns the display name (custom nickname or default), plus rename/reset mutations.
 * No row is auto-inserted — returns the default until the user explicitly renames.
 */
const useConversationNickname = ({
  conversationId,
  defaultNickname,
}: UseConversationNicknameOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: nickname, isLoading } = useQuery({
    queryKey: chatKeys.nickname(conversationId),
    queryFn: async (): Promise<string | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('conversation_nicknames')
        .select('nickname')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.nickname ?? null;
    },
    enabled: !!user && !!conversationId,
  });

  const renameMutation = useMutation({
    mutationFn: async (newNickname: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('conversation_nicknames')
        .upsert(
          {
            conversation_id: conversationId,
            user_id: user.id,
            nickname: newNickname,
          },
          { onConflict: 'conversation_id,user_id' },
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.nickname(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('conversation_nicknames')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.nickname(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    },
  });

  const isCustom = nickname !== null;
  const displayName = nickname ?? defaultNickname;

  return {
    displayName,
    isCustom,
    isLoading,
    rename: renameMutation.mutate,
    resetToDefault: resetMutation.mutate,
    isRenaming: renameMutation.isPending || resetMutation.isPending,
  };
};

export default useConversationNickname;
