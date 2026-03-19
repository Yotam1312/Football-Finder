// Integration tests for /api/auth endpoints
// Uses supertest to send real HTTP requests to the Express app.
// Prisma is mocked so tests don't need a real database connection.
// Email service is mocked so no real emails are sent during tests.

import request from 'supertest';
import app from '../app';

// Mock the google-oauth helper so tests don't make real Google API calls.
// generateAuthUrl returns a fake Google URL, getToken returns a fake token.
jest.mock('../lib/google-oauth', () => ({
  oauth2Client: {
    generateAuthUrl: jest.fn().mockReturnValue('https://accounts.google.com/o/oauth2/auth?mock=1'),
    getToken: jest.fn().mockResolvedValue({ tokens: { access_token: 'mock-access-token' } }),
    setCredentials: jest.fn(),
  },
}));

// Mock global fetch used in googleCallback to call Google's userinfo endpoint
// Each test that exercises the callback will configure this mock per-test.
global.fetch = jest.fn();

// Mock the Prisma client so all database calls are controlled in tests
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    verificationToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    post: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    team: {
      findUnique: jest.fn(),
    },
    // $transaction receives an array of Prisma "request" objects.
    // In tests we mock it to resolve with the same array mock returns.
    $transaction: jest.fn(),
  },
}));

// Mock the email service to avoid real SMTP calls
jest.mock('../services/email.service', () => ({
  sendContactEmail: jest.fn().mockResolvedValue(undefined),
}));

// Mock nanoid so we get predictable token values in tests
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-token-64-chars-long-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
}));

// Get typed references to the mocked modules so we can control return values per test
import prisma from '../config/database';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Set a fixed JWT_SECRET for all tests
process.env.JWT_SECRET = 'test-secret-for-jest';
// Set FRONTEND_URL for redirect assertions
process.env.FRONTEND_URL = 'http://localhost:5173';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 201 and sets cookie for valid registration', async () => {
    // No existing user with this email
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    // User creation succeeds
    (mockPrisma.user.create as jest.Mock).mockResolvedValue({
      id: 99,
      email: 'newuser@test.com',
      name: 'New User',
      passwordHash: 'hashed',
      age: null,
      favoriteClubId: null,
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newuser@test.com', password: 'password123', name: 'New User' });

    expect(res.status).toBe(201);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body.user).toHaveProperty('email', 'newuser@test.com');
    expect(res.body.user).toHaveProperty('level', 3);
  });

  it('returns 409 for duplicate email', async () => {
    // Simulate existing user with this email
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'dup@test.com',
      name: 'Existing User',
      passwordHash: 'hashed',
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'password123', name: 'Dup User 2' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error', 'Email already registered');
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'missing@test.com' }); // no password, no name

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing required fields');
  });

  it('returns 400 for password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'short@test.com', password: 'short', name: 'Short Pass' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Password must be at least 8 characters');
  });
});

describe('Removed hybrid endpoints return 404', () => {
  it('POST /api/auth/request-post returns 404', async () => {
    const res = await request(app).post('/api/auth/request-post').send({});
    expect(res.status).toBe(404);
  });

  it('POST /api/auth/resend returns 404', async () => {
    const res = await request(app).post('/api/auth/resend').send({});
    expect(res.status).toBe(404);
  });
});

describe('POST /api/auth/login', () => {
  const bcrypt = require('bcryptjs');

  it('returns 401 with wrong password', async () => {
    // Create a real bcrypt hash so we can test the comparison
    const realHash = await bcrypt.hash('correct-password', 10);

    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'fan@example.com',
      name: 'John Fan',
      passwordHash: realHash,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fan@example.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('returns 401 when user does not exist', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'any-password' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });
});

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without a cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    // No cookie set — should get 401
    expect(res.status).toBe(401);
  });

  it('returns level 3 and accountType google for a Google user (no passwordHash)', async () => {
    // First, register and grab the cookie so we have a valid JWT
    // We need to generate a real JWT for this test — borrow the same secret
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: 5, level: 3 }, 'test-secret-for-jest', { expiresIn: '7d' });

    // Mock the DB lookup to return a Google user (has googleId, no passwordHash)
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 5,
      email: 'googleuser@gmail.com',
      name: 'Google User',
      passwordHash: null,
      googleId: 'google-id-123',
      avatarUrl: 'https://lh3.googleusercontent.com/photo.jpg',
      country: 'GB',
      age: null,
      favoriteClubId: null,
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('level', 3);
    expect(res.body.user).toHaveProperty('accountType', 'google');
    expect(res.body.user).toHaveProperty('avatarUrl', 'https://lh3.googleusercontent.com/photo.jpg');
    expect(res.body.user).toHaveProperty('country', 'GB');
  });

  it('returns level 3 and accountType email for an email+password user', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: 6, level: 3 }, 'test-secret-for-jest', { expiresIn: '7d' });

    // Mock the DB lookup to return an email+password user (has passwordHash, no googleId)
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 6,
      email: 'emailuser@example.com',
      name: 'Email User',
      passwordHash: 'some-hash',
      googleId: null,
      avatarUrl: null,
      country: null,
      age: null,
      favoriteClubId: null,
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('level', 3);
    expect(res.body.user).toHaveProperty('accountType', 'email');
  });
});

