// Converts a display string to a URL-safe kebab-case slug.
// Examples: "Premier League" → "premier-league", "Ligue 1" → "ligue-1"
// Used for building FanBase hub URLs: /fanbase/england/39
// Note: country names in our DB are all ASCII (England, Spain, Germany, Italy, France)
// so no special Unicode handling is needed.
export const toSlug = (s: string): string =>
  s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
