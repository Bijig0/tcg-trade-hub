import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Avatar from '@/components/ui/Avatar/Avatar';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import Separator from '@/components/ui/Separator/Separator';
import useMeetupDetail from '../../hooks/useMeetupDetail/useMeetupDetail';
import useCompleteMeetup from '../../hooks/useCompleteMeetup/useCompleteMeetup';
import useCancelMeetup from '../../hooks/useCancelMeetup/useCancelMeetup';
import RatingModal from '../RatingModal/RatingModal';

/**
 * Full detail screen for a single meetup.
 *
 * Displays location (with map placeholder if coords available), date/time,
 * other user info, and action buttons for completing or cancelling the meetup.
 */
const MeetupDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: meetup, isLoading, isError } = useMeetupDetail(id ?? '');
  const [ratingVisible, setRatingVisible] = useState(false);
  const [rateeId, setRateeId] = useState('');

  const handleBothCompleted = useCallback(
    (_meetupId: string) => {
      if (meetup) {
        setRateeId(meetup.other_user.id);
        setRatingVisible(true);
      }
    },
    [meetup],
  );

  const completeMeetup = useCompleteMeetup(handleBothCompleted);
  const cancelMeetup = useCancelMeetup();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !meetup) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-base text-destructive">
          Failed to load meetup details.
        </Text>
      </View>
    );
  }

  const { other_user, shop, proposed_time, status, is_user_a } = meetup;

  const initials = other_user.display_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formattedTime = proposed_time
    ? new Date(proposed_time).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'To be determined';

  const locationName = shop?.name ?? meetup.location_name ?? 'Location TBD';
  const locationAddress = shop?.address ?? null;

  const userCompleted = is_user_a ? meetup.user_a_completed : meetup.user_b_completed;
  const otherCompleted = is_user_a ? meetup.user_b_completed : meetup.user_a_completed;

  const statusLabel =
    status === 'confirmed'
      ? 'Confirmed'
      : status === 'completed'
        ? 'Completed'
        : 'Cancelled';

  const statusVariant =
    status === 'confirmed'
      ? 'default'
      : status === 'completed'
        ? 'secondary'
        : 'destructive';

  const handleOpenChat = () => {
    if (meetup.conversation) {
      router.push(`/(tabs)/(messages)/chat/${meetup.conversation.id}`);
    }
  };

  const handleComplete = () => {
    Alert.alert(
      'Complete Meetup',
      'Confirm that this trade meetup has been completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => completeMeetup.mutate({ meetupId: meetup.id }),
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Meetup',
      'Are you sure you want to cancel this meetup?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () =>
            cancelMeetup.mutate({
              meetupId: meetup.id,
              conversationId: meetup.conversation?.id ?? '',
            }),
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-8">
        {/* Map placeholder */}
        {meetup.location_coords ? (
          <View className="h-48 w-full items-center justify-center bg-muted">
            <Text className="text-sm text-muted-foreground">
              Map view available with react-native-maps
            </Text>
          </View>
        ) : (
          <View className="h-32 w-full items-center justify-center bg-muted">
            <Text className="text-4xl">📍</Text>
          </View>
        )}

        {/* Location info */}
        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-foreground">{locationName}</Text>
            <Badge variant={statusVariant as 'default' | 'secondary' | 'destructive'}>
              {statusLabel}
            </Badge>
          </View>
          {locationAddress ? (
            <Text className="mt-1 text-sm text-muted-foreground">{locationAddress}</Text>
          ) : null}
          <Text className="mt-2 text-base text-foreground">{formattedTime}</Text>
        </View>

        <View className="px-4 py-4">
          <Separator />
        </View>

        {/* Other user info */}
        <View className="flex-row items-center px-4">
          <Avatar uri={other_user.avatar_url} fallback={initials} size="lg" />
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-foreground">
              {other_user.display_name}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-muted-foreground">
                {other_user.rating_score > 0
                  ? `${'★'.repeat(Math.round(other_user.rating_score))} ${other_user.rating_score.toFixed(1)}`
                  : 'New trader'}
              </Text>
              {other_user.total_trades > 0 ? (
                <Text className="text-sm text-muted-foreground">
                  {other_user.total_trades} trade{other_user.total_trades !== 1 ? 's' : ''}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Completion status */}
        {status === 'confirmed' ? (
          <View className="mx-4 mt-4 rounded-lg bg-muted p-3">
            {userCompleted ? (
              <Text className="text-sm text-foreground">
                You confirmed completion. Waiting for the other party.
              </Text>
            ) : otherCompleted ? (
              <Text className="text-sm text-foreground">
                The other party confirmed. Your turn to confirm completion.
              </Text>
            ) : (
              <Text className="text-sm text-muted-foreground">
                Neither party has confirmed completion yet.
              </Text>
            )}
          </View>
        ) : null}

        {/* Action buttons */}
        <View className="gap-3 px-4 pt-6">
          {meetup.conversation ? (
            <Button variant="outline" onPress={handleOpenChat}>
              <Text className="text-base font-medium text-foreground">Open Chat</Text>
            </Button>
          ) : null}

          {status === 'confirmed' && !userCompleted ? (
            <Button
              onPress={handleComplete}
              disabled={completeMeetup.isPending}
            >
              <Text className="text-base font-semibold text-primary-foreground">
                {completeMeetup.isPending ? 'Completing...' : 'Complete Meetup'}
              </Text>
            </Button>
          ) : null}

          {status === 'confirmed' ? (
            <Button
              variant="destructive"
              onPress={handleCancel}
              disabled={cancelMeetup.isPending}
            >
              <Text className="text-base font-semibold text-destructive-foreground">
                {cancelMeetup.isPending ? 'Cancelling...' : 'Cancel Meetup'}
              </Text>
            </Button>
          ) : null}
        </View>
      </ScrollView>

      <RatingModal
        visible={ratingVisible}
        onClose={() => setRatingVisible(false)}
        meetupId={meetup.id}
        rateeId={rateeId}
      />
    </View>
  );
};

export default MeetupDetailScreen;