describe('GET /api/auth/google', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responds with 302 redirect and Location header containing accounts.google.com', async () => {
    const res = await request(app).get('/api/auth/google');

    expect(res.status).toBe(302);
    expect(res.headers['location']).toContain('accounts.google.com');
  });
});

describe('GET /api/auth/google/callback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the fetch mock between tests
    (global.fetch as jest.Mock).mockReset();
  });

  it('redirects to /login?error=cancelled when no code param is provided', async () => {
    const res = await request(app).get('/api/auth/google/callback');

    expect(res.status).toBe(302);
    expect(res.headers['location']).toBe('http://localhost:5173/login?error=cancelled');
  });

  it('redirects to /login?error=cancelled when error param is present (user cancelled)', async () => {
    const res = await request(app).get('/api/auth/google/callback?error=access_denied');

    expect(res.status).toBe(302);
    expect(res.headers['location']).toBe('http://localhost:5173/login?error=cancelled');
  });

  it('creates a new user and redirects to /welcome for a brand-new Google sign-in', async () => {
    // Simulate Google returning a profile for a user not in our database
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        id: 'google-id-123',
        email: 'newgoogleuser@gmail.com',
        name: 'New Google User',
        picture: 'https://lh3.googleusercontent.com/photo.jpg',
        verified_email: true,
      }),
    });

    // No existing user found (neither by googleId nor email)
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    // New user creation succeeds
    (mockPrisma.user.create as jest.Mock).mockResolvedValue({
      id: 10,
      email: 'newgoogleuser@gmail.com',
      name: 'New Google User',
      googleId: 'google-id-123',
      avatarUrl: 'https://lh3.googleusercontent.com/photo.jpg',
      passwordHash: null,
    });

    const res = await request(app).get('/api/auth/google/callback?code=valid-code-123');

    expect(res.status).toBe(302);
    expect(res.headers['location']).toBe('http://localhost:5173/welcome');
    // Should have set a JWT cookie
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('finds an existing Google user and redirects to / (home)', async () => {
    // Simulate Google returning a profile for a user already in our database
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        id: 'google-id-456',
        email: 'returninggoogle@gmail.com',
        name: 'Returning Google User',
        picture: 'https://lh3.googleusercontent.com/photo2.jpg',
        verified_email: true,
      }),
    });

    // Existing user found by googleId
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 20,
      email: 'returninggoogle@gmail.com',
      name: 'Returning Google User',
      googleId: 'google-id-456',
      avatarUrl: 'https://lh3.googleusercontent.com/photo2.jpg',
      passwordHash: null,
    });

    const res = await request(app).get('/api/auth/google/callback?code=valid-code-456');

    expect(res.status).toBe(302);
    // Returning user goes to / (home), not /welcome
    expect(res.headers['location']).toBe('http://localhost:5173/');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('links googleId to an existing email+password user without creating a duplicate', async () => {
    // Simulate Google returning a profile matching an existing email+password user
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        id: 'google-id-789',
        email: 'existing@example.com',
        name: 'Existing User',
        picture: 'https://lh3.googleusercontent.com/photo3.jpg',
        verified_email: true,
      }),
    });

    // Found by email match — existing user has no googleId yet
    const existingUser = {
      id: 30,
      email: 'existing@example.com',
      name: 'Existing User',
      googleId: null,   // no googleId yet — this is the first time they sign in via Google
      avatarUrl: null,
      passwordHash: 'some-hash',
    };
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(existingUser);

    // update() links the googleId and returns the updated user
    (mockPrisma.user.update as jest.Mock).mockResolvedValue({
      ...existingUser,
      googleId: 'google-id-789',
      avatarUrl: 'https://lh3.googleusercontent.com/photo3.jpg',
    });

    const res = await request(app).get('/api/auth/google/callback?code=valid-code-789');

    expect(res.status).toBe(302);
    // Linked user is a returning user — goes to / not /welcome
    expect(res.headers['location']).toBe('http://localhost:5173/');
    // prisma.user.create should NOT have been called — no new user was created
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
    // prisma.user.update should have been called to link the googleId
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 30 },
        data: expect.objectContaining({ googleId: 'google-id-789' }),
      })
    );
  });
});
