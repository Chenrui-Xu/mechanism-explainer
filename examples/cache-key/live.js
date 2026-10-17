'use strict';
  // A single pure model drives numbers, comparison signs, highlights and prose.
  const storedCache = Object.freeze({ exists: true, documentVersion: 3, modelVersion: 2 });
  const presets = Object.freeze({
    match: Object.freeze({ documentVersion: 3, modelVersion: 2 }),
    document: Object.freeze({ documentVersion: 4, modelVersion: 2 }),
    model: Object.freeze({ documentVersion: 3, modelVersion: 3 })
  });
    const element = id => document.getElementById(id);
  const presetButtons = [...document.querySelectorAll('[data-preset]')];
  function renderPreset(name, announce) {
    const current = presets[name];
    const decision = evaluateCache(current, storedCache);
    const key = '(' + current.documentVersion + ', ' + current.modelVersion + ')';
    const title = decision.reuse ? 'Reuse the stored result' : 'Recompute the result';
    element('current-key').textContent = key;
    element('result-title').textContent = title;
    element('reason').textContent = decision.reason;
    element('explanation').dataset.reuse = String(decision.reuse);
    element('cache').dataset.reuse = String(decision.reuse);
    element('cache-result').textContent = decision.reuse ? 'Reuse' : 'Recompute';
    for (const [field, value, cached, matches] of [
      ['document', current.documentVersion, storedCache.documentVersion, decision.documentMatches],
      ['model', current.modelVersion, storedCache.modelVersion, decision.modelMatches]
    ]) {
      element(field + '-value').textContent = String(value);
      element(field + '-comparison').textContent = matches ? '=' : '≠';
      element(field + '-slot').dataset.match = String(matches);
      element(field + '-check').dataset.match = String(matches);
      element(field + '-wire').setAttribute('class', 'wire ' + (matches ? 'active' : 'inactive'));
      element(field + '-detail').textContent = 'Current ' + value + (matches ? ' = ' : ' ≠ ') + 'stored ' + cached + (matches ? ' · Match' : ' · Mismatch');
    }
    element('diagram-description').textContent = 'The current key is ' + key + '. The stored cache key is (3, 2). ' + title + '. ' + decision.reason;
    for (const button of presetButtons) button.setAttribute('aria-pressed', String(button.dataset.preset === name));
    // Only user actions write to this live region. There is no per-frame announcement.
    if (announce) element('announcement').textContent = 'Current key ' + key + '. ' + title + '. ' + decision.reason;
  }
  for (const button of presetButtons) {
    button.disabled = false;
    button.addEventListener('click', () => renderPreset(button.dataset.preset, true));
  }
  renderPreset('match', false);
