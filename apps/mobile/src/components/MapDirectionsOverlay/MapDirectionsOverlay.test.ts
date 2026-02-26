import { describe, it, expect, vi } from 'vitest';

// Mock env module
vi.mock('@/config/env', () => ({
  env: { EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: undefined },
}));

// Mock react-native-maps-directions
vi.mock('react-native-maps-directions', () => ({
  default: vi.fn((_props: Record<string, unknown>) => 'MapViewDirections'),
}));

describe('MapDirectionsOverlay', () => {
  it('should return null when API key is not set', async () => {
    const { env } = await import('@/config/env');
    (env as { EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: string | undefined }).EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = undefined;

    const { default: MapDirectionsOverlay } = await import('./MapDirectionsOverlay');
    const result = MapDirectionsOverlay({
      origin: { latitude: -37.81, longitude: 144.96 },
      destination: { latitude: -37.82, longitude: 144.97 },
    });
    expect(result).toBeNull();
  });

  it('should return a React element when API key is set', async () => {
    const { env } = await import('@/config/env');
    (env as { EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: string | undefined }).EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

    const { default: MapDirectionsOverlay } = await import('./MapDirectionsOverlay');
    const result = MapDirectionsOverlay({
      origin: { latitude: -37.81, longitude: 144.96 },
      destination: { latitude: -37.82, longitude: 144.97 },
    });

    // When API key is present, should return a React element (not null)
    expect(result).not.toBeNull();
    expect(result).toBeDefined();
  });
});
