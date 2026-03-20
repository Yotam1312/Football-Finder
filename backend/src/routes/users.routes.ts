import express from 'express';
import { requireLevel3 } from '../middleware/auth.middleware';
import * as usersController from '../controllers/users.controller';

const router = express.Router();

// POST /favorites/:teamId — toggle a team as favorite (requires full account, Level 3)
// First call: adds the team to favorites and returns { favorited: true }
// Second call: removes the team from favorites and returns { favorited: false }
router.post('/favorites/:teamId', requireLevel3, usersController.toggleFavorite);

// GET /favorites — return all team IDs the user has favorited (requires full account, Level 3)
// Used on page load to initialize the heart icon state for each team
router.get('/favorites', requireLevel3, usersController.getFavorites);

// PATCH /me — update profile fields (name, age, country, favoriteClubId, avatarUrl)
// All fields are optional — only the provided fields are updated.
router.patch('/me', requireLevel3, usersController.updateProfile);

// PATCH /me/password — change password for email+password users (Level 3 required)
// Google-only users receive 400 if they call this endpoint.
router.patch('/me/password', requireLevel3, usersController.changePassword);

// DELETE /me — permanently delete the authenticated user's account
// Cascades: upvotes and favorites are deleted; posts become anonymous (userId = null)
router.delete('/me', requireLevel3, usersController.deleteAccount);

export default router;
