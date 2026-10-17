import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { startPreview } from '../scripts/preview.mjs';

test('preview only serves the public gallery and known examples', async () => {
  const { server, url } = await startPreview();
  try {
    const gallery = await fetch(`${url}/`);
    assert.equal(gallery.status, 200);
    assert.match(await gallery.text(), /<html\s+lang="en"/);
    const image = await fetch(`${url}/spring-balance.png`, { method: 'HEAD' });
    assert.equal(image.status, 200);
    assert.equal(image.headers.get('content-type'), 'image/png');
    assert.equal((await image.arrayBuffer()).byteLength, 0);
    assert.equal((await fetch(`${url}/cache-key/`)).status, 200);
    for (const path of ['/SKILL.md', '/.git/config', '/../../etc/passwd', '/%2e%2e%2fREADME.md']) {
      assert.equal((await fetch(url + path)).status, 404);
    }
    assert.equal((await fetch(`${url}/cache-key/`, { method: 'POST' })).status, 405);
    const malformedStatus = await new Promise((resolve, reject) => {
      const req = request(url, { path: '//[' }, response => {
        response.resume();
        response.on('end', () => resolve(response.statusCode));
      });
      req.on('error', reject);
      req.end();
    });
    assert.equal(malformedStatus, 400);
    assert.equal((await fetch(`${url}/cache-key/`)).status, 200, 'Malformed input must not stop the server');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
