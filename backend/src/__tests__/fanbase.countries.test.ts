// Integration tests for GET /api/fanbase/countries
// Verifies the endpoint returns a list of unique country names from the League table.
// No auth required — this is a public read-only endpoint (FAN-04).
import request from 'supertest';
import app from '../app';

describe('GET /api/fanbase/countries', () => {
  it('returns 200 with countries array', async () => {
    const res = await request(app).get('/api/fanbase/countries');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('countries');
    expect(Array.isArray(res.body.countries)).toBe(true);
  });

  it('does not require an Authorization header (FAN-04)', async () => {
    const res = await request(app).get('/api/fanbase/countries');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
