// Integration tests for GET /api/fanbase/teams/search
// Verifies query validation: q must be 2+ characters.
// No auth required — this is a public read-only endpoint (FAN-04).
import request from 'supertest';
import app from '../app';

describe('GET /api/fanbase/teams/search', () => {
  it('returns 400 when q is missing', async () => {
    const res = await request(app).get('/api/fanbase/teams/search');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when q is less than 2 characters', async () => {
    const res = await request(app).get('/api/fanbase/teams/search?q=a');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 with teams array when q is 2+ characters', async () => {
    const res = await request(app).get('/api/fanbase/teams/search?q=ch');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('teams');
    expect(Array.isArray(res.body.teams)).toBe(true);
  });

  it('does not require an Authorization header (FAN-04)', async () => {
    const res = await request(app).get('/api/fanbase/teams/search?q=ch');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
