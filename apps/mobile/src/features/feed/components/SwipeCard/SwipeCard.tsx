import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Info } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import { TCG_LABELS } from '@/config/constants';
import PhotoCarousel from '../PhotoCarousel/PhotoCarousel';
import BundleItemSelector from '../BundleItemSelector/BundleItemSelector';
import type { ListingWithDistance } from '../../schemas';
import type { CardDetailSheetItem } from '@/features/listings/components/CardDetailSheet/CardDetailSheet';
import formatDistance from '../../utils/formatDistance/formatDistance';

export type SwipeCardProps = {
  listing: ListingWithDistance;
  className?: string;
  /** Callback to open the detail bottom sheet for a specific item */
  onOpenDetail?: (item: CardDetailSheetItem) => void;
};

/**
 * Full-screen card for the swipe view with interactive bundle
 * item selection, photo navigation, and detail access.
 */
const SwipeCard = ({ listing, className, onOpenDetail }: SwipeCardProps) => {
  const items = listing.items ?? [];
  const isBundle = items.length > 1;
  const mountIdRef = useRef(Math.random().toString(36).slice(2, 6));

  // DEBUG: track mount/unmount
  useEffect(() => {
    const mid = mountIdRef.current;
    console.log(`[SWIPECARD-MOUNT] instance=${mid} listing=${listing.id.slice(0, 8)} title="${listing.title?.slice(0, 20)}"`);
    return () => {
      console.log(`[SWIPECARD-UNMOUNT] instance=${mid} listing=${listing.id.slice(0, 8)}`);
    };
  }, []);

  // DEBUG: track prop changes
  const prevListingIdForLog = useRef(listing.id);
  if (prevListingIdForLog.current !== listing.id) {
    console.log(`[SWIPECARD-PROP-CHANGE] instance=${mountIdRef.current} OLD=${prevListingIdForLog.current.slice(0, 8)} NEW=${listing.id.slice(0, 8)} title="${listing.title?.slice(0, 20)}"`);
    prevListingIdForLog.current = listing.id;
  }

  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [prevListingId, setPrevListingId] = useState(listing.id);
  const [prevSelectedIndex, setPrevSelectedIndex] = useState(0);

  // Synchronous reset during render — avoids the one-frame stale state
  // that useEffect causes (useEffect runs after paint).
  if (listing.id !== prevListingId) {
    setPrevListingId(listing.id);
    setSelectedItemIndex(0);
    setPhotoIndex(0);
    setPrevSelectedIndex(0);
  } else if (selectedItemIndex !== prevSelectedIndex) {
    setPrevSelectedIndex(selectedItemIndex);
    setPhotoIndex(0);
  }

  const selectedItem = items[selectedItemIndex] ?? items[0];

  const handleOpenDetail = useCallback(() => {
    if (!selectedItem || !onOpenDetail) return;
    onOpenDetail({
      card_name: selectedItem.card_name,
      card_image_url: selectedItem.card_image_url,
      card_external_id: selectedItem.card_external_id,
      tcg: selectedItem.tcg,
      card_set: selectedItem.card_set,
      card_number: selectedItem.card_number,
      condition: selectedItem.condition,
      market_price: selectedItem.market_price,
      card_rarity: selectedItem.card_rarity,
    });
  }, [selectedItem, onOpenDetail]);

  return (
    <View
      className={cn(
        'flex-1 overflow-hidden rounded-2xl border border-border bg-card',
        className,
      )}
    >
      {/* Hero image area with photo navigation */}
      <PhotoCarousel
        photos={listing.photos ?? []}
        fallbackImageUrl={selectedItem?.card_image_url ?? ''}
        photoIndex={photoIndex}
        onPhotoIndexChange={setPhotoIndex}
        listingType={listing.type}
      />

      {/* Card info */}
      <View className="flex-1 p-4">
        {/* Bundle item selector */}
        {isBundle && (
          <View className="mb-3">
            <BundleItemSelector
              items={items}
              selectedIndex={selectedItemIndex}
              onSelectIndex={setSelectedItemIndex}
            />
          </View>
        )}

        {/* Title row with info button */}
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-card-foreground" numberOfLines={2}>
              {listing.title}
            </Text>
          </View>
          {onOpenDetail && (
            <Pressable
              onPress={handleOpenDetail}
              className="mt-1 items-center justify-center rounded-lg bg-muted p-1.5 active:bg-accent"
            >
              <Info size={16} color="#a1a1aa" />
            </Pressable>
          )}
        </View>

        {/* Selected item name (bundle only) */}
        {isBundle && selectedItem && (
          <Text className="mt-0.5 text-sm text-primary" numberOfLines={1}>
            {selectedItem.card_name}
          </Text>
        )}

        <Text className="mt-1 text-sm text-muted-foreground">
          {TCG_LABELS[listing.tcg] ?? listing.tcg} &middot; {items.length} card{items.length !== 1 ? 's' : ''}
        </Text>

        <View className="mt-3 flex-row items-center gap-2">
          <Text className="text-xs text-muted-foreground">
            {formatDistance(listing.distance_km)}
          </Text>
        </View>

        {listing.cash_amount > 0 && (
          <Text className="mt-3 text-xl font-bold text-foreground">
            ${listing.cash_amount.toFixed(2)}
          </Text>
        )}

        {listing.description && (
          <Text className="mt-2 text-sm text-muted-foreground" numberOfLines={3}>
            {listing.description}
          </Text>
        )}
      </View>
    </View>
  );
};

export default SwipeCard;
