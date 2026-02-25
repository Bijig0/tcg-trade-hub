import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '@/components/ui/Avatar/Avatar';
import Button from '@/components/ui/Button/Button';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import useBlockedUsers, { type BlockedUser } from '../../hooks/useBlockedUsers/useBlockedUsers';
import useUnblockUser from '../../hooks/useUnblockUser/useUnblockUser';

/**
 * Screen showing a list of blocked users with the option to unblock each one.
 * Displays an empty state when no users are blocked.
 */
const BlockedUsersScreen = () => {
  const { data: blockedUsers, isLoading, isError } = useBlockedUsers();
  const unblock = useUnblockUser();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6" edges={['top']}>
        <Text className="text-center text-base text-destructive">
          Failed to load blocked users.
        </Text>
      </SafeAreaView>
    );
  }

  if (!blockedUsers || blockedUsers.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <EmptyState
          icon={<Text className="text-5xl">🛡️</Text>}
          title="No Blocked Users"
          description="You haven't blocked anyone."
        />
      </SafeAreaView>
    );
  }

  const handleUnblock = (blockedId: string) => {
    unblock.mutate({ blockedId });
  };

  const renderItem = ({ item }: { item: BlockedUser }) => {
    const initials = item.display_name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Avatar uri={item.avatar_url} fallback={initials} size="md" />
        <Text className="ml-3 flex-1 text-base font-medium text-foreground">
          {item.display_name}
        </Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => handleUnblock(item.blocked_id)}
          disabled={unblock.isPending}
        >
          <Text className="text-sm text-foreground">Unblock</Text>
        </Button>
      </View>
    );
  };

  const keyExtractor = (item: BlockedUser) => item.id;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <FlatList
        data={blockedUsers}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerClassName="pb-8"
      />
    </SafeAreaView>
  );
};

export default BlockedUsersScreen;
