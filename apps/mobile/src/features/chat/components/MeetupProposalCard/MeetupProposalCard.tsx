import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, ChevronRight } from 'lucide-react-native';
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
  const hasMapData = !!(payload.location_coords || payload.shop_id);

  const handleViewLocation = () => {
    router.push({
      pathname: '/(tabs)/(messages)/meetup-location',
      params: {
        locationName: payload.location_name ?? '',
        ...(payload.location_coords
          ? {
              lat: String(payload.location_coords.lat),
              lng: String(payload.location_coords.lng),
            }
          : {}),
        ...(payload.shop_id ? { shopId: payload.shop_id } : {}),
        ...(payload.proposed_time ? { proposedTime: payload.proposed_time } : {}),
        ...(payload.note ? { note: payload.note } : {}),
      },
    });
  };

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
          <View className="gap-3">
            {/* Location section */}
            <View className="rounded-lg border border-border bg-accent p-3">
              <Text className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
                Location
              </Text>
              <View className="flex-row items-center">
                <MapPin size={16} className="text-amber-500" />
                <Text className="ml-1.5 flex-1 text-sm font-medium text-foreground" numberOfLines={1}>
                  {locationDisplay}
                </Text>
                {hasMapData ? (
                  <Pressable
                    onPress={handleViewLocation}
                    className="flex-row items-center"
                    hitSlop={8}
                  >
                    <Text className="text-xs font-semibold text-primary">View</Text>
                    <ChevronRight size={14} className="text-primary" />
                  </Pressable>
                ) : null}
              </View>
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
                &ldquo;{payload.note}&rdquo;
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
