import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '@/lib/cn';

export type EmptyStateAction = {
  label: string;
  onPress: () => void;
};

export type EmptyStateProps = {
  /** Icon or illustration rendered above the title */
  icon: React.ReactNode;
  /** Primary heading */
  title: string;
  /** Supporting copy beneath the title */
  description: string;
  /** Optional call-to-action button */
  action?: EmptyStateAction;
  /** Additional Tailwind classes for the outer container */
  className?: string;
};

/**
 * A centered empty-state placeholder with icon, text, and an optional CTA.
 *
 * Useful for blank lists, search results with no matches, or onboarding prompts.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<PackageOpen size={48} className="text-muted-foreground" />}
 *   title="No Listings Yet"
 *   description="Create your first trade listing to get started."
 *   action={{ label: 'Create Listing', onPress: handleCreate }}
 * />
 * ```
 */
const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <View
      className={cn(
        'flex-1 items-center justify-center px-6 py-12',
        className,
      )}
    >
      <View className="mb-4">{icon}</View>

      <Text className="mb-1 text-center text-lg font-semibold text-foreground">
        {title}
      </Text>

      <Text className="mb-6 text-center text-sm text-muted-foreground">
        {description}
      </Text>

      {action ? (
        <Pressable
          onPress={action.onPress}
          className="rounded-lg bg-primary px-6 py-3 active:bg-primary/90"
        >
          <Text className="text-sm font-semibold text-primary-foreground">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default EmptyState;
