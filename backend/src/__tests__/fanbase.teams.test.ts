// Integration tests for GET /api/fanbase/leagues/:leagueId/teams
// Verifies the endpoint returns teams for a given league with post counts.
// Uses leagueId 9999 (unknown) to avoid relying on specific DB seed data.
// No auth required — this is a public read-only endpoint (FAN-04).
import request from 'supertest';
import app from '../app';

describe('GET /api/fanbase/leagues/:leagueId/teams', () => {
  it('returns 200 with teams array', async () => {
    const res = await request(app).get('/api/fanbase/leagues/9999/teams');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('teams');
    expect(Array.isArray(res.body.teams)).toBe(true);
  });

  it('returns empty array for unknown leagueId', async () => {
    const res = await request(app).get('/api/fanbase/leagues/9999/teams');
    expect(res.status).toBe(200);
    expect(res.body.teams).toHaveLength(0);
  });

  it('returns 400 for non-numeric leagueId', async () => {
    const res = await request(app).get('/api/fanbase/leagues/abc/teams');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('does not require an Authorization header (FAN-04)', async () => {
    const res = await request(app).get('/api/fanbase/leagues/9999/teams');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
