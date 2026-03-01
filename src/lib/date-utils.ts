/**
 * Formats a date into a relative time string (e.g., "2m", "1h", "3d").
 * @param date The date to format.
 * @returns A condensed relative time string.
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "0m"; // Just synchronized
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  // Fallback to a simple date if older than a week
  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
