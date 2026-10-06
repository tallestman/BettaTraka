import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { app } from './server/app.js';
import { checkDatabaseConnection } from './server/db/index.js';
import { runMigrations } from './server/db/migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  console.log(`Starting BettaTraka full-stack server (NODE_ENV=${process.env.NODE_ENV || 'development'})...`);

  // Verify PostgreSQL connection and optionally run pending migrations
  try {
    const dbStatus = await checkDatabaseConnection();
    if (dbStatus.connected) {
      console.log('✓ PostgreSQL connected. Running database migrations...');
      const { applied, skipped } = await runMigrations();
      console.log(`✓ Migrations up to date (applied: ${applied.length}, existing: ${skipped.length}).`);
    } else {
      console.warn(`! NOTICE: ${dbStatus.message}`);
      console.warn('! The server will start in setup mode. Configure DATABASE_URL in .env to enable database persistence.');
    }
  } catch (err: any) {
    console.warn(`! Migration check warning: ${err.message}`);
  }

  if (!isProduction) {
    // Mount Vite middleware in development mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('✓ Vite dev middleware attached.');
  } else {
    // Serve static frontend build in production mode
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`✓ Production static files served from: ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 BettaTraka Server running on http://0.0.0.0:${PORT}`);
    console.log(`   Health Check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting BettaTraka server:', err);
  process.exit(1);
});
