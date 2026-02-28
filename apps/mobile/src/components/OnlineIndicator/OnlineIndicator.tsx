import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/cn';

type OnlineIndicatorProps = {
  isOnline: boolean;
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Small colored dot indicating whether a user is currently online.
 * Green when online, muted gray when offline.
 */
const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  isOnline,
  size = 'sm',
  className,
}) => {
  const sizeClass = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5';

  return (
    <View
      className={cn(
        'rounded-full border-2 border-background',
        sizeClass,
        isOnline ? 'bg-green-500' : 'bg-muted-foreground/40',
        className,
      )}
    />
  );
};

export default OnlineIndicator;
