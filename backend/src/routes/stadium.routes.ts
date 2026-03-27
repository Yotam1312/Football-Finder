import express from 'express';
import * as stadiumController from '../controllers/stadium.controller';

const router = express.Router();

// Root GET — handles ?leagueId=X for the browse grid
router.get('/', stadiumController.getStadiumsByLeague);
// Specific route BEFORE parameterized route — prevents Express matching "search" as :id
router.get('/search', stadiumController.searchStadiums);
router.get('/:id', stadiumController.getStadiumById);

export default router;
