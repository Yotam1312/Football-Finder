// Integration tests for /api/users endpoints (favorites + profile management)
// Uses supertest to send real HTTP requests to the Express app.
// Prisma is mocked so tests don't need a real database connection.
// JWTs are manually signed with a test secret to simulate authenticated requests.

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

// Set a fixed JWT_SECRET before importing the app
process.env.JWT_SECRET = 'test-secret-for-jest';

// Mock bcryptjs so password tests don't require actual hashing (fast + deterministic)
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

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
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import prisma from '../config/database';
import bcrypt from 'bcryptjs';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

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

// ─── PATCH /api/users/me — updateProfile ────────────────────────────────────

describe('PATCH /api/users/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without an auth cookie', async () => {
    const res = await request(app).patch('/api/users/me').send({ name: 'New Name' });
    expect(res.status).toBe(401);
  });

  it('updates name and returns the updated user object', async () => {
    const cookie = makeAuthCookie(42, 3);

    // Simulate Prisma returning the updated user
    (mockPrisma.user.update as jest.Mock).mockResolvedValue({
      id: 42,
      name: 'New Name',
      email: 'test@example.com',
      avatarUrl: null,
      age: null,
      country: null,
      favoriteClubId: null,
      googleId: null,
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Cookie', cookie)
      .send({ name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 42, name: 'New Name' });
  });

  it('updates age and country together', async () => {
    const cookie = makeAuthCookie(42, 3);

    (mockPrisma.user.update as jest.Mock).mockResolvedValue({
      id: 42,
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: null,
      age: 25,
      country: 'Spain',
      favoriteClubId: null,
      googleId: null,
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Cookie', cookie)
      .send({ age: 25, country: 'Spain' });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ age: 25, country: 'Spain' });
  });

  it('updates favoriteClubId', async () => {
    const cookie = makeAuthCookie(42, 3);

    (mockPrisma.user.update as jest.Mock).mockResolvedValue({
      id: 42,
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: null,
      age: null,
      country: null,
      favoriteClubId: 42,
      googleId: null,
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Cookie', cookie)
      .send({ favoriteClubId: 42 });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ favoriteClubId: 42 });
  });

  it('updates avatarUrl', async () => {
    const cookie = makeAuthCookie(42, 3);

    (mockPrisma.user.update as jest.Mock).mockResolvedValue({
      id: 42,
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      age: null,
      country: null,
      favoriteClubId: null,
      googleId: null,
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Cookie', cookie)
      .send({ avatarUrl: 'https://example.com/avatar.jpg' });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ avatarUrl: 'https://example.com/avatar.jpg' });
  });
});

// ─── PATCH /api/users/me/password — changePassword ──────────────────────────

describe('PATCH /api/users/me/password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without an auth cookie', async () => {
    const res = await request(app)
      .patch('/api/users/me/password')
      .send({ currentPassword: 'old', newPassword: 'newpass123' });
    expect(res.status).toBe(401);
  });

  it('returns 200 for email+password user with correct current password', async () => {
    const cookie = makeAuthCookie(42, 3);

    // User has a passwordHash (email+password account)
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 42,
      passwordHash: 'hashed_old_password',
    });

    // Simulate correct current password verification
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
    (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashed_new_password');
    (mockPrisma.user.update as jest.Mock).mockResolvedValue({ id: 42 });

    const res = await request(app)
      .patch('/api/users/me/password')
      .set('Cookie', cookie)
      .send({ currentPassword: 'correctpassword', newPassword: 'newpass123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Password changed successfully');
  });

  it('returns 401 when current password is wrong', async () => {
    const cookie = makeAuthCookie(42, 3);

    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 42,
      passwordHash: 'hashed_old_password',
    });

    // Simulate wrong current password
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

    const res = await request(app)
      .patch('/api/users/me/password')
      .set('Cookie', cookie)
      .send({ currentPassword: 'wrongpassword', newPassword: 'newpass123' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Current password is incorrect');
  });

  it('returns 400 for a Google-only user (no passwordHash)', async () => {
    const cookie = makeAuthCookie(42, 3);

    // Google-only user — passwordHash is null
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 42,
      passwordHash: null,
    });

    const res = await request(app)
      .patch('/api/users/me/password')
      .set('Cookie', cookie)
      .send({ currentPassword: 'anything', newPassword: 'newpass123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Password change not available for Google accounts');
  });

  it('returns 400 when newPassword is shorter than 8 characters', async () => {
    const cookie = makeAuthCookie(42, 3);

    const res = await request(app)
      .patch('/api/users/me/password')
      .set('Cookie', cookie)
      .send({ currentPassword: 'anything', newPassword: 'short' });

    expect(res.status).toBe(400);
  });
});

// ─── DELETE /api/users/me — deleteAccount ───────────────────────────────────

describe('DELETE /api/users/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without an auth cookie', async () => {
    const res = await request(app).delete('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('deletes the account and returns 200 with cookie cleared', async () => {
    const cookie = makeAuthCookie(42, 3);

    // Simulate successful deletion
    (mockPrisma.user.delete as jest.Mock).mockResolvedValue({ id: 42 });

    const res = await request(app)
      .delete('/api/users/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Account deleted');

    // Verify the Set-Cookie header clears the token cookie
    const setCookieHeader = res.headers['set-cookie'];
    expect(setCookieHeader).toBeDefined();
    const cookieString = Array.isArray(setCookieHeader)
      ? setCookieHeader.join('; ')
      : setCookieHeader;
    expect(cookieString).toContain('token=');
  });
});
