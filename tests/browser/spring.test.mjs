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

async function openSpring(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  const errors = [], external = [];
  await context.route('**/*', async route => {
    if (new URL(route.request().url()).origin !== base) {
      external.push(route.request().url());
      await route.abort();
    } else await route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`${base}/spring-balance/`);
  return { context, page, errors, external };
}

async function snapshot(page) {
  return page.locator('.iso-svg').evaluate(svg => {
    const carriage = svg.querySelector('[data-part="carriage"]');
    const matrix = carriage.transform.baseVal.consolidate().matrix;
    return {
      transform: carriage.getAttribute('transform'),
      dx: matrix.e, dy: matrix.f,
      coil: svg.querySelector('#coil-front').getAttribute('d'),
      extensionLength: svg.querySelector('#extension-line').getTotalLength(),
      forceArrow: svg.querySelector('#force-arrow').getAttribute('d'),
    };
  });
}

async function assertState(page, force, stiffness, extension) {
  assert.equal(await page.locator('#force').inputValue(), String(force));
  assert.equal(await page.locator('#stiffness').inputValue(), String(stiffness));
  assert.equal(await page.locator('#force-value').textContent(), `${force.toFixed(1)} N`);
  assert.equal(await page.locator('#stiffness-value').textContent(), `${stiffness} N/m`);
  assert.equal(await page.locator('#extension-value').textContent(), `${extension.toFixed(1)} mm`);
  assert.equal(await page.locator('#equation').textContent(),
    `x = ${force.toFixed(1)} / ${stiffness} ≈ ${(extension / 1000).toFixed(4)} m`);
  assert.ok((await page.locator('#force-meaning').textContent()).includes(`${force.toFixed(1)} N`));
  assert.ok((await page.locator('#stiffness-meaning').textContent()).includes(`${stiffness} N/m`));
  assert.ok((await page.locator('#extension-meaning').textContent()).includes(`${extension.toFixed(1)} mm`));
  assert.ok((await page.locator('.iso-svg').getAttribute('aria-label')).includes(`${extension.toFixed(1)} 毫米`));
  assert.ok(await page.locator('#force').isEnabled());
  assert.ok(await page.locator('#stiffness').isEnabled());
}

async function assertVisibleFocus(locator) {
  const focus = await locator.evaluate(element => ({
    focused: document.activeElement === element,
    style: getComputedStyle(element).outlineStyle,
    width: parseFloat(getComputedStyle(element).outlineWidth),
  }));
  assert.equal(focus.focused, true);
  assert.notEqual(focus.style, 'none');
  assert.ok(focus.width >= 2, `Focus outline too thin: ${JSON.stringify(focus)}`);
}

async function assertLayout(page, width) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(scrollWidth <= width + 1, `Horizontal overflow: ${scrollWidth} > ${width}`);
  const figure = await page.locator('figure').boundingBox();
  const explanation = await page.locator('.explanation').boundingBox();
  const controls = await page.locator('.controls').boundingBox();
  if (width === 390) {
    assert.ok(explanation.y >= figure.y + figure.height - 1);
    assert.ok(explanation.y - figure.y - figure.height <= 24, 'Current explanation must immediately follow the picture');
    assert.ok(controls.y >= explanation.y + explanation.height, 'Controls must follow the current explanation on phones');
  } else {
    assert.ok(explanation.x >= figure.x + figure.width, 'Desktop explanation should sit beside the drawing');
  }
  const semanticOrder = await page.locator('.layout').evaluate(element =>
    [...element.children].map(child => child.className));
  assert.deepEqual(semanticOrder, ['machine', 'explanation', 'controls']);
}

async function assertPartInsideSvg(page, selector) {
  const svg = await page.locator('.iso-svg').boundingBox();
  const part = await page.locator(selector).boundingBox();
  assert.ok(part.x >= svg.x - 1 && part.y >= svg.y - 1 &&
    part.x + part.width <= svg.x + svg.width + 1 &&
    part.y + part.height <= svg.y + svg.height + 1,
  `${selector} is outside the SVG viewBox`);
}

