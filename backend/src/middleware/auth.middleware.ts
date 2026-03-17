import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express's Request type so TypeScript knows about req.auth
// This is the standard way to attach custom data to Express requests.
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        level: number;
      };
    }
  }
}

// The shape of what we store in the JWT payload
interface JwtPayload {
  userId: number;
  level: number;
}

// requireAuth — checks that a valid JWT cookie is present.
// Reads the 'token' cookie, verifies it with JWT_SECRET, and attaches
// the decoded { userId, level } to req.auth so controllers can use it.
// Returns 401 if the cookie is missing or the token is invalid/expired.
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.auth = { userId: payload.userId, level: payload.level };
    next();
  } catch {
    // Token is expired or tampered with
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// requireLevel3 — same as requireAuth, but also checks that the user
// has a full account (Level 3, meaning they've set a password).
// Returns 403 if the user is only Level 2 (email-only).
export const requireLevel3 = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (payload.level < 3) {
      res.status(403).json({ error: 'Full account required' });
      return;
    }

    req.auth = { userId: payload.userId, level: payload.level };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
