import { Request, Response } from 'express';
import { runFixtureSync } from '../jobs/sync.service';

// Manual sync trigger — for development use only.
// This lets you run the sync job on demand without waiting for midnight.
// IMPORTANT: Each trigger uses ~10 API calls. Free tier is 100/day.
// Do not call this repeatedly — run once, then work from the populated DB.
export const triggerSync = async (req: Request, res: Response) => {
  try {
    console.log('[Admin] Manual sync triggered via API');

    // Run sync in the background so the HTTP request returns immediately
    // The sync takes ~30 seconds — we don't want the request to time out
    runFixtureSync().catch((error) => {
      console.error('[Admin] Background sync failed:', error);
    });

    res.json({
      message: 'Sync started in background. Check server logs for progress.',
      warning: 'Each sync uses ~10 API calls. Free tier limit is 100/day.',
    });
  } catch (error) {
    console.error('Failed to trigger sync:', error);
    res.status(500).json({ error: 'Failed to trigger sync' });
  }
};
