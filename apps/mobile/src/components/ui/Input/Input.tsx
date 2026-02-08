import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { cn } from '@/lib/cn';

export type InputProps = TextInputProps & {
  /** Optional label displayed above the input */
  label?: string;
  /** Error message displayed below the input in red */
  error?: string;
  /** Additional Tailwind classes for the TextInput */
  className?: string;
};

/**
 * A styled text input component with optional label and error message.
 *
 * Wraps React Native's `TextInput` with NativeWind classes following the
 * shadcn/ui design system.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="you@example.com"
 *   keyboardType="email-address"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={errors.email}
 * />
 * ```
 */
const Input = ({
  label,
  error,
  className,
  ...props
}: InputProps) => {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-sm font-medium text-foreground">
          {label}
        </Text>
      ) : null}

      <TextInput
        placeholderTextColor="#9ca3af"
        className={cn(
          'h-12 rounded-lg border border-input bg-background px-3 text-base text-foreground',
          error && 'border-destructive',
          props.editable === false && 'opacity-50',
          className,
        )}
        {...props}
      />

      {error ? (
        <Text className="text-sm text-destructive">{error}</Text>
      ) : null}
    </View>
  );
};

export default Input;
