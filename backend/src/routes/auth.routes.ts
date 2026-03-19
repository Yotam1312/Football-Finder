import express from 'express';
import * as authController from '../controllers/auth.controller';

const router = express.Router();

// POST /api/auth/register
// Create a new full account. No email verification step — account is active immediately.
// Requires: email, password (min 8 chars), name. Optional: age, favoriteClubId.
router.post('/register', authController.register);

// POST /api/auth/login
// Full account login: email + password. Returns a Level 3 JWT cookie.
router.post('/login', authController.login);

// POST /api/auth/logout
// Clears the JWT cookie, ending the session.
router.post('/logout', authController.logout);

// GET /api/auth/me
// Returns the currently authenticated user's info.
router.get('/me', authController.getMe);

// GET /api/auth/google
// Redirects the browser to Google's OAuth consent screen.
// Optional query param: ?returnTo=/fanbase/team/42
router.get('/google', authController.googleRedirect);

// GET /api/auth/google/callback
// Google redirects here after the user approves (or cancels) sign-in.
// Exchanges the code for a user profile, finds or creates the user, sets cookie.
router.get('/google/callback', authController.googleCallback);

export default router;
