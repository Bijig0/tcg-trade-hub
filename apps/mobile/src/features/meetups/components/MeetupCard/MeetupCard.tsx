import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/cn';
import Avatar from '@/components/ui/Avatar/Avatar';
import Badge from '@/components/ui/Badge/Badge';
import type { MeetupWithDetails } from '../../hooks/useMeetups/useMeetups';

export type MeetupCardProps = {
  meetup: MeetupWithDetails;
  className?: string;
};

const statusVariants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  confirmed: { label: 'Confirmed', variant: 'default' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

/**
 * A card displaying a meetup summary with the other user's avatar,
 * location, date/time, and status badge. Navigates to detail on press.
 */
const MeetupCard = ({ meetup, className }: MeetupCardProps) => {
  const router = useRouter();
  const { other_user, shop, proposed_time, status } = meetup;

  const statusConfig = statusVariants[status] ?? statusVariants.confirmed;

  const initials = other_user.display_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formattedTime = proposed_time
    ? new Date(proposed_time).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'TBD';

  const locationName = shop?.name ?? meetup.location_name ?? 'Location TBD';

  const handlePress = () => {
    router.push(`/(tabs)/meetups/${meetup.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        'flex-row items-center rounded-xl border border-border bg-card p-4 active:bg-accent',
        className,
      )}
    >
      <Avatar uri={other_user.avatar_url} fallback={initials} size="lg" />

      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-card-foreground" numberOfLines={1}>
            {other_user.display_name}
          </Text>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </View>

        <Text className="mt-0.5 text-sm text-muted-foreground" numberOfLines={1}>
          {locationName}
        </Text>

        <Text className="mt-0.5 text-xs text-muted-foreground">
          {formattedTime}
        </Text>
      </View>
    </Pressable>
  );
};

export default MeetupCard;
