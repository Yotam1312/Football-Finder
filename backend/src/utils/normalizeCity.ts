// Normalizes a city name for database search.
// The sync job stores cities as normalized strings (diacritics removed, lowercased).
// When users search, we apply the same normalization so "München" finds "munchen" in the DB.
//
// This function must be kept in sync with the normalization applied during data ingestion
// in sync.service.ts — if that function changes, this one must change too.
export function normalizeCity(city: string): string {
  return city
    .normalize('NFD')                     // decompose characters: é → e + combining acute
    .replace(/[\u0300-\u036f]/g, '')      // remove all combining diacritical marks
    .toLowerCase()
    .trim();
}
