import React from 'react';
import { View, Text, SectionList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import useMeetups, { type MeetupWithDetails } from '../../hooks/useMeetups/useMeetups';
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
  const { data, isLoading, isError, refetch } = useMeetups();

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
          Failed to load meetups. Pull to retry.
        </Text>
      </SafeAreaView>
    );
  }

  const upcoming = data?.upcoming ?? [];
  const past = data?.past ?? [];

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <EmptyState
          icon={<Text className="text-5xl">🤝</Text>}
          title="No meetups yet"
          description="Match and chat with traders to plan meetups!"
        />
      </SafeAreaView>
    );
  }

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
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerClassName="pb-8"
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
};

export default MeetupsScreen;
