import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useErrorToastStore } from '@/stores/errorToastStore/errorToastStore';

const AUTO_DISMISS_MS = 4000;

type ToastItemProps = {
  id: string;
  message: string;
  onDismiss: (id: string) => void;
};

const ToastItem = ({ id, message, onDismiss }: ToastItemProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss(id));
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [id, onDismiss, opacity, translateY]);

  const handlePress = useCallback(() => {
    void Clipboard.setStringAsync(message);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(id));
  }, [id, message, onDismiss, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        onPress={handlePress}
        className="mb-2 rounded-lg bg-destructive px-4 py-3 shadow-lg"
      >
        <Text className="text-sm text-destructive-foreground" numberOfLines={3}>
          {message}
        </Text>
        <Text className="mt-1 text-[10px] text-destructive-foreground/60">
          Tap to copy & dismiss
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const ErrorToast = () => {
  const insets = useSafeAreaInsets();
  const toasts = useErrorToastStore((s) => s.toasts);
  const dismissToast = useErrorToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <View
      style={{ bottom: insets.bottom + 60 }}
      className="absolute left-4 right-4 z-50"
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          onDismiss={dismissToast}
        />
      ))}
    </View>
  );
};

export default ErrorToast;
