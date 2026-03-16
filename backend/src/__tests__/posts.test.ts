// Integration tests for /api/posts endpoints (upvote, edit, delete)
// Uses supertest to send real HTTP requests to the Express app.
// Prisma is mocked so tests don't need a real database connection.
// JWTs are manually signed with a test secret to simulate authenticated requests.

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

// Set a fixed JWT_SECRET before importing the app (must match what the middleware uses)
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
    // $transaction receives an array of Prisma "request" objects.
    // We mock it to resolve by running all the already-mocked functions.
    $transaction: jest.fn(),
  },
}));

import prisma from '../config/database';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Helper: create a signed JWT cookie string for a given userId and level.
// This simulates what the server sends back after login.
const makeAuthCookie = (userId: number, level: number): string => {
  const token = jwt.sign({ userId, level }, process.env.JWT_SECRET!);
  return `token=${token}`;
};

// A sample post object returned by Prisma mocks
const samplePost = {
  id: 1,
  teamId: 10,
  userId: 42,
  postType: 'GENERAL_TIP',
  title: 'Great north stand',
  body: 'Lots of atmosphere here',
  authorName: 'John Fan',
  authorEmail: 'john@example.com',
  photoUrl: null,
  seatSection: null,
  seatRow: null,
  seatNumber: null,
  seatRating: null,
  pubName: null,
  pubAddress: null,
  pubDistance: null,
  matchId: null,
  upvoteCount: 5,
  reported: false,
  createdAt: new Date(),
};

describe('POST /api/posts/:postId/upvote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without a cookie', async () => {
    // No cookie — requireLevel3 middleware should block this
    const res = await request(app).post('/api/posts/1/upvote');
    expect(res.status).toBe(401);
  });

  it('returns 403 for Level 2 user (requireLevel3 blocks it)', async () => {
    // Level 2 (email-only) user — should be blocked by requireLevel3
    const cookie = makeAuthCookie(42, 2);

    const res = await request(app)
      .post('/api/posts/1/upvote')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
  });

  it('creates upvote and returns { upvoted: true } on first call', async () => {
    const cookie = makeAuthCookie(42, 3);

    // No existing upvote — first toggle
    (mockPrisma.upvote.findUnique as jest.Mock).mockResolvedValue(null);

    // $transaction runs both create and update — resolve as if DB succeeded
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (ops: unknown[]) => {
      return Promise.all(ops);
    });

    // Simulate upvote.create and post.update being called inside the transaction
    (mockPrisma.upvote.create as jest.Mock).mockResolvedValue({ id: 1, postId: 1, userId: 42 });
    (mockPrisma.post.update as jest.Mock).mockResolvedValue({ ...samplePost, upvoteCount: 6 });

    // After the transaction, the controller fetches the updated post
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue({ ...samplePost, upvoteCount: 6 });

    const res = await request(app)
      .post('/api/posts/1/upvote')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('upvoted', true);
    expect(res.body).toHaveProperty('upvoteCount', 6);
  });
});

describe('PUT /api/posts/:postId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the title and returns the updated post for the correct owner', async () => {
    // User 42 owns the post (samplePost.userId === 42)
    const cookie = makeAuthCookie(42, 2);

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(samplePost);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue({
      ...samplePost,
      title: 'Updated title',
    });

    const res = await request(app)
      .put('/api/posts/1')
      .set('Cookie', cookie)
      .send({ title: 'Updated title' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Updated title');
  });

  it('returns 403 when a different user tries to edit the post', async () => {
    // User 99 is NOT the owner (post belongs to userId 42)
    const cookie = makeAuthCookie(99, 3);

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(samplePost);

    const res = await request(app)
      .put('/api/posts/1')
      .set('Cookie', cookie)
      .send({ title: 'Trying to hijack' });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'You can only edit your own posts');
  });

  it('returns 404 when the post does not exist', async () => {
    const cookie = makeAuthCookie(42, 2);
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/posts/999')
      .set('Cookie', cookie)
      .send({ title: 'Title' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/posts/:postId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 403 when a different user tries to delete the post', async () => {
    // User 99 does not own the post (post.userId === 42)
    const cookie = makeAuthCookie(99, 3);

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(samplePost);

    const res = await request(app)
      .delete('/api/posts/1')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
  });

  it('deletes the post and returns { message: "Post deleted" } for the owner', async () => {
    const cookie = makeAuthCookie(42, 2);

    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(samplePost);
    (mockPrisma.upvote.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
    (mockPrisma.post.delete as jest.Mock).mockResolvedValue(samplePost);

    const res = await request(app)
      .delete('/api/posts/1')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Post deleted');
  });
});
