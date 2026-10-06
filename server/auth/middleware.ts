import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, hashToken } from './jwt.js';
import { pool, checkDatabaseConnection } from '../db/index.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  status: string;
}

export interface ActiveMembership {
  organizationId: string;
  organizationName: string;
  role: string;
  status: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      membership?: ActiveMembership;
      rawToken?: string;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.bettatraka_token;

  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No session token provided.' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.rawToken = token;

    const dbCheck = await checkDatabaseConnection();
    if (!dbCheck.connected) {
      res.status(503).json({
        error: 'Database connection unavailable. Please verify PostgreSQL configuration (DATABASE_URL) on your VPS.',
        details: dbCheck.message,
      });
      return;
    }

    // Check session revocation in database
    const tokenHash = hashToken(token);
    const sessionRes = await pool.query(
      'SELECT revoked_at, expires_at FROM sessions WHERE token_hash = $1',
      [tokenHash]
    );
    if (sessionRes.rows.length > 0) {
      const session = sessionRes.rows[0];
      if (session.revoked_at || new Date(session.expires_at) < new Date()) {
        res.status(401).json({ error: 'Session has expired or was revoked. Please log in again.' });
        return;
      }
    }

    // Load User record from database
    const userRes = await pool.query(
      'SELECT id, email, full_name, status FROM users WHERE id = $1',
      [payload.userId]
    );
    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }
    const userRow = userRes.rows[0];
    if (userRow.status !== 'ACTIVE') {
      res.status(403).json({ error: 'User account is suspended or inactive.' });
      return;
    }

    req.user = {
      id: userRow.id,
      email: userRow.email,
      fullName: userRow.full_name,
      status: userRow.status,
    };

    // Load active organization membership
    const targetOrgId = payload.organizationId;
    let memberQuery = `
      SELECT m.organization_id, o.name AS organization_name, m.role, m.status 
      FROM organization_memberships m
      JOIN organizations o ON o.id = m.organization_id
      WHERE m.user_id = $1 AND m.status = 'ACTIVE' AND o.status = 'ACTIVE'
    `;
    const memberParams: any[] = [userRow.id];

    if (targetOrgId) {
      memberQuery += ' AND m.organization_id = $2';
      memberParams.push(targetOrgId);
    } else {
      memberQuery += ' ORDER BY (m.role = \'Owner\') DESC, m.created_at ASC LIMIT 1';
    }

    const memberRes = await pool.query(memberQuery, memberParams);
    if (memberRes.rows.length > 0) {
      const m = memberRes.rows[0];
      req.membership = {
        organizationId: m.organization_id,
        organizationName: m.organization_name,
        role: m.role,
        status: m.status,
      };
    }

    next();
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid or expired session token.' });
  }
}

export function requireOrg(req: Request, res: Response, next: NextFunction): void {
  if (!req.membership?.organizationId) {
    res.status(403).json({
      error: 'Organization access required. Please select an active workspace or join an organization.',
    });
    return;
  }
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.membership) {
      res.status(403).json({ error: 'Active organization membership required.' });
      return;
    }
    if (!allowedRoles.includes(req.membership.role)) {
      res.status(403).json({
        error: `Forbidden: role '${req.membership.role}' lacks permission for this operation. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }
    next();
  };
}

export function preventSelfEscalation(req: Request, res: Response, next: NextFunction): void {
  const currentRole = req.membership?.role;
  const targetRole = req.body?.role;
  const targetMemberId = req.params?.memberId;

  // Rule: Cannot assign Owner role unless the requester is already an Owner
  if (targetRole === 'Owner' && currentRole !== 'Owner') {
    res.status(403).json({
      error: 'Security Violation: Only existing workspace Owners can designate or transfer the Owner role.',
    });
    return;
  }

  // Rule: A member cannot alter their own role
  if (targetMemberId && targetMemberId === req.user?.id && targetRole && targetRole !== currentRole) {
    res.status(403).json({
      error: 'Security Violation: You cannot alter your own staff permissions.',
    });
    return;
  }

  next();
}
