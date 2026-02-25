import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthProvider';
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import type { MessageRow } from '@tcg-trade-hub/database';
import type {
  CardOfferPayload,
  CardRef,
} from '@tcg-trade-hub/database';

export type OfferCardProps = {
  message: MessageRow;
  isOwnMessage: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCounter?: () => void;
  /** Whether a response has already been sent for this offer */
  hasResponse?: boolean;
  className?: string;
};

type CardPillListProps = {
  cards: CardRef[];
  label: string;
};

const CardPillList = ({ cards, label }: CardPillListProps) => (
  <View className="mb-2">
    <Text className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
      {label}
    </Text>
    <View className="flex-row flex-wrap gap-2">
      {cards.map((card, index) => (
        <View
          key={`${card.externalId}-${index}`}
          className="flex-row items-center gap-1.5 rounded-full bg-muted px-2.5 py-1"
        >
          <Image
            source={{ uri: card.imageUrl }}
            className="h-5 w-4 rounded-sm"
            cachePolicy="disk"
          />
          <Text className="text-xs text-foreground" numberOfLines={1}>
            {card.name}
            {card.quantity && card.quantity > 1 ? ` x${card.quantity}` : ''}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

/** Rich card rendering a card_offer message with offering/requesting sections and action buttons */
const OfferCard = ({
  message,
  isOwnMessage,
  onAccept,
  onDecline,
  onCounter,
  hasResponse = false,
  className,
}: OfferCardProps) => {
  const { user } = useAuth();
  const payload = message.payload as unknown as CardOfferPayload | null;

  if (!payload) return null;

  const isRecipient = !isOwnMessage && user?.id !== message.sender_id;
  const showActions = isRecipient && !hasResponse;

  return (
    <View
      className={cn(
        'mb-2 max-w-[85%] px-3',
        isOwnMessage ? 'self-end' : 'self-start',
        className,
      )}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trade Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <CardPillList cards={payload.offering} label="Offering" />
          <CardPillList cards={payload.requesting} label="Requesting" />

          {payload.cash_amount != null && payload.cash_amount > 0 ? (
            <View className="mt-1 flex-row items-center gap-1">
              <Text className="text-xs text-muted-foreground">
                {payload.cash_direction === 'offering' ? '+' : '-'}
              </Text>
              <Text className="text-sm font-semibold text-foreground">
                ${payload.cash_amount.toFixed(2)} cash
              </Text>
              <Text className="text-xs text-muted-foreground">
                ({payload.cash_direction === 'offering'
                  ? 'included'
                  : 'requested'})
              </Text>
            </View>
          ) : null}

          {payload.note ? (
            <Text className="mt-2 text-xs italic text-muted-foreground">
              "{payload.note}"
            </Text>
          ) : null}
        </CardContent>

        {showActions ? (
          <CardFooter className="gap-2">
            <Button
              size="sm"
              variant="default"
              onPress={onAccept}
              className="flex-1"
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onPress={onDecline}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              size="sm"
              variant="outline"
              onPress={onCounter}
              className="flex-1"
            >
              Counter
            </Button>
          </CardFooter>
        ) : null}

        {hasResponse ? (
          <CardFooter>
            <Text className="text-xs text-muted-foreground">
              This offer has been responded to
            </Text>
          </CardFooter>
        ) : null}
      </Card>
    </View>
  );
};

export default OfferCard;
