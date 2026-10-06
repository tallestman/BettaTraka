import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../db/index.js';

export const healthRouter = Router();

healthRouter.get('/health', async (req: Request, res: Response): Promise<void> => {
  const dbStatus = await checkDatabaseConnection();

  const payload = {
    status: dbStatus.connected ? 'healthy' : 'degraded',
    version: '1.0.0-pilot',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: dbStatus.connected,
      message: dbStatus.message,
    },
    timestamp: new Date().toISOString(),
  };

  if (!dbStatus.connected) {
    res.status(503).json(payload);
    return;
  }

  res.json(payload);
});
