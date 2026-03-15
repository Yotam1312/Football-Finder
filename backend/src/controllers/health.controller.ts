import { Request, Response } from 'express';
import prisma from '../config/database';

// Health check endpoint — used to confirm:
// 1. The server is running
// 2. The database connection is alive
export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Run a trivial query to confirm database connectivity
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check failed:', error);

    // Still return 503 but flag the database as unreachable
    // This way the server is always reachable for monitoring
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: 'unreachable',
    });
  }
};
