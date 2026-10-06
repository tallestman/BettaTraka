import { Router, Request, Response } from 'express';
import { pool, withTransaction } from '../db/index.js';
import { authenticate, requireOrg, requireRole, preventSelfEscalation } from '../auth/middleware.js';

export const organizationRouter = Router();

organizationRouter.use(authenticate);
organizationRouter.use(requireOrg);

// 1. GET /api/organizations/current
organizationRouter.get('/current', async (req: Request, res: Response): Promise<void> => {
  const orgId = req.membership!.organizationId;

  try {
    const orgRes = await pool.query(
      `SELECT id, name, slug, currency, timezone, status, created_at, updated_at
       FROM organizations WHERE id = $1`,
      [orgId]
    );

    if (orgRes.rows.length === 0) {
      res.status(404).json({ error: 'Organization not found.' });
      return;
    }

    res.json({
      organization: orgRes.rows[0],
      currentRole: req.membership!.role,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve organization.' });
  }
});

// 2. PATCH /api/organizations/current
organizationRouter.patch(
  '/current',
  requireRole(['Owner', 'Admin']),
  async (req: Request, res: Response): Promise<void> => {
    const orgId = req.membership!.organizationId;
    const { name, currency, timezone } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name && typeof name === 'string') {
      updates.push(`name = $${idx++}`);
      values.push(name.trim());
    }
    if (currency && typeof currency === 'string') {
      updates.push(`currency = $${idx++}`);
      values.push(currency.trim().toUpperCase());
    }
    if (timezone && typeof timezone === 'string') {
      updates.push(`timezone = $${idx++}`);
      values.push(timezone.trim());
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No valid fields to update.' });
      return;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(orgId);

    try {
      const result = await pool.query(
        `UPDATE organizations SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      // Audit event
      await pool.query(
        `INSERT INTO audit_events (organization_id, user_id, action, resource_type, resource_id, metadata)
         VALUES ($1, $2, 'ORG_SETTINGS_UPDATED', 'ORGANIZATION', $1, $3)`,
        [orgId, req.user!.id, JSON.stringify({ updates: req.body })]
      );

      res.json({ organization: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update organization.' });
    }
  }
);

// 3. GET /api/organizations/members
organizationRouter.get(
  '/members',
  requireRole(['Owner', 'Admin', 'Manager']),
  async (req: Request, res: Response): Promise<void> => {
    const orgId = req.membership!.organizationId;

    try {
      const membersRes = await pool.query(
        `SELECT m.id AS membership_id, m.user_id, u.email, u.full_name, u.phone, 
                m.role, m.status, m.joined_at, m.invited_at, m.invited_email
         FROM organization_memberships m
         LEFT JOIN users u ON u.id = m.user_id
         WHERE m.organization_id = $1
         ORDER BY (m.role = 'Owner') DESC, m.created_at ASC`,
        [orgId]
      );

      res.json({ members: membersRes.rows });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve members.' });
    }
  }
);

// 4. POST /api/organizations/members/invite
organizationRouter.post(
  '/members/invite',
  requireRole(['Owner', 'Admin']),
  preventSelfEscalation,
  async (req: Request, res: Response): Promise<void> => {
    const orgId = req.membership!.organizationId;
    const { email, role, fullName } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email required for invitation.' });
      return;
    }

    const validRoles = [
      'Admin',
      'Manager',
      'Accountant',
      'Sales Representative',
      'Distributor',
      'Inventory Manager',
      'Media Buyer',
    ];

    if (!validRoles.includes(role)) {
      res.status(400).json({
        error: `Invalid role specified. Allowed roles for invitation: ${validRoles.join(', ')}`,
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const result = await withTransaction(async (client) => {
        // Check if user exists
        let userRes = await client.query('SELECT id, email, full_name FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
        let userId: string;

        if (userRes.rows.length === 0) {
          // Create stub / pending user account
          const stubRes = await client.query(
            `INSERT INTO users (email, password_hash, full_name, status)
             VALUES ($1, 'PENDING_INVITATION', $2, 'PENDING')
             RETURNING id`,
            [normalizedEmail, fullName?.trim() || normalizedEmail.split('@')[0]]
          );
          userId = stubRes.rows[0].id;
        } else {
          userId = userRes.rows[0].id;
        }

        // Check if membership exists
        const existingMember = await client.query(
          'SELECT id, role, status FROM organization_memberships WHERE organization_id = $1 AND user_id = $2',
          [orgId, userId]
        );

        if (existingMember.rows.length > 0) {
          throw new Error('User is already a member of this workspace.');
        }

        // Create membership
        const memberRes = await client.query(
          `INSERT INTO organization_memberships (organization_id, user_id, role, status, invited_email, invited_at)
           VALUES ($1, $2, $3, 'ACTIVE', $4, CURRENT_TIMESTAMP)
           RETURNING id, role, status, joined_at`,
          [orgId, userId, role, normalizedEmail]
        );

        // Audit log
        await client.query(
          `INSERT INTO audit_events (organization_id, user_id, action, resource_type, resource_id, metadata)
           VALUES ($1, $2, 'MEMBER_INVITED', 'MEMBERSHIP', $3, $4)`,
          [orgId, req.user!.id, memberRes.rows[0].id, JSON.stringify({ invitedEmail: normalizedEmail, role })]
        );

        return memberRes.rows[0];
      });

      res.status(201).json({
        message: 'Member invited and added to organization successfully.',
        membership: result,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to invite member.' });
    }
  }
);

// 5. PATCH /api/organizations/members/:memberId
organizationRouter.patch(
  '/members/:memberId',
  requireRole(['Owner', 'Admin']),
  preventSelfEscalation,
  async (req: Request, res: Response): Promise<void> => {
    const orgId = req.membership!.organizationId;
    const { memberId } = req.params;
    const { role, status } = req.body;

    try {
      // Fetch target membership
      const targetRes = await pool.query(
        'SELECT id, user_id, role, status FROM organization_memberships WHERE id = $1 AND organization_id = $2',
        [memberId, orgId]
      );

      if (targetRes.rows.length === 0) {
        res.status(404).json({ error: 'Member not found in this organization.' });
        return;
      }

      const target = targetRes.rows[0];

      // Anti-self-escalation: Cannot alter one's own role
      if (target.user_id === req.user!.id && role && role !== target.role) {
        res.status(403).json({ error: 'Security Violation: You cannot alter your own staff permissions or role.' });
        return;
      }

      // Protect Owner: Only an Owner can alter the Owner membership
      if (target.role === 'Owner' && req.membership!.role !== 'Owner') {
        res.status(403).json({ error: 'Permission denied: Only the Owner can modify Owner membership.' });
        return;
      }

      // Only an Owner can promote another member to Owner
      if (role === 'Owner' && req.membership!.role !== 'Owner') {
        res.status(403).json({ error: 'Security Violation: Only existing workspace Owners can designate or transfer the Owner role.' });
        return;
      }

      const updates: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (role && typeof role === 'string') {
        updates.push(`role = $${idx++}`);
        values.push(role);
      }
      if (status && typeof status === 'string' && ['ACTIVE', 'SUSPENDED'].includes(status)) {
        updates.push(`status = $${idx++}`);
        values.push(status);
      }

      if (updates.length === 0) {
        res.status(400).json({ error: 'No valid fields provided to update.' });
        return;
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(memberId);
      values.push(orgId);

      const updateRes = await pool.query(
        `UPDATE organization_memberships SET ${updates.join(', ')} 
         WHERE id = $${idx++} AND organization_id = $${idx} 
         RETURNING id, role, status, updated_at`,
        values
      );

      res.json({
        message: 'Member updated successfully.',
        membership: updateRes.rows[0],
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update member.' });
    }
  }
);

// 6. DELETE /api/organizations/members/:memberId
organizationRouter.delete(
  '/members/:memberId',
  requireRole(['Owner', 'Admin']),
  async (req: Request, res: Response): Promise<void> => {
    const orgId = req.membership!.organizationId;
    const { memberId } = req.params;

    try {
      const targetRes = await pool.query(
        'SELECT id, role, user_id FROM organization_memberships WHERE id = $1 AND organization_id = $2',
        [memberId, orgId]
      );

      if (targetRes.rows.length === 0) {
        res.status(404).json({ error: 'Member not found.' });
        return;
      }

      const target = targetRes.rows[0];
      if (target.role === 'Owner') {
        res.status(403).json({ error: 'The primary workspace Owner cannot be removed from the organization.' });
        return;
      }

      await pool.query(
        'DELETE FROM organization_memberships WHERE id = $1 AND organization_id = $2',
        [memberId, orgId]
      );

      await pool.query(
        `INSERT INTO audit_events (organization_id, user_id, action, resource_type, resource_id)
         VALUES ($1, $2, 'MEMBER_REMOVED', 'MEMBERSHIP', $3)`,
        [orgId, req.user!.id, memberId]
      );

      res.json({ success: true, message: 'Member removed from workspace.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to remove member.' });
    }
  }
);
