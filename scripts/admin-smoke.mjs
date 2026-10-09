import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

const base = 'http://127.0.0.1:3100';
async function run(password) {
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3100'], {
    env: { ...process.env, ADMIN_PASSWORD: password, GITHUB_TOKEN: '' }, stdio: 'inherit',
  });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 120; attempt++) {
      if (server.exitCode !== null) throw new Error('Server exited');
      try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
      await delay(250);
    }
    assert.ok(ready, 'Server ready');
    for (const path of ['/admin', '/admin/nested', '/api/admin', '/api/admin/home']) {
      for (const authorization of ['', 'Basic invalid', 'Basic ' + Buffer.from('admin:incorrect').toString('base64')]) {
        const response = await fetch(base + path, { headers: { authorization }, redirect: 'follow' });
        assert.equal(response.status, 401, path + ' requires authentication');
        assert.match(response.headers.get('cache-control'), /no-store/);
      }
    }
    assert.equal((await fetch(base + '/api/admin/home', { method: 'PUT', body: '{}' })).status, 401);
    assert.equal((await fetch(base + '/admin', { headers: { RSC: '1', 'x-middleware-subrequest': 'src/proxy:src/proxy:src/proxy:src/proxy:src/proxy' } })).status, 401);
    if (password) {
      const authorization = 'Basic ' + Buffer.from('admin:' + password).toString('base64');
      const page = await fetch(base + '/admin', { headers: { authorization } });
      assert.equal(page.status, 200);
      assert.match(await page.text(), /Homepage Editor/);
      assert.match(page.headers.get('cache-control'), /no-store/);
      assert.equal((await fetch(base + '/api/admin/home', { headers: { authorization } })).status, 503);
      for (const origin of ['', 'https://example.invalid']) {
        assert.equal((await fetch(base + '/api/admin/home', {
          method: 'PUT', headers: { authorization, origin, 'Content-Type': 'application/json' }, body: '{}',
        })).status, 403);
      }
      assert.equal((await fetch(base + '/api/admin/home', {
        method: 'PUT', headers: { authorization, origin: base, 'Content-Type': 'application/json' }, body: '{}',
      })).status, 503);
    }
  } finally {
    const exited = once(server, 'exit');
    server.kill('SIGTERM');
    await exited;
  }
}
await run('');
await run(randomBytes(32).toString('hex'));
console.log('PASS: missing password, unauthorized HTML/RSC/API, invalid credentials, authorized editor, missing token and CSRF.');
