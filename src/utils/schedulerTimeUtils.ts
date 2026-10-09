/**
 * Utility functions for time-of-day math and scheduling.
 */

/**
 * Parses a string in "HH:MM" format and returns a Date object set to that time on the same day as `now`.
 */
export function parseTimeToToday(timeStr: string, now: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(now);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Gets the next occurrence of a time string (e.g. "22:00"). If the time has already passed today,
 * returns the occurrence for tomorrow.
 */
export function getNextOccurrence(timeStr: string, now: Date): Date {
  const occurrence = parseTimeToToday(timeStr, now);
  if (occurrence.getTime() <= now.getTime()) {
    occurrence.setDate(occurrence.getDate() + 1);
  }
  return occurrence;
}

/**
 * Checks if a given time is between startTime and endTime (both in "HH:MM" format).
 * Properly supports intervals that cross midnight (e.g., "22:00" to "07:00").
 */
export function isTimeBetween(now: Date, startTimeStr: string, endTimeStr: string): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
  const startTotalMinutes = startHours * 60 + startMinutes;
  
  const [endHours, endMinutes] = endTimeStr.split(':').map(Number);
  const endTotalMinutes = endHours * 60 + endMinutes;

  if (startTotalMinutes <= endTotalMinutes) {
    // Standard interval during the same day (e.g., 08:00 to 17:00)
    return currentMinutes >= startTotalMinutes && currentMinutes <= endTotalMinutes;
  } else {
    // Interval crosses midnight (e.g., 22:00 to 07:00)
    return currentMinutes >= startTotalMinutes || currentMinutes <= endTotalMinutes;
  }
}

/**
 * Returns the absolute difference in minutes between two Date objects.
 */
export function minutesBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60);
}

/**
 * Formats a Date object as a local time string "HH:MM".
 */
export function formatLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
