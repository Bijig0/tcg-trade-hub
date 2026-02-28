import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Pressable } from 'react-native';
import { Image, type ImageLoadEventData } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import ListingTypeBadges from '@/features/listings/components/ListingTypeBadges/ListingTypeBadges';
import type { ListingType } from '@tcg-trade-hub/database';

type PhotoCarouselProps = {
  /** Listing-level photos array */
  photos: string[];
  /** Fallback image when no photos exist (selected item's card_image_url) */
  fallbackImageUrl: string;
  /** Current photo index */
  photoIndex: number;
  /** Callback when photo index changes */
  onPhotoIndexChange: (index: number) => void;
  /** Listing type for the badge overlay */
  listingType: ListingType;
  /** Whether listing accepts cash (for dual badge rendering) */
  acceptsCash?: boolean;
  /** Whether listing accepts trades (for dual badge rendering) */
  acceptsTrades?: boolean;
};

/**
 * Photo navigation overlay for the SwipeCard hero image area.
 *
 * When listing photos exist, shows them with left/right tap zones
 * and dot indicators. When no photos exist, shows the fallback
 * card image without navigation.
 */
const PhotoCarousel = ({
  photos,
  fallbackImageUrl,
  photoIndex,
  onPhotoIndexChange,
  listingType,
  acceptsCash,
  acceptsTrades,
}: PhotoCarouselProps) => {
  const [imageError, setImageError] = useState(false);
  const handleImageError = useCallback(() => setImageError(true), []);
  const carouselIdRef = useRef(Math.random().toString(36).slice(2, 6));

  const hasPhotos = photos.length > 0;
  const imageUri = hasPhotos ? photos[photoIndex] ?? '' : fallbackImageUrl;

  // DEBUG: track URI changes
  const prevUriRef = useRef(imageUri);
  if (prevUriRef.current !== imageUri) {
    const oldShort = prevUriRef.current.split('/').pop()?.slice(0, 30) ?? 'empty';
    const newShort = imageUri.split('/').pop()?.slice(0, 30) ?? 'empty';
    console.log(`[PHOTO-URI-CHANGE] carousel=${carouselIdRef.current} OLD="${oldShort}" NEW="${newShort}"`);
    prevUriRef.current = imageUri;
  }

  // DEBUG: track mount/unmount
  useEffect(() => {
    const cid = carouselIdRef.current;
    const uriShort = imageUri.split('/').pop()?.slice(0, 30) ?? 'empty';
    console.log(`[PHOTO-MOUNT] carousel=${cid} uri="${uriShort}"`);
    return () => {
      console.log(`[PHOTO-UNMOUNT] carousel=${cid}`);
    };
  }, []);

  const handleImageLoad = useCallback((e: ImageLoadEventData) => {
    console.log(`[PHOTO-LOADED] carousel=${carouselIdRef.current} w=${e.source.width} h=${e.source.height} cacheType=${e.cacheType} url="${e.source.url?.split('/').pop()?.slice(0, 30) ?? '?'}"`);
  }, []);

  // Reset error state when the displayed image URL changes
  useEffect(() => {
    setImageError(false);
  }, [imageUri]);
  const showImage = imageUri.length > 0 && !imageError;

  const handlePrevious = useCallback(() => {
    if (photoIndex > 0) {
      onPhotoIndexChange(photoIndex - 1);
    }
  }, [photoIndex, onPhotoIndexChange]);

  const handleNext = useCallback(() => {
    if (photoIndex < photos.length - 1) {
      onPhotoIndexChange(photoIndex + 1);
    }
  }, [photoIndex, photos.length, onPhotoIndexChange]);

  return (
    <View className="relative h-[55%]">
      {showImage ? (
        <Image
          source={{ uri: imageUri }}
          className="h-full w-full bg-muted"
          contentFit="contain"
          cachePolicy="disk"
          transition={200}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          placeholderContentFit="contain"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <View className="h-full w-full items-center justify-center bg-muted">
          <ImageOff size={48} className="text-muted-foreground" />
        </View>
      )}

      {/* Listing type badge(s) */}
      <ListingTypeBadges
        listing={{ type: listingType, accepts_cash: acceptsCash, accepts_trades: acceptsTrades }}
        className="absolute left-3 top-3"
      />

      {/* Tap zones for photo navigation (only when multiple photos) */}
      {hasPhotos && photos.length > 1 && (
        <>
          {/* Left tap zone */}
          <Pressable
            onPress={handlePrevious}
            className="absolute bottom-0 left-0 top-0 w-[30%]"
            style={{ opacity: 0 }}
          />
          {/* Right tap zone */}
          <Pressable
            onPress={handleNext}
            className="absolute bottom-0 right-0 top-0 w-[30%]"
            style={{ opacity: 0 }}
          />
        </>
      )}

      {/* Dot indicators */}
      {hasPhotos && photos.length > 1 && (
        <View className="absolute bottom-2 left-0 right-0 flex-row items-center justify-center gap-1.5">
          {photos.map((_, i) => (
            <View
              key={i}
              className={cn(
                'h-1.5 rounded-full',
                i === photoIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50',
              )}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default PhotoCarousel;
