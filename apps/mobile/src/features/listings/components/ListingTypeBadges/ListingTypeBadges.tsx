import React from 'react';
import { View } from 'react-native';
import ListingTypeBadge from '../ListingTypeBadge/ListingTypeBadge';
import type { ListingType } from '@tcg-trade-hub/database';

type ListingTypeBadgesProps = {
  listing: {
    type: ListingType;
    accepts_cash?: boolean;
    accepts_trades?: boolean;
  };
  long?: boolean;
  className?: string;
};

/**
 * Renders one or two type badges based on the Have/Want system.
 *
 * When a listing accepts both cash and trades, renders WTS + WTT badges side by side.
 * Falls back to the listing's `type` field when `accepts_cash`/`accepts_trades` are absent
 * (backward compatibility with pre-migration listings).
 */
const ListingTypeBadges = ({ listing, long, className }: ListingTypeBadgesProps) => {
  const { accepts_cash, accepts_trades } = listing;

  // If both boolean fields are present, use them for badge rendering
  if (accepts_cash != null && accepts_trades != null) {
    const showBoth = accepts_cash && accepts_trades;

    if (showBoth) {
      return (
        <View className={`flex-row gap-1 ${className ?? ''}`}>
          <ListingTypeBadge type="wts" long={long} />
          <ListingTypeBadge type="wtt" long={long} />
        </View>
      );
    }

    if (accepts_cash) {
      return <ListingTypeBadge type="wts" long={long} className={className} />;
    }

    if (accepts_trades) {
      return <ListingTypeBadge type="wtt" long={long} className={className} />;
    }
  }

  // Fallback: use the type field directly
  return <ListingTypeBadge type={listing.type} long={long} className={className} />;
};

export default ListingTypeBadges;
