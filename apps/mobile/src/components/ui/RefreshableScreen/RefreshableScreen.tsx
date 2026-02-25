import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

type RenderProps = {
  onRefresh: () => void;
  isRefreshing: boolean;
};

type RefreshableScreenProps = {
  /** Query keys to invalidate on pull-to-refresh */
  queryKeys: readonly (readonly unknown[])[];
  children: React.ReactNode | ((props: RenderProps) => React.ReactNode);
  /** SafeAreaView edges (default: ['top']) */
  edges?: Edge[];
  /** SafeAreaView className */
  className?: string;
  /** ScrollView contentContainer className (only used when children is ReactNode) */
  contentClassName?: string;
};

/**
 * Wrapper that provides pull-to-refresh via React Query invalidation.
 *
 * - **ReactNode children** → wraps in ScrollView with RefreshControl
 * - **Function children** → passes { onRefresh, isRefreshing } for FlatList/SectionList screens
 *
 * Both modes wrap content in a SafeAreaView with bg-background.
 */
const RefreshableScreen = ({
  queryKeys,
  children,
  edges = ['top'],
  className = 'flex-1 bg-background',
  contentClassName = 'pb-8',
}: RefreshableScreenProps) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all(
        queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })),
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, queryKeys]);

  const isRenderProp = typeof children === 'function';

  return (
    <SafeAreaView className={className} edges={edges}>
      {isRenderProp ? (
        (children as (props: RenderProps) => React.ReactNode)({
          onRefresh,
          isRefreshing,
        })
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName={contentClassName}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {children}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RefreshableScreen;
