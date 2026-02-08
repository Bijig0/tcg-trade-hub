/**
 * Formats a distance in kilometers into a human-readable string.
 *
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance string (e.g. "2.3 km" or "< 1 km")
 */
const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return '< 1 km';
  }

  if (distanceKm >= 100) {
    return `${Math.round(distanceKm)} km`;
  }

  return `${distanceKm.toFixed(1)} km`;
};

export default formatDistance;
