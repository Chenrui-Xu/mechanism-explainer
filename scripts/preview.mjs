import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Only release examples are exposed. No directory browsing or arbitrary paths.
const routes = new Map([
  ['/cache-key/', new URL('../examples/cache-key/index.html', import.meta.url)],
  ['/spring-balance/', new URL('../examples/spring-balance/index.html', import.meta.url)],
  ['/paired-template/', new URL('../assets/paired-explainer/index.html', import.meta.url)],
]);

export async function startPreview({ port = 0 } = {}) {
  const server = createServer(async (request, response) => {
    let url;
    try { url = new URL(request.url, 'http://127.0.0.1'); }
    catch { response.writeHead(400).end('Invalid request target'); return; }
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405).end(); return;
    }
    if (url.pathname === '/') {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end('<!doctype html><html lang="en"><meta charset="utf-8"><title>Explain with Models examples</title><h1>Explain with Models</h1><ul><li><a href="/cache-key/">Cache key — paired explanation</a></li><li><a href="/spring-balance/">Spring balance — Anatomy SVG</a></li><li><a href="/paired-template/">Reusable paired template</a></li></ul></html>');
      return;
    }
    const file = routes.get(url.pathname);
    if (!file) { response.writeHead(404).end('Not found'); return; }
    try {
      const body = await readFile(file);
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(404).end('Build this example first');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { server, url } = await startPreview({ port: Number(process.env.PORT || 4173) });
  console.log(`Example preview: ${url}`);
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
}
