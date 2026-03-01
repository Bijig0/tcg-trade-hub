import React, { useMemo } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Check, Clock } from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar/Avatar';
import SlideToConfirm from '@/components/ui/SlideToConfirm/SlideToConfirm';
import { useAuth } from '@/context/AuthProvider';

type CompletionBarProps = {
  userCompleted: boolean;
  otherCompleted: boolean;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  onComplete: () => void;
  isPending: boolean;
  onUncomplete: () => void;
  isUncompletePending: boolean;
};

/** Derive up to 2-character initials from a display name. */
const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/**
 * Stacked completion status bar for meetups.
 *
 * Top row shows the current user with a SlideToConfirm gesture
 * (or a "Done" badge if already completed). Bottom row shows the other
 * user with a "Waiting" or "Done" indicator.
 *
 * The current user's Done badge is tappable to undo completion, but
 * only while the other party hasn't completed yet.
 */
const CompletionBar = ({
  userCompleted,
  otherCompleted,
  otherUserName,
  otherUserAvatarUrl,
  onComplete,
  isPending,
  onUncomplete,
  isUncompletePending,
}: CompletionBarProps) => {
  const { profile } = useAuth();

  const currentUserName = profile?.display_name ?? 'You';
  const currentUserAvatar = profile?.avatar_url ?? null;
  const currentUserInitials = useMemo(() => getInitials(currentUserName), [currentUserName]);
  const otherInitials = useMemo(() => getInitials(otherUserName), [otherUserName]);

  const canUncomplete = userCompleted && !otherCompleted;

  const handleUncompletePress = () => {
    Alert.alert('Undo completion?', 'Your completion status will be reset.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Undo', style: 'destructive', onPress: onUncomplete },
    ]);
  };

  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-foreground">Completion Status</Text>

      <View className="gap-2">
        {/* Current user side */}
        <View className="rounded-xl bg-muted/50 p-3">
          <View className="mb-2 flex-row items-center gap-2">
            <Avatar uri={currentUserAvatar} fallback={currentUserInitials} size="sm" />
            <Text className="flex-1 text-xs font-medium text-foreground" numberOfLines={1}>
              {currentUserName}
            </Text>
            <View className="rounded-full bg-primary/15 px-2 py-0.5">
              <Text className="text-[10px] font-semibold text-primary">You</Text>
            </View>
          </View>
          {userCompleted ? (
            <DoneBadge
              onPress={canUncomplete ? handleUncompletePress : undefined}
              disabled={isUncompletePending}
            />
          ) : (
            <SlideToConfirm
              onConfirm={onComplete}
              label="Slide to complete"
              confirmedLabel="Done!"
              isConfirmed={false}
              isPending={isPending}
            />
          )}
        </View>

        {/* Other user side */}
        <View className="rounded-xl bg-muted/50 p-3">
          <View className="mb-2 flex-row items-center gap-2">
            <Avatar uri={otherUserAvatarUrl} fallback={otherInitials} size="sm" />
            <Text className="flex-1 text-xs font-medium text-foreground" numberOfLines={1}>
              {otherUserName}
            </Text>
          </View>
          {otherCompleted ? <DoneBadge /> : <WaitingBadge />}
        </View>
      </View>
    </View>
  );
};

type DoneBadgeProps = {
  onPress?: () => void;
  disabled?: boolean;
};

const DoneBadge = ({ onPress, disabled }: DoneBadgeProps) => {
  const content = (
    <View className="h-12 flex-row items-center justify-center gap-1.5 rounded-full bg-green-500/20">
      <Check size={16} color="#22c55e" />
      <Text className="text-sm font-semibold text-green-500">Done</Text>
      {onPress ? (
        <Text className="text-[10px] text-green-500/60"> (tap to undo)</Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} disabled={disabled}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const WaitingBadge = () => (
  <View className="h-12 flex-row items-center justify-center gap-1.5 rounded-full bg-muted">
    <Clock size={14} className="text-muted-foreground" />
    <Text className="text-xs font-medium text-muted-foreground">Waiting...</Text>
  </View>
);

export default CompletionBar;
