import React, { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { View, Text, Modal, Pressable, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Heart, X, Sparkles, Handshake } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button/Button';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import OfferCreationSheet from '@/features/listings/components/OfferCreationSheet/OfferCreationSheet';
import FeedCardDetailSheet from '../FeedCardDetailSheet/FeedCardDetailSheet';
import SwipeCard from '../SwipeCard/SwipeCard';
import useFeedListings from '../../hooks/useFeedListings/useFeedListings';
import { feedKeys } from '../../queryKeys';
import useRecordSwipe from '../../hooks/useRecordSwipe/useRecordSwipe';
import type { CardDetailSheetItem } from '@/features/listings/components/CardDetailSheet/CardDetailSheet';
import type { ListingWithDistance } from '../../schemas';
import type { MatchRow } from '@tcg-trade-hub/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SWIPE_EXIT_DURATION = 250;

export type FeedSwipeViewProps = {
  className?: string;
};

/**
 * Card stack swipe interface using react-native-gesture-handler + reanimated.
 *
 * Shows SwipeCard components in a stack. Swipe right = like, left = pass.
 * Center button opens OfferCreationSheet for the current listing.
 * Calls useRecordSwipe on swipe completion. Shows a match animation modal
 * when a mutual match is detected.
 */
const FeedSwipeView = ({ className }: FeedSwipeViewProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage } = useFeedListings();
  const recordSwipe = useRecordSwipe();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const detailSheetRef = useRef<BottomSheet>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setMatchData] = useState<MatchRow | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [detailItem, setDetailItem] = useState<CardDetailSheetItem | null>(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const nextCardProgress = useSharedValue(0);

  const listings = data?.pages.flatMap((page) => page.listings) ?? [];
  const currentListing = listings[currentIndex] as ListingWithDistance | undefined;
  const nextListing = listings[currentIndex + 1] as ListingWithDistance | undefined;

  const advanceCard = useCallback(
    (direction: 'like' | 'pass') => {
      const listing = listings[currentIndex] as ListingWithDistance | undefined;
      if (!listing) return;

      recordSwipe.mutate(
        { listingId: listing.id, direction },
        {
          onSuccess: (response) => {
            if (response.match) {
              setMatchData(response.match);
              setShowMatch(true);
            }
          },
        },
      );

      setCurrentIndex((prev) => {
        const nextIdx = prev + 1;
        if (nextIdx >= listings.length - 3 && hasNextPage) {
          fetchNextPage();
        }
        return nextIdx;
      });

      // Reset front card position instantly (it's off-screen anyway)
      translateX.value = 0;
      translateY.value = 0;
      // Smoothly shrink the new back card from full size to resting state
      nextCardProgress.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(setIsSwiping)(false);
      });
    },
    [currentIndex, listings, recordSwipe, hasNextPage, fetchNextPage, translateX, translateY, nextCardProgress],
  );

  const animateOffScreen = useCallback(
    (direction: 'like' | 'pass') => {
      'worklet';
      const targetX = direction === 'like' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

      nextCardProgress.value = withTiming(1, { duration: SWIPE_EXIT_DURATION });
      translateX.value = withTiming(targetX, { duration: SWIPE_EXIT_DURATION }, (finished) => {
        if (finished) {
          runOnJS(advanceCard)(direction);
        }
      });
    },
    [translateX, nextCardProgress, advanceCard],
  );

  const panGesture = Gesture.Pan()
    .enabled(!isSwiping)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      // Drive back card progress from drag distance (0 → 1)
      const exitX = SCREEN_WIDTH * 1.5;
      nextCardProgress.value = Math.min(Math.abs(event.translationX) / exitX, 1);
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        runOnJS(setIsSwiping)(true);
        animateOffScreen('like');
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        runOnJS(setIsSwiping)(true);
        animateOffScreen('pass');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        nextCardProgress.value = withSpring(0);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          [-15, 0, 15],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          nextCardProgress.value,
          [0, 1],
          [0.92, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      nextCardProgress.value,
      [0, 1],
      [0.6, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const handleButtonSwipe = (direction: 'like' | 'pass') => {
    if (isSwiping) return;
    setIsSwiping(true);
    animateOffScreen(direction);
  };

  const handleMakeOffer = () => {
    if (!currentListing) return;
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleOpenDetail = useCallback((item: CardDetailSheetItem) => {
    setDetailItem(item);
    detailSheetRef.current?.snapToIndex(0);
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Skeleton className="h-[70%] w-full rounded-2xl" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="mb-2 text-lg font-semibold text-destructive">Feed Error</Text>
        <Text className="mb-4 text-center text-sm text-muted-foreground">
          {error.message}
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="rounded-lg bg-primary px-6 py-2"
        >
          <Text className="font-semibold text-primary-foreground">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!currentListing) {
    return (
      <EmptyState
        icon={<PackageOpenIcon />}
        title="No More Listings"
        description="You've seen all available listings. Check back later or adjust your filters."
        action={
          __DEV__
            ? {
                label: 'Refresh Feed',
                onPress: async () => {
                  if (!user) return;
                  await supabase.from('swipes').delete().eq('user_id', user.id);
                  setCurrentIndex(0);
                  await queryClient.resetQueries({ queryKey: feedKeys.lists() });
                },
              }
            : undefined
        }
      />
    );
  }

  return (
    <View className={cn('flex-1', className)}>
      {/* Card stack */}
      <View className="flex-1 items-center justify-center px-4">
        {/* Next card (behind) */}
        {nextListing && (
          <Animated.View
            className="absolute inset-0"
            style={nextCardStyle}
          >
            <SwipeCard listing={nextListing} />
          </Animated.View>
        )}

        {/* Current card (front) */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            className="w-full flex-1"
            style={cardAnimatedStyle}
          >
            <SwipeCard listing={currentListing} onOpenDetail={handleOpenDetail} />

            {/* Like overlay */}
            <Animated.View
              className="absolute left-6 top-10 rounded-lg border-4 border-emerald-500 px-4 py-2"
              style={[likeOverlayStyle, { transform: [{ rotate: '-15deg' }] }]}
            >
              <Text className="text-3xl font-black text-emerald-500">LIKE</Text>
            </Animated.View>

            {/* Pass overlay */}
            <Animated.View
              className="absolute right-6 top-10 rounded-lg border-4 border-red-500 px-4 py-2"
              style={[passOverlayStyle, { transform: [{ rotate: '15deg' }] }]}
            >
              <Text className="text-3xl font-black text-red-500">PASS</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center justify-center gap-6 pb-6 pt-4">
        <Pressable
          onPress={() => handleButtonSwipe('pass')}
          disabled={isSwiping}
          className="h-16 w-16 items-center justify-center rounded-full border-2 border-red-400 bg-card active:bg-red-50"
        >
          <X size={28} className="text-red-500" />
        </Pressable>

        <Pressable
          onPress={handleMakeOffer}
          className="items-center justify-center rounded-full bg-amber-500 px-5 py-3 shadow-sm active:bg-amber-600"
        >
          <Handshake size={22} color="white" />
          <Text className="mt-0.5 text-[10px] font-bold text-white">OFFER</Text>
        </Pressable>

        <Pressable
          onPress={() => handleButtonSwipe('like')}
          disabled={isSwiping}
          className="h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-400 bg-card active:bg-emerald-50"
        >
          <Heart size={28} className="text-emerald-500" fill="#10b981" />
        </Pressable>
      </View>

      {/* Card detail sheet */}
      <FeedCardDetailSheet
        ref={detailSheetRef}
        item={detailItem}
        allItems={currentListing?.items ?? []}
        onClose={() => setDetailItem(null)}
      />

      {/* Offer creation sheet */}
      {currentListing && (
        <OfferCreationSheet
          listing={currentListing}
          bottomSheetRef={bottomSheetRef}
        />
      )}

      {/* Match modal */}
      <Modal
        visible={showMatch}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMatch(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-8">
          <View className="w-full items-center rounded-2xl bg-card p-8">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Sparkles size={40} className="text-primary" />
            </View>

            <Text className="mb-2 text-2xl font-bold text-card-foreground">
              It's a Match!
            </Text>

            <Text className="mb-6 text-center text-sm text-muted-foreground">
              You and the other trader are both interested. Start a conversation to discuss the trade!
            </Text>

            <Button size="lg" onPress={() => setShowMatch(false)} className="w-full">
              <Text className="text-base font-semibold text-primary-foreground">Continue</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/** Simple icon wrapper since lucide-react-native PackageOpen might not exist */
const PackageOpenIcon = () => (
  <View className="h-12 w-12 items-center justify-center">
    <Text className="text-3xl text-muted-foreground">&#128230;</Text>
  </View>
);

export default FeedSwipeView;
