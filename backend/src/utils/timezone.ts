// Converts a UTC date to a human-readable string in the venue's local timezone.
//
// We store match times as UTC in the database (matchDate field).
// When displaying to users, we need to show the time in the timezone where
// the match is actually happening — e.g. a 20:00 UTC kick-off in London
// is 21:00 in Madrid during summer (CEST).
//
// Intl.DateTimeFormat is built into Node.js and all modern browsers —
// no external library needed.
//
// @param utcDate  - The UTC Date object from the database
// @param timezone - IANA timezone string stored in Stadium.timezone (e.g. "Europe/Madrid")
// @returns        - Formatted string like "15 Mar 2026, 21:00"
export function toVenueLocalTime(utcDate: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(utcDate);
}

// Returns just the time portion in the venue's local timezone (e.g. "21:00")
// Useful for match cards where the date is shown separately
export function toVenueLocalTimeOnly(utcDate: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    timeStyle: 'short',
  }).format(utcDate);
}
