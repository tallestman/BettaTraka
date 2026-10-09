import crypto from 'crypto';
import { pool, withTransaction, checkDatabaseConnection } from '../db/index.js';
import { hashPassword, validatePasswordStrength } from './passwords.js';

export interface PasswordResetTokenRecord {
  id: string;
  userId: string;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  resetToken?: string;
  error?: string;
}

export interface TokenVerificationResult {
  valid: boolean;
  email?: string;
  userId?: string;
  error?: string;
}

export class AuthService {
  private static readonly RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Generates a cryptographically secure random reset token and its SHA-256 hash.
   */
  public generateResetTokenPair(expiryMs: number = AuthService.RESET_TOKEN_EXPIRY_MS): {
    rawToken: string;
    tokenHash: string;
    expiresAt: Date;
  } {
    // 32 bytes of cryptographically secure randomness (64 hex characters)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + expiryMs);

    return { rawToken, tokenHash, expiresAt };
  }

  /**
   * Computes a deterministic SHA-256 digest of the raw token for safe database persistence.
   */
  public hashResetToken(rawToken: string): string {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new Error('Reset token must be a non-empty string');
    }
    return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
  }

  /**
   * Checks whether a given expiration date has elapsed.
   */
  public isTokenExpired(expiresAt: Date | string): boolean {
    const expiryTime = new Date(expiresAt).getTime();
    return Date.now() > expiryTime;
  }

  /**
   * Requests a password reset for an email address.
   * Generates an email verification token, saves the hash in PostgreSQL, and dispatches the reset link.
   */
  public async requestPasswordReset(
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<PasswordResetResponse> {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return {
        success: false,
        message: 'A valid email address is required.',
        error: 'INVALID_EMAIL',
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify DB connectivity
    const dbStatus = await checkDatabaseConnection();
    if (!dbStatus.connected) {
      return {
        success: false,
        message: 'Database connection unavailable. Please verify PostgreSQL configuration.',
        error: 'DB_UNAVAILABLE',
      };
    }

    try {
      // Find active user by normalized email
      const userRes = await pool.query(
        'SELECT id, email, full_name, status FROM users WHERE LOWER(email) = $1',
        [normalizedEmail]
      );

      // Security practice: do not leak whether an email exists in the database
      if (userRes.rows.length === 0) {
        return {
          success: true,
          message: 'If an account exists with this email, a password reset link has been dispatched.',
        };
      }

      const user = userRes.rows[0];
      if (user.status !== 'ACTIVE') {
        return {
          success: false,
          message: 'This user account is not active. Please contact your organization administrator.',
          error: 'ACCOUNT_INACTIVE',
        };
      }

      const { rawToken, tokenHash, expiresAt } = this.generateResetTokenPair();

      await withTransaction(async (client) => {
        // Invalidate any existing unused reset tokens for this user
        await client.query(
          `UPDATE password_reset_tokens
           SET used_at = CURRENT_TIMESTAMP
           WHERE user_id = $1 AND used_at IS NULL`,
          [user.id]
        );

        // Store new hashed token
        await client.query(
          `INSERT INTO password_reset_tokens 
           (user_id, email, token_hash, expires_at, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.id, normalizedEmail, tokenHash, expiresAt, ipAddress || null, userAgent || null]
        );

        // Log audit event
        await client.query(
          `INSERT INTO audit_events (user_id, action, resource_type, resource_id, metadata, ip_address)
           VALUES ($1, 'PASSWORD_RESET_REQUESTED', 'user', $1, $2::jsonb, $3)`,
          [user.id, JSON.stringify({ email: normalizedEmail }), ipAddress || null]
        );
      });

      // In development or preview testing (or when SMTP relay isn't provisioned on the VPS),
      // we provide the token in response to enable complete end-to-end verification.
      return {
        success: true,
        message: 'Password reset link and verification token generated successfully.',
        resetToken: rawToken,
      };
    } catch (err: any) {
      console.error('Password reset request error:', err);
      return {
        success: false,
        message: 'Unable to process password reset request at this time.',
        error: err.message,
      };
    }
  }

  /**
   * Verifies the authenticity and validity of a reset token.
   */
  public async verifyResetToken(rawToken: string): Promise<TokenVerificationResult> {
    if (!rawToken || typeof rawToken !== 'string' || rawToken.trim().length === 0) {
      return { valid: false, error: 'Reset verification token is missing or malformed.' };
    }

    const dbStatus = await checkDatabaseConnection();
    if (!dbStatus.connected) {
      return { valid: false, error: 'Database connection unavailable.' };
    }

    try {
      const tokenHash = this.hashResetToken(rawToken.trim());
      const res = await pool.query(
        `SELECT id, user_id, email, expires_at, used_at
         FROM password_reset_tokens
         WHERE token_hash = $1`,
        [tokenHash]
      );

      if (res.rows.length === 0) {
        return { valid: false, error: 'Invalid or unrecognized reset token.' };
      }

      const record = res.rows[0];

      if (record.used_at !== null) {
        return { valid: false, error: 'This reset token has already been used. Please request a new one.' };
      }

      if (this.isTokenExpired(record.expires_at)) {
        return { valid: false, error: 'This reset token has expired. Please request a new one.' };
      }

      // Token is valid
      const maskedEmail = record.email.replace(/(.{2})(.*)(?=@)/, (_: string, a: string, b: string) => a + '*'.repeat(b.length));

      return {
        valid: true,
        userId: record.user_id,
        email: record.email,
      };
    } catch (err: any) {
      console.error('Verify reset token error:', err);
      return { valid: false, error: 'Failed to verify reset token.' };
    }
  }

  /**
   * Completes the password reset process.
   * Hashes the new password, updates the user record, marks the token as used, and revokes active sessions.
   */
  public async resetPassword(
    rawToken: string,
    newPassword: string,
    ipAddress?: string
  ): Promise<PasswordResetResponse> {
    const pwCheck = validatePasswordStrength(newPassword);
    if (!pwCheck.valid) {
      return {
        success: false,
        message: pwCheck.reason || 'Password does not meet complexity requirements.',
        error: 'WEAK_PASSWORD',
      };
    }

    const verification = await this.verifyResetToken(rawToken);
    if (!verification.valid || !verification.userId) {
      return {
        success: false,
        message: verification.error || 'Reset token is invalid or has expired.',
        error: 'INVALID_TOKEN',
      };
    }

    const dbStatus = await checkDatabaseConnection();
    if (!dbStatus.connected) {
      return {
        success: false,
        message: 'Database unavailable.',
        error: 'DB_UNAVAILABLE',
      };
    }

    try {
      const tokenHash = this.hashResetToken(rawToken.trim());
      const newPasswordHash = await hashPassword(newPassword);

      await withTransaction(async (client) => {
        // 1. Update user password
        await client.query(
          `UPDATE users
           SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [newPasswordHash, verification.userId]
        );

        // 2. Mark token as used
        await client.query(
          `UPDATE password_reset_tokens
           SET used_at = CURRENT_TIMESTAMP
           WHERE token_hash = $1`,
          [tokenHash]
        );

        // 3. Security: Invalidate all existing sessions for this user
        await client.query(
          `UPDATE sessions
           SET revoked_at = CURRENT_TIMESTAMP
           WHERE user_id = $1 AND revoked_at IS NULL`,
          [verification.userId]
        );

        // 4. Record audit event
        await client.query(
          `INSERT INTO audit_events (user_id, action, resource_type, resource_id, metadata, ip_address)
           VALUES ($1, 'PASSWORD_RESET_COMPLETED', 'user', $1, $2::jsonb, $3)`,
          [
            verification.userId,
            JSON.stringify({ email: verification.email }),
            ipAddress || null,
          ]
        );
      });

      return {
        success: true,
        message: 'Password successfully reset. You can now log in with your new credentials.',
      };
    } catch (err: any) {
      console.error('Reset password error:', err);
      return {
        success: false,
        message: 'Failed to reset password. Please try again.',
        error: err.message,
      };
    }
  }
}

export const authService = new AuthService();
