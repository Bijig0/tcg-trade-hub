/**
 * Computes the great-circle distance in kilometers between two
 * latitude/longitude coordinate pairs using the Haversine formula.
 */
const haversineDistance = (
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number => {
  const EARTH_RADIUS_KM = 6371;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);

  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLng = Math.sin(dLng / 2);

  const h =
    sinHalfLat * sinHalfLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinHalfLng * sinHalfLng;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

export default haversineDistance;
