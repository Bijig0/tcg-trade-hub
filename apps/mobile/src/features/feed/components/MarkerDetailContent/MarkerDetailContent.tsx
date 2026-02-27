import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ArrowLeft, MapPin, Store, ShieldCheck } from 'lucide-react-native';
import Badge from '@/components/ui/Badge/Badge';
import type { RelevantShop } from '@/features/listings/schemas';

type MarkerDetailContentProps = {
  shop: RelevantShop;
  onClose: () => void;
};

/**
 * Bottom sheet content showing details of a selected shop/trader marker.
 * Displayed when a marker is tapped on the browse map.
 */
const MarkerDetailContent = ({ shop, onClose }: MarkerDetailContentProps) => {
  return (
    <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="flex-row items-center px-4 pb-3 pt-1">
        <Pressable onPress={onClose} className="mr-3 rounded-lg bg-card p-1.5">
          <ArrowLeft size={20} className="text-foreground" />
        </Pressable>
        <Text className="flex-1 text-base font-semibold text-foreground">
          {shop.verified ? 'Shop Details' : 'Trader Details'}
        </Text>
      </View>

      {/* Shop info card */}
      <View className="mx-4 rounded-xl border border-border bg-card p-4">
        {/* Name + icon */}
        <View className="flex-row items-center">
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              shop.verified ? 'bg-purple-600' : 'bg-amber-500'
            }`}
          >
            <Store size={20} color="white" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-lg font-bold text-foreground" numberOfLines={2}>
              {shop.name}
            </Text>
            {shop.verified && (
              <View className="mt-0.5 flex-row items-center">
                <ShieldCheck size={14} color="#9333ea" />
                <Text className="ml-1 text-xs font-medium text-purple-500">
                  Verified Shop
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Address */}
        <View className="mt-4 flex-row items-start">
          <MapPin size={16} className="mt-0.5 text-muted-foreground" />
          <Text className="ml-2 flex-1 text-sm text-muted-foreground">
            {shop.address || 'No address available'}
          </Text>
        </View>

        {/* Supported TCGs */}
        {shop.supported_tcgs.length > 0 && (
          <View className="mt-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Supported TCGs
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {shop.supported_tcgs.map((tcg) => (
                <Badge key={tcg} variant="secondary">
                  {tcg}
                </Badge>
              ))}
            </View>
          </View>
        )}
      </View>
    </BottomSheetScrollView>
  );
};

export default MarkerDetailContent;
