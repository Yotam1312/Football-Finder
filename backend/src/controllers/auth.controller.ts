import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { oauth2Client } from '../lib/google-oauth';

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

    // Google-only users have no password — they need to use Google sign-in
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

    // Level 3 if the user has a password OR a linked Google account.
    // Previously this was `user.passwordHash ? 3 : 2` which incorrectly gave
    // Google users (no passwordHash) a level of 2.
    const level = (user.passwordHash || user.googleId) ? 3 : 2;

    // accountType tells the frontend whether to show the password change section.
    // We expose this as a string flag — we never expose the actual googleId.
    const accountType = user.googleId ? 'google' : 'email';

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        country: user.country,
        age: user.age,
        favoriteClubId: user.favoriteClubId,
        accountType,
        level,
      },
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// GET /api/auth/google
// Redirects the browser to Google's OAuth consent screen.
// Before redirecting, we store the intended destination in a short-lived cookie
// so we can send the user to the right page after they return from Google.
export const googleRedirect = (req: Request, res: Response): void => {
  // Read the returnTo query param — e.g. /fanbase/team/42 if user clicked
  // "post a tip" while not logged in. Defaults to '/' (homepage).
  const returnTo = (req.query.returnTo as string) || '/';

  // Store returnTo in an httpOnly cookie that survives the OAuth round-trip.
  // We use a cookie (not the OAuth state param) because the state param
  // appears in the browser's address bar history — a cookie is more private.
  res.cookie('oauth_return_to', returnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes — only needs to last through the Google flow
  });

  // Build the callback URL dynamically from the incoming request host.
  // This means localhost on PC and 192.168.68.117 on mobile both work automatically,
  // as long as both are registered in Google Cloud Console as allowed redirect URIs.
  const callbackUrl = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

  // Store the callback URL in a cookie so googleCallback can use the exact same
  // URL when exchanging the code — Google requires them to match precisely.
  res.cookie('oauth_callback_url', callbackUrl, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  });

  // Generate the Google consent screen URL.
  // access_type 'online' means we only want an access token, not a refresh token.
  // We only need profile data once during sign-in — we don't need ongoing access.
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    redirect_uri: callbackUrl,
  });

  res.redirect(authUrl);
};

// GET /api/auth/google/callback
// Google calls this URL after the user approves (or cancels) the sign-in.
// We exchange the authorization code for an access token, fetch the user's
// Google profile, then find or create a user in our database.
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    const code = req.query.code as string;

    // If code is missing, the user cancelled the Google sign-in flow
    if (!code) {
      res.redirect(`${frontendUrl}/login?error=cancelled`);
      return;
    }

    // Exchange the one-time authorization code for an access token.
    // We must pass the same redirect_uri used in googleRedirect — Google validates they match.
    const callbackUrl = req.cookies?.oauth_callback_url ||
      `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

    const { tokens } = await oauth2Client.getToken({ code, redirect_uri: callbackUrl });
    oauth2Client.setCredentials(tokens);

    // Fetch the user's profile from Google's userinfo endpoint.
    // The profile contains: id, email, name, picture, verified_email
    const profileResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const googleProfile = await profileResponse.json() as {
      id: string;
      email: string;
      name: string;
      picture?: string;
      verified_email: boolean;
    };

    // Find an existing user by their Google ID first, then by email.
    // The email fallback handles the case where a user registered with
    // email+password and is now signing in with Google for the first time.
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleProfile.id },
          { email: googleProfile.email },
        ],
      },
    });

    let isNewUser = false;

    if (!user) {
      // First-time Google sign-in — create an account automatically.
      // Google users have no password, so passwordHash is null.
      user = await prisma.user.create({
        data: {
          email: googleProfile.email,
          name: googleProfile.name,
          googleId: googleProfile.id,
          avatarUrl: googleProfile.picture || null,
          passwordHash: null,
        },
      });
      isNewUser = true;
    } else if (!user.googleId) {
      // Existing email+password user signing in with Google for the first time.
      // Link their Google account to the existing user record.
      // Only update avatarUrl if they don't already have one.
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleProfile.id,
          avatarUrl: user.avatarUrl || googleProfile.picture || null,
        },
      });
    }

    // Issue the same JWT cookie used for email+password login.
    // Google users are always Level 3 — they have a full account.
    setAuthCookie(res, user.id, 3);

    // Read the returnTo cookie set before the Google redirect.
    // Clear it immediately — it is single-use.
    const returnTo = req.cookies?.oauth_return_to || '/';
    res.clearCookie('oauth_return_to');

    // New users go to the welcome page (shown once).
    // Returning users go back to where they came from.
    const destination = isNewUser ? '/welcome' : returnTo;
    res.redirect(`${frontendUrl}${destination}`);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${frontendUrl}/login?error=cancelled`);
  }
};
