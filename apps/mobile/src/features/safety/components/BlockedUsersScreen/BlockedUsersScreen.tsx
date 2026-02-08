import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
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
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-base text-destructive">
          Failed to load blocked users.
        </Text>
      </View>
    );
  }

  if (!blockedUsers || blockedUsers.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          icon={<Text className="text-5xl">🛡️</Text>}
          title="No Blocked Users"
          description="You haven't blocked anyone."
        />
      </View>
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
    <View className="flex-1 bg-background">
      <FlatList
        data={blockedUsers}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerClassName="pb-8"
      />
    </View>
  );
};

export default BlockedUsersScreen;
