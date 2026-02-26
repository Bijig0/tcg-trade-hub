import { describe, it, expect } from 'vitest';
import parseLocationCoords from './parseLocationCoords';

describe('parseLocationCoords', () => {
  it('should return null for null/undefined input', () => {
    expect(parseLocationCoords(null)).toBeNull();
    expect(parseLocationCoords(undefined)).toBeNull();
  });

  it('should parse GeoJSON Point format', () => {
    const geoJson = { type: 'Point', coordinates: [144.9631, -37.8136] };
    const result = parseLocationCoords(geoJson);
    expect(result).toEqual({ latitude: -37.8136, longitude: 144.9631 });
  });

  it('should parse GeoJSON with extra coordinates (altitude)', () => {
    const geoJson = { type: 'Point', coordinates: [144.9631, -37.8136, 50] };
    const result = parseLocationCoords(geoJson);
    expect(result).toEqual({ latitude: -37.8136, longitude: 144.9631 });
  });

  it('should return null for GeoJSON with insufficient coordinates', () => {
    const geoJson = { type: 'Point', coordinates: [144.9631] };
    expect(parseLocationCoords(geoJson)).toBeNull();
  });

  it('should return null for GeoJSON with non-numeric coordinates', () => {
    const geoJson = { type: 'Point', coordinates: ['abc', 'def'] };
    expect(parseLocationCoords(geoJson)).toBeNull();
  });

  it('should parse WKT POINT format', () => {
    const wkt = 'POINT(144.9631 -37.8136)';
    const result = parseLocationCoords(wkt);
    expect(result).toEqual({ latitude: -37.8136, longitude: 144.9631 });
  });

  it('should parse WKT POINT with extra spaces', () => {
    const wkt = 'POINT(  144.9631   -37.8136  )';
    const result = parseLocationCoords(wkt);
    expect(result).toEqual({ latitude: -37.8136, longitude: 144.9631 });
  });

  it('should be case-insensitive for WKT', () => {
    const wkt = 'point(144.9631 -37.8136)';
    const result = parseLocationCoords(wkt);
    expect(result).toEqual({ latitude: -37.8136, longitude: 144.9631 });
  });

  it('should return null for invalid WKT string', () => {
    expect(parseLocationCoords('LINESTRING(0 0, 1 1)')).toBeNull();
    expect(parseLocationCoords('random string')).toBeNull();
  });

  it('should return null for empty object', () => {
    expect(parseLocationCoords({})).toBeNull();
  });

  it('should return null for non-matching object', () => {
    expect(parseLocationCoords({ lat: 1, lng: 2 })).toBeNull();
  });

  it('should return null for number input', () => {
    expect(parseLocationCoords(42)).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(parseLocationCoords('')).toBeNull();
  });
});
