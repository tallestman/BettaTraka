#!/usr/bin/env python3
"""Verify a prebuilt local image without deploying Compose or starting a database."""
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
IMAGE = "bettatraka-auth-review:local"


def run(*args, env=None):
    result = subprocess.run(args, cwd=ROOT, env=env, text=True, capture_output=True)
    if result.returncode:
        # Do not expose generated secrets or resolved Compose credentials.
        raise RuntimeError(f"{args[0]} {args[1]} failed (exit {result.returncode})")
    return result.stdout.strip()


# Ignore host .env and application environment when rendering Compose.
env = {k: v for k, v in os.environ.items() if k in {
    "PATH", "HOME", "DOCKER_HOST", "DOCKER_CONTEXT", "DOCKER_CONFIG",
    "DOCKER_TLS_VERIFY", "DOCKER_CERT_PATH",
}}
env.update(POSTGRES_PASSWORD=secrets.token_hex(32), JWT_SECRET=secrets.token_hex(32),
           NODE_ENV="development")
config = json.loads(run("docker", "compose", "--env-file", "/dev/null", "config", "--format", "json", env=env))
app = config["services"]["app"]
assert app["environment"]["NODE_ENV"] == "production"
assert all(port["host_ip"] == "127.0.0.1" for port in app["ports"])
assert not config["services"]["db"].get("ports")
print("PASS Compose: production even with host NODE_ENV=development; loopback app; no database host ports")

metadata = json.loads(run("docker", "image", "inspect", IMAGE))[0]
assert metadata["Config"]["User"] == "node"
assert "NODE_ENV=production" in metadata["Config"]["Env"]
assert metadata["Config"]["Cmd"] == ["node", "--import", "tsx", "server.ts"]
print(f"PASS image metadata: {metadata['Id']}; non-root node; production; local tsx loader")

name = "bettatraka-build-smoke-" + secrets.token_hex(6)
container = None
try:
    container = run("docker", "run", "--detach", "--name", name,
                    "--publish", "127.0.0.1::3000", "--env", "JWT_SECRET",
                    IMAGE, env=env)
    info = json.loads(run("docker", "inspect", container))[0]
    mapping = info["NetworkSettings"]["Ports"]["3000/tcp"][0]
    assert mapping["HostIp"] == "127.0.0.1"
    base = "http://127.0.0.1:" + mapping["HostPort"]
    deadline = time.monotonic() + 30
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    while True:
        try:
            with opener.open(base + "/", timeout=2) as response:
                html = response.read().decode()
                assert response.status == 200 and '<div id="root">' in html
            break
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if time.monotonic() >= deadline:
                raise RuntimeError("Image failed to serve frontend within 30 seconds") from None
            time.sleep(0.25)
    assets = re.findall(r'(?:src|href)="(/assets/[^\"]+)"', html)
    assert assets, "Production asset references are missing"
    for asset in assets:
        with opener.open(base + asset, timeout=3) as response:
            assert response.status == 200 and response.read(1)
    print(f"PASS HTTP: frontend 200 and {len(assets)} built assets 200 on temporary loopback port")
    try:
        opener.open(base + "/api/health", timeout=3)
        raise AssertionError("Health must report unavailable database")
    except urllib.error.HTTPError as error:
        payload = json.load(error)
        assert error.code == 503 and payload["status"] == "degraded"
        assert payload["database"]["connected"] is False
    print("PASS database-free health: HTTP 503 degraded, database.connected=false")
    assert run("docker", "exec", container, "id", "-u") != "0"
    run("docker", "exec", container, "npm", "ls", "tsx", "--omit=dev")
    image_lock = json.loads(run("docker", "exec", container, "node", "-e",
        "console.log(require('fs').readFileSync('/app/package-lock.json','utf8'))"))
    assert image_lock == json.loads((ROOT / "package-lock.json").read_text())
    run("docker", "exec", container, "node", "-e", """
const fs = require('fs');
for (const p of ['/app/.env', '/app/.env.example', '/app/.git', '/app/tests', '/app/src', '/app/node_modules/typescript']) {
  if (fs.existsSync(p)) throw new Error('Unexpected runtime file: ' + p);
}
""")
    print("PASS runtime: non-root UID; locked tsx installed; lock matches; no env/git/tests/frontend-source/TypeScript compiler")
finally:
    if container:
        run("docker", "rm", "--force", container)
        remaining = run("docker", "ps", "--all", "--filter", "name=" + name, "--format", "{{.Names}}")
        assert name not in remaining.splitlines()
        print("PASS cleanup: temporary smoke container removed")
