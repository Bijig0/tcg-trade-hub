/**
 * Parses a PostGIS geography/geometry value to lat/lng coordinates.
 * Handles GeoJSON `{ type: 'Point', coordinates: [lng, lat] }` and
 * WKT `POINT(lng lat)` string formats.
 */
const parseLocationCoords = (
  location: unknown,
): { latitude: number; longitude: number } | null => {
  if (!location) return null;

  // GeoJSON format: { type: 'Point', coordinates: [lng, lat] }
  if (typeof location === 'object' && location !== null) {
    const geo = location as Record<string, unknown>;
    if (Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
      const [lng, lat] = geo.coordinates as number[];
      if (typeof lat === 'number' && typeof lng === 'number') {
        return { latitude: lat, longitude: lng };
      }
    }
  }

  // WKT format: "POINT(lng lat)"
  if (typeof location === 'string') {
    const wktMatch = location.match(/POINT\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (wktMatch) {
      const lng = parseFloat(wktMatch[1]);
      const lat = parseFloat(wktMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { latitude: lat, longitude: lng };
      }
    }
  }

  return null;
};

export default parseLocationCoords;
