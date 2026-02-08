import React from 'react';
import { View, Text, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import Avatar from '@/components/ui/Avatar/Avatar';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import Separator from '@/components/ui/Separator/Separator';
import { TCG_LABELS } from '@/config/constants';
import useUserRatings, { type UserRating } from '../../hooks/useUserRatings/useUserRatings';
import type { TcgType } from '@tcg-trade-hub/database';

/**
 * Screen showing the current user's own profile.
 *
 * Displays avatar, display name, member since date, rating score,
 * trade count, preferred TCGs as badges, and recent ratings received.
 */
const MyProfileScreen = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: ratings, isLoading: ratingsLoading } = useUserRatings(profile?.id ?? '');

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
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

  const renderRating = ({ item }: { item: UserRating }) => (
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
      {/* Profile header */}
      <View className="items-center px-6 pt-8">
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

      {/* Action buttons */}
      <View className="mt-6 gap-3 px-6">
        <Button variant="outline" onPress={() => router.push('/(tabs)/(profile)/collection')}>
          <Text className="text-base font-medium text-foreground">My Collection</Text>
        </Button>
        <Button variant="outline" onPress={() => router.push('/(tabs)/(profile)/edit')}>
          <Text className="text-base font-medium text-foreground">Edit Profile</Text>
        </Button>
        <Button variant="outline" onPress={() => router.push('/(tabs)/(profile)/settings')}>
          <Text className="text-base font-medium text-foreground">Settings</Text>
        </Button>
      </View>

      {/* Recent ratings */}
      <View className="mt-6 px-6">
        <Separator />
      </View>

      <View className="mt-4">
        <Text className="px-4 text-lg font-bold text-foreground">Recent Ratings</Text>

        {ratingsLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator />
          </View>
        ) : !ratings || ratings.length === 0 ? (
          <Text className="px-4 py-4 text-sm text-muted-foreground">
            No ratings received yet.
          </Text>
        ) : (
          <FlatList
            data={ratings.slice(0, 10)}
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

export default MyProfileScreen;
