import { Router } from 'express';
import { triggerSync } from '../controllers/admin.controller';
import { requireAdminKey } from '../middleware/adminAuth.middleware';

const router = Router();

// POST /api/admin/sync — manually trigger the fixture sync
// Protected by API key — set ADMIN_API_KEY in environment variables.
// Callers must include the header: x-admin-api-key: <your-key>
router.post('/sync', requireAdminKey, triggerSync);

export default router;
