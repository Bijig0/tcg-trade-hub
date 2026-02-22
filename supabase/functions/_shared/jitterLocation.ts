/**
 * Adds a random ~500m offset to coordinates for user privacy.
 * Prevents exact user locations from being exposed to other users.
 */
export const jitterLocation = (
  lat: number,
  lng: number,
): { lat: number; lng: number } => {
  // ~500m in degrees (roughly 0.0045 at mid-latitudes)
  const jitterRange = 0.0045;
  const jitteredLat = lat + (Math.random() - 0.5) * 2 * jitterRange;
  const jitteredLng = lng + (Math.random() - 0.5) * 2 * jitterRange;
  return { lat: jitteredLat, lng: jitteredLng };
};
