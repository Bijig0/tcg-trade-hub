import React, { useRef, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import OfferCreationSheet from '@/features/listings/components/OfferCreationSheet/OfferCreationSheet';
import useLikedListings from '../../hooks/useLikedListings/useLikedListings';
import InterestedListingCard from '../InterestedListingCard/InterestedListingCard';
import { feedKeys } from '../../queryKeys';
import type { ListingWithDistance } from '../../schemas';

/**
 * Screen showing listings the user has swiped right (liked) on.
 * Each card has a "Make Offer" CTA and an unlike (X) button.
 */
const InterestedScreen = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: listings, isLoading, refetch } = useLikedListings();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedListing, setSelectedListing] = useState<ListingWithDistance | null>(null);

  const unlikeMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('swipes')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.liked() });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
  });

  const handleMakeOffer = useCallback((listing: ListingWithDistance) => {
    setSelectedListing(listing);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleUnlike = useCallback(
    (listingId: string) => {
      Alert.alert(
        'Remove from Interested',
        'This listing will reappear in your Discover feed.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => unlikeMutation.mutate(listingId),
          },
        ],
      );
    },
    [unlikeMutation],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <EmptyState
        icon={
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart size={32} className="text-primary" />
          </View>
        }
        title="No Liked Listings"
        description="Swipe right on listings you're interested in — they'll appear here so you can make offers."
      />
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InterestedListingCard
            listing={item}
            onMakeOffer={handleMakeOffer}
            onUnlike={handleUnlike}
          />
        )}
        contentContainerClassName="gap-3 p-4"
        onRefresh={() => refetch()}
        refreshing={false}
      />

      {selectedListing && (
        <OfferCreationSheet
          listing={selectedListing}
          bottomSheetRef={bottomSheetRef}
        />
      )}
    </View>
  );
};

export default React.memo(InterestedScreen);
