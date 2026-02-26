import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
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
import type { MeetupProposalPayload } from '@tcg-trade-hub/database';

export type MeetupProposalCardProps = {
  message: MessageRow;
  isOwnMessage: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  /** Whether a response has already been sent for this proposal */
  hasResponse?: boolean;
  conversationId?: string;
  className?: string;
};

/** Rich card rendering a meetup_proposal message with location, time, and action buttons */
const MeetupProposalCard = ({
  message,
  isOwnMessage,
  onAccept,
  onDecline,
  hasResponse = false,
  conversationId,
  className,
}: MeetupProposalCardProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const payload = message.payload as unknown as MeetupProposalPayload | null;

  if (!payload) return null;

  const isRecipient = !isOwnMessage && user?.id !== message.sender_id;
  const showActions = isRecipient && !hasResponse;

  const parsedDate = payload.proposed_time
    ? new Date(payload.proposed_time)
    : null;
  const formattedTime =
    parsedDate && !isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleString([], {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'TBD';

  const locationDisplay = payload.location_name ?? 'Location not specified';

  const handleViewTrade = () => {
    if (!conversationId) return;
    router.push({
      pathname: '/(tabs)/(messages)/offer-detail',
      params: { conversationId },
    });
  };

  return (
    <View
      className={cn(
        'mb-2 w-[95%] self-center px-3',
        className,
      )}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meetup Proposal</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-semibold uppercase text-muted-foreground">
                Location
              </Text>
              <Text className="flex-1 text-sm text-foreground">
                {locationDisplay}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-semibold uppercase text-muted-foreground">
                When
              </Text>
              <Text className="flex-1 text-sm text-foreground">
                {formattedTime}
              </Text>
            </View>

            {payload.note ? (
              <Text className="mt-1 text-xs italic text-muted-foreground">
                "{payload.note}"
              </Text>
            ) : null}
          </View>
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
          </CardFooter>
        ) : null}

        {hasResponse ? (
          <CardFooter>
            <Text className="text-xs text-muted-foreground">
              This proposal has been responded to
            </Text>
          </CardFooter>
        ) : null}

        {conversationId ? (
          <CardFooter>
            <Button
              size="sm"
              variant="outline"
              onPress={handleViewTrade}
              className="flex-1"
            >
              View Trade
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </View>
  );
};

export default MeetupProposalCard;
