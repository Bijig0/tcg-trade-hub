import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeftRight, ChevronLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import useTradeContext from '../../hooks/useTradeContext/useTradeContext';
import NegotiationStatusBadge from '../NegotiationStatusBadge/NegotiationStatusBadge';
import TradeSideSection from '../TradeSideSection/TradeSideSection';

export type OfferDetailScreenProps = {
  conversationId: string;
};

/** Full-screen view showing "My Side" vs "Their Side" of a trade */
const OfferDetailScreen = ({ conversationId }: OfferDetailScreenProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const { data: tradeContext, isLoading } = useTradeContext(conversationId);

  const { mySide, theirSide } = useMemo(() => {
    if (!tradeContext) return { mySide: null, theirSide: null };

    const isListingOwner = tradeContext.listingOwnerId === user?.id;

    if (isListingOwner) {
      return {
        mySide: {
          label: 'My Listing',
          items: tradeContext.listingItems,
          totalValue: tradeContext.listingTotalValue,
        },
        theirSide: {
          label: 'Their Offer',
          items: tradeContext.offerItems,
          totalValue: tradeContext.offerItems.reduce(
            (sum, item) => sum + (item.marketPrice ?? 0) * item.quantity,
            0,
          ),
        },
      };
    }

    return {
      mySide: {
        label: 'My Offer',
        items: tradeContext.offerItems,
        totalValue: tradeContext.offerItems.reduce(
          (sum, item) => sum + (item.marketPrice ?? 0) * item.quantity,
          0,
        ),
      },
      theirSide: {
        label: 'Their Listing',
        items: tradeContext.listingItems,
        totalValue: tradeContext.listingTotalValue,
      },
    };
  }, [tradeContext, user?.id]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!tradeContext || !mySide || !theirSide) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <Text className="text-base text-muted-foreground">
          Trade details unavailable
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center gap-2 border-b border-border px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="p-1 active:opacity-70"
          hitSlop={8}
        >
          <ChevronLeft size={24} color="#6b7280" />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-foreground">
          Trade Details
        </Text>
        <NegotiationStatusBadge status={tradeContext.negotiationStatus} />
      </View>

      <ScrollView className="flex-1 px-4 py-4" contentContainerClassName="gap-3 pb-8">
        {/* My side */}
        <TradeSideSection
          label={mySide.label}
          items={mySide.items}
          totalValue={mySide.totalValue}
        />

        {/* Swap icon */}
        <View className="items-center py-1">
          <ArrowLeftRight size={20} color="#9ca3af" />
        </View>

        {/* Their side */}
        <TradeSideSection
          label={theirSide.label}
          items={theirSide.items}
          totalValue={theirSide.totalValue}
        />

        {/* Cash amount */}
        {tradeContext.offerCashAmount > 0 && (
          <View className="items-center rounded-lg bg-accent px-4 py-3">
            <Text className="text-sm font-medium text-foreground">
              + ${tradeContext.offerCashAmount.toFixed(2)} cash
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OfferDetailScreen;
