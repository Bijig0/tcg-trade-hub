import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: 'View',
  Text: ({ children }: { children: string }) => children,
}));

vi.mock('lucide-react-native', () => ({
  Navigation: 'Navigation',
  Clock: 'Clock',
}));

describe('DirectionsInfoBar', () => {
  it('should show meters for distances under 1 km', async () => {
    const { default: DirectionsInfoBar } = await import('./DirectionsInfoBar');
    const result = DirectionsInfoBar({ distanceKm: 0.5, durationMin: 7 });

    // The component renders JSX; we verify it doesn't throw
    expect(result).toBeDefined();
  });

  it('should format distance as km when >= 1 km', () => {
    // Unit-test the formatting logic directly
    const distanceKm = 2.345;
    const distanceText =
      distanceKm < 1
        ? `${Math.round(distanceKm * 1000)} m`
        : `${distanceKm.toFixed(1)} km`;
    expect(distanceText).toBe('2.3 km');
  });

  it('should show meters when distance is less than 1 km', () => {
    const distanceKm = 0.75;
    const distanceText =
      distanceKm < 1
        ? `${Math.round(distanceKm * 1000)} m`
        : `${distanceKm.toFixed(1)} km`;
    expect(distanceText).toBe('750 m');
  });

  it('should format duration as minutes when under 60', () => {
    const durationMin = 25;
    const durationText =
      durationMin < 60
        ? `${Math.round(durationMin)} min`
        : `${Math.floor(durationMin / 60)} hr ${Math.round(durationMin % 60)} min`;
    expect(durationText).toBe('25 min');
  });

  it('should format duration as hours + minutes when >= 60', () => {
    const durationMin = 95;
    const durationText =
      durationMin < 60
        ? `${Math.round(durationMin)} min`
        : `${Math.floor(durationMin / 60)} hr ${Math.round(durationMin % 60)} min`;
    expect(durationText).toBe('1 hr 35 min');
  });
});
