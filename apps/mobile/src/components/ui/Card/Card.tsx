import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/cn';

/* -------------------------------------------------------------------------- */
/*  Card                                                                      */
/* -------------------------------------------------------------------------- */

export type CardProps = {
  /** Additional Tailwind classes */
  className?: string;
  children: React.ReactNode;
};

/**
 * A styled card container following the shadcn/ui design system for React Native.
 *
 * Compose with `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`,
 * and `CardFooter` for a structured layout.
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Trade Offer</CardTitle>
 *     <CardDescription>Review the details below</CardDescription>
 *   </CardHeader>
 *   <CardContent>...</CardContent>
 *   <CardFooter>...</CardFooter>
 * </Card>
 * ```
 */
const Card = ({ className, children }: CardProps) => {
  return (
    <View
      className={cn(
        'rounded-xl border border-border bg-card',
        className,
      )}
    >
      {children}
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*  CardHeader                                                                */
/* -------------------------------------------------------------------------- */

export type CardHeaderProps = {
  className?: string;
  children: React.ReactNode;
};

const CardHeader = ({ className, children }: CardHeaderProps) => {
  return (
    <View className={cn('p-4 pb-2', className)}>
      {children}
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*  CardTitle                                                                 */
/* -------------------------------------------------------------------------- */

export type CardTitleProps = {
  className?: string;
  children: React.ReactNode;
};

const CardTitle = ({ className, children }: CardTitleProps) => {
  return (
    <Text
      className={cn(
        'text-lg font-semibold text-card-foreground',
        className,
      )}
    >
      {children}
    </Text>
  );
};

/* -------------------------------------------------------------------------- */
/*  CardDescription                                                           */
/* -------------------------------------------------------------------------- */

export type CardDescriptionProps = {
  className?: string;
  children: React.ReactNode;
};

const CardDescription = ({ className, children }: CardDescriptionProps) => {
  return (
    <Text
      className={cn('text-sm text-muted-foreground', className)}
    >
      {children}
    </Text>
  );
};

/* -------------------------------------------------------------------------- */
/*  CardContent                                                               */
/* -------------------------------------------------------------------------- */

export type CardContentProps = {
  className?: string;
  children: React.ReactNode;
};

const CardContent = ({ className, children }: CardContentProps) => {
  return (
    <View className={cn('p-4 pt-0', className)}>
      {children}
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*  CardFooter                                                                */
/* -------------------------------------------------------------------------- */

export type CardFooterProps = {
  className?: string;
  children: React.ReactNode;
};

const CardFooter = ({ className, children }: CardFooterProps) => {
  return (
    <View
      className={cn('flex-row items-center p-4 pt-0', className)}
    >
      {children}
    </View>
  );
};

export default Card;
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
