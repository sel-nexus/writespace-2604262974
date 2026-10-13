import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = resolve(process.cwd(), 'dist');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export function createStaticServer({ root = defaultRoot } = {}) {
  const staticRoot = resolve(root);
  return createServer((request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }

    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    if (pathname === '/health') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : JSON.stringify({ status: 'ok' }));
      return;
    }

    let requestedPath;
    try {
      requestedPath = decodeURIComponent(pathname);
    } catch {
      response.writeHead(400);
      response.end();
      return;
    }

    let filePath = resolve(staticRoot, `.${requestedPath}`);
    if (filePath !== staticRoot && !filePath.startsWith(`${staticRoot}${sep}`)) {
      response.writeHead(404);
      response.end();
      return;
    }
    if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = resolve(filePath, 'index.html');
    if (!existsSync(filePath) || !statSync(filePath).isFile()) filePath = resolve(staticRoot, 'index.html');
    if (!existsSync(filePath)) {
      response.writeHead(404);
      response.end();
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(filePath).pipe(response);
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 8080);
  createStaticServer().listen(port, '0.0.0.0');
}
