import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startPreview } from '../../scripts/preview.mjs';

let browser, server, base;
const output = new URL('../../test-results/', import.meta.url);
before(async () => {
  await mkdir(output, { recursive: true });
  ({ server, url: base } = await startPreview());
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

async function openPage(path, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  const errors = [], external = [];
  await context.route('**/*', async route => {
    if (new URL(route.request().url()).origin !== base) {
      external.push(route.request().url()); await route.abort();
    } else await route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`${base}${path}`);
  return { context, page, errors, external };
}

async function checkLayout(page) {
  const bounds = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(bounds.scroll <= bounds.width + 1, `Horizontal overflow: ${JSON.stringify(bounds)}`);
}

for (const width of [1280, 390]) {
  test(`cache presets agree with the graphic and explanation at ${width}px`, async () => {
    const { context, page, errors, external } = await openPage('/cache-key/', { viewport: { width, height: 900 } });
    try {
      const cases = [
        ['match', '(3, 2)', 'true', '=', '=', '两项版本都匹配'],
        ['document', '(4, 2)', 'false', '≠', '=', '文档版本从 3 变为 4'],
        ['model', '(3, 3)', 'false', '=', '≠', '模型版本从 2 变为 3'],
        ['match', '(3, 2)', 'true', '=', '=', '两项版本都匹配'],
      ];
      for (const [preset, key, reuse, doc, model, reason] of cases) {
        await page.locator(`[data-preset="${preset}"]`).click();
        assert.equal(await page.locator('#current-key').textContent(), key);
        assert.equal(await page.locator('#cache').getAttribute('data-reuse'), reuse);
        assert.equal(await page.locator('#explanation').getAttribute('data-reuse'), reuse);
        assert.equal(await page.locator('#document-comparison').textContent(), doc);
        assert.equal(await page.locator('#model-comparison').textContent(), model);
        assert.ok((await page.locator('#reason').textContent()).includes(reason));
        assert.equal(await page.locator('[aria-pressed="true"]').count(), 1);
      }
      await page.locator('[data-preset="document"]').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#current-key').textContent(), '(4, 2)');
      const focus = await page.locator('[data-preset="document"]').evaluate(node => ({
        focused: document.activeElement === node,
        outline: getComputedStyle(node).outlineStyle,
      }));
      assert.equal(focus.focused, true);
      assert.notEqual(focus.outline, 'none');
      await checkLayout(page);
      if (width === 390) {
        const visual = await page.locator('figure').boundingBox();
        const explanation = await page.locator('#explanation').boundingBox();
        assert.ok(explanation.y >= visual.y + visual.height - 1);
        assert.ok(explanation.y - (visual.y + visual.height) < 4, 'Explanation detached from figure');
      }
      await page.screenshot({ path: fileURLToPath(new URL(`cache-${width}.png`, output)), fullPage: true });
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
    } finally { await context.close(); }
  });
}

test('cache has readable no-JavaScript content', async () => {
  const { context, page, external } = await openPage('/cache-key/', { javaScriptEnabled: false });
  try {
    assert.match(await page.locator('#result-title').textContent(), /可以复用/);
    assert.equal(await page.locator('#document-value').textContent(), '3');
    assert.ok(await page.locator('noscript').isVisible());
    assert.ok(await page.locator('[data-preset="document"]').isDisabled());
    assert.deepEqual(external, []);
  } finally { await context.close(); }
});

test('cache controls remain usable under reduced motion', async () => {
  const { context, page } = await openPage('/cache-key/', { reducedMotion: 'reduce' });
  try {
    await page.locator('[data-preset="model"]').click();
    assert.equal(await page.locator('#model-comparison').textContent(), '≠');
    assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
  } finally { await context.close(); }
});

for (const width of [1280, 390]) {
  test(`paired template steps and linked references work at ${width}px`, async () => {
    const { context, page, errors, external } = await openPage('/paired-template/', { viewport: { width, height: 900 } });
    try {
      const next = page.locator('[data-step-go="1"]');
      const previous = page.locator('[data-step-go="-1"]');
      assert.ok(await previous.isDisabled());
      assert.equal(await page.locator('[data-queue-count]').textContent(), '0 waiting');
      await next.click();
      assert.equal(await page.locator('[data-queue-count]').textContent(), '1 waiting');
      assert.equal(await page.locator('[data-queue-job]').getAttribute('visibility'), 'visible');
      await next.click();
      assert.equal(await page.locator('[data-queue-count]').textContent(), '0 waiting');
      assert.equal(await page.locator('[data-worker-state]').textContent(), '1 active job');
      assert.equal(await page.locator('[data-worker-job]').getAttribute('visibility'), 'visible');
      assert.equal(await page.locator('[data-queue-job]').getAttribute('visibility'), 'hidden');
      assert.match(await page.locator('[data-explanation]').textContent(), /not finished yet/);
      assert.ok(await next.isDisabled());
      await page.locator('[data-step-reset]').click();
      assert.equal(await page.locator('[data-worker-state]').textContent(), 'Idle');
      await page.locator('[data-step-index]').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('[data-step-status]').textContent(), '2 / 3');
      const text = page.locator('.pe-explanation [data-ref="queue"]');
      const shape = page.locator('svg [data-ref="queue"]');
      await text.focus();
      assert.notEqual(await shape.getAttribute('data-ref-active'), null);
      await page.locator('svg [data-ref="worker"]').hover();
      assert.equal(await page.locator('svg [data-ref-active]').count(), 2);
      await page.locator('h1').hover();
      assert.notEqual(await shape.getAttribute('data-ref-active'), null, 'Pointer leave must retain keyboard highlight');
      assert.notEqual(await text.evaluate(node => getComputedStyle(node).outlineStyle), 'none');
      await checkLayout(page);
      if (width === 390) {
        const figure = await page.locator('figure').boundingBox();
        const explanation = await page.locator('.pe-explanation').boundingBox();
        assert.ok(explanation.y >= figure.y + figure.height - 1);
        assert.ok(explanation.y - figure.y - figure.height < 40);
      }
      await page.screenshot({ path: fileURLToPath(new URL(`paired-${width}.png`, output)), fullPage: true });
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
    } finally { await context.close(); }
  });
}

test('paired template has no-JavaScript and print explanations', async () => {
  const { context, page, external } = await openPage('/paired-template/', { javaScriptEnabled: false });
  try {
    assert.ok(await page.locator('noscript').isVisible());
    assert.equal(await page.locator('.pe-summary li').count(), 3);
    assert.equal(await page.locator('[data-step-controls]').isVisible(), false);
    await page.emulateMedia({ media: 'print' });
    assert.ok(await page.locator('.pe-summary').isVisible());
    assert.deepEqual(external, []);
  } finally { await context.close(); }
});

test('paired template has no automatic playback under reduced motion', async () => {
  const { context, page } = await openPage('/paired-template/', { reducedMotion: 'reduce' });
  try {
    await page.locator('[data-step-go="1"]').click();
    assert.equal(await page.locator('[data-step-status]').textContent(), '2 / 3');
    assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
  } finally { await context.close(); }
});
