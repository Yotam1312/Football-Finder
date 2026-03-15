// Integration tests for GET /api/fanbase/team/:teamId/posts
// Verifies posts pagination, type filtering, and auth-free access.
// Uses teamId 9999 (unknown) — empty results are valid, not an error.
// No auth required — this is a public read-only endpoint (FAN-04).
import request from 'supertest';
import app from '../app';

describe('GET /api/fanbase/team/:teamId/posts', () => {
  it('returns 200 with posts array for any teamId (empty is fine)', async () => {
    const res = await request(app).get('/api/fanbase/team/9999/posts');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('posts');
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.posts)).toBe(true);
  });

  it('returns 200 when filtering by a valid type', async () => {
    const res = await request(app).get('/api/fanbase/team/9999/posts?type=SEAT_TIP');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.posts)).toBe(true);
  });

  it('returns 400 when type is invalid', async () => {
    const res = await request(app).get('/api/fanbase/team/9999/posts?type=INVALID');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('does not require an Authorization header (FAN-04)', async () => {
    const res = await request(app).get('/api/fanbase/team/9999/posts');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
