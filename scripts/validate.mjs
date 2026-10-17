import { readFile, readdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative, sep, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const problems = [];
const excluded = new Set(['node_modules', '.git', 'test-results', 'shots', '_site']);
async function walk(directory) {
  const results = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) { problems.push(`Symlink in distributable: ${relative(root, path)}`); continue; }
    if (entry.isDirectory()) results.push(...await walk(path));
    else results.push(path);
  }
  return results;
}

const skill = await readFile(resolve(root, 'SKILL.md'), 'utf8');
const front = skill.match(/^---\n([\s\S]*?)\n---/);
if (!front || !/^name: mechanism-explainer$/m.test(front[1]) || !/^description: .+/m.test(front[1])) {
  problems.push('Missing skill identity or description');
}

const files = await walk(root);
const textExtensions = new Set(['.md', '.mjs', '.js', '.ts', '.py', '.json', '.yaml', '.yml', '.html', '.css', '.txt']);
for (const file of files) {
  const rel = relative(root, file).split(sep).join('/');
  if (textExtensions.has(extname(file)) || ['LICENSE', '.gitignore'].includes(basename(file))) {
    const content = await readFile(file, 'utf8');
    if (/\p{Script=Han}/u.test(content)) problems.push(`Non-English release text (Han characters): ${rel}`);
    if (file.endsWith('.html') && !/<html\b[^>]*\blang=["']en(?:-[A-Za-z]+)?["']/i.test(content)) {
      problems.push(`Published HTML must declare English: ${rel}`);
    }
  }
  if (file.endsWith('.md') && !rel.startsWith('vendor/')) {
    const content = await readFile(file, 'utf8');
    if (/\/Users\/|C:\\Users\\/.test(content)) problems.push(`Machine-specific path: ${rel}`);
    for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1].split('#')[0].replace(/^<|>$/g, '');
      if (!target || /^[a-z][a-z\d+.-]*:/i.test(target)) continue;
      const path = resolve(dirname(file), decodeURIComponent(target));
      try { await access(path); } catch { problems.push(`Broken link in ${rel}: ${target}`); }
    }
  }
  if (/\/(upstream|MANIFEST|SOURCES)\.json$/.test(rel)) {
    const metadata = JSON.parse(await readFile(file, 'utf8'));
    if (!/^[a-f0-9]{40}$/.test(metadata.commit || '')) problems.push(`Missing pinned upstream commit: ${rel}`);
    const originals = metadata.files || (metadata.reviewed_sources || []).filter(item => (metadata.vendored_files || []).includes(item.path));
    for (const item of originals) {
      const local = item.local || item.path;
      if (item.modified || !local || !item.sha256) continue;
      const source = resolve(dirname(file), local);
      const actual = createHash('sha256').update(await readFile(source)).digest('hex');
      if (actual !== item.sha256) problems.push(`Upstream checksum mismatch: ${rel}: ${local}`);
    }
    try { await access(resolve(dirname(file), 'LICENSE')); }
    catch { problems.push(`Missing third-party license: ${rel}`); }
  }
}

for (const path of ['LICENSE', 'ATTRIBUTION.md', 'references/clear-writing.md', 'references/paired-explanations.md', 'references/anatomy-adapter.md']) {
  try { await access(resolve(root, path)); } catch { problems.push(`Missing integrated resource: ${path}`); }
}
if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
else console.log(`Validation passed: skill identity, local links, English release text, ${files.length} distributable files, and recorded unmodified upstream hashes.`);
