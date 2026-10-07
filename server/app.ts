import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { organizationRouter } from './routes/organizations.js';
import { sharedOrdersRouter } from './routes/orders.js';

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Mount API Routers
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/organizations', organizationRouter);
app.use('/api', sharedOrdersRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error occurred.',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});
