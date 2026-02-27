/**
 * Dev-only hook that emits graph events when the user navigates within the app.
 *
 * Watches `useSegments()` from Expo Router and resolves the full segment path
 * to a graph pathId + stepIndex, then emits a "started" event on the graph server.
 * Only active when __DEV__ is true.
 */
import { useEffect, useRef } from 'react';
import { useSegments } from 'expo-router';
import { devEmitter, createTraceId } from '@/services/devLiveEmitter/devLiveEmitter';
import { resolveSegments } from '@/services/devLiveEmitter/routePathMap/routePathMap';

const useDevGraphEmitter = (): void => {
  const segments = useSegments();
  const prevKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!__DEV__) return;

    // Build a key from all segments to detect any navigation change
    const key = segments.join('/');
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    const mapping = resolveSegments(segments);
    if (!mapping) return;

    const traceId = createTraceId();
    const scoped = devEmitter.forPath(mapping.pathId, traceId, 'mobile:nav');
    scoped(mapping.stepIndex, 'started', { message: mapping.label });
  }, [segments]);
};

export default useDevGraphEmitter;
