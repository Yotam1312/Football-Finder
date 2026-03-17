import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

// Helper: set the JWT cookie on the response.
// httpOnly prevents JavaScript from reading it (XSS protection).
// secure is only true in production so local dev works over HTTP.
// sameSite 'lax' prevents CSRF while allowing normal navigation.
const setAuthCookie = (res: Response, userId: number, level: number): void => {
  const token = jwt.sign(
    { userId, level },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

// POST /api/auth/register
// Creates a new full account (Level 3) with email, password, and name.
// Age and favoriteClubId are optional — stored as null if not provided.
// Account is active immediately — no email verification step required.
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, age, favoriteClubId } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Password must be at least 8 characters for basic security
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if email is already registered — return 409 Conflict if so
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password before storing — bcrypt with salt rounds = 10 is the standard
    // High enough to slow brute force, fast enough that a single hash takes ~100ms
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        age: age ? parseInt(age, 10) : null,
        favoriteClubId: favoriteClubId ? parseInt(favoriteClubId, 10) : null,
      },
    });

    // Issue a Level 3 cookie immediately — registered users are full accounts from the start
    setAuthCookie(res, user.id, 3);

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, level: 3 },
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /api/auth/set-password (requires requireAuth middleware)
// Upgrades a Level 2 user to Level 3 by setting a password.
// req.auth is attached by requireAuth middleware with { userId, level }.
export const setPassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    // Password must be at least 8 characters
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // We use bcryptjs (not bcrypt) — same API, no native compilation required.
    // Salt rounds of 10 is the standard — high enough to slow brute force,
    // fast enough that a single hash takes ~100ms.
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: req.auth!.userId },
      data: { passwordHash: hashedPassword },
    });

    // Re-issue the JWT with level 3 to reflect the upgrade
    setAuthCookie(res, req.auth!.userId, 3);

    res.status(200).json({ message: 'Password set. You are now a full account holder.' });
  } catch (error) {
    console.error('Error in setPassword:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
};

// POST /api/auth/login
// Full account login with email and password. Returns a Level 3 JWT cookie.
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // Return the same generic message for both "not found" and "wrong password"
    // so we don't leak which emails are registered
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Level 2 users have no password — they need to use set-password first
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password against the stored bcrypt hash
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Issue a Level 3 JWT cookie
    setAuthCookie(res, user.id, 3);

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: 3,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// POST /api/auth/logout
// Clears the JWT cookie. The user is immediately logged out on the frontend.
export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out' });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// GET /api/auth/me
// Returns the current user's info by reading and verifying the JWT cookie.
// This is how the frontend knows who is logged in on page load.
export const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify the JWT and extract the payload
    let payload: { userId: number; level: number };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; level: number };
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch the user from the database to ensure they still exist
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Determine level dynamically: Level 3 if they have a password, Level 2 if not
    const level = user.passwordHash ? 3 : 2;

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level,
      },
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
