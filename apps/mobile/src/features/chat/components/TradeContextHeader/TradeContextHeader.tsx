import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Animated, Image } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import Card from '@/components/ui/Card/Card';
import NegotiationStatusBadge from '../NegotiationStatusBadge/NegotiationStatusBadge';
import type { TradeContext } from '../../hooks/useTradeContext/useTradeContext';

export type TradeContextHeaderProps = {
  tradeContext: TradeContext;
  isCurrentUserListingOwner: boolean;
};

const COLLAPSED_HEIGHT = 48;
const EXPANDED_HEIGHT = 200;

/**
 * Collapsible card below the chat header showing listing + offer context.
 *
 * Collapsed: single row with listing title, NegotiationStatusBadge, chevron.
 * Expanded: two sections — "Their Listing" / "Your Listing" and "Offer" with
 * card thumbnails and values.
 */
const TradeContextHeader = ({
  tradeContext,
  isCurrentUserListingOwner,
}: TradeContextHeaderProps) => {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toExpanded = !expanded;
    setExpanded(toExpanded);

    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: toExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: toExpanded ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const listingLabel = isCurrentUserListingOwner
    ? 'Your Listing'
    : 'Their Listing';
  const offerLabel = isCurrentUserListingOwner
    ? 'Their Offer'
    : 'Your Offer';

  return (
    <Card className="mx-3 mt-2 overflow-hidden">
      <Animated.View style={{ height: heightAnim }}>
        {/* Collapsed row */}
        <Pressable
          onPress={toggle}
          className="flex-row items-center justify-between px-3 py-3"
        >
          <View className="flex-1 flex-row items-center gap-2">
            <Text
              className="flex-shrink text-sm font-medium text-card-foreground"
              numberOfLines={1}
            >
              {tradeContext.listingTitle}
            </Text>
            <NegotiationStatusBadge status={tradeContext.negotiationStatus} />
          </View>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <ChevronDown size={16} color="#9ca3af" />
          </Animated.View>
        </Pressable>

        {/* Expanded content */}
        {expanded && (
          <View className="gap-3 px-3 pb-3">
            {/* Listing section */}
            <View>
              <Text className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                {listingLabel}
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {tradeContext.listingItems.slice(0, 4).map((item, i) => (
                  <View key={i} className="items-center">
                    <Image
                      source={{ uri: item.cardImageUrl }}
                      className="h-12 w-9 rounded"
                      resizeMode="cover"
                    />
                    <Text
                      className="mt-0.5 max-w-[60px] text-center text-[9px] text-muted-foreground"
                      numberOfLines={1}
                    >
                      {item.cardName}
                    </Text>
                  </View>
                ))}
                {tradeContext.listingItems.length > 4 && (
                  <View className="items-center justify-center px-1">
                    <Text className="text-xs text-muted-foreground">
                      +{tradeContext.listingItems.length - 4}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="mt-1 text-xs text-muted-foreground">
                Value: ${tradeContext.listingTotalValue.toFixed(2)}
              </Text>
            </View>

            {/* Offer section */}
            <View>
              <Text className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                {offerLabel}
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {tradeContext.offerItems.slice(0, 4).map((item, i) => (
                  <View key={i} className="items-center">
                    <Image
                      source={{ uri: item.cardImageUrl }}
                      className="h-12 w-9 rounded"
                      resizeMode="cover"
                    />
                    <Text
                      className="mt-0.5 max-w-[60px] text-center text-[9px] text-muted-foreground"
                      numberOfLines={1}
                    >
                      {item.cardName}
                    </Text>
                  </View>
                ))}
                {tradeContext.offerItems.length > 4 && (
                  <View className="items-center justify-center px-1">
                    <Text className="text-xs text-muted-foreground">
                      +{tradeContext.offerItems.length - 4}
                    </Text>
                  </View>
                )}
              </View>
              {tradeContext.offerCashAmount > 0 && (
                <Text className="mt-1 text-xs text-muted-foreground">
                  + ${tradeContext.offerCashAmount.toFixed(2)} cash
                </Text>
              )}
            </View>
          </View>
        )}
      </Animated.View>
    </Card>
  );
};

export default TradeContextHeader;
