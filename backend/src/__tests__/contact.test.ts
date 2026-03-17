import request from 'supertest';
import app from '../app';

// Mock the email service so tests don't actually try to send emails.
// This prevents test failures from network/SMTP issues and keeps tests fast.
jest.mock('../services/email.service', () => ({
  sendContactEmail: jest.fn().mockResolvedValue(undefined),
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('POST /api/contact', () => {
  it('returns 200 for valid contact form submission', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message from the contact form.',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Test User' }); // missing email, subject, message
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Test', subject: 'Hi', message: 'Hello' }); // no email
    expect(res.status).toBe(400);
  });
});
