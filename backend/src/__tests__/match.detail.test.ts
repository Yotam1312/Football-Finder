// Integration tests for GET /api/matches/:id
import request from 'supertest';
import app from '../app';

describe('GET /api/matches/:id', () => {
  it('returns 404 for a non-existent match id', async () => {
    const res = await request(app).get('/api/matches/99999999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/api/matches/abc');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
