import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';

type InitiateContactInput = {
  myListingId: string;
  theirListingId: string;
};

type InitiateContactResponse = {
  match_id: string;
  conversation_id: string | null;
};

/**
 * Mutation hook that initiates contact between the owner's listing
 * and another user's listing. Creates a match + conversation, then
 * navigates to the chat screen.
 */
const useInitiateContact = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<InitiateContactResponse, Error, InitiateContactInput>({
    mutationFn: async ({ myListingId, theirListingId }) => {
      const response = await supabase.functions.invoke('initiate-contact', {
        body: {
          my_listing_id: myListingId,
          their_listing_id: theirListingId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message ?? 'Failed to initiate contact');
      }

      return response.data as InitiateContactResponse;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings() });

      // Navigate to chat if conversation was created
      if (data.conversation_id) {
        router.push(`/(tabs)/(messages)/chat/${data.conversation_id}`);
      }
    },
  });
};

export default useInitiateContact;
