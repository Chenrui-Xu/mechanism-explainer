import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Only the public gallery and examples are exposed. No arbitrary paths.
const routes = new Map([
  ['/', new URL('../docs/index.html', import.meta.url)],
  ['/spring-balance.png', new URL('../docs/spring-balance.png', import.meta.url)],
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
    const file = routes.get(url.pathname);
    if (!file) { response.writeHead(404).end('Not found'); return; }
    try {
      const body = await readFile(file);
      response.setHeader('Content-Type', file.pathname.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8');
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
