import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashPassword, comparePassword, validatePasswordStrength } from '../server/auth/passwords.js';
import { signAccessToken, verifyAccessToken, hashToken } from '../server/auth/jwt.js';
import { requireRole, preventSelfEscalation } from '../server/auth/middleware.js';
import { parseDatabaseSsl } from '../server/db/index.js';
import { authService, AuthService } from '../server/auth/authService.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_suite_ephemeral_jwt_secret_32_bytes_min_length_for_ci';

describe('Auth Security Unit Tests', () => {
  describe('Password Hashing & Strength', () => {
    it('should hash passwords using bcrypt (never plaintext)', async () => {
      const rawPassword = 'SecurePassword2026!';
      const hash = await hashPassword(rawPassword);

      assert.notStrictEqual(hash, rawPassword, 'Hash must not equal plaintext');
      assert.ok(hash.startsWith('$2'), 'Hash must follow bcrypt prefix format ($2a$ or $2b$)');

      const isMatch = await comparePassword(rawPassword, hash);
      assert.strictEqual(isMatch, true, 'Correct password must match hash');

      const isWrongMatch = await comparePassword('WrongPassword!', hash);
      assert.strictEqual(isWrongMatch, false, 'Incorrect password must be rejected');
    });

    it('should reject weak or short passwords', () => {
      const weak = validatePasswordStrength('short');
      assert.strictEqual(weak.valid, false);
      assert.ok(weak.reason?.includes('at least 8 characters'));

      const empty = validatePasswordStrength('');
      assert.strictEqual(empty.valid, false);

      const strong = validatePasswordStrength('ComplexPassword99#');
      assert.strictEqual(strong.valid, true);
    });
  });

  describe('JWT Session Tokens & Hashes', () => {
    it('should issue and verify cryptographically signed session tokens', () => {
      const payload = {
        userId: 'usr-test-123',
        email: 'merchant@bettatraka.com',
        organizationId: 'org-test-456',
        role: 'Owner',
      };

      const token = signAccessToken(payload);
      assert.ok(typeof token === 'string' && token.length > 50, 'Token must be a valid JWT string');

      const decoded = verifyAccessToken(token);
      assert.strictEqual(decoded.userId, payload.userId);
      assert.strictEqual(decoded.email, payload.email);
      assert.strictEqual(decoded.organizationId, payload.organizationId);
      assert.strictEqual(decoded.role, payload.role);
    });

    it('should reject tampered tokens', () => {
      const token = signAccessToken({
        userId: 'usr-test-123',
        email: 'merchant@bettatraka.com',
      });

      const tampered = token.slice(0, -6) + 'abcdef';
      assert.throws(() => {
        verifyAccessToken(tampered);
      }, /Invalid session token|invalid signature/);
    });

    it('should generate deterministic sha256 token hashes for session revocation', () => {
      const sample = 'sample-token-abc-123';
      const hash1 = hashToken(sample);
      const hash2 = hashToken(sample);

      assert.strictEqual(hash1, hash2, 'Hash must be deterministic');
      assert.strictEqual(hash1.length, 64, 'SHA-256 hex hash must be 64 characters long');
    });

    it('should strictly refuse to sign or verify tokens when JWT_SECRET is unset (no hardcoded fallback)', () => {
      const savedSecret = process.env.JWT_SECRET;
      try {
        delete process.env.JWT_SECRET;

        assert.throws(() => {
          signAccessToken({ userId: 'u-1', email: 'merchant@bettatraka.com' });
        }, /Missing JWT_SECRET environment variable/);

        assert.throws(() => {
          verifyAccessToken('some.arbitrary.jwt');
        }, /Missing JWT_SECRET environment variable/);
      } finally {
        process.env.JWT_SECRET = savedSecret;
      }
    });
  });

  describe('Database SSL Environment Parsing', () => {
    it('parseDatabaseSsl parses disabled modes correctly', () => {
      assert.strictEqual(parseDatabaseSsl('false'), false);
      assert.strictEqual(parseDatabaseSsl('FALSE'), false);
      assert.strictEqual(parseDatabaseSsl('0'), false);
      assert.strictEqual(parseDatabaseSsl('no'), false);
      assert.strictEqual(parseDatabaseSsl('disable'), false);
      assert.strictEqual(parseDatabaseSsl('off'), false);
    });

    it('parseDatabaseSsl parses permissive TLS modes ({ rejectUnauthorized: false })', () => {
      const permissive = { rejectUnauthorized: false };
      assert.deepStrictEqual(parseDatabaseSsl('true'), permissive);
      assert.deepStrictEqual(parseDatabaseSsl('1'), permissive);
      assert.deepStrictEqual(parseDatabaseSsl('yes'), permissive);
      assert.deepStrictEqual(parseDatabaseSsl('require'), permissive);
      assert.deepStrictEqual(parseDatabaseSsl('prefer'), permissive);
    });

    it('parseDatabaseSsl parses strict TLS verification modes ({ rejectUnauthorized: true })', () => {
      const strict = { rejectUnauthorized: true };
      assert.deepStrictEqual(parseDatabaseSsl('strict'), strict);
      assert.deepStrictEqual(parseDatabaseSsl('verify-full'), strict);
      assert.deepStrictEqual(parseDatabaseSsl('verify-ca'), strict);
    });

    it('parseDatabaseSsl returns undefined for empty or unset values', () => {
      assert.strictEqual(parseDatabaseSsl(undefined), undefined);
      assert.strictEqual(parseDatabaseSsl(''), undefined);
      assert.strictEqual(parseDatabaseSsl('   '), undefined);
    });
  });

  describe('Server-Side RBAC & Anti-Escalation Middleware', () => {
    it('requireRole grants access to authorized roles and rejects unauthorized roles', () => {
      const guard = requireRole(['Owner', 'Admin']);

      let nextCalled = false;
      const mockReqSuccess: any = {
        membership: { role: 'Admin', organizationId: 'org-1' },
      };
      const mockRes: any = {
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(payload: any) {
          this.body = payload;
          return this;
        },
      };

      guard(mockReqSuccess, mockRes, () => {
        nextCalled = true;
      });
      assert.strictEqual(nextCalled, true, 'Admin should pass Owner/Admin guard');

      // Unauthorized role (Sales Rep trying to access Admin endpoint)
      let rejectedNextCalled = false;
      const mockReqFail: any = {
        membership: { role: 'Sales Representative', organizationId: 'org-1' },
      };
      guard(mockReqFail, mockRes, () => {
        rejectedNextCalled = true;
      });
      assert.strictEqual(rejectedNextCalled, false, 'Sales Representative must not pass Admin guard');
      assert.strictEqual(mockRes.statusCode, 403);
      assert.ok(mockRes.body.error?.includes('Forbidden'));
    });

    it('preventSelfEscalation blocks non-Owners from designating the Owner role', () => {
      const mockRes: any = {
        statusCode: 0,
        body: null,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(payload: any) {
          this.body = payload;
          return this;
        },
      };

      let nextCalled = false;
      const mockReqAdminEscalate: any = {
        user: { id: 'usr-admin' },
        membership: { role: 'Admin' },
        body: { role: 'Owner' },
      };

      preventSelfEscalation(mockReqAdminEscalate, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, 'Admin must not be allowed to assign Owner role');
      assert.strictEqual(mockRes.statusCode, 403);
      assert.ok(mockRes.body.error?.includes('Security Violation'));
    });

    it('preventSelfEscalation blocks staff members from altering their own role', () => {
      const mockRes: any = {
        statusCode: 0,
        body: null,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(payload: any) {
          this.body = payload;
          return this;
        },
      };

      let nextCalled = false;
      const mockReqSelfEdit: any = {
        user: { id: 'usr-manager' },
        membership: { role: 'Manager' },
        params: { memberId: 'usr-manager' },
        body: { role: 'Admin' },
      };

      preventSelfEscalation(mockReqSelfEdit, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, 'Staff member must not alter their own role');
      assert.strictEqual(mockRes.statusCode, 403);
      assert.ok(mockRes.body.error?.includes('Security Violation'));
    });
  });

  describe('AuthService & Password Reset Token Logic', () => {
    it('generates cryptographically secure 64-character hex tokens and valid SHA-256 hashes', () => {
      const pair = authService.generateResetTokenPair();

      assert.ok(pair.rawToken, 'Must generate rawToken');
      assert.strictEqual(pair.rawToken.length, 64, 'Raw token must be 64 hex chars (32 bytes)');
      assert.ok(pair.tokenHash, 'Must generate tokenHash');
      assert.strictEqual(pair.tokenHash.length, 64, 'SHA-256 hash must be 64 hex chars');
      assert.ok(pair.expiresAt instanceof Date, 'Must set an expiration date');
      assert.ok(pair.expiresAt.getTime() > Date.now(), 'Expiration must be in the future');

      // Verify deterministic hashing
      const manualHash = authService.hashResetToken(pair.rawToken);
      assert.strictEqual(manualHash, pair.tokenHash, 'Token hash must match sha256 of raw token');
    });

    it('rejects invalid or empty tokens when hashing', () => {
      assert.throws(() => {
        authService.hashResetToken('');
      }, /Reset token must be a non-empty string/);

      assert.throws(() => {
        authService.hashResetToken(null as any);
      }, /Reset token must be a non-empty string/);
    });

    it('correctly assesses expiration timestamps with isTokenExpired', () => {
      const past = new Date(Date.now() - 5000);
      assert.strictEqual(authService.isTokenExpired(past), true, 'Past date must be expired');

      const future = new Date(Date.now() + 60000);
      assert.strictEqual(authService.isTokenExpired(future), false, 'Future date must not be expired');
    });

    it('rejects password resets with short or weak passwords', async () => {
      const res = await authService.resetPassword('some-token-value', 'short');
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, 'WEAK_PASSWORD');
      assert.ok(res.message.includes('at least 8 characters'));
    });

    it('rejects password reset requests with invalid email syntax', async () => {
      const res = await authService.requestPasswordReset('invalid-email-string');
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, 'INVALID_EMAIL');
    });
  });
});

