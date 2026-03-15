// Formats match date and time strings for display.
// The backend stores matchDate as UTC — we display it in the venue's local timezone
// using the stadium.timezone IANA string (e.g. "Europe/London").

// Returns date string like "Sat, 15 Mar 2026" in the venue's local timezone
export function formatMatchDate(utcDate: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(utcDate));
}

// Returns time string like "20:00" in the venue's local timezone
export function formatMatchTime(utcDate: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(utcDate));
}
