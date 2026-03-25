// Integration tests for GET /api/stadiums/:id
// Verifies input validation, 404 handling, and response shape for stadium detail (STAD-12).
// No auth required — this is a public read-only endpoint.
import request from 'supertest';
import app from '../app';

describe('GET /api/stadiums/:id', () => {
  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/api/stadiums/abc');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 for a non-existent stadium id', async () => {
    const res = await request(app).get('/api/stadiums/99999999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 with stadium object containing post arrays when stadium exists', async () => {
    // First, find a real stadium id via search
    const searchRes = await request(app).get('/api/stadiums/search?q=stadium');
    if (searchRes.body.stadiums && searchRes.body.stadiums.length > 0) {
      const stadiumId = searchRes.body.stadiums[0].id;
      const res = await request(app).get(`/api/stadiums/${stadiumId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stadium');
      expect(res.body.stadium).toHaveProperty('pubRecPosts');
      expect(res.body.stadium).toHaveProperty('gettingTherePosts');
      expect(Array.isArray(res.body.stadium.pubRecPosts)).toBe(true);
      expect(Array.isArray(res.body.stadium.gettingTherePosts)).toBe(true);
    }
  });

  it('returns stadium with primaryTeam property when stadium exists', async () => {
    const searchRes = await request(app).get('/api/stadiums/search?q=stadium');
    if (searchRes.body.stadiums && searchRes.body.stadiums.length > 0) {
      const stadiumId = searchRes.body.stadiums[0].id;
      const res = await request(app).get(`/api/stadiums/${stadiumId}`);
      expect(res.status).toBe(200);
      expect(res.body.stadium).toHaveProperty('primaryTeam');
    }
  });

  it('does not require an Authorization header', async () => {
    const res = await request(app).get('/api/stadiums/1');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
