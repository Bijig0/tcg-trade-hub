import React from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import { cn } from '@/lib/cn';

const buttonVariants = {
  default: 'bg-primary active:bg-primary/90',
  secondary: 'bg-secondary active:bg-secondary/90',
  destructive: 'bg-destructive active:bg-destructive/90',
  outline: 'border border-border bg-transparent active:bg-accent',
  ghost: 'bg-transparent active:bg-accent',
} as const;

const buttonTextVariants = {
  default: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  destructive: 'text-destructive-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
} as const;

const buttonSizes = {
  default: 'h-12 px-5',
  sm: 'h-9 px-3',
  lg: 'h-14 px-8',
} as const;

const buttonTextSizes = {
  default: 'text-base',
  sm: 'text-sm',
  lg: 'text-lg',
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export type ButtonProps = PressableProps & {
  /** Visual style variant of the button */
  variant?: ButtonVariant;
  /** Size preset for the button */
  size?: ButtonSize;
  /** Additional Tailwind classes for the button container */
  className?: string;
  /** Additional Tailwind classes for the button text */
  textClassName?: string;
  /** Button label content */
  children: React.ReactNode;
};

/**
 * A pressable button component with multiple visual variants and sizes.
 *
 * Uses NativeWind className styling and follows the shadcn/ui design system
 * adapted for React Native.
 *
 * @example
 * ```tsx
 * <Button variant="default" size="lg" onPress={handlePress}>
 *   Submit
 * </Button>
 * ```
 */
const Button = ({
  variant = 'default',
  size = 'default',
  disabled = false,
  className,
  textClassName,
  children,
  ...props
}: ButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      className={cn(
        'flex-row items-center justify-center rounded-lg',
        buttonVariants[variant],
        buttonSizes[size],
        disabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          className={cn(
            'font-semibold',
            buttonTextVariants[variant],
            buttonTextSizes[size],
            textClassName,
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

export default Button;
