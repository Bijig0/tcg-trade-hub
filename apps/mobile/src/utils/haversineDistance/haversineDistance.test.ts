import { describe, it, expect } from 'vitest';
import haversineDistance from './haversineDistance';

describe('haversineDistance', () => {
  it('should return 0 for the same point', () => {
    const point = { latitude: -37.8136, longitude: 144.9631 };
    expect(haversineDistance(point, point)).toBe(0);
  });

  it('should compute distance between Melbourne and Sydney (~714 km)', () => {
    const melbourne = { latitude: -37.8136, longitude: 144.9631 };
    const sydney = { latitude: -33.8688, longitude: 151.2093 };
    const distance = haversineDistance(melbourne, sydney);
    expect(distance).toBeGreaterThan(700);
    expect(distance).toBeLessThan(730);
  });

  it('should compute distance between New York and London (~5570 km)', () => {
    const newYork = { latitude: 40.7128, longitude: -74.006 };
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const distance = haversineDistance(newYork, london);
    expect(distance).toBeGreaterThan(5550);
    expect(distance).toBeLessThan(5600);
  });

  it('should be symmetrical (a→b equals b→a)', () => {
    const a = { latitude: 35.6762, longitude: 139.6503 }; // Tokyo
    const b = { latitude: 37.5665, longitude: 126.978 }; // Seoul
    expect(haversineDistance(a, b)).toBeCloseTo(haversineDistance(b, a), 10);
  });

  it('should handle antipodal points (~20,000 km)', () => {
    const north = { latitude: 0, longitude: 0 };
    const south = { latitude: 0, longitude: 180 };
    const distance = haversineDistance(north, south);
    expect(distance).toBeGreaterThan(20000);
    expect(distance).toBeLessThan(20100);
  });

  it('should handle short distances accurately', () => {
    // Two points ~1.1 km apart in central Melbourne
    const a = { latitude: -37.8136, longitude: 144.9631 };
    const b = { latitude: -37.8136, longitude: 144.975 };
    const distance = haversineDistance(a, b);
    expect(distance).toBeGreaterThan(0.9);
    expect(distance).toBeLessThan(1.5);
  });
});
