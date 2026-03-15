import express from 'express';
import * as fanbaseController from '../controllers/fanbase.controller';

const router = express.Router();

// IMPORTANT: /teams/search must be registered before /team/:teamId
// because Express matches routes in order. "teams" and "team" have
// different prefixes, so ordering prevents "search" being treated as a teamId.
router.get('/countries', fanbaseController.getCountries);
router.get('/countries/:country/leagues', fanbaseController.getLeaguesByCountry);
router.get('/leagues/:leagueId/teams', fanbaseController.getTeamsByLeague);
router.get('/teams/search', fanbaseController.searchTeams);
router.get('/team/:teamId', fanbaseController.getTeamById);
router.get('/team/:teamId/posts', fanbaseController.getTeamPosts);

export default router;
