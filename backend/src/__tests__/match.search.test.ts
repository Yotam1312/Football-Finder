// Integration tests for GET /api/matches/search
// These tests verify the request validation layer (no DB queries needed for 400 tests).
// The 200-shape test will pass once the endpoint is wired up in Plan 03.
import request from 'supertest';
import app from '../app';

describe('GET /api/matches/search', () => {
  it('returns 400 when city is missing', async () => {
    const res = await request(app)
      .get('/api/matches/search?from=2024-01-01&to=2024-12-31');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when from is missing', async () => {
    const res = await request(app)
      .get('/api/matches/search?city=london&to=2024-12-31');
    expect(res.status).toBe(400);
  });

  it('returns 400 when to is missing', async () => {
    const res = await request(app)
      .get('/api/matches/search?city=london&from=2024-01-01');
    expect(res.status).toBe(400);
  });

  it('returns matches array shape when all params provided', async () => {
    // This test uses a city unlikely to have fixtures (empty results is fine)
    // We're verifying the response shape, not the data
    const res = await request(app)
      .get('/api/matches/search?city=testcityxyz&from=2024-01-01&to=2024-12-31');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('matches');
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.matches)).toBe(true);
  });
});
