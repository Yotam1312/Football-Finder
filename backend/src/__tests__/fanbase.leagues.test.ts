// Integration tests for GET /api/fanbase/countries/:country/leagues
// Verifies the endpoint returns leagues filtered by country.
// No auth required — this is a public read-only endpoint (FAN-04).
import request from 'supertest';
import app from '../app';

describe('GET /api/fanbase/countries/:country/leagues', () => {
  it('returns 200 with leagues array for a known country', async () => {
    const res = await request(app).get('/api/fanbase/countries/England/leagues');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('leagues');
    expect(Array.isArray(res.body.leagues)).toBe(true);
  });

  it('returns empty array for unknown country', async () => {
    const res = await request(app).get('/api/fanbase/countries/Narnia/leagues');
    expect(res.status).toBe(200);
    expect(res.body.leagues).toHaveLength(0);
  });

  it('does not require an Authorization header (FAN-04)', async () => {
    const res = await request(app).get('/api/fanbase/countries/England/leagues');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
