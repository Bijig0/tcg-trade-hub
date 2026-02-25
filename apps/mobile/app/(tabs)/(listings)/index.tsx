import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import SegmentedFilter from '@/components/ui/SegmentedFilter/SegmentedFilter';
import { MyListingsScreen } from '@/features/listings';
import { CollectionScreen } from '@/features/collection';
import InterestedScreen from '@/features/feed/components/InterestedScreen/InterestedScreen';
import usePrefetchListingsSubTabs from '@/hooks/usePrefetchListingsSubTabs/usePrefetchListingsSubTabs';
import type { SegmentedFilterItem } from '@/components/ui/SegmentedFilter/SegmentedFilter';

type Section = 'listings' | 'interested' | 'collection';

const SECTION_ITEMS: SegmentedFilterItem<Section>[] = [
  { value: 'listings', label: 'Listings' },
  { value: 'interested', label: 'Interested' },
  { value: 'collection', label: 'Collection' },
];

const SECTION_TITLES: Record<Section, string> = {
  listings: 'My Listings',
  interested: 'Interested',
  collection: 'My Collection',
};

const VALID_SECTIONS: Section[] = ['listings', 'interested', 'collection'];

const ListingsRoute = () => {
  usePrefetchListingsSubTabs();
  const params = useLocalSearchParams<{ section?: string }>();
  const initialSection =
    params.section && VALID_SECTIONS.includes(params.section as Section)
      ? (params.section as Section)
      : 'listings';
  const [activeSection, setActiveSection] = useState<Section>(initialSection);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="border-b border-border px-4 py-3">
        <Text className="text-xl font-bold text-foreground">
          {SECTION_TITLES[activeSection]}
        </Text>
      </View>

      <SegmentedFilter
        items={SECTION_ITEMS}
        value={activeSection}
        onValueChange={setActiveSection}
      />

      <View style={{ flex: activeSection === 'listings' ? 1 : 0, display: activeSection === 'listings' ? 'flex' : 'none' }}>
        <MyListingsScreen />
      </View>
      <View style={{ flex: activeSection === 'interested' ? 1 : 0, display: activeSection === 'interested' ? 'flex' : 'none' }}>
        <InterestedScreen />
      </View>
      <View style={{ flex: activeSection === 'collection' ? 1 : 0, display: activeSection === 'collection' ? 'flex' : 'none' }}>
        <CollectionScreen />
      </View>
    </SafeAreaView>
  );
};

export default ListingsRoute;
