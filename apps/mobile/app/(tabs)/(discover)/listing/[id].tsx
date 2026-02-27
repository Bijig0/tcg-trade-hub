import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ListingDetailScreen } from '@/features/feed';
import { MyListingDetailScreen } from '@/features/listings';
import useListingDetail from '@/features/feed/hooks/useListingDetail/useListingDetail';
import { useAuth } from '@/context/AuthProvider';

const ListingDetailRoute = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { data: listing, isLoading } = useListingDetail(id ?? '');

  if (isLoading || !listing) {
    // Let the child screens handle their own loading/error states
    // but we need the listing to determine ownership
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" />
        </View>
      );
    }
    return <ListingDetailScreen />;
  }

  const isOwner = session?.user?.id === listing.user_id;

  return isOwner ? <MyListingDetailScreen /> : <ListingDetailScreen />;
};

export default ListingDetailRoute;
