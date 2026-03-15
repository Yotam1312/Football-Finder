// These tests verify the city normalization function used in the search endpoint.
// The DB stores cities as normalized strings (diacritics removed, lowercased).
// The search endpoint MUST apply the same normalization so "München" finds "munchen".
import { normalizeCity } from '../utils/normalizeCity';

describe('normalizeCity', () => {
  it('lowercases ASCII city names', () => {
    expect(normalizeCity('London')).toBe('london');
  });

  it('strips diacritics from non-ASCII characters', () => {
    // München is stored as "munchen" in the DB
    expect(normalizeCity('München')).toBe('munchen');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeCity('  Madrid  ')).toBe('madrid');
  });

  it('handles multiple diacritics in one word', () => {
    expect(normalizeCity('São Paulo')).toBe('sao paulo');
  });
});
