// Integration tests for POST /api/admin/sync — admin API key authentication
// Uses supertest to send real HTTP requests to the Express app.
// The middleware reads ADMIN_API_KEY from the environment, so we set it in beforeEach.

import request from 'supertest';
import app from '../app';

// Mock the Prisma client so database calls never fire during auth tests.
// The sync handler calls prisma internally — we just need it not to crash.
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {},
}));

describe('POST /api/admin/sync — requireAdminKey middleware', () => {
  const VALID_KEY = 'test-secret-key-12345';

  beforeEach(() => {
    // Set the env var the middleware reads — simulates a real deployment
    process.env.ADMIN_API_KEY = VALID_KEY;
  });

  afterEach(() => {
    // Clean up so other tests are not affected by this env var
    delete process.env.ADMIN_API_KEY;
  });

  it('returns 401 when x-admin-api-key header is missing', async () => {
    const response = await request(app)
      .post('/api/admin/sync');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 401 when x-admin-api-key header has the wrong value', async () => {
    const response = await request(app)
      .post('/api/admin/sync')
      .set('x-admin-api-key', 'wrong-key-value');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('proceeds past middleware when x-admin-api-key header matches ADMIN_API_KEY env var', async () => {
    const response = await request(app)
      .post('/api/admin/sync')
      .set('x-admin-api-key', VALID_KEY);

    // The middleware should let the request through — it must NOT return 401.
    // The sync handler itself may return any status (200, 500, etc.) depending on
    // environment — we just verify the key check passed.
    expect(response.status).not.toBe(401);
  });
});
