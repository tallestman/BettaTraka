import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../server/app.js';
import { checkDatabaseConnection, pool } from '../server/db/index.js';

describe('API & Tenancy Integration Suite', () => {
  it('GET /api/health should respond with service status', async () => {
    const res = await request(app).get('/api/health');
    assert.ok([200, 503].includes(res.status), `Health status must be 200 or 503, got ${res.status}`);
    assert.ok(res.body.status, 'Response must include status field');
    assert.ok(typeof res.body.database === 'object', 'Response must include database check object');
  });

  it('POST /api/auth/register rejects missing or invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'ValidPassword123!', fullName: 'Test User' });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error?.includes('valid email'));
  });

  it('POST /api/auth/register rejects short passwords under 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123', fullName: 'Test User' });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error?.includes('at least 8 characters'));
  });

  it('POST /api/auth/login rejects empty credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error?.includes('required'));
  });

  it('Protected API routes reject unauthenticated requests with 401', async () => {
    const meRes = await request(app).get('/api/auth/me');
    assert.strictEqual(meRes.status, 401);
    assert.ok(meRes.body.error?.includes('Authentication required'));

    const orgRes = await request(app).get('/api/organizations/current');
    assert.strictEqual(orgRes.status, 401);
    assert.ok(orgRes.body.error?.includes('Authentication required'));

    const membersRes = await request(app).get('/api/organizations/members');
    assert.strictEqual(membersRes.status, 401);
    assert.ok(membersRes.body.error?.includes('Authentication required'));

    const logoutRes = await request(app).post('/api/auth/logout');
    assert.strictEqual(logoutRes.status, 401);
    assert.ok(logoutRes.body.error?.includes('Authentication required'));
  });

  it('Database connection handling or multi-tenant isolation verification', async (t) => {
    const dbStatus = await checkDatabaseConnection();

    if (!dbStatus.connected) {
      t.diagnostic(
        'NOTICE [NOT RUN]: PostgreSQL server is not running in this evaluation container. Database-dependent tests marked NOT RUN as requested.'
      );
      // Verify graceful setup error behavior
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'valid.user@example.com',
          password: 'ValidPassword123!',
          fullName: 'Test Merchant',
          organizationName: 'Merchant Store',
        });

      assert.strictEqual(res.status, 503);
      assert.ok(res.body.error?.includes('Database unavailable'));
      return;
    }

    // When PostgreSQL IS active, test full cross-organization isolation & anti-escalation
    t.diagnostic('PostgreSQL detected. Executing live multi-tenancy tests...');

    // 1. Create Tenant A
    const regA = await request(app).post('/api/auth/register').send({
      email: `tenant.a.${Date.now()}@example.com`,
      password: 'StrongPassword123!',
      fullName: 'Owner A',
      organizationName: 'Store A',
    });
    assert.strictEqual(regA.status, 201);
    const tokenA = regA.body.token;
    const orgAId = regA.body.organization.id;

    // 2. Create Tenant B
    const regB = await request(app).post('/api/auth/register').send({
      email: `tenant.b.${Date.now()}@example.com`,
      password: 'StrongPassword123!',
      fullName: 'Owner B',
      organizationName: 'Store B',
    });
    assert.strictEqual(regB.status, 201);
    const tokenB = regB.body.token;

    // 3. Verify Tenant B cannot access Tenant A members
    const crossAccess = await request(app)
      .get('/api/organizations/members')
      .set('Authorization', `Bearer ${tokenB}`);

    // Members returned must belong ONLY to Org B
    assert.strictEqual(crossAccess.status, 200);
    const members = crossAccess.body.members;
    assert.ok(
      members.every((m: any) => m.organization_id !== orgAId),
      'Tenant B must never receive Tenant A member data'
    );
  });
});
