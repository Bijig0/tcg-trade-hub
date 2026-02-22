import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SegmentedFilter from '@/components/ui/SegmentedFilter/SegmentedFilter';
import { MyListingsScreen } from '@/features/listings';
import { CollectionScreen } from '@/features/collection';
import type { SegmentedFilterItem } from '@/components/ui/SegmentedFilter/SegmentedFilter';

type Section = 'listings' | 'collection';

const SECTION_ITEMS: SegmentedFilterItem<Section>[] = [
  { value: 'listings', label: 'Listings' },
  { value: 'collection', label: 'Collection' },
];

const SECTION_TITLES: Record<Section, string> = {
  listings: 'My Listings',
  collection: 'My Collection',
};

const ListingsRoute = () => {
  const [activeSection, setActiveSection] = useState<Section>('listings');

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

      {activeSection === 'listings' ? <MyListingsScreen /> : <CollectionScreen />}
    </SafeAreaView>
  );
};

export default ListingsRoute;
