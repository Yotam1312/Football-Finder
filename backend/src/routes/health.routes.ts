import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';

const router = Router();

// GET /api/health — confirms the server is running and can reach the database
router.get('/health', healthCheck);

export default router;
