import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'Missing JWT_SECRET environment variable. Generate a cryptographically secure 256-bit secret using: openssl rand -base64 32'
    );
  }
  return secret.trim();
}

const TOKEN_EXPIRY = '7d';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  organizationId?: string;
  role?: string;
}

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: TOKEN_EXPIRY,
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const secret = getJwtSecret();
  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] }) as AuthTokenPayload;
  } catch (err: any) {
    throw new Error(err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid session token');
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

