import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/cn';

const DEV_SIM_SERVER = 'http://localhost:8083';

type SimState = 'server_offline' | 'ready' | 'launching' | 'running' | 'error';
type SimInfo = { udid: string; name: string };

/**
 * Dev-only component that launches a second iOS simulator for P2P testing.
 * Communicates with the bridge server at localhost:8083.
 */
const DevSimulatorLauncher = () => {
  const [state, setState] = useState<SimState>('server_offline');
  const [simInfo, setSimInfo] = useState<SimInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!__DEV__) return null;

  const checkServer = useCallback(async () => {
    try {
      const res = await fetch(`${DEV_SIM_SERVER}/status`);
      const data = await res.json();
      if (data.ok) {
        if (data.launchedSim) {
          setSimInfo(data.launchedSim);
          setState('running');
        } else {
          setState('ready');
        }
      } else {
        setState('server_offline');
      }
    } catch {
      setState('server_offline');
    }
  }, []);

  useEffect(() => {
    checkServer();
  }, [checkServer]);

  const handleLaunch = async () => {
    setState('launching');
    setErrorMsg(null);
    try {
      const res = await fetch(`${DEV_SIM_SERVER}/launch`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSimInfo(data.sim);
        setState('running');
      } else {
        setErrorMsg(data.error ?? 'Failed to launch simulator');
        setState('error');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error');
      setState('error');
    }
  };

  const handleShutdown = async () => {
    try {
      await fetch(`${DEV_SIM_SERVER}/shutdown`, { method: 'POST' });
    } catch {
      // server may already be gone
    }
    setSimInfo(null);
    setState('ready');
  };

  // Server offline
  if (state === 'server_offline') {
    return (
      <View className="rounded-lg border border-border bg-card p-3">
        <Text className="text-sm font-medium text-foreground">2nd Simulator</Text>
        <Text className="mt-1 text-xs text-muted-foreground">
          Server not running. Start with:
        </Text>
        <Text className="mt-1 font-mono text-xs text-muted-foreground">
          pnpm dev:sim-server
        </Text>
        <Pressable onPress={checkServer} className="mt-2">
          <Text className="text-xs text-primary">Retry connection</Text>
        </Pressable>
      </View>
    );
  }

  // Ready to launch
  if (state === 'ready') {
    return (
      <Pressable
        onPress={handleLaunch}
        className="rounded-lg border border-border bg-card p-3 active:bg-accent"
      >
        <Text className="text-sm font-medium text-foreground">Launch 2nd Simulator</Text>
        <Text className="mt-1 text-xs text-muted-foreground">
          Boot a second iPhone sim for P2P testing
        </Text>
      </Pressable>
    );
  }

  // Launching
  if (state === 'launching') {
    return (
      <View className="flex-row items-center gap-3 rounded-lg border border-border bg-card p-3">
        <ActivityIndicator size="small" />
        <View>
          <Text className="text-sm font-medium text-foreground">Booting simulator...</Text>
          <Text className="text-xs text-muted-foreground">This may take 10-20 seconds</Text>
        </View>
      </View>
    );
  }

  // Running
  if (state === 'running' && simInfo) {
    return (
      <View className="rounded-lg border border-green-600 bg-green-950/30 p-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-medium text-green-400">2nd Simulator Running</Text>
            <Text className="mt-0.5 text-xs text-green-400/70">{simInfo.name}</Text>
          </View>
          <Pressable
            onPress={handleShutdown}
            className="rounded-md border border-red-600/50 bg-red-950/30 px-3 py-1.5 active:bg-red-900/40"
          >
            <Text className="text-xs font-medium text-red-400">Shutdown</Text>
          </Pressable>
        </View>
        <Text className="mt-2 text-xs text-muted-foreground">
          Log in as a different test user on each sim to test P2P features.
        </Text>
      </View>
    );
  }

  // Error
  return (
    <View className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
      <Text className="text-sm font-medium text-destructive">Simulator Error</Text>
      <Text className="mt-1 text-xs text-destructive/80">{errorMsg}</Text>
      <Pressable onPress={() => setState('ready')} className="mt-2">
        <Text className="text-xs text-primary">Try again</Text>
      </Pressable>
    </View>
  );
};

export default DevSimulatorLauncher;
