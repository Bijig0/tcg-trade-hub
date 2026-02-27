import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';

const GRAPH_SERVER = 'http://localhost:4243';
const POLL_INTERVAL = 5_000;

type LinkState = 'offline' | 'server_only' | 'admin_connected';

/**
 * Dev-only component showing bidirectional connectivity between
 * the mobile app and the admin dashboard via the graph server.
 */
const DevAdminLink = () => {
  if (!__DEV__) return null;

  const [state, setState] = useState<LinkState>('offline');
  const [info, setInfo] = useState<{ paths: number; clients: number } | null>(null);

  const check = useCallback(async () => {
    try {
      const [pathsRes, clientsRes] = await Promise.all([
        fetch(`${GRAPH_SERVER}/api/paths`, { signal: AbortSignal.timeout(3_000) }),
        fetch(`${GRAPH_SERVER}/api/ws/clients`, { signal: AbortSignal.timeout(3_000) }),
      ]);
      if (!pathsRes.ok || !clientsRes.ok) throw new Error('bad response');
      const paths = await pathsRes.json();
      const clients = await clientsRes.json();
      const clientCount = clients.count ?? 0;
      setInfo({ paths: paths.length, clients: clientCount });
      setState(clientCount > 0 ? 'admin_connected' : 'server_only');
    } catch {
      setState('offline');
      setInfo(null);
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
