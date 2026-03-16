import { nanoid } from 'nanoid';
import prisma from '../config/database';

// createVerificationToken — generates a secure random token and stores it
// in the VerificationToken table along with the pending post data.
// The token is emailed to the user; when they click the link, the server
// looks up this record to find their pending post and create it.
export const createVerificationToken = async (
  email: string,
  pendingPostData: object
): Promise<string> => {
  // Generate a 64-character URL-safe random string (nanoid is URL-safe by default)
  const token = nanoid(64);

  // Token expires 24 hours from now
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      token,
      email,
      expiresAt,
      pendingPostData,
    },
  });

  return token;
};
