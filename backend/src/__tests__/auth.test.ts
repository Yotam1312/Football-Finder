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
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
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

describe('POST /api/auth/request-post', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: token creation succeeds
    (mockPrisma.verificationToken.create as jest.Mock).mockResolvedValue({
      id: 1,
      token: 'test-token',
      email: 'user@example.com',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      usedAt: null,
      pendingPostData: {},
      userId: null,
    });
  });

  it('returns 200 with valid body', async () => {
    const res = await request(app)
      .post('/api/auth/request-post')
      .send({
        email: 'fan@example.com',
        authorName: 'John Fan',
        teamId: 1,
        teamName: 'Arsenal',
        postType: 'GENERAL_TIP',
        title: 'Great stadium',
        body: 'The north stand is brilliant',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Verification email sent');
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/request-post')
      .send({
        authorName: 'John Fan',
        teamId: 1,
        teamName: 'Arsenal',
        postType: 'GENERAL_TIP',
        title: 'Great stadium',
        body: 'The north stand is brilliant',
        // email is intentionally missing
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing required fields');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/auth/request-post')
      .send({
        email: 'fan@example.com',
        authorName: 'John Fan',
        teamId: 1,
        teamName: 'Arsenal',
        postType: 'GENERAL_TIP',
        // title is intentionally missing
        body: 'The north stand is brilliant',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing required fields');
  });
});

describe('POST /api/auth/verify/:token', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 and sets a cookie for a valid unused token', async () => {
    // Simulate a valid token record
    (mockPrisma.verificationToken.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      token: 'valid-token',
      email: 'fan@example.com',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // expires in 1 hour
      usedAt: null, // not used yet
      pendingPostData: {
        teamId: 1,
        postType: 'GENERAL_TIP',
        title: 'Great stadium',
        body: 'The north stand is brilliant',
        authorName: 'John Fan',
      },
      userId: null,
      user: null,
    });

    // Simulate finding/creating the user
    (mockPrisma.user.upsert as jest.Mock).mockResolvedValue({
      id: 42,
      email: 'fan@example.com',
      name: 'John Fan',
      passwordHash: null,
      createdAt: new Date(),
    });

    // The controller passes an array of PrismaPromises to $transaction.
    // We mock post.create and verificationToken.update to return the expected values,
    // then mock $transaction to resolve them as if the DB did the work.
    const mockPost = {
      id: 10,
      teamId: 1,
      postType: 'GENERAL_TIP',
      title: 'Great stadium',
      body: 'The north stand is brilliant',
      authorName: 'John Fan',
      authorEmail: 'fan@example.com',
      userId: 42,
    };
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);
    (mockPrisma.verificationToken.update as jest.Mock).mockResolvedValue({ id: 1, usedAt: new Date() });

    // $transaction with array form: Prisma executes each PrismaPromise inside a transaction.
    // In our mock, we make it resolve using the already-mocked return values.
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (ops: unknown[]) => {
      return Promise.all(ops);
    });

    const res = await request(app)
      .post('/api/auth/verify/valid-token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('post');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.level).toBe(2);
    // A Set-Cookie header should be present
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 400 for an already-used token', async () => {
    // Simulate a token that was already used
    (mockPrisma.verificationToken.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      token: 'used-token',
      email: 'fan@example.com',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      usedAt: new Date(Date.now() - 60 * 60 * 1000), // was used 1 hour ago
      pendingPostData: {},
      userId: 42,
      user: { id: 42, email: 'fan@example.com', name: 'John Fan' },
    });

    const res = await request(app)
      .post('/api/auth/verify/used-token');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Link already used');
  });

  it('returns 404 for a non-existent token', async () => {
    (mockPrisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/verify/nonexistent-token');

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
