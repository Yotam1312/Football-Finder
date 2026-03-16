import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as authController from '../controllers/auth.controller';

const router = express.Router();

// POST /api/auth/request-post
// Step 1 of post creation: validate the email, store pending post data,
// and send a verification email. No auth required — this is the entry point.
router.post('/request-post', authController.requestPost);

// POST /api/auth/verify/:token
// Step 2 of post creation: the user clicks the email link, this endpoint
// verifies the token, creates the post, and sets a Level 2 JWT cookie.
router.post('/verify/:token', authController.verifyToken);

// POST /api/auth/resend
// Resend the verification email using an expired token as a reference.
router.post('/resend', authController.resendVerification);

// POST /api/auth/set-password
// Upgrade a Level 2 user to Level 3 by setting a password.
// requireAuth ensures the user is logged in (Level 2 cookie required).
router.post('/set-password', requireAuth, authController.setPassword);

// POST /api/auth/login
// Full account login: email + password. Returns a Level 3 JWT cookie.
router.post('/login', authController.login);

// POST /api/auth/logout
// Clears the JWT cookie, ending the session.
router.post('/logout', authController.logout);

// GET /api/auth/me
// Returns the currently authenticated user's info.
router.get('/me', authController.getMe);

export default router;
