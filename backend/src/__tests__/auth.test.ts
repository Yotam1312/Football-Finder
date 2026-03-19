// Integration tests for /api/auth endpoints
// Uses supertest to send real HTTP requests to the Express app.
// Prisma is mocked so tests don't need a real database connection.
// Email service is mocked so no real emails are sent during tests.

import request from 'supertest';
import app from '../app';

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
  it('returns 401 without a cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    // No cookie set — should get 401
    expect(res.status).toBe(401);
  });
});
