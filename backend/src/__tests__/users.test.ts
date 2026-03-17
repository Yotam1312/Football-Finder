// Integration tests for /api/users endpoints (favorites)
// Uses supertest to send real HTTP requests to the Express app.
// Prisma is mocked so tests don't need a real database connection.
// JWTs are manually signed with a test secret to simulate authenticated requests.

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

// Set a fixed JWT_SECRET before importing the app
process.env.JWT_SECRET = 'test-secret-for-jest';

// Mock the Prisma client so all database calls are controlled in tests
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    upvote: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    post: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userFavorite: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import prisma from '../config/database';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Helper: create a signed JWT cookie string for a given userId and level
const makeAuthCookie = (userId: number, level: number): string => {
  const token = jwt.sign({ userId, level }, process.env.JWT_SECRET!);
  return `token=${token}`;
};

describe('POST /api/users/favorites/:teamId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without a cookie', async () => {
    // No cookie — requireLevel3 middleware should block this
    const res = await request(app).post('/api/users/favorites/1');
    expect(res.status).toBe(401);
  });

  it('returns 403 for Level 2 user (requireLevel3 blocks it)', async () => {
    // Email-only user (Level 2) — requireLevel3 should reject with 403
    const cookie = makeAuthCookie(42, 2);

    const res = await request(app)
      .post('/api/users/favorites/1')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
  });

  it('returns { favorited: true } on first call (adds favorite)', async () => {
    const cookie = makeAuthCookie(42, 3);

    // No existing favorite — first toggle should add it
    (mockPrisma.userFavorite.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.userFavorite.create as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 42,
      teamId: 1,
    });

    const res = await request(app)
      .post('/api/users/favorites/1')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('favorited', true);
  });

  it('returns { favorited: false } on second call (removes favorite)', async () => {
    const cookie = makeAuthCookie(42, 3);

    // Existing favorite exists — second toggle should remove it
    (mockPrisma.userFavorite.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 42,
      teamId: 1,
    });
    (mockPrisma.userFavorite.delete as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 42,
      teamId: 1,
    });

    const res = await request(app)
      .post('/api/users/favorites/1')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('favorited', false);
  });
});

describe('GET /api/users/favorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without a cookie', async () => {
    const res = await request(app).get('/api/users/favorites');
    expect(res.status).toBe(401);
  });

  it('returns { favoriteTeamIds: [...] } for a Level 3 user', async () => {
    const cookie = makeAuthCookie(42, 3);

    // Simulate user has favorited teams 10, 20, 30
    (mockPrisma.userFavorite.findMany as jest.Mock).mockResolvedValue([
      { teamId: 10 },
      { teamId: 20 },
      { teamId: 30 },
    ]);

    const res = await request(app)
      .get('/api/users/favorites')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('favoriteTeamIds');
    expect(res.body.favoriteTeamIds).toEqual([10, 20, 30]);
  });
});
