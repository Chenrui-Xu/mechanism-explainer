import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCache } from '../examples/cache-key/model.mjs';

test('cache reuse needs an entry and both matching fields', () => {
  for (const exists of [false, true]) {
    for (const documentVersion of [3, 4]) {
      for (const modelVersion of [2, 3]) {
        const current = { documentVersion, modelVersion };
        const stored = { exists, documentVersion: 3, modelVersion: 2 };
        const result = evaluateCache(current, stored);
        assert.equal(result.reuse, exists && documentVersion === 3 && modelVersion === 2);
        if (!exists) assert.match(result.reason, /不存在/);
        else if (documentVersion !== 3 && modelVersion !== 2) assert.match(result.reason, /两项版本/);
        else if (documentVersion !== 3) assert.match(result.reason, /文档版本/);
        else if (modelVersion !== 2) assert.match(result.reason, /模型版本/);
      }
    }
  }
});

test('explanations use the stored values instead of fixed sample numbers', () => {
  const result = evaluateCache({ documentVersion: 8, modelVersion: 4 }, { exists: true, documentVersion: 7, modelVersion: 4 });
  assert.match(result.reason, /从 7 变为 8/);
});
