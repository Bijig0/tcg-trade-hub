import React, { useState, useCallback } from 'react';
import { View, Text, Modal, Pressable, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Heart, X, Sparkles, Send } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button/Button';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import SwipeCard from '../SwipeCard/SwipeCard';
import useFeedListings from '../../hooks/useFeedListings/useFeedListings';
import useRecordSwipe from '../../hooks/useRecordSwipe/useRecordSwipe';
import type { ListingWithDistance } from '../../schemas';
import type { MatchRow } from '@tcg-trade-hub/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export type FeedSwipeViewProps = {
  className?: string;
};

/**
 * Card stack swipe interface using react-native-gesture-handler + reanimated.
 *
 * Shows SwipeCard components in a stack. Swipe right = like, left = pass.
 * Calls useRecordSwipe on swipe completion. Shows a match animation modal
 * when a mutual match is detected.
 */
const FeedSwipeView = ({ className }: FeedSwipeViewProps) => {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage } = useFeedListings();
  const recordSwipe = useRecordSwipe();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setMatchData] = useState<MatchRow | null>(null);
  const [showMatch, setShowMatch] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const listings = data?.pages.flatMap((page) => page.listings) ?? [];
  const currentListing = listings[currentIndex] as ListingWithDistance | undefined;
  const nextListing = listings[currentIndex + 1] as ListingWithDistance | undefined;

  const handleSwipeComplete = useCallback(
    (direction: 'like' | 'pass') => {
      if (!currentListing) return;

      recordSwipe.mutate(
        { listingId: currentListing.id, direction },
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
        // Prefetch next page when near the end
        if (nextIdx >= listings.length - 3 && hasNextPage) {
          fetchNextPage();
        }
        return nextIdx;
      });
    },
    [currentListing, recordSwipe, listings.length, hasNextPage, fetchNextPage],
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5);
        runOnJS(handleSwipeComplete)('like');
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
        runOnJS(handleSwipeComplete)('pass');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
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

  const nextCardScale = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          Math.abs(translateX.value),
          [0, SWIPE_THRESHOLD],
          [0.95, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.5, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const handleButtonSwipe = (direction: 'like' | 'pass') => {
    const targetX = direction === 'like' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    translateX.value = withSpring(targetX);
    handleSwipeComplete(direction);
  };

  const resetSwipePosition = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Skeleton className="h-[70%] w-full rounded-2xl" />
      </View>
    );
  }

  if (!currentListing) {
    return (
      <EmptyState
        icon={<PackageOpenIcon />}
        title="No More Listings"
        description="You've seen all available listings. Check back later or adjust your filters."
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
            className="absolute inset-x-4"
            style={nextCardScale}
          >
            <SwipeCard listing={nextListing} />
          </Animated.View>
        )}

        {/* Current card (front) */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            className="w-full flex-1"
            style={cardAnimatedStyle}
            onLayout={() => resetSwipePosition()}
          >
            <SwipeCard listing={currentListing} />

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
          className="h-16 w-16 items-center justify-center rounded-full border-2 border-red-400 bg-card active:bg-red-50"
        >
          <X size={28} className="text-red-500" />
        </Pressable>

        <Pressable
          onPress={() => {
            if (currentListing) {
              router.push(`/(tabs)/(listings)/listing/${currentListing.id}`);
            }
          }}
          className="h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-card active:bg-primary/10"
        >
          <Send size={22} className="text-primary" />
        </Pressable>

        <Pressable
          onPress={() => handleButtonSwipe('like')}
          className="h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-400 bg-card active:bg-emerald-50"
        >
          <Heart size={28} className="text-emerald-500" fill="#10b981" />
        </Pressable>
      </View>

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
