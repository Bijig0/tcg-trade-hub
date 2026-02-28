import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { chatKeys } from '../../queryKeys';

/**
 * Fetches the other user's last-read message ID for a conversation.
 * Returns null if no read receipt row exists yet.
 */
const useOtherUserReadReceipt = (conversationId: string, otherUserId: string) => {
  return useQuery({
    queryKey: chatKeys.readReceipt(conversationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversation_reads')
        .select('last_read_message_id')
        .eq('conversation_id', conversationId)
        .eq('user_id', otherUserId)
        .maybeSingle();

      if (error) throw error;
      return data?.last_read_message_id ?? null;
    },
    enabled: !!conversationId && !!otherUserId,
  });
};

export default useOtherUserReadReceipt;