for (const width of [1280, 390]) {
  test(`spring model, figure, explanation, and keyboard agree at ${width}px`, async () => {
    const { context, page, errors, external } = await openSpring({ viewport: { width, height: 900 } });
    try {
      await assertState(page, 6, 300, 20);
      const baseline = await snapshot(page);
      assert.ok(baseline.extensionLength > 0 && baseline.forceArrow.length > 0);

      for (const [preset, force, stiffness, extension, scale] of [
        ['double-force', 12, 300, 40, 2],
        ['double-stiffness', 6, 600, 10, 0.5],
        ['zero-force', 0, 300, 0, 0],
        ['baseline', 6, 300, 20, 1],
      ]) {
        await page.locator(`[data-preset="${preset}"]`).click();
        await assertState(page, force, stiffness, extension);
        const picture = await snapshot(page);
        // Translation and measured line length must scale with the visible result.
        // This catches a text-only update while the picture stays unchanged.
        assert.ok(Math.abs(picture.dx - baseline.dx * scale) <= 0.2);
        assert.ok(Math.abs(picture.dy - baseline.dy * scale) <= 0.2);
        assert.ok(Math.abs(picture.extensionLength - baseline.extensionLength * scale) <= 0.25);
        if (scale !== 1) assert.notEqual(picture.coil, baseline.coil);
        assert.equal(picture.forceArrow === '', force === 0);
        assert.equal(await page.locator('[aria-pressed="true"]').count(), 1);
        assert.equal(await page.locator(`[data-preset="${preset}"]`).getAttribute('aria-pressed'), 'true');
      }

      // Set both extremes through real keyboard interaction with native sliders.
      await page.locator('#force').focus();
      await page.keyboard.press('End');
      await assertVisibleFocus(page.locator('#force'));
      await page.locator('#stiffness').focus();
      await page.keyboard.press('Home');
      await assertVisibleFocus(page.locator('#stiffness'));
      await assertState(page, 12, 100, 120);
      const maximum = await snapshot(page);
      assert.ok(Math.abs(maximum.dx - baseline.dx * 6) <= 0.35);
      assert.ok(Math.abs(maximum.dy - baseline.dy * 6) <= 0.35);
      assert.ok(Math.abs(maximum.extensionLength - baseline.extensionLength * 6) <= 0.5);
      assert.equal(await page.locator('[aria-pressed="true"]').count(), 0);
      await assertPartInsideSvg(page, '[data-part="carriage"]');
      await assertPartInsideSvg(page, '#force-arrow');

      await page.locator('[data-preset="baseline"]').focus();
      await page.keyboard.press('Enter');
      await assertVisibleFocus(page.locator('[data-preset="baseline"]'));
      await assertState(page, 6, 300, 20);
      await page.locator('#force').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#force-value').textContent(), '6.5 N');
      assert.equal(await page.locator('#extension-value').textContent(), '21.7 mm');
      assert.notEqual((await snapshot(page)).transform, baseline.transform);
      await page.locator('[data-preset="baseline"]').click();

      // Hover prose -> graphic. Keyboard focus graphic -> prose.
      const prose = page.locator('.explanation [data-ref="spring"]');
      const graphic = page.locator('svg [data-ref="spring"]');
      await prose.hover();
      assert.equal(await graphic.getAttribute('data-ref-active'), '');
      assert.equal(await prose.getAttribute('data-ref-active'), '');
      await graphic.focus();
      await page.keyboard.press('Shift');
      await assertVisibleFocus(graphic);
      await page.mouse.move(1, 1);
      assert.equal(await graphic.getAttribute('data-ref-active'), '');
      assert.equal(await prose.getAttribute('data-ref-active'), '', 'Pointer leave must retain keyboard highlighting');
      await page.locator('#force').focus();
      assert.equal(await graphic.getAttribute('data-ref-active'), null);

      await page.locator('[data-preset="baseline"]').click();
      await page.locator('h1').click();
      await page.mouse.move(1, 1);
      await assertLayout(page, width);
      await page.screenshot({ path: fileURLToPath(new URL(`spring-${width}.png`, output)), fullPage: true });
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
    } finally { await context.close(); }
  });

  test(`spring no-JavaScript fallback remains honest and readable at ${width}px`, async () => {
    const { context, page, errors, external } = await openSpring({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    try {
      assert.ok(await page.locator('noscript').isVisible());
      assert.equal(await page.locator('#extension-value').textContent(), '20.0 mm');
      assert.match(await page.locator('#equation').textContent(), /0\.0200 m/);
      assert.match(await page.locator('#narrative').textContent(), /平衡位置/);
      assert.ok((await page.locator('#force-arrow').getAttribute('d')).length > 0);
      for (const control of await page.locator('.controls input, .controls button').all()) {
        assert.ok(await control.isDisabled(), 'An inert control must not appear usable without JavaScript');
      }
      await assertLayout(page, width);
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
    } finally { await context.close(); }
  });
}

test('spring reduced-motion mode has no autoplay and keeps controls usable', async () => {
  const { context, page, errors, external } = await openSpring({ reducedMotion: 'reduce', viewport: { width: 390, height: 900 } });
  try {
    assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
    const before = await snapshot(page);
    await page.waitForTimeout(250);
    assert.deepEqual(await snapshot(page), before);
    assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
    await page.locator('[data-preset="double-force"]').click();
    await assertState(page, 12, 300, 40);
    assert.notEqual((await snapshot(page)).transform, before.transform);
    assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
  } finally { await context.close(); }
});
