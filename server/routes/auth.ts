import { Router, Request, Response } from 'express';
import { pool, withTransaction, checkDatabaseConnection } from '../db/index.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../auth/passwords.js';
import { signAccessToken, hashToken } from '../auth/jwt.js';
import { authenticate } from '../auth/middleware.js';
import { authService } from '../auth/authService.js';

export const authRouter = Router();

// In-memory rate limiting map for basic abuse prevention
const authAttempts = new Map<string, { count: number; resetAt: number }>();

function rateLimitAuth(req: Request, res: Response, next: () => void): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = authAttempts.get(ip) || { count: 0, resetAt: now + 60000 };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + 60000;
  }

  record.count += 1;
  authAttempts.set(ip, record);

  if (record.count > 25) {
    res.status(429).json({ error: 'Too many authentication attempts. Please wait a minute before retrying.' });
    return;
  }
  next();
}

// 1. POST /api/auth/register
authRouter.post('/register', rateLimitAuth, async (req: Request, res: Response): Promise<void> => {
  const { email, password, fullName, phone, organizationName } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    res.status(400).json({ error: 'Full name must be at least 2 characters.' });
    return;
  }

  const pwCheck = validatePasswordStrength(password);
  if (!pwCheck.valid) {
    res.status(400).json({ error: pwCheck.reason });
    return;
  }

  const dbStatus = await checkDatabaseConnection();
  if (!dbStatus.connected) {
    res.status(503).json({
      error: 'Database unavailable. Please verify PostgreSQL connection configuration (DATABASE_URL) on your VPS.',
      details: dbStatus.message,
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const orgName = (organizationName && typeof organizationName === 'string' && organizationName.trim()) 
    ? organizationName.trim() 
    : `${fullName.trim()}'s Business`;

  try {
    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const result = await withTransaction(async (client) => {
      // 1. Create User
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, full_name, phone, status)
         VALUES ($1, $2, $3, $4, 'ACTIVE')
         RETURNING id, email, full_name, phone, status, created_at`,
        [normalizedEmail, passwordHash, fullName.trim(), phone || null]
      );
      const user = userRes.rows[0];

      // 2. Create Organization
      const orgRes = await client.query(
        `INSERT INTO organizations (name, slug, currency, timezone, status, created_by_user_id)
         VALUES ($1, $2, 'NGN', 'Africa/Lagos', 'ACTIVE', $3)
         RETURNING id, name, slug, currency, timezone, status`,
        [orgName, slug, user.id]
      );
      const org = orgRes.rows[0];

      // 3. Create Owner Membership
      const memberRes = await client.query(
        `INSERT INTO organization_memberships (organization_id, user_id, role, status)
         VALUES ($1, $2, 'Owner', 'ACTIVE')
         RETURNING id, role, status`,
        [org.id, user.id]
      );
      const membership = memberRes.rows[0];

      // 4. Audit Log
      await client.query(
        `INSERT INTO audit_events (organization_id, user_id, action, resource_type, resource_id, metadata, ip_address)
         VALUES ($1, $2, 'ORG_CREATED', 'ORGANIZATION', $3, $4, $5)`,
        [org.id, user.id, org.id, JSON.stringify({ orgName, creatorEmail: user.email }), req.ip || null]
      );

      return { user, org, membership };
    });

    const token = signAccessToken({
      userId: result.user.id,
      email: result.user.email,
      organizationId: result.org.id,
      role: 'Owner',
    });

    // Record session
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO sessions (user_id, organization_id, token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [result.user.id, result.org.id, tokenHash, expiresAt, req.ip || null, req.headers['user-agent'] || null]
    );

    res.cookie('bettatraka_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Account and organization created successfully.',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.full_name,
        phone: result.user.phone,
      },
      organization: result.org,
      role: 'Owner',
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// 2. POST /api/auth/login
authRouter.post('/login', rateLimitAuth, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const dbStatus = await checkDatabaseConnection();
  if (!dbStatus.connected) {
    res.status(503).json({
      error: 'Database connection failed. Please verify PostgreSQL configuration on your VPS.',
      details: dbStatus.message,
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const userRes = await pool.query(
      `SELECT id, email, password_hash, full_name, phone, status 
       FROM users 
       WHERE LOWER(email) = $1`,
      [normalizedEmail]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const user = userRes.rows[0];

    if (user.status !== 'ACTIVE') {
      res.status(403).json({ error: 'Account is suspended or deactivated. Contact your administrator.' });
      return;
    }

    const passwordValid = await comparePassword(password, user.password_hash);
    if (!passwordValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Retrieve active memberships & organizations
    const orgsRes = await pool.query(
      `SELECT o.id, o.name, o.slug, o.currency, o.timezone, m.role, m.status AS membership_status
       FROM organization_memberships m
       JOIN organizations o ON o.id = m.organization_id
       WHERE m.user_id = $1 AND m.status = 'ACTIVE' AND o.status = 'ACTIVE'
       ORDER BY (m.role = 'Owner') DESC, m.created_at ASC`,
      [user.id]
    );

    const organizations = orgsRes.rows;
    const activeOrg = organizations[0] || null;

    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      organizationId: activeOrg?.id,
      role: activeOrg?.role,
    });

    // Record session
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO sessions (user_id, organization_id, token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, activeOrg?.id || null, tokenHash, expiresAt, req.ip || null, req.headers['user-agent'] || null]
    );

    res.cookie('bettatraka_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
      },
      organizations,
      activeOrganization: activeOrg,
      role: activeOrg?.role || null,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// 3. POST /api/auth/logout
authRouter.post('/logout', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.rawToken) {
      const tokenHash = hashToken(req.rawToken);
      await pool.query(
        'UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1',
        [tokenHash]
      );
    }
  } catch (err) {
    console.warn('Session revocation notice:', err);
  }

  res.clearCookie('bettatraka_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. GET /api/auth/me
authRouter.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const orgsRes = await pool.query(
      `SELECT o.id, o.name, o.slug, o.currency, o.timezone, m.role, m.status AS membership_status
       FROM organization_memberships m
       JOIN organizations o ON o.id = m.organization_id
       WHERE m.user_id = $1 AND m.status = 'ACTIVE' AND o.status = 'ACTIVE'
       ORDER BY (m.role = 'Owner') DESC, m.created_at ASC`,
      [req.user!.id]
    );

    res.json({
      user: req.user,
      activeMembership: req.membership || null,
      organizations: orgsRes.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// 5. POST /api/auth/switch-org
authRouter.post('/switch-org', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { organizationId } = req.body;
  if (!organizationId) {
    res.status(400).json({ error: 'organizationId is required.' });
    return;
  }

  try {
    const checkRes = await pool.query(
      `SELECT m.organization_id, o.name, m.role, m.status
       FROM organization_memberships m
       JOIN organizations o ON o.id = m.organization_id
       WHERE m.user_id = $1 AND m.organization_id = $2 AND m.status = 'ACTIVE' AND o.status = 'ACTIVE'`,
      [req.user!.id, organizationId]
    );

    if (checkRes.rows.length === 0) {
      res.status(403).json({ error: 'You are not an active member of this organization.' });
      return;
    }

    const target = checkRes.rows[0];
    const newToken = signAccessToken({
      userId: req.user!.id,
      email: req.user!.email,
      organizationId: target.organization_id,
      role: target.role,
    });

    res.cookie('bettatraka_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token: newToken,
      activeOrganization: {
        organizationId: target.organization_id,
        organizationName: target.name,
        role: target.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to switch organization.' });
  }
});

// 7. POST /api/auth/forgot-password - Request password reset & dispatch verification token
authRouter.post('/forgot-password', rateLimitAuth, async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  const result = await authService.requestPasswordReset(
    email,
    req.ip || req.socket.remoteAddress,
    req.headers['user-agent']
  );

  if (!result.success) {
    if (result.error === 'DB_UNAVAILABLE') {
      res.status(503).json({
        error: 'Database connection unavailable. Please verify PostgreSQL configuration.',
        details: result.message,
      });
      return;
    }
    res.status(400).json({ error: result.message });
    return;
  }

  res.json({
    success: true,
    message: result.message,
    resetToken: result.resetToken, // Provided in development/preview testing
  });
});

// 8. GET /api/auth/verify-reset-token & POST /api/auth/verify-reset-token - Check token validity
authRouter.get('/verify-reset-token', async (req: Request, res: Response): Promise<void> => {
  const token = typeof req.query.token === 'string' ? req.query.token : '';

  if (!token) {
    res.status(400).json({ valid: false, error: 'Verification token is required.' });
    return;
  }

  const result = await authService.verifyResetToken(token);
  if (!result.valid) {
    res.status(400).json({ valid: false, error: result.error || 'Token is invalid or expired.' });
    return;
  }

  res.json({ valid: true, email: result.email });
});

authRouter.post('/verify-reset-token', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ valid: false, error: 'Verification token is required.' });
    return;
  }

  const result = await authService.verifyResetToken(token);
  if (!result.valid) {
    res.status(400).json({ valid: false, error: result.error || 'Token is invalid or expired.' });
    return;
  }

  res.json({ valid: true, email: result.email });
});

// 9. POST /api/auth/reset-password - Verify token and update password
authRouter.post('/reset-password', rateLimitAuth, async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Reset verification token is required.' });
    return;
  }

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'New password is required.' });
    return;
  }

  const pwCheck = validatePasswordStrength(password);
  if (!pwCheck.valid) {
    res.status(400).json({ error: pwCheck.reason });
    return;
  }

  const result = await authService.resetPassword(
    token,
    password,
    req.ip || req.socket.remoteAddress
  );

  if (!result.success) {
    if (result.error === 'DB_UNAVAILABLE') {
      res.status(503).json({ error: 'Database unavailable.', details: result.message });
      return;
    }
    res.status(400).json({ error: result.message });
    return;
  }

  res.json({
    success: true,
    message: result.message,
  });
});

