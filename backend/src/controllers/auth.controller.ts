import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { createVerificationToken } from '../lib/token.helpers';
import { sendVerificationEmail } from '../services/email.service';

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

// POST /api/auth/request-post
// First step of posting: validates form data, stores it in a VerificationToken,
// and emails the user a link. The user clicks the link to actually create the post.
export const requestPost = async (req: Request, res: Response) => {
  try {
    const {
      email,
      authorName,
      teamId,
      teamName,
      postType,
      title,
      body,
      // optional seat tip fields
      seatSection,
      seatRow,
      seatNumber,
      seatRating,
      // optional pub recommendation fields
      pubName,
      pubAddress,
      pubDistance,
      // optional match link
      matchId,
    } = req.body;

    // Validate required fields — return 400 if any are missing
    if (!email || !authorName || !teamId || !teamName || !postType || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store the pending post data in the VerificationToken so we can create the post
    // after the user clicks the email link (without them re-entering the form)
    const token = await createVerificationToken(email, {
      teamId,
      postType,
      title,
      body,
      authorName,
      seatSection,
      seatRow,
      seatNumber,
      seatRating,
      pubName,
      pubAddress,
      pubDistance,
      matchId,
    });

    await sendVerificationEmail(email, token, teamName);

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Error in requestPost:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
};

// POST /api/auth/verify/:token
// Second step of posting: the user clicks the email link with this token.
// We look up the pending post data, create the post, and set a JWT cookie.
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Look up the token record (include the associated user if one already exists)
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // Guard checks in order of priority
    if (!tokenRecord) {
      return res.status(404).json({ error: 'Verification link not found' });
    }

    if (tokenRecord.usedAt !== null) {
      return res.status(400).json({ error: 'Link already used' });
    }

    if (tokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Link expired', code: 'EXPIRED' });
    }

    // Cast pendingPostData — Prisma stores it as JsonValue (unknown shape)
    const postData = tokenRecord.pendingPostData as Record<string, unknown>;

    // Find or create the user by email.
    // upsert is perfect here: create if new user, return existing if returning visitor.
    const user = await prisma.user.upsert({
      where: { email: tokenRecord.email },
      update: {}, // don't change anything if user already exists
      create: {
        email: tokenRecord.email,
        name: postData.authorName as string,
      },
    });

    // Use a Prisma transaction to create the post and mark the token as used
    // in a single atomic operation. If either fails, both are rolled back.
    const [post] = await prisma.$transaction([
      prisma.post.create({
        data: {
          teamId: postData.teamId as number,
          userId: user.id,
          postType: postData.postType as 'GENERAL_TIP' | 'SEAT_TIP' | 'PUB_RECOMMENDATION' | 'IM_GOING',
          title: postData.title as string,
          body: postData.body as string,
          authorName: postData.authorName as string,
          authorEmail: tokenRecord.email,
          seatSection: (postData.seatSection as string | undefined) ?? null,
          seatRow: (postData.seatRow as string | undefined) ?? null,
          seatNumber: (postData.seatNumber as string | undefined) ?? null,
          seatRating: (postData.seatRating as number | undefined) ?? null,
          pubName: (postData.pubName as string | undefined) ?? null,
          pubAddress: (postData.pubAddress as string | undefined) ?? null,
          pubDistance: (postData.pubDistance as string | undefined) ?? null,
          matchId: (postData.matchId as number | undefined) ?? null,
        },
      }),
      prisma.verificationToken.update({
        where: { token },
        data: { usedAt: new Date(), userId: user.id },
      }),
    ]);

    // Set a Level 2 cookie — they've verified their email but haven't set a password yet
    setAuthCookie(res, user.id, 2);

    res.status(200).json({
      post,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: 2,
      },
    });
  } catch (error) {
    console.error('Error in verifyToken:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
};

// POST /api/auth/resend
// Creates a new verification token using the data from an expired token,
// then sends a fresh email. The user provides the old token string.
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { expiredToken } = req.body;

    // Find the old token record
    const oldRecord = await prisma.verificationToken.findUnique({
      where: { token: expiredToken },
    });

    if (!oldRecord) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const postData = oldRecord.pendingPostData as Record<string, unknown>;

    // Create a fresh token with the same pending post data
    const newToken = await createVerificationToken(oldRecord.email, oldRecord.pendingPostData as object);

    // Get the team name so we can use it in the email subject
    const teamId = postData.teamId as number;
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    const teamName = team?.name || 'Your Team';

    await sendVerificationEmail(oldRecord.email, newToken, teamName);

    res.status(200).json({ message: 'New verification email sent' });
  } catch (error) {
    console.error('Error in resendVerification:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
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
