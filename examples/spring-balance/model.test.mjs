import test from 'node:test';
import assert from 'node:assert/strict';
import { springState, springPresets } from './model.mjs';

test('known SI-unit calculation and meaningful counterfactuals', () => {
  assert.equal(springState(6, 300).extensionMm, 20);
  assert.equal(springState(12, 300).extensionMm, 40);
  assert.equal(springState(6, 600).extensionMm, 10);
  assert.equal(springState(0, 300).extensionMm, 0);
  assert.equal(springState(12, 100).extensionMm, 120);
});

test('every selectable input obeys F = kx and stays inside the drawing range', () => {
  for (let force = 0; force <= 12; force += 0.5) {
    for (let stiffness = 100; stiffness <= 600; stiffness += 25) {
      const s = springState(force, stiffness);
      assert.ok(Math.abs(s.stiffnessNm * s.extensionM - s.forceN) < 1e-12);
      assert.ok(s.extensionMm >= 0 && s.extensionMm <= 120);
    }
  }
  for (const p of springPresets) assert.doesNotThrow(() => springState(p.forceN, p.stiffnessNm));
});

test('invalid input cannot silently produce a plausible readout', () => {
  for (const args of [[NaN,300],[6,Infinity],[6,0],[-1,300],[13,300],[6,99]]) {
    assert.throws(() => springState(...args));
  }
});
