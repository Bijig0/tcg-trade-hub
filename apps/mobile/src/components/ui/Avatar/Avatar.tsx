import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { cn } from '@/lib/cn';

const avatarSizes = {
  sm: { container: 'h-8 w-8', text: 'text-xs' },
  md: { container: 'h-10 w-10', text: 'text-sm' },
  lg: { container: 'h-14 w-14', text: 'text-lg' },
} as const;

export type AvatarSize = keyof typeof avatarSizes;

export type AvatarProps = {
  /** Remote image URI. Falls back to initials when null or load fails. */
  uri: string | null;
  /** Initials to display as fallback (e.g. "JD") */
  fallback: string;
  /** Size preset */
  size?: AvatarSize;
  /** Additional Tailwind classes for the outer container */
  className?: string;
};

/**
 * A circular avatar component that displays a user image with a text-initial
 * fallback when the image is unavailable or fails to load.
 *
 * @example
 * ```tsx
 * <Avatar uri={user.avatarUrl} fallback="AB" size="lg" />
 * ```
 */
const Avatar = ({
  uri,
  fallback,
  size = 'md',
  className,
}: AvatarProps) => {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = avatarSizes[size];
  const showImage = uri && !hasError;

  return (
    <View
      className={cn(
        'items-center justify-center overflow-hidden rounded-full bg-muted',
        sizeConfig.container,
        className,
      )}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          className="h-full w-full"
          cachePolicy="disk"
          transition={150}
          onError={() => setHasError(true)}
        />
      ) : (
        <Text
          className={cn(
            'font-semibold uppercase text-muted-foreground',
            sizeConfig.text,
          )}
        >
          {fallback}
        </Text>
      )}
    </View>
  );
};

export default Avatar;
