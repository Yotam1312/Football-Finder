import { Request, Response, NextFunction } from 'express';

// requireAdminKey — checks that a valid ADMIN_API_KEY header is present.
// Compares the x-admin-api-key request header against the ADMIN_API_KEY env var.
// Returns 401 immediately if missing or wrong — the sync handler never fires.
//
// Why header instead of body? Headers are standard for machine-to-machine API keys.
// The caller (a cron job or admin script) sets the header, not a user form.
export const requireAdminKey = (req: Request, res: Response, next: NextFunction): void => {
  const providedKey = req.headers['x-admin-api-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  // If the env var is not set, reject all requests — this prevents accidental
  // exposure in environments where the variable was forgotten.
  // If the provided key does not match, also reject.
  if (!expectedKey || providedKey !== expectedKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
};
