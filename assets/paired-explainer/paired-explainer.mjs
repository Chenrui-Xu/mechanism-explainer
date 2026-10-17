/*
 * Paired explanation primitives, adapted from visual-explainer's linked
 * highlighting and stepper patterns. Upstream Copyright (c) 2025 Nico Bailon.
 * MIT license and pinned provenance: ../../vendor/visual-explainer/.
 * Integration changes Copyright (c) 2026 Mechanism Explainer contributors. MIT.
 */

/** Space-separated concept IDs, deduplicated without treating IDs as CSS. */
export function referenceIds(value = '') {
  return [...new Set(String(value).trim().split(/\s+/).filter(Boolean))];
}

export function sharesReference(value, activeIds) {
  const active = new Set(activeIds);
  return referenceIds(value).some((id) => active.has(id));
}

/**
 * Link every [data-ref] within root. Works with SVG and HTML and with content
 * replaced by render(). Hover and focus are additive; leaving the pointer
 * does not erase the keyboard's highlight. No essential text is hidden.
 */
export function wireReferences(root) {
  let hovered = null;
  let focused = null;
  const within = (target) => {
    const element = target?.closest?.('[data-ref]');
    return element && root.contains(element) ? element : null;
  };
  const paint = () => {
    if (hovered && !root.contains(hovered)) hovered = null;
    if (focused && !root.contains(focused)) focused = null;
    const active = new Set([
      ...referenceIds(hovered?.getAttribute('data-ref') || ''),
      ...referenceIds(focused?.getAttribute('data-ref') || ''),
    ]);
    for (const element of root.querySelectorAll('[data-ref]')) {
      element.toggleAttribute('data-ref-active', sharesReference(element.getAttribute('data-ref'), active));
    }
  };
  const handlers = {
    pointerover: (event) => { hovered = within(event.target); paint(); },
    pointerout: (event) => { hovered = within(event.relatedTarget); paint(); },
    focusin: (event) => { focused = within(event.target); paint(); },
    focusout: (event) => { focused = within(event.relatedTarget); paint(); },
  };
  for (const [name, handler] of Object.entries(handlers)) root.addEventListener(name, handler);
  return {
    refresh: paint,
    destroy() {
      for (const [name, handler] of Object.entries(handlers)) root.removeEventListener(name, handler);
      hovered = focused = null;
      paint();
    },
  };
}

/** Pure, bounded sequence controller. It never starts a timer. */
export function createStepper({ steps, initial = 0, onChange = () => {} }) {
  if (!Array.isArray(steps) || steps.length === 0) throw new TypeError('steps must be a non-empty array');
  if (typeof onChange !== 'function') throw new TypeError('onChange must be a function');
  const sequence = [...steps];
  const bounded = (value) => {
    if (!Number.isFinite(value)) throw new TypeError('step index must be finite');
    return Math.max(0, Math.min(sequence.length - 1, Math.trunc(value)));
  };
  let index = bounded(initial);
  const getState = () => Object.freeze({
    index, step: sequence[index], total: sequence.length,
    canPrevious: index > 0, canNext: index < sequence.length - 1,
  });
  const go = (value) => {
    const next = bounded(value);
    if (next !== index) { index = next; onChange(getState()); }
    return getState();
  };
  return { getState, go, next: () => go(index + 1), previous: () => go(index - 1), reset: () => go(0) };
}

/**
 * Enhance static HTML with a sequence and linked references.
 * render(snapshot, root) is the only place that renders factual state.
 * It runs once initially, then once for each actual index change.
 */
export function mountStepper(root, {
  steps, initial = 0, render,
  describePosition = (index, total) => `${index + 1} / ${total}`,
}) {
  if (typeof render !== 'function') throw new TypeError('render must be a function');
  const references = wireReferences(root);
  const paint = (state) => {
    render(state, root);
    for (const node of root.querySelectorAll('[data-step-status]')) node.textContent = describePosition(state.index, state.total);
    for (const button of root.querySelectorAll('[data-step-go]')) {
      const direction = Number(button.getAttribute('data-step-go'));
      button.disabled = direction < 0 ? !state.canPrevious : !state.canNext;
    }
    for (const slider of root.querySelectorAll('[data-step-index]')) {
      slider.min = '0'; slider.max = String(state.total - 1); slider.step = '1';
      slider.value = String(state.index);
      slider.setAttribute('aria-valuetext', describePosition(state.index, state.total));
    }
    references.refresh();
  };
  const controller = createStepper({ steps, initial, onChange: paint });
  // Leave useful static content and hidden controls intact if initial render fails.
  try { paint(controller.getState()); } catch (error) { references.destroy(); throw error; }
  const click = (event) => {
    const button = event.target?.closest?.('[data-step-go], [data-step-reset]');
    if (!button || !root.contains(button) || button.disabled) return;
    if (button.hasAttribute('data-step-reset')) controller.reset();
    else controller.go(controller.getState().index + Number(button.getAttribute('data-step-go')));
  };
  const input = (event) => {
    const slider = event.target?.closest?.('[data-step-index]');
    if (slider && root.contains(slider)) controller.go(Number(slider.value));
  };
  root.addEventListener('click', click);
  root.addEventListener('input', input);
  root.setAttribute('data-enhanced', '');
  for (const control of root.querySelectorAll('[data-step-controls]')) control.hidden = false;
  return {
    ...controller,
    refreshReferences: references.refresh,
    destroy() {
      root.removeEventListener('click', click);
      root.removeEventListener('input', input);
      references.destroy();
      root.removeAttribute('data-enhanced');
      for (const control of root.querySelectorAll('[data-step-controls]')) control.hidden = true;
    },
  };
}
