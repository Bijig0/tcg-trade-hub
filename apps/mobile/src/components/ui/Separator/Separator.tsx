import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/cn';

export type SeparatorProps = {
  /** Direction of the separator line */
  orientation?: 'horizontal' | 'vertical';
  /** Additional Tailwind classes */
  className?: string;
};

/**
 * A thin line separator for visually dividing content sections.
 *
 * Renders either horizontally (full width, 1px tall) or vertically
 * (full height, 1px wide).
 *
 * @example
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" className="mx-2 h-6" />
 * ```
 */
const Separator = ({
  orientation = 'horizontal',
  className,
}: SeparatorProps) => {
  return (
    <View
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
    />
  );
};

export default Separator;
