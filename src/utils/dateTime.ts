/**
 * Format a date to a localized string
 */
export function formatDate(date: Date, locale: string = 'de-DE'): string {
  return date.toLocaleDateString(locale);
}

/**
 * Format a time to a localized string
 */
export function formatTime(date: Date, locale: string = 'de-DE'): string {
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format a date and time to a localized string
 */
export function formatDateTime(date: Date, locale: string = 'de-DE'): string {
  return date.toLocaleString(locale);
}

/**
 * Parse a time string (HH:MM) and return a Date object for today
 */
export function parseTimeString(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Check if a time is between two other times
 */
export function isTimeBetween(time: Date, start: Date, end: Date): boolean {
  return time >= start && time <= end;
}

/**
 * Get the difference in minutes between two dates
 */
export function getMinutesDifference(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}
