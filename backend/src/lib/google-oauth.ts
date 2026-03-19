// google-oauth.ts
// Creates and exports a single OAuth2Client instance.
// We create it once here and import it wherever we need to generate
// Google auth URLs or exchange authorization codes for tokens.
import { OAuth2Client } from 'google-auth-library';

// OAuth2Client takes three arguments:
//   1. GOOGLE_CLIENT_ID — identifies our app to Google
//   2. GOOGLE_CLIENT_SECRET — proves we own the app (keep this secret, never expose to frontend)
//   3. GOOGLE_CALLBACK_URL — where Google sends the user after they approve
export const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL,
);
