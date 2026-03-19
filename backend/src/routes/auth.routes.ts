import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
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

export default router;
