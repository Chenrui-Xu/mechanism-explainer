import { readFile, writeFile } from 'node:fs/promises';
import { evaluateCache } from './model.mjs';

const source = new URL('./template.html', import.meta.url);
const template = await readFile(source, 'utf8');
const live = await readFile(new URL('./live.js', import.meta.url), 'utf8');
const script = `${evaluateCache.toString()}\n${live}`.replace(/<\/script/gi, '<\\/script');
await writeFile(new URL('./index.html', import.meta.url), template.replace('<!-- CACHE_RUNTIME -->', `<script>\n${script}</script>`));
console.log('Built examples/cache-key/index.html');
