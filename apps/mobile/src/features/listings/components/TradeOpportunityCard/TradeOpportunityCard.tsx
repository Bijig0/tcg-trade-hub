import React from 'react';
import { View, Text } from 'react-native';
import { Star, Zap, Handshake } from 'lucide-react-native';
import Avatar from '@/components/ui/Avatar/Avatar';
import Button from '@/components/ui/Button/Button';
import BundlePreview from '../BundlePreview/BundlePreview';
import type { TradeOpportunity } from '../../schemas';

type TradeOpportunityCardProps = {
  opportunity: TradeOpportunity;
  onMatch: (opportunity: TradeOpportunity) => void;
  onOffer: (opportunity: TradeOpportunity) => void;
};

const MATCH_TYPE_LABELS: Record<TradeOpportunity['matchType'], { label: string; color: string }> = {
  has_what_you_want: { label: 'Has yours', color: 'bg-green-500/10 text-green-500' },
  wants_what_you_have: { label: 'Wants yours', color: 'bg-blue-500/10 text-blue-500' },
  mutual: { label: 'Mutual', color: 'bg-amber-500/10 text-amber-500' },
};

/**
 * Card showing a trade opportunity with owner info, bundle preview,
 * match type badge, and Match/Offer action buttons.
 */
const TradeOpportunityCard = ({ opportunity, onMatch, onOffer }: TradeOpportunityCardProps) => {
  const { listing, owner, matchType } = opportunity;
  const matchInfo = MATCH_TYPE_LABELS[matchType];

  const totalItemValue = listing.items.reduce(
    (sum, item) => sum + (item.market_price ?? 0),
    0,
  );
  const totalValue = totalItemValue + listing.cash_amount;

  return (
    <View className="mx-4 mb-3 rounded-xl border border-border bg-card p-3">
      {/* Owner info + match badge */}
      <View className="flex-row items-center gap-2">
        <Avatar
          uri={owner.avatar_url}
          fallback={owner.display_name.slice(0, 2).toUpperCase()}
          size="sm"
        />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-card-foreground">
            {owner.display_name}
          </Text>
          <View className="flex-row items-center gap-1">
            <Star size={10} color="#eab308" fill="#eab308" />
            <Text className="text-xs text-muted-foreground">
              {owner.rating_score.toFixed(1)} · {owner.total_trades} trades
            </Text>
          </View>
        </View>
        <View className={`rounded-full px-2 py-0.5 ${matchInfo.color.split(' ')[0]}`}>
          <Text className={`text-xs font-semibold ${matchInfo.color.split(' ')[1]}`}>
            {matchInfo.label}
          </Text>
        </View>
      </View>

      {/* Bundle preview */}
      <View className="mt-2">
        {listing.items.length > 0 && (
          <View className="flex-row items-center gap-2">
            <BundlePreview items={listing.items} size="sm" />
          </View>
        )}

        <Text className="mt-1 text-sm font-semibold text-card-foreground" numberOfLines={1}>
          {listing.title}
        </Text>

        {listing.cash_amount > 0 && (
          <Text className="text-xs text-muted-foreground">
            + ${listing.cash_amount.toFixed(2)} cash
          </Text>
        )}

        <Text className="mt-0.5 text-xs text-muted-foreground">
          Total value: ${totalValue.toFixed(2)}
        </Text>
      </View>

      {/* Action buttons */}
      <View className="mt-2.5 flex-row gap-2">
        <Button
          size="sm"
          className="flex-1"
          onPress={() => onMatch(opportunity)}
        >
          <View className="flex-row items-center gap-1">
            <Zap size={14} color="white" />
            <Text className="text-sm font-semibold text-primary-foreground">Match</Text>
          </View>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onPress={() => onOffer(opportunity)}
        >
          <View className="flex-row items-center gap-1">
            <Handshake size={14} className="text-foreground" />
            <Text className="text-sm font-semibold text-foreground">Offer</Text>
          </View>
        </Button>
      </View>
    </View>
  );
};

export default TradeOpportunityCard;
