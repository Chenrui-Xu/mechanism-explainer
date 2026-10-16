import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { queueSteps, queueView } from './queue-model.mjs';

const directory = new URL('./', import.meta.url);
const read = (name) => readFile(new URL(name, directory), 'utf8');
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const [template, css, runtime, model, upstreamLicense] = await Promise.all([
  read('template.html'), read('paired-explainer.css'), read('paired-explainer.mjs'), read('queue-model.mjs'),
  read('../../vendor/visual-explainer/LICENSE'),
]);
const initial = queueView(queueSteps[0]);
const replacements = {
  '/*__PAIRED_CSS__*/': css,
  '/*__PAIRED_RUNTIME__*/': runtime.replace(/^export /gm, ''),
  '/*__QUEUE_MODEL__*/': model.replace(/^export /gm, ''),
  '/*__UPSTREAM_LICENSE__*/': `/*\n${upstreamLicense}\n*/`,
  '{{INITIAL_TITLE}}': escape(initial.title),
  '{{INITIAL_COUNT}}': escape(initial.count),
  '{{INITIAL_WORKER}}': escape(initial.worker),
  '{{INITIAL_EXPLANATION}}': escape(initial.explanation),
  '{{ALL_STATES}}': queueSteps.map((step) => `<li>${escape(queueView(step).explanation)}</li>`).join('\n'),
};
let html = template;
for (const [marker, value] of Object.entries(replacements)) html = html.replaceAll(marker, value);
if (/\{\{[A-Z_]+\}\}|\/\*__[A-Z_]+__\*\//.test(html)) throw new Error('Unresolved template marker');
const output = new URL('index.html', directory);
await writeFile(output, html);
console.log(`Built ${fileURLToPath(output)}`);
