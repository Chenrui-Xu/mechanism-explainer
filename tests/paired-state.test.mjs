import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Script } from 'node:vm';
import { createStepper, referenceIds, sharesReference, wireReferences } from '../assets/paired-explainer/paired-explainer.mjs';
import { queueSteps, queueView } from '../assets/paired-explainer/queue-model.mjs';

test('stepper bounds its state, preserves reset, and notifies only for a change', () => {
  const seen = [];
  const steps = [{ label: 'start' }, { label: 'wait' }, { label: 'accepted' }];
  const controller = createStepper({ steps, onChange: (state) => seen.push(state) });
  steps.push({ label: 'unexpected external addition' });
  assert.equal(controller.getState().total, 3);
  assert.equal(controller.getState().canPrevious, false);
  controller.previous();
  controller.next();
  controller.go(999);
  controller.next();
  assert.equal(controller.getState().step.label, 'accepted');
  assert.equal(controller.getState().canNext, false);
  assert.throws(() => { controller.getState().index = 9; }, TypeError);
  controller.reset();
  assert.deepEqual(seen.map(({ index }) => index), [1, 2, 0]);
});

test('invalid step state fails explicitly rather than rendering undefined values', () => {
  assert.throws(() => createStepper({ steps: [] }), /non-empty/);
  assert.throws(() => createStepper({ steps: [0], initial: NaN }), /finite/);
  const controller = createStepper({ steps: [0, 1, 2], initial: 1.8 });
  assert.equal(controller.getState().index, 1);
  assert.throws(() => controller.go(Infinity), /finite/);
  assert.throws(() => controller.go('1'), /finite/);
  assert.equal(controller.getState().index, 1);
});

test('references compare full tokens, not CSS fragments or substrings', () => {
  assert.deepEqual(referenceIds('  queue\tworker queue\n '), ['queue', 'worker']);
  assert.equal(sharesReference('cache-key other', ['cache']), false);
  assert.equal(sharesReference('queue worker', ['worker']), true);
  assert.equal(sharesReference('part[0]', ['part[0]']), true);
  assert.equal(sharesReference('', []), false);
});

// A small event adapter tests reference ownership, not browser layout or a11y.
function referenceFixture() {
  const handlers = new Map();
  const root = {
    children: [],
    contains(node) { return this.children.includes(node); },
    querySelectorAll() { return this.children; },
    addEventListener(name, fn) { handlers.set(name, fn); },
    removeEventListener(name) { handlers.delete(name); },
    fire(name, target, relatedTarget = null) { handlers.get(name)?.({ target, relatedTarget }); },
    add(ref) {
      const node = {
        active: false,
        closest() { return this; },
        getAttribute() { return ref; },
        toggleAttribute(name, active) { assert.equal(name, 'data-ref-active'); this.active = active; },
      };
      this.children.push(node);
      return node;
    },
  };
  return root;
}

test('pointer exit preserves keyboard highlight; delegated rendering accepts new nodes', () => {
  const root = referenceFixture();
  const queueText = root.add('queue');
  const queueShape = root.add('queue');
  const workerText = root.add('worker');
  const references = wireReferences(root);
  root.fire('focusin', queueText);
  root.fire('pointerover', workerText);
  assert.equal(queueShape.active, true);
  assert.equal(workerText.active, true);
  root.fire('pointerout', workerText);
  assert.equal(queueShape.active, true);
  assert.equal(workerText.active, false);
  const newQueue = root.add('queue');
  references.refresh();
  assert.equal(newQueue.active, true);
  root.fire('focusout', queueText);
  assert.equal(newQueue.active, false);
  root.fire('pointerover', workerText);
  references.destroy();
  assert.equal(workerText.active, false);
  root.fire('focusin', queueText);
  assert.equal(queueShape.active, false);
});

test('queue narration and marks preserve the difference between accepted and finished', () => {
  for (const step of queueSteps) {
    const view = queueView(step);
    assert.equal(view.count, `${step.queued} waiting`);
    assert.equal(view.queueJobVisible, step.queued > 0);
    assert.equal(view.workerJobVisible, step.busy);
    assert.equal(view.worker, step.busy ? '1 active job' : 'Idle');
  }
  assert.match(queueView(queueSteps[2]).explanation, /not finished yet/);
});

test('built starter retains initial content, every state, local assets and attribution', async () => {
  const html = await readFile(new URL('../assets/paired-explainer/index.html', import.meta.url), 'utf8');
  const initial = queueView(queueSteps[0]);
  assert.ok(html.includes(initial.explanation));
  for (const step of queueSteps) assert.ok(html.includes(queueView(step).explanation));
  assert.match(html, /data-step-controls hidden/);
  assert.match(html, /<noscript>/);
  assert.match(html, /@media print/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /Copyright \(c\) 2025 Nico Bailon/);
  assert.match(html, /Permission is hereby granted/);
  assert.doesNotMatch(html, /(?:src|href)=["']https?:\/\//);
  assert.doesNotMatch(html, /setInterval\s*\(|setTimeout\s*\(|requestAnimationFrame\s*\(/);
  assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}|\/\*__[A-Z_]+__\*\//);
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(() => new Script(script));
});

test('vendored license is byte-identical to the reviewed upstream source', async () => {
  const metadata = JSON.parse(await readFile(new URL('../vendor/visual-explainer/SOURCES.json', import.meta.url), 'utf8'));
  const license = await readFile(new URL('../vendor/visual-explainer/LICENSE', import.meta.url));
  const recorded = metadata.reviewed_sources.find(({ path }) => path === 'LICENSE');
  assert.equal(createHash('sha256').update(license).digest('hex'), recorded.sha256);
  assert.match(metadata.commit, /^[a-f0-9]{40}$/);
});
