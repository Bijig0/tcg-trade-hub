import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, MessageCircle } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import ListingTypeBadge from '../ListingTypeBadge/ListingTypeBadge';
import formatListingDate from '../../utils/formatListingDate/formatListingDate';
import type { MyListingWithMatch } from '../../schemas';

type MatchedListingCardProps = {
  listing: MyListingWithMatch;
};

/**
 * Card component for listings in the Matched tab.
 *
 * Has a cyan left border, shows matched user avatar+name, and a "View Chat" CTA.
 */
const MatchedListingCard = ({ listing }: MatchedListingCardProps) => {
  const router = useRouter();

  const handleViewChat = () => {
    if (listing.conversation_id) {
      router.push(`/(tabs)/(chat)/${listing.conversation_id}`);
    }
  };

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/(listings)/listing/${listing.id}`)}
      className="mx-4 mb-3 flex-row rounded-xl border border-border border-l-4 border-l-primary bg-card p-3 active:bg-accent"
    >
      <Image
        source={{ uri: listing.card_image_url }}
        className="h-20 w-14 rounded-lg bg-muted"
        resizeMode="cover"
      />

      <View className="ml-3 flex-1 justify-between">
        <View>
          <View className="flex-row items-center gap-2">
            <ListingTypeBadge type={listing.type} />
            <Badge variant="secondary">Matched</Badge>
          </View>

          <Text
            className="mt-1 text-base font-semibold text-card-foreground"
            numberOfLines={1}
          >
            {listing.card_name}
          </Text>

          {listing.asking_price != null && (
            <Text className="text-sm text-muted-foreground">
              ${listing.asking_price.toFixed(2)}
            </Text>
          )}
        </View>

        <View className="mt-1 flex-row items-center gap-1">
          <Clock size={10} className="text-muted-foreground" />
          <Text className="text-xs text-muted-foreground">
            {formatListingDate(listing.created_at)}
          </Text>
        </View>

        {listing.matched_user && (
          <View className="mt-2 flex-row items-center justify-between border-t border-border pt-2">
            <View className="flex-row items-center gap-2">
              {listing.matched_user.avatar_url ? (
                <Image
                  source={{ uri: listing.matched_user.avatar_url }}
                  className="h-6 w-6 rounded-full bg-muted"
                />
              ) : (
                <View className="h-6 w-6 items-center justify-center rounded-full bg-muted">
                  <Text className="text-xs font-semibold text-muted-foreground">
                    {listing.matched_user.display_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text className="text-sm text-foreground" numberOfLines={1}>
                {listing.matched_user.display_name}
              </Text>
            </View>

            {listing.conversation_id && (
              <Pressable
                onPress={handleViewChat}
                className="flex-row items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1"
                hitSlop={4}
              >
                <MessageCircle size={14} className="text-primary" />
                <Text className="text-xs font-medium text-primary">Chat</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default MatchedListingCard;
