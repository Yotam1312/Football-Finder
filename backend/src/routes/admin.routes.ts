import { Router } from 'express';
import { triggerSync } from '../controllers/admin.controller';

const router = Router();

// POST /api/admin/sync — manually trigger the fixture sync
// Development tool only — remove or lock down before public launch
router.post('/sync', triggerSync);

export default router;
