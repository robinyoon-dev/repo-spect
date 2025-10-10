/**
 * Date-related constants for filtering repository data
 */

// Number of days to look back for recent activity
export const RECENT_ACTIVITY_DAYS = 7;

/**
 * Get the date that is N days ago from today
 * @param days Number of days to subtract (default: RECENT_ACTIVITY_DAYS)
 * @returns ISO string of the date N days ago
 */
export function getDateNDaysAgo(days: number = RECENT_ACTIVITY_DAYS): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * Get the date that is 7 days ago from today (most commonly used)
 * @returns ISO string of the date 7 days ago
 */
export function getLastWeekDate(): string {
  return getDateNDaysAgo(RECENT_ACTIVITY_DAYS);
}

/**
 * Check if a given date is within the last N days
 * @param dateString ISO date string to check
 * @param days Number of days to look back (default: RECENT_ACTIVITY_DAYS)
 * @returns true if the date is within the last N days
 */
export function isWithinLastNDays(
  dateString: string,
  days: number = RECENT_ACTIVITY_DAYS
): boolean {
  const date = new Date(dateString);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return date >= cutoffDate;
}
