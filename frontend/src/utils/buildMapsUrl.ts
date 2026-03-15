// Generates a Google Maps search URL for a stadium.
// The Stadium model has an optional googleMapsUrl field that overrides this when set.
// Pattern locked in CONTEXT.md: https://www.google.com/maps/search/?api=1&query={stadiumName},{city}
export function buildMapsUrl(stadiumName: string, city: string): string {
  const query = encodeURIComponent(`${stadiumName}, ${city}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
