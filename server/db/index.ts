import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export function parseDatabaseSsl(
  val?: string
): boolean | { rejectUnauthorized: boolean } | undefined {
  if (!val || val.trim().length === 0) return undefined;
  const normalized = val.trim().toLowerCase();
  if (['false', '0', 'no', 'disable', 'off'].includes(normalized)) {
    return false;
  }
  if (['strict', 'verify-full', 'verify-ca'].includes(normalized)) {
    return { rejectUnauthorized: true };
  }
  if (['true', '1', 'yes', 'require', 'prefer', 'allow'].includes(normalized)) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

const connectionString = process.env.DATABASE_URL;
const sslOption = parseDatabaseSsl(process.env.DATABASE_SSL);

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: sslOption,
      }
    : {
        host: process.env.PGHOST || '127.0.0.1',
        port: parseInt(process.env.PGPORT || '5432', 10),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'bettatraka',
        ssl: sslOption,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect();
}

export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

let connectionCache: { connected: boolean; checkedAt: number } = {
  connected: false,
  checkedAt: 0,
};

export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  const now = Date.now();
  if (now - connectionCache.checkedAt < 5000 && connectionCache.checkedAt > 0) {
    return {
      connected: connectionCache.connected,
      message: connectionCache.connected
        ? 'Connected to PostgreSQL database'
        : 'PostgreSQL database unreachable',
    };
  }

  try {
    const res = await pool.query('SELECT 1 AS alive');
    if (res.rows[0]?.alive === 1) {
      connectionCache = { connected: true, checkedAt: now };
      return { connected: true, message: 'Connected to PostgreSQL database' };
    }
    throw new Error('Unexpected ping response');
  } catch (err: any) {
    connectionCache = { connected: false, checkedAt: now };
    return {
      connected: false,
      message: `PostgreSQL connection failed: ${err.message || 'Cannot reach database'}. Ensure DATABASE_URL is configured and PostgreSQL is active.`,
    };
  }
}
