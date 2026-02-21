/**
 * Formats a listing date string into a short human-readable format.
 *
 * @example
 * formatListingDate('2026-02-15T12:00:00Z') // "Feb 15, 2026"
 */
const formatListingDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default formatListingDate;
