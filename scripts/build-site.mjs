import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, '_site');

// Publish only the gallery and built standalone examples, never the repository.
const files = [
  ['docs/index.html', 'index.html'],
  ['docs/spring-balance.png', 'spring-balance.png'],
  ['examples/cache-key/index.html', 'cache-key/index.html'],
  ['examples/spring-balance/index.html', 'spring-balance/index.html'],
  ['assets/paired-explainer/index.html', 'paired-template/index.html'],
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const [source, destination] of files) {
  const target = path.join(output, destination);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(root, source), target);
}
await writeFile(path.join(output, '.nojekyll'), '');
console.log(`Built _site/ with ${files.length} allowlisted assets and .nojekyll.`);
