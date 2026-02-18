import React from 'react';
import { View, Text, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Avatar from '@/components/ui/Avatar/Avatar';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import Separator from '@/components/ui/Separator/Separator';
import { TCG_LABELS } from '@/config/constants';
import usePublicProfile from '../../hooks/usePublicProfile/usePublicProfile';
import type { TcgType, RatingRow } from '@tcg-trade-hub/database';

type RatingItem = Pick<RatingRow, 'id' | 'score' | 'comment' | 'created_at'> & {
  rater_display_name: string;
};

/**
 * Screen showing another user's public profile (read-only).
 *
 * Displays the same layout as MyProfile but without edit/settings buttons.
 * Includes active listings count and header actions for Block and Report.
 */
const PublicProfileScreen = () => {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { data: profile, isLoading, isError } = usePublicProfile(userId ?? '');

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-base text-destructive">
          Failed to load profile.
        </Text>
      </View>
    );
  }

  const initials = profile.display_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const memberSince = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const handleBlock = () => {
    Alert.alert('Block User', `Are you sure you want to block ${profile.display_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: () => {
          // The parent screen or navigation handler should use useBlockUser
          router.back();
        },
      },
    ]);
  };

  const handleReport = () => {
    router.push({
      pathname: '/(modals)/report',
      params: { reportedUserId: profile.id },
    });
  };

  const renderRating = ({ item }: { item: RatingItem }) => (
    <View className="border-b border-border px-4 py-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground">
          {item.rater_display_name}
        </Text>
        <Text className="text-sm text-yellow-500">
          {'★'.repeat(item.score)}{'☆'.repeat(5 - item.score)}
        </Text>
      </View>
      {item.comment ? (
        <Text className="mt-1 text-sm text-muted-foreground">{item.comment}</Text>
      ) : null}
      <Text className="mt-1 text-xs text-muted-foreground">
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
    <ScrollView className="flex-1" contentContainerClassName="pb-8">
      {/* Header actions */}
      <View className="flex-row justify-end gap-2 px-4 pt-4">
        <Button variant="ghost" size="sm" onPress={handleReport}>
          <Text className="text-sm text-muted-foreground">Report</Text>
        </Button>
        <Button variant="ghost" size="sm" onPress={handleBlock}>
          <Text className="text-sm text-destructive">Block</Text>
        </Button>
      </View>

      {/* Profile header */}
      <View className="items-center px-6 pt-2">
        <Avatar uri={profile.avatar_url} fallback={initials} size="lg" className="h-20 w-20" />
        <Text className="mt-3 text-2xl font-bold text-foreground">{profile.display_name}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">Member since {memberSince}</Text>
      </View>

      {/* Stats */}
      <View className="mt-4 flex-row items-center justify-center gap-6">
        {profile.total_trades > 0 ? (
          <>
            <View className="items-center">
              <Text className="text-lg font-bold text-foreground">
                {profile.rating_score.toFixed(1)}
              </Text>
              <Text className="text-xs text-muted-foreground">Rating</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-foreground">{profile.total_trades}</Text>
              <Text className="text-xs text-muted-foreground">Trades</Text>
            </View>
          </>
        ) : (
          <Badge variant="secondary">New Trader</Badge>
        )}
        <View className="items-center">
          <Text className="text-lg font-bold text-foreground">{profile.active_listings_count}</Text>
          <Text className="text-xs text-muted-foreground">Listings</Text>
        </View>
      </View>

      {/* Preferred TCGs */}
      {profile.preferred_tcgs.length > 0 ? (
        <View className="mt-4 flex-row flex-wrap items-center justify-center gap-2 px-6">
          {profile.preferred_tcgs.map((tcg) => (
            <Badge key={tcg} variant="outline">
              {TCG_LABELS[tcg as TcgType] ?? tcg}
            </Badge>
          ))}
        </View>
      ) : null}

      {/* Recent ratings */}
      <View className="mt-6 px-6">
        <Separator />
      </View>

      <View className="mt-4">
        <Text className="px-4 text-lg font-bold text-foreground">Ratings</Text>

        {profile.recent_ratings.length === 0 ? (
          <Text className="px-4 py-4 text-sm text-muted-foreground">
            No ratings yet.
          </Text>
        ) : (
          <FlatList
            data={profile.recent_ratings}
            keyExtractor={(item) => item.id}
            renderItem={renderRating}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default PublicProfileScreen;
