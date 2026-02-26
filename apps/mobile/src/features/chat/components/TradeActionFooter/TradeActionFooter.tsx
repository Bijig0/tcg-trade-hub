import React from 'react';
import { View, Text } from 'react-native';
import Button from '@/components/ui/Button/Button';
import type { NegotiationStatus } from '@tcg-trade-hub/database';

export type TradeActionFooterProps = {
  status: NegotiationStatus;
  /** True when the current user sent the most recent offer */
  isOfferSender: boolean;
  isPending: boolean;
  hasChanges: boolean;
  onPropose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onCounter: () => void;
  onProposeMeetup: () => void;
  onAcceptMeetup: () => void;
  onDeclineMeetup: () => void;
  onCompleteTrade: () => void;
};

/** Status-based action footer for the trade detail screen */
const TradeActionFooter = ({
  status,
  isOfferSender,
  isPending,
  hasChanges,
  onPropose,
  onAccept,
  onDecline,
  onCounter,
  onProposeMeetup,
  onAcceptMeetup,
  onDeclineMeetup,
  onCompleteTrade,
}: TradeActionFooterProps) => {
  const renderContent = () => {
    switch (status) {
      case 'chatting':
        return (
          <Button size="lg" onPress={onPropose} disabled={isPending} className="w-full">
            {isPending ? 'Sending...' : 'Propose Trade'}
          </Button>
        );

      case 'offer_pending':
        if (isOfferSender) {
          return (
            <View className="gap-2">
              <Text className="text-center text-sm text-muted-foreground">
                Waiting for response...
              </Text>
              <Button
                variant="outline"
                size="lg"
                onPress={onPropose}
                disabled={!hasChanges || isPending}
                className="w-full"
              >
                {isPending ? 'Sending...' : 'Update Offer'}
              </Button>
            </View>
          );
        }
        return (
          <View className="gap-2">
            <View className="flex-row gap-2">
              <Button
                size="lg"
                onPress={onAccept}
                disabled={isPending}
                className="flex-1"
              >
                Accept
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onPress={onDecline}
                disabled={isPending}
                className="flex-1"
              >
                Decline
              </Button>
            </View>
            <Button
              variant="outline"
              size="lg"
              onPress={onCounter}
              disabled={isPending}
              className="w-full"
            >
              Counter Offer
            </Button>
          </View>
        );

      case 'offer_accepted':
        return (
          <Button size="lg" onPress={onProposeMeetup} disabled={isPending} className="w-full">
            {isPending ? 'Sending...' : 'Propose Meetup'}
          </Button>
        );

      case 'meetup_proposed':
        if (isOfferSender) {
          return (
            <Text className="text-center text-sm text-muted-foreground">
              Waiting for meetup confirmation...
            </Text>
          );
        }
        return (
          <View className="flex-row gap-2">
            <Button
              size="lg"
              onPress={onAcceptMeetup}
              disabled={isPending}
              className="flex-1"
            >
              Accept Meetup
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onPress={onDeclineMeetup}
              disabled={isPending}
              className="flex-1"
            >
              Decline
            </Button>
          </View>
        );

      case 'meetup_confirmed':
        return (
          <Button size="lg" onPress={onCompleteTrade} disabled={isPending} className="w-full">
            {isPending ? 'Completing...' : 'Complete Trade'}
          </Button>
        );

      case 'completed':
        return (
          <View className="items-center rounded-lg bg-green-50 py-3 dark:bg-green-950">
            <Text className="text-sm font-semibold text-green-700 dark:text-green-400">
              Trade Completed
            </Text>
          </View>
        );

      case 'cancelled':
        return (
          <View className="items-center rounded-lg bg-red-50 py-3 dark:bg-red-950">
            <Text className="text-sm font-semibold text-red-700 dark:text-red-400">
              Trade was cancelled
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="border-t border-border bg-background px-4 pb-6 pt-3">
      {renderContent()}
    </View>
  );
};

export default TradeActionFooter;
