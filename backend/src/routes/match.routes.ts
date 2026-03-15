import express from 'express';
import * as matchController from '../controllers/match.controller';

const router = express.Router();

// GET /api/matches/search?city=london&from=2026-04-01&to=2026-04-30
router.get('/search', matchController.searchMatches);

// GET /api/matches/:id
router.get('/:id', matchController.getMatchById);

export default router;
