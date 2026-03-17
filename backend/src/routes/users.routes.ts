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

export default router;
