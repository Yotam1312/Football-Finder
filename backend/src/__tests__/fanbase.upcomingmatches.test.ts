// Integration tests for GET /api/fanbase/team/:teamId/upcoming-matches
// Verifies the endpoint returns an empty array for unknown teams (valid result, not 404).
// Used by the "I'm Going" post type match picker in the CreatePostModal.
// No auth required — this is a public endpoint.
import request from 'supertest';
import app from '../app';

describe('GET /api/fanbase/team/:teamId/upcoming-matches', () => {
  it('returns 200 with an empty matches array for a non-existent teamId', async () => {
    // teamId 999 does not exist — no matches should be found, but that is valid (empty result)
    const res = await request(app).get('/api/fanbase/team/999/upcoming-matches');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('matches');
    expect(Array.isArray(res.body.matches)).toBe(true);
    expect(res.body.matches).toHaveLength(0);
  });

  it('returns 400 when teamId is not a number', async () => {
    const res = await request(app).get('/api/fanbase/team/abc/upcoming-matches');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('does not require an Authorization header', async () => {
    const res = await request(app).get('/api/fanbase/team/999/upcoming-matches');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
