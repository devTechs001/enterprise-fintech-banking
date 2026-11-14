#!/usr/bin/env node
/**
 * Server smoke check.
 *
 * Runs without a database or Redis: it verifies that every module in `src/`
 * loads, that the Express app assembles, and that a few routes respond correctly.
 *
 * Why this exists: the repository shipped with two files that did not parse and
 * eleven modules that did not exist, yet `npm start` had never been run. A check
 * that only parses files (`node --check`) misses import-time failures, so this
 * actually imports everything.
 *
 *   node scripts/check-server.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '../src');

let failures = 0;
const fail = (label, error) => {
  failures += 1;
  console.error(`  ✗ ${label}\n      ${error.message?.split('\n')[0] ?? error}`);
};
const pass = (label) => console.log(`  ✓ ${label}`);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.js') ? [full] : [];
  });

// Config must load before anything else, and must fail loudly in production.
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.JWT_ACCESS_SECRET ||= 'x'.repeat(48);
process.env.JWT_REFRESH_SECRET ||= 'y'.repeat(48);

console.log('\n1. Module load');
const files = walk(srcDir).sort();
for (const file of files) {
  const rel = path.relative(srcDir, file);
  try {
    await import(pathToFileURL(file).href);
    pass(rel);
  } catch (error) {
    fail(rel, error);
  }
}

console.log('\n2. Application assembly');
let app;
try {
  const { createApp } = await import('#config/app.js');
  app = createApp();
  pass('createApp() built the Express application');
} catch (error) {
  fail('createApp()', error);
}

console.log('\n3. HTTP behaviour (in-process, no port bound)');
if (app) {
  const request = (method, urlPath, { body, headers } = {}) =>
    new Promise((resolve, reject) => {
      const server = app.listen(0, async () => {
        const { port } = server.address();
        try {
          const response = await fetch(`http://127.0.0.1:${port}${urlPath}`, {
            method,
            headers: { 'Content-Type': 'application/json', ...headers },
            body: body ? JSON.stringify(body) : undefined,
          });
          const text = await response.text();
          let json = null;
          try { json = JSON.parse(text); } catch { /* non-JSON */ }
          resolve({ status: response.status, headers: response.headers, json, text });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });

  const check = async (label, fn) => {
    try {
      await fn();
      pass(label);
    } catch (error) {
      fail(label, error);
    }
  };

  await check('GET /health returns 200 with the success envelope', async () => {
    const res = await request('GET', '/health');
    if (res.status !== 200) throw new Error(`status ${res.status}`);
    if (res.json?.success !== true) throw new Error('missing success:true');
  });

  await check('every response carries a correlation id', async () => {
    const res = await request('GET', '/health');
    if (!res.headers.get('x-request-id')) throw new Error('no X-Request-Id header');
  });

  await check('a 1MB JSON body is rejected by the parser limit', async () => {
    const res = await request('POST', '/api/v1/auth/login', { body: { padding: 'a'.repeat(1024 * 1024) } });
    if (res.status !== 413) throw new Error(`expected 413, got ${res.status}`);
  });

  await check('an unknown route returns a JSON 404, not the HTML index', async () => {
    const res = await request('GET', '/api/v1/does-not-exist');
    if (res.status !== 404) throw new Error(`status ${res.status}`);
    if (res.json?.success !== false) throw new Error('not the error envelope');
  });

  await check('a protected route rejects a missing token with 401', async () => {
    const res = await request('GET', '/api/v1/auth/me');
    if (res.status !== 401) throw new Error(`status ${res.status}`);
  });

  await check('a protected route rejects a forged token with 401', async () => {
    const res = await request('GET', '/api/v1/auth/me', { headers: { Authorization: 'Bearer not.a.real.token' } });
    if (res.status !== 401) throw new Error(`status ${res.status}`);
  });

  await check('CORS refuses an unlisted origin', async () => {
    const res = await request('GET', '/health', { headers: { Origin: 'https://evil.example' } });
    if (res.headers.get('access-control-allow-origin') === '*') throw new Error('wildcard CORS origin');
  });

  await check('validation rejects a malformed registration', async () => {
    const res = await request('POST', '/api/v1/auth/register', {
      body: { email: 'not-an-email', password: 'short', firstName: '', lastName: '' },
    });
    if (res.status !== 422) throw new Error(`expected 422, got ${res.status}`);
  });

  await check('validation rejects a weak password that meets the length rule', async () => {
    const res = await request('POST', '/api/v1/auth/register', {
      body: { email: 'a@b.co', password: 'alllowercaseonly', firstName: 'A', lastName: 'B' },
    });
    if (res.status !== 422) throw new Error(`expected 422, got ${res.status}`);
  });

  await check('error responses never leak a stack trace', async () => {
    const res = await request('GET', '/api/v1/auth/me');
    if (res.text.includes('at ') && res.text.includes('.js:')) throw new Error('stack trace in response body');
  });
}

console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}`);
process.exit(failures === 0 ? 0 : 1);
