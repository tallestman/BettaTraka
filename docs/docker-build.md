# Production image and locked installs

`package-lock.json` is the authoritative lock for the npm/Docker workflow. Use
`npm ci`, not `npm install`, for routine installs. The older `bun.lock` is not
used by Docker; do not assume Bun resolves the same dependency graph.

Both Docker stages pin the same Node 24 Alpine image digest (including npm).
`tsx` is a locked application dependency, not an unversioned global install.
The runtime installs with `npm ci --omit=dev`, runs as the image's `node` user,
and starts Node directly as PID 1. Existing frontend dependencies remain in the
manifest's production group; this is not a minimal-size runtime image.

The build context uses an allowlist in `.dockerignore`: only manifests and
application build inputs are sent. Environment files, Git metadata, local
`node_modules`, tests, and common credential/key filenames are excluded. Do not
put secrets in source code or public assets: ignore patterns cannot detect
arbitrarily named secrets, and anything in `public/` is intentionally public.
Add new build inputs to the allowlist deliberately. Supply secrets at runtime,
never with `COPY`, build arguments, or frontend variables.

## Local verification (no Compose deployment)

From the repository root, with Docker and Python 3 available:

```sh
docker build -t bettatraka-auth-review:local .
python3 scripts/verify-docker.py
```

The verifier renders Compose using synthetic secrets and no `.env`, checks
production mode, loopback-only application publishing and no database host
ports, then starts only the image on a random loopback port. It checks the
frontend and built assets, expected database-free health (`503`, `degraded`),
non-root UID, locked runtime loader, and absent development/environment files.
It removes its smoke container even if a check fails. No database or Compose
stack is started. A successful smoke check is not a migration or connected-DB
integration test.

Compose always sets `NODE_ENV=production`, regardless of the host's `NODE_ENV`.
It publishes `127.0.0.1:${PORT:-3000}:3000`; use a host reverse proxy with TLS for
public traffic. The database has no published host ports and is reachable only
through its Docker network. This network is not an egress-isolated network.
Set `POSTGRES_PASSWORD` and `JWT_SECRET` securely before a separately authorized
deployment. No Supabase services are required.

## Updating the lock/base

Intentionally refresh the base digest for security updates, keeping both
`FROM` instructions identical, then regenerate the lock with that image's npm
in an empty directory containing only `package.json`. This avoids carrying
host `node_modules` platform artifacts into the lock. Copy the resulting
`package-lock.json` back, review the diff, rebuild, and rerun the verifier.
Do not run an install against another worker's shared `node_modules`.

Pinned dependency inputs improve repeatability; they do not promise bit-for-bit
image identity, dependency vulnerability clearance, or identical assets when
application source is changing concurrently.
