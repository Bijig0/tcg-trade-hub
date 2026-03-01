import React from 'react';
import { View, Text, SectionList, ActivityIndicator } from 'react-native';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import RefreshableScreen from '@/components/ui/RefreshableScreen/RefreshableScreen';
import useMeetups, { type MeetupWithDetails } from '../../hooks/useMeetups/useMeetups';
import { meetupKeys } from '../../queryKeys';
import MeetupCard from '../MeetupCard/MeetupCard';

type MeetupSection = {
  title: string;
  data: MeetupWithDetails[];
};

/**
 * Screen listing all meetups split into "Upcoming" and "Past" sections.
 * Shows an empty state when the user has no meetups.
 */
const MeetupsScreen = () => {
  const { data, isLoading, isError } = useMeetups();

  const upcoming = data?.upcoming ?? [];
  const past = data?.past ?? [];

  const sections: MeetupSection[] = [];
  if (upcoming.length > 0) {
    sections.push({ title: 'Upcoming', data: upcoming });
  }
  if (past.length > 0) {
    sections.push({ title: 'Past', data: past });
  }

  const renderItem = ({ item }: { item: MeetupWithDetails }) => (
    <View className="px-4 pb-3">
      <MeetupCard meetup={item} />
    </View>
  );

  const renderSectionHeader = ({ section }: { section: MeetupSection }) => (
    <View className="bg-background px-4 pb-2 pt-4">
      <Text className="text-lg font-bold text-foreground">{section.title}</Text>
    </View>
  );

  const keyExtractor = (item: MeetupWithDetails) => item.id;

  return (
    <RefreshableScreen testID="meetups-screen" queryKeys={[meetupKeys.all]}>
      {({ onRefresh, isRefreshing }) => (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
          contentContainerClassName="pb-8"
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View className="px-4 pb-3 pt-4">
              <Text className="text-2xl font-bold text-foreground">Meetups</Text>
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 items-center justify-center pt-40">
                <ActivityIndicator size="large" />
              </View>
            ) : isError ? (
              <View className="flex-1 items-center justify-center px-6 pt-40">
                <Text className="text-center text-base text-destructive">
                  Failed to load meetups. Pull to retry.
                </Text>
              </View>
            ) : (
              <EmptyState
                icon={<Text className="text-5xl">🤝</Text>}
                title="No meetups yet"
                description="Match and chat with traders to plan meetups!"
              />
            )
          }
        />
      )}
    </RefreshableScreen>
  );
};

export default MeetupsScreen;
