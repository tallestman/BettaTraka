import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { app } from '../server/app.js';
import { pool } from '../server/db/index.js';
import { signAccessToken, hashToken } from '../server/auth/jwt.js';

// Deliberately fail (never skip) without the isolated integration database.
const db = new URL(process.env.DATABASE_URL || 'http://missing');
assert.equal(db.hostname, '127.0.0.1');
assert.equal(db.port, '55439');
assert.equal(db.pathname, '/bettatraka_auth_test');
let server: ReturnType<typeof app.listen>;
let base: string;
let alice: any;
let bob: any;
const password = 'Synthetic-Test-Password-42!';
async function http(path: string, token?: string, body?: any, method = body ? 'POST' : 'GET') {
  const response = await fetch(base + '/api' + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie') };
}
function tokenFor(user = alice, org = user.organization.id) {
  return signAccessToken({ userId: user.user.id, email: user.user.email, organizationId: org, role: 'Owner' });
}
async function record(token: string, user = alice, org: string | null = user.organization.id) {
  await pool.query('INSERT INTO sessions (user_id, organization_id, token_hash, expires_at) VALUES ($1,$2,$3,NOW()+INTERVAL \'1 day\')', [user.user.id, org, hashToken(token)]);
}
before(async () => {
  await pool.query('SELECT 1');
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${(server.address() as any).port}`;
  for (const name of ['Alice', 'Bob']) {
    const result = await http('/auth/register', undefined, { email: `${name}-${randomUUID()}@example.invalid`, password, fullName: `Synthetic ${name}`, organizationName: `Synthetic ${name} ${randomUUID()}` });
    assert.equal(result.status, 201);
    if (name === 'Alice') alice = result.body; else bob = result.body;
  }
});
after(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  await pool.end();
});
test('registration validates input and creates an isolated owner workspace', async () => {
  assert.equal((await http('/auth/register', undefined, { email: 'bad', password, fullName: 'Synthetic' })).status, 400);
  assert.equal((await http('/auth/register', undefined, { email: 'weak@example.invalid', password: 'weak', fullName: 'Synthetic' })).status, 400);
  assert.equal((await http('/auth/register', undefined, { email: alice.user.email, password, fullName: 'Synthetic' })).status, 409);
  const me = await http('/auth/me', alice.token);
  assert.equal(me.status, 200);
  assert.equal(me.body.user.id, alice.user.id);
  assert.equal(me.body.activeMembership.organizationId, alice.organization.id);
  assert.equal(me.body.activeMembership.role, 'Owner');
  assert.equal(me.body.organizations.length, 1);
});
test('good login issues independent sessions; bad credentials fail; logout denies token reuse', async () => {
  assert.equal((await http('/auth/login', undefined, { email: alice.user.email, password: 'wrong' })).status, 401);
  assert.equal((await http('/auth/login', undefined, { email: 'absent@example.invalid', password })).status, 401);
  const first = await http('/auth/login', undefined, { email: alice.user.email, password });
  const second = await http('/auth/login', undefined, { email: alice.user.email, password });
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.notEqual(first.body.token, second.body.token);
  assert.equal((await http('/auth/logout', first.body.token, {})).status, 200);
  assert.equal((await http('/auth/me', first.body.token)).status, 401);
  assert.equal((await http('/auth/me', second.body.token)).status, 200);
});
for (const state of ['deleted', 'revoked', 'expired']) {
  test(`${state} sessions are denied`, async () => {
    const token = tokenFor();
    await record(token);
    assert.equal((await http('/auth/me', token)).status, 200);
    const sql = state === 'deleted' ? 'DELETE FROM sessions WHERE token_hash=$1' : state === 'revoked' ? 'UPDATE sessions SET revoked_at=NOW() WHERE token_hash=$1' : "UPDATE sessions SET expires_at=NOW()-INTERVAL '1 second' WHERE token_hash=$1";
    await pool.query(sql, [hashToken(token)]);
    assert.equal((await http('/auth/me', token)).status, 401);
  });
}
test('suspended users are denied both existing sessions and login', async () => {
  await pool.query("UPDATE users SET status='SUSPENDED' WHERE id=$1", [alice.user.id]);
  try {
    assert.equal((await http('/auth/me', alice.token)).status, 403);
    assert.equal((await http('/auth/login', undefined, { email: alice.user.email, password })).status, 403);
  } finally { await pool.query("UPDATE users SET status='ACTIVE' WHERE id=$1", [alice.user.id]); }
});
for (const table of ['organization_memberships', 'organizations']) {
  test(`suspended ${table} deny tenant access`, async () => {
    const where = table === 'organizations' ? 'id=$1' : 'organization_id=$1';
    await pool.query(`UPDATE ${table} SET status='SUSPENDED' WHERE ${where}`, [alice.organization.id]);
    try {
      assert.equal((await http('/organizations/current', alice.token)).status, 403);
      assert.equal((await http('/auth/switch-org', alice.token, { organizationId: alice.organization.id })).status, 403);
    } finally { await pool.query(`UPDATE ${table} SET status='ACTIVE' WHERE ${where}`, [alice.organization.id]); }
  });
}
test('two tenants cannot read or mutate each other through selected-workspace routes', async () => {
  for (const [owner, other] of [[alice, bob], [bob, alice]]) {
    const current = await http(`/organizations/current?organizationId=${other.organization.id}`, owner.token);
    assert.equal(current.status, 200);
    assert.equal(current.body.organization.id, owner.organization.id);
    const members = await http('/organizations/members', owner.token);
    assert.equal(members.status, 200);
    assert.deepEqual(members.body.members.map((m: any) => m.user_id), [owner.user.id]);
    assert.equal((await http('/auth/switch-org', owner.token, { organizationId: other.organization.id })).status, 403);
    const target = await pool.query('SELECT id FROM organization_memberships WHERE user_id=$1 AND organization_id=$2', [other.user.id, other.organization.id]);
    assert.equal((await http(`/organizations/members/${target.rows[0].id}`, owner.token, { role: 'Admin' }, 'PATCH')).status, 404);
  }
});
test('staff cannot escalate through stale Owner claims, self promotion or owner mutation', async () => {
  const member = await pool.query('SELECT id FROM organization_memberships WHERE user_id=$1 AND organization_id=$2', [bob.user.id, bob.organization.id]);
  const memberId = member.rows[0].id;
  await pool.query("UPDATE organization_memberships SET role='Manager' WHERE id=$1", [memberId]);
  try {
    assert.equal((await http('/auth/me', bob.token)).body.activeMembership.role, 'Manager');
    assert.equal((await http(`/organizations/members/${memberId}`, bob.token, { role: 'Owner' }, 'PATCH')).status, 403);
    assert.equal((await http('/organizations/current', bob.token, { name: 'Escalated' }, 'PATCH')).status, 403);
    await pool.query("UPDATE organization_memberships SET role='Admin' WHERE id=$1", [memberId]);
    assert.equal((await http(`/organizations/members/${memberId}`, bob.token, { role: 'Manager' }, 'PATCH')).status, 403);
    assert.equal((await http('/organizations/members/invite', bob.token, { email: 'escalate@example.invalid', role: 'Owner' })).status, 403);
    const owner = await pool.query("INSERT INTO organization_memberships (user_id, organization_id, role) VALUES ($1,$2,'Owner') RETURNING id", [alice.user.id, bob.organization.id]);
    try {
      assert.equal((await http(`/organizations/members/${owner.rows[0].id}`, bob.token, { role: 'Manager' }, 'PATCH')).status, 403);
    } finally { await pool.query('DELETE FROM organization_memberships WHERE id=$1', [owner.rows[0].id]); }
    assert.equal((await pool.query('SELECT role FROM organization_memberships WHERE id=$1', [memberId])).rows[0].role, 'Admin');
  } finally { await pool.query("UPDATE organization_memberships SET role='Owner' WHERE id=$1", [memberId]); }
});
test('an organization-less session does not silently acquire tenant access', async () => {
  const token = signAccessToken({ userId: alice.user.id, email: alice.user.email });
  await record(token, alice, null);
  const me = await http('/auth/me', token);
  assert.equal(me.status, 200);
  assert.equal(me.body.activeMembership, null);
  assert.equal((await http('/organizations/current', token)).status, 403);
});
test('logout never reports success when database revocation fails or updates no rows', async () => {
  for (const action of ["RETURN NULL;", "RAISE EXCEPTION 'synthetic revocation failure';"]) {
    await pool.query(`CREATE OR REPLACE FUNCTION auth_test_block_revoke() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN ${action} END $$`);
    await pool.query(`CREATE TRIGGER auth_test_block_revoke BEFORE UPDATE ON sessions FOR EACH ROW WHEN (OLD.token_hash = '${hashToken(alice.token)}') EXECUTE FUNCTION auth_test_block_revoke()`);
    try {
      const logout = await http('/auth/logout', alice.token, {});
      assert.equal(logout.status, 503);
      assert.notEqual(logout.body.success, true);
      assert.equal((await http('/auth/me', alice.token)).status, 200);
    } finally {
      await pool.query('DROP TRIGGER auth_test_block_revoke ON sessions');
      await pool.query('DROP FUNCTION auth_test_block_revoke()');
    }
  }
});
test('switch-org records a usable session that logout revokes', async () => {
  await pool.query("INSERT INTO organization_memberships (user_id, organization_id, role) VALUES ($1,$2,'Manager')", [alice.user.id, bob.organization.id]);
  try {
    const switched = await http('/auth/switch-org', alice.token, { organizationId: bob.organization.id });
    assert.equal(switched.status, 200);
    const me = await http('/auth/me', switched.body.token);
    assert.equal(me.status, 200);
    assert.equal(me.body.activeMembership.organizationId, bob.organization.id);
    const logout = await http('/auth/logout', switched.body.token, {});
    assert.equal(logout.status, 200);
    assert.match(logout.cookie!, /bettatraka_token=;/);
    assert.equal((await http('/auth/me', switched.body.token)).status, 401);
    const session = await pool.query('SELECT revoked_at FROM sessions WHERE token_hash=$1', [hashToken(switched.body.token)]);
    assert.ok(session.rows[0].revoked_at);
    assert.equal((await http('/auth/me', alice.token)).status, 200);
  } finally {
    await pool.query('DELETE FROM organization_memberships WHERE user_id=$1 AND organization_id=$2', [alice.user.id, bob.organization.id]);
  }
});
test('session must bind the token user and organization', async () => {
  for (const [user, org] of [[bob, alice.organization.id], [alice, bob.organization.id], [alice, null]] as const) {
    const token = tokenFor();
    await record(token, user, org);
    assert.equal((await http('/auth/me', token)).status, 401);
  }
});
test('each issuance has a unique JWT session ID even in the same second', () => {
  const tokens = Array.from({ length: 20 }, () => tokenFor());
  assert.equal(new Set(tokens).size, tokens.length);
});
test('rejects a correctly signed token with no recorded session', async () => {
  // Distinct claim avoids collisions with registration before unique JWT IDs exist.
  const token = signAccessToken({ userId: alice.user.id, email: 'unrecorded@example.invalid', organizationId: alice.organization.id });
  assert.equal((await http('/auth/me', token)).status, 401);
});
