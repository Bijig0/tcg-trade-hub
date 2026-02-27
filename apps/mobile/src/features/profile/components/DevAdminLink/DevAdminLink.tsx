import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { graphClient, type GraphStatus } from '@/lib/graphClient';

const POLL_INTERVAL = 5_000;

type LinkState = 'offline' | 'server_only' | 'admin_connected';

/**
 * Dev-only component showing bidirectional connectivity between
 * the mobile app and the admin dashboard via the graph server.
 * Uses oRPC for type-safe communication with full error propagation.
 */
const DevAdminLink = () => {
  if (!__DEV__) return null;

  const [state, setState] = useState<LinkState>('offline');
  const [info, setInfo] = useState<{ paths: number; clients: number } | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const check = useCallback(async () => {
    console.log('[DevAdminLink] Checking graph server status via oRPC...');
    try {
      const result = (await graphClient.status()) as GraphStatus;
      console.log('[DevAdminLink] oRPC response:', JSON.stringify(result));

      setInfo({ paths: result.paths, clients: result.clients });
      setLastError(null);

      if (result.clients > 0) {
        setState('admin_connected');
      } else {
        setState('server_only');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? `${err.name}: ${err.message}`
          : String(err);
      console.error('[DevAdminLink] oRPC call FAILED:', message);
      if (err instanceof Error && err.cause) {
        console.error('[DevAdminLink] cause:', err.cause);
      }
      if (err instanceof Error && err.stack) {
        console.error('[DevAdminLink] stack:', err.stack);
      }
      setState('offline');
      setInfo(null);
      setLastError(message);
    }
  }, []);

  useEffect(() => {
    check();
    const timer = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [check]);

  if (state === 'offline') {
    return (
      <View className="rounded-lg border border-border bg-card p-3">
        <Text className="text-sm font-medium text-muted-foreground">Admin Dashboard</Text>
        <Text className="mt-1 text-xs text-muted-foreground">
          Graph server offline. Start with:
        </Text>
        <Text className="mt-1 font-mono text-xs text-muted-foreground">
          cd ~/Desktop/flow-graph && bun src/server/serve.ts
        </Text>
        {lastError ? (
          <Text className="mt-1 font-mono text-xs text-destructive">
            {lastError}
          </Text>
        ) : null}
        <Pressable onPress={check} className="mt-2">
          <Text className="text-xs text-primary">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (state === 'server_only') {
    return (
      <View className="rounded-lg border border-yellow-600 bg-yellow-950/30 p-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-medium text-yellow-400">Graph Server Online</Text>
            <Text className="mt-0.5 text-xs text-yellow-400/70">
              {info?.paths ?? 0} paths · No admin connected
            </Text>
          </View>
          <Pressable onPress={check}>
            <Text className="text-xs text-primary">Refresh</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="rounded-lg border border-green-600 bg-green-950/30 p-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-medium text-green-400">Admin Dashboard Connected</Text>
          <Text className="mt-0.5 text-xs text-green-400/70">
            {info?.paths ?? 0} paths · {info?.clients ?? 0} admin {(info?.clients ?? 0) === 1 ? 'client' : 'clients'}
          </Text>
        </View>
        <Pressable onPress={check}>
          <Text className="text-xs text-primary">Refresh</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default DevAdminLink;
