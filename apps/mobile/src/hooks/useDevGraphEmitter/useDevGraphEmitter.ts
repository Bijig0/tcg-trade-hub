/**
 * Dev-only hook that emits graph events when the user navigates between tabs.
 *
 * Watches `useSegments()` from Expo Router and emits a "started" event
 * on the primary pathId for the current tab. Only active when __DEV__ is true.
 */
import { useEffect, useRef } from 'react';
import { useSegments } from 'expo-router';
import { devEmitter, createTraceId } from '@/services/devLiveEmitter/devLiveEmitter';
import { ROUTE_PATH_MAP } from '@/services/devLiveEmitter/routePathMap';

const useDevGraphEmitter = (): void => {
  const segments = useSegments();
  const prevTabRef = useRef<string | null>(null);

  useEffect(() => {
    if (!__DEV__) return;

    // The tab segment is the second element: ['(tabs)', '(listings)', ...]
    const tabSegment = segments[1] as string | undefined;
    if (!tabSegment || tabSegment === prevTabRef.current) return;

    prevTabRef.current = tabSegment;

    const mapping = ROUTE_PATH_MAP[tabSegment];
    if (!mapping) return;

    const traceId = createTraceId();
    const scoped = devEmitter.forPath(mapping.pathId, traceId, 'mobile:nav');
    scoped(0, 'started', { message: `Navigated to ${mapping.label}` });
  }, [segments]);
};

export default useDevGraphEmitter;
