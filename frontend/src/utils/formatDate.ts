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

// Returns a human-readable relative time string from an ISO date string.
// Used to display post ages on FanBase post cards (e.g. "2 months ago").
// No external library needed — this simple implementation covers Phase 3 and 4 needs.
export const formatRelativeTime = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(diff / 86_400_000);
  const months  = Math.floor(days / 30);

  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24)   return `${hours}h ago`;
  if (days < 30)    return `${days}d ago`;
  return `${months} month${months !== 1 ? 's' : ''} ago`;
};
