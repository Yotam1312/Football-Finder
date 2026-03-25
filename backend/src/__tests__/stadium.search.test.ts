// Integration tests for GET /api/stadiums/search
// Verifies query validation and response shape for stadium search (STAD-12).
// No auth required — this is a public read-only endpoint.
import request from 'supertest';
import app from '../app';

describe('GET /api/stadiums/search', () => {
  it('returns 400 when q is missing', async () => {
    const res = await request(app).get('/api/stadiums/search');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when q is empty string', async () => {
    const res = await request(app).get('/api/stadiums/search?q=');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 with stadiums array for valid q', async () => {
    const res = await request(app).get('/api/stadiums/search?q=stadium');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('stadiums');
    expect(Array.isArray(res.body.stadiums)).toBe(true);
  });

  it('returns stadium objects with correct shape when results exist', async () => {
    const res = await request(app).get('/api/stadiums/search?q=stadium');
    expect(res.status).toBe(200);
    if (res.body.stadiums.length > 0) {
      const stadium = res.body.stadiums[0];
      expect(stadium).toHaveProperty('id');
      expect(stadium).toHaveProperty('name');
      expect(stadium).toHaveProperty('city');
    }
  });

  it('returns empty array for a query that matches nothing', async () => {
    const res = await request(app).get('/api/stadiums/search?q=zzzznonexistent99999');
    expect(res.status).toBe(200);
    expect(res.body.stadiums).toEqual([]);
  });

  it('does not require an Authorization header', async () => {
    const res = await request(app).get('/api/stadiums/search?q=test');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
