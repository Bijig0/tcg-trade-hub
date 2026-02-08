import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/cn';

const badgeVariants = {
  default: 'bg-primary',
  secondary: 'bg-secondary',
  destructive: 'bg-destructive',
  outline: 'border border-border bg-transparent',
} as const;

const badgeTextVariants = {
  default: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  destructive: 'text-destructive-foreground',
  outline: 'text-foreground',
} as const;

export type BadgeVariant = keyof typeof badgeVariants;

export type BadgeProps = {
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Additional Tailwind classes for the container */
  className?: string;
  /** Badge label text */
  children: string;
};

/**
 * A small status indicator badge with multiple style variants.
 *
 * Renders a compact pill-shaped label useful for tags, statuses, and categories.
 *
 * @example
 * ```tsx
 * <Badge variant="secondary">Rare</Badge>
 * <Badge variant="destructive">Sold</Badge>
 * ```
 */
const Badge = ({ variant = 'default', className, children }: BadgeProps) => {
  return (
    <View
      className={cn(
        'self-start rounded-full px-2.5 py-0.5',
        badgeVariants[variant],
        className,
      )}
    >
      <Text
        className={cn(
          'text-xs font-semibold',
          badgeTextVariants[variant],
        )}
      >
        {children}
      </Text>
    </View>
  );
};

export default Badge;
