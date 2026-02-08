import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/cn';

export type SystemMessageProps = {
  body: string;
  className?: string;
};

/** Centered gray text for system-generated messages (e.g. "Trade completed") */
const SystemMessage = ({ body, className }: SystemMessageProps) => {
  return (
    <View className={cn('items-center px-8 py-2', className)}>
      <Text className="text-center text-xs text-muted-foreground">{body}</Text>
    </View>
  );
};

export default SystemMessage;
