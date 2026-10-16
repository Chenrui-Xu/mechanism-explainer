import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const vendor = new URL('../vendor/ste/', import.meta.url);
const script = fileURLToPath(new URL('scripts/ste-lint.py', vendor));
const python = process.env.PYTHON || 'python3';

function run(args = [], input) {
  const result = spawnSync(python, [script, ...args], {
    input,
    encoding: 'utf8',
    timeout: 30000,
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null, result.stderr);
  return result;
}

function lint(text) {
  const result = run(['--json'], text);
  assert.ok([0, 1].includes(result.status), result.stderr);
  return { ...JSON.parse(result.stdout), status: result.status };
}

test('vendored source and license retain the pinned upstream hashes', () => {
  const manifest = JSON.parse(readFileSync(new URL('upstream.json', vendor), 'utf8'));
  for (const file of manifest.files) {
    const actual = createHash('sha256').update(readFileSync(new URL(file.local, vendor))).digest('hex');
    assert.equal(actual, file.sha256, file.local);
  }
});

test('the unmodified upstream selftest passes', () => {
  const result = run(['--selftest']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /selftest OK/);
});

test('uncertainty, modal negation, and conditional retries are not style defects', () => {
  const cases = [
    'The request may have failed. The timeout could explain it.',
    'The operation might not have finished. Do not assume it succeeded.',
    'Retry only if the operation is idempotent and no response arrives within 5 seconds.',
    'The results suggest a reduction in latency. They do not establish a causal effect.',
    'This model allows at most 4 requests per worker.',
  ];
  for (const source of cases) {
    const report = lint(source);
    assert.equal(report.hard_count, 0, `${source}\n${JSON.stringify(report.violations)}`);
    assert.equal(report.status, 0);
  }
});

test('unknown actor and current relevance remain advisory rather than failures', () => {
  const report = lint('The record was removed. The task has completed.');
  assert.equal(report.hard_count, 0);
  assert.equal(report.status, 0);
  assert.ok(report.violations.some(item => item.rule === 'passive-voice'));
  assert.ok(report.violations.some(item => item.rule === 'present-perfect'));
});

test('clean English lint cannot certify that a rewrite preserves meaning', () => {
  const pairs = [
    ['The request may have failed.', 'The request failed.'],
    ['Retry only if the operation is idempotent.', 'Retry the operation.'],
    ['The results do not establish a causal effect.', 'The results establish a causal effect.'],
    ['This model allows at most 4 requests per worker.', 'Each worker runs 4 requests.'],
  ];
  for (const [source, incorrectRewrite] of pairs) {
    // Passing both sides demonstrates a limit of lint, not semantic correctness.
    for (const text of [source, incorrectRewrite]) {
      const report = lint(text);
      assert.equal(report.count, 0, JSON.stringify(report.violations));
    }
  }
});

test('English terminology groups need human review when domain actions differ', () => {
  const report = lint('Validate the schema. Confirm the payment.');
  assert.ok(report.violations.some(item => item.rule === 'synonym-rotation'));
  assert.equal(report.status, 1);
  // The schema and payment actions are distinct. This finding is not an instruction
  // to rename either action, and its exit status is not a semantic quality score.
});
