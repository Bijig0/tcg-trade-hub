import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  type ListRenderItemInfo,
} from 'react-native';
import { cn } from '@/lib/cn';

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps = {
  /** Currently selected value */
  value: string;
  /** Callback fired when an option is selected */
  onValueChange: (value: string) => void;
  /** List of selectable options */
  options: SelectOption[];
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Optional label displayed above the select */
  label?: string;
  /** Error message displayed below the select in red */
  error?: string;
  /** Additional Tailwind classes for the trigger container */
  className?: string;
};

/**
 * A select / dropdown component that opens a modal list of options.
 *
 * Styled to match the `Input` component aesthetics. Tapping the trigger
 * opens a centered modal with a scrollable list of options.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Condition"
 *   placeholder="Select condition"
 *   value={condition}
 *   onValueChange={setCondition}
 *   options={[
 *     { label: 'Mint', value: 'mint' },
 *     { label: 'Near Mint', value: 'near-mint' },
 *   ]}
 * />
 * ```
 */
const Select = ({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  label,
  error,
  className,
}: SelectProps) => {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
  };

  const renderOption = ({ item }: ListRenderItemInfo<SelectOption>) => {
    const isSelected = item.value === value;

    return (
      <Pressable
        onPress={() => handleSelect(item.value)}
        className={cn(
          'px-5 py-3.5',
          isSelected && 'bg-accent',
        )}
      >
        <Text
          className={cn(
            'text-base text-foreground',
            isSelected && 'font-semibold',
          )}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  const keyExtractor = (item: SelectOption) => item.value;

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      ) : null}

      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          'h-12 flex-row items-center justify-between rounded-lg border border-input bg-background px-3',
          error && 'border-destructive',
          className,
        )}
      >
        <Text
          className={cn(
            'text-base',
            selectedOption ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <Text className="text-sm text-muted-foreground">&#9662;</Text>
      </Pressable>

      {error ? (
        <Text className="text-sm text-destructive">{error}</Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 items-center justify-center bg-black/50"
        >
          <Pressable
            onPress={() => {
              /* prevent close when pressing the list area */
            }}
            className="mx-6 max-h-[60%] w-[85%] overflow-hidden rounded-xl border border-border bg-card"
          >
            {label ? (
              <View className="border-b border-border px-5 py-3">
                <Text className="text-base font-semibold text-card-foreground">
                  {label}
                </Text>
              </View>
            ) : null}

            <FlatList
              data={options}
              keyExtractor={keyExtractor}
              renderItem={renderOption}
              ItemSeparatorComponent={() => (
                <View className="h-px bg-border" />
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Select;
