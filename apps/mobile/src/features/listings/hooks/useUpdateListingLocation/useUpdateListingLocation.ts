import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import { feedKeys } from '../../../feed/queryKeys';

type UpdateLocationInput = {
  listingId: string;
  coords: { latitude: number; longitude: number };
  locationName: string;
};

/**
 * Mutation hook that updates a listing's location and location_name.
 * Invalidates listing detail and feed queries on success.
 */
const useUpdateListingLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, coords, locationName }: UpdateLocationInput) => {
      const { error } = await supabase
        .from('listings')
        .update({
          location: `POINT(${coords.longitude} ${coords.latitude})`,
          location_name: locationName,
        })
        .eq('id', listingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
  });
};

export default useUpdateListingLocation;
