// Integration tests for POST /api/upload
// Uses supertest to send real HTTP requests to the Express app.
// Prisma and the Azure SDK are mocked so tests don't need real cloud connections.
// JWTs are manually signed with a test secret to simulate authenticated requests.

// Set env vars BEFORE any imports so the modules pick them up on first load
process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.AZURE_STORAGE_CONNECTION_STRING = 'fake-connection-string';
process.env.AZURE_STORAGE_CONTAINER_NAME = 'test-container';

// Mock the Azure Blob Storage SDK so no real uploads happen in tests.
// We intercept at the module level and control what each method returns.
const mockUploadData = jest.fn().mockResolvedValue({});
const mockGetBlockBlobClient = jest.fn().mockReturnValue({
  uploadData: mockUploadData,
  url: 'https://teststorage.blob.core.windows.net/test-container/posts/test-uuid.jpg',
});
const mockGetContainerClient = jest.fn().mockReturnValue({
  getBlockBlobClient: mockGetBlockBlobClient,
});

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn().mockReturnValue({
      getContainerClient: mockGetContainerClient,
    }),
  },
}));

// Mock Prisma so the auth middleware's user lookup doesn't need a real database.
// requireLevel3 only validates the JWT (no DB call), so this mock covers
// any controller-level DB usage (e.g. if the controller ever looks up the user).
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
  },
}));

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import prisma from '../config/database';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Helper: create a signed JWT cookie string for a given userId and level.
// This simulates what the server sends back after login.
const makeAuthCookie = (userId: number, level: number): string => {
  const token = jwt.sign({ userId, level }, process.env.JWT_SECRET!);
  return `token=${token}`;
};

describe('POST /api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Re-apply the upload data mock after clearAllMocks resets it
    mockUploadData.mockResolvedValue({});
    mockGetBlockBlobClient.mockReturnValue({
      uploadData: mockUploadData,
      url: 'https://teststorage.blob.core.windows.net/test-container/posts/test-uuid.jpg',
    });
    mockGetContainerClient.mockReturnValue({
      getBlockBlobClient: mockGetBlockBlobClient,
    });
  });

  it('returns 401 for unauthenticated request', async () => {
    // No cookie — requireLevel3 middleware should block this immediately
    const res = await request(app).post('/api/upload');
    expect(res.status).toBe(401);
  });

  it('rejects non-image MIME type with 400', async () => {
    const cookie = makeAuthCookie(1, 3);

    // Attach a plain text file — multer's fileFilter should reject this
    const res = await request(app)
      .post('/api/upload')
      .set('Cookie', cookie)
      .attach('photo', Buffer.from('this is not an image'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
    // The error message should mention the allowed types
    expect(res.body.error).toContain('jpg, png, and webp');
  });

  it('rejects file too large with 400', async () => {
    const cookie = makeAuthCookie(1, 3);

    // Create a 6MB buffer — exceeds our 5MB limit
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024);

    const res = await request(app)
      .post('/api/upload')
      .set('Cookie', cookie)
      .attach('photo', bigBuffer, {
        filename: 'big.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(400);
  });

  it('returns url on valid upload', async () => {
    const cookie = makeAuthCookie(1, 3);

    // Mock prisma.user.findUnique in case the controller looks up the user
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1, email: 'test@test.com', name: 'Test User', level: 3,
    });

    const res = await request(app)
      .post('/api/upload')
      .set('Cookie', cookie)
      .attach('photo', Buffer.from('fake-image-data'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('url');
    expect(typeof res.body.url).toBe('string');
    expect(res.body.url).toContain('teststorage.blob.core.windows.net');
  });
});
