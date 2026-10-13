import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStaticServer } from './server.mjs';

let server;
let baseUrl;
let root;

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'writespace-server-'));
  writeFileSync(join(root, 'index.html'), '<!doctype html><title>WriteSpace</title>');
  writeFileSync(join(root, 'asset.js'), 'console.log("asset")');
  mkdirSync(join(root, 'nested'));
  server = createStaticServer({ root });
  server.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (root) rmSync(root, { recursive: true, force: true });
});

describe('production static server', () => {
  it('returns a JSON health response', async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('serves assets and falls back to the SPA entry point', async () => {
    const asset = await fetch(`${baseUrl}/asset.js`);
    expect(asset.status).toBe(200);
    expect(await asset.text()).toContain('console.log');

    const route = await fetch(`${baseUrl}/blogs/example`);
    expect(route.status).toBe(200);
    expect(await route.text()).toContain('<title>WriteSpace</title>');
  });

  it('rejects unsupported methods', async () => {
    const response = await fetch(`${baseUrl}/health`, { method: 'POST' });
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, HEAD');
  });
});
