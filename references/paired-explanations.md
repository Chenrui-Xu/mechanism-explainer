# Pair the explanation with the state

Read this when creating an illustrated page or an interactive explanation.

## Start from working code

The integration ships a reusable, dependency-free layer in
[`assets/paired-explainer`](../assets/paired-explainer/). It adapts
visual-explainer's linked references, stepper, live-model, and fallback patterns;
the [pinned provenance and MIT notice](../vendor/visual-explainer/README.md)
identify the upstream work and the changes.

From the skill directory, run:

```sh
node assets/paired-explainer/build.mjs
node --test tests/paired-state.test.mjs
```

The build produces a self-contained `assets/paired-explainer/index.html`, with
no network requests, web fonts, npm dependencies, or autoplay. Its queue example
is deliberately simple so that the pairing behavior is easy to inspect. Use
the project's loopback preview server to inspect it. `template.html` is a build
input containing placeholders; preview the generated `index.html`.

For a new explanation, copy the template and build pattern, replace the model,
and supply a renderer. The queue is an example, not a required metaphor.
For a mechanical illustration, use the Anatomy kit for geometry and this layer
for the surrounding HTML and interactions.

## A small working contract

Choose stable IDs for the concepts that need visible anchors. For example:

```text
concept: model-version
label: 模型版本
source: explicitly defined toy cache key
view: second key slot
control: “模型变化” preset button
state: current.modelVersion
explanation: the stored and current model versions differ, so this example recomputes
```

This need not be a separate JSON file or framework. A shared object or a small
mapping table is enough. Its purpose is to prevent a visual called “version”
from drifting away from text called “configuration.”

## Explain cause, not just appearance

A useful explanation answers three questions in context:

1. Which visible thing should I inspect?
2. What relation or change does it show?
3. What consequence follows, and under what assumption?

For example: “Look at the model version. The current value is 3, but the cached
value is 2. In this example, any key mismatch requires a new calculation.”

“The second pin moves” identifies a motion but leaves its meaning unexplained.
An entire paragraph explaining caching beside a moving pin does not establish
which sentence belongs to which state either.

## Layout

Start with one takeaway above the artifact. On a wide display, use adjacent
visual and explanation panels when that makes their relationship clear.
On a narrow display, use visual → current explanation → relevant controls,
or controls → visual → current explanation when input must come first.

Keep labels near their referents. Put longer reasoning in HTML text so it can
wrap, scale, be selected, and be read by assistive technology. Reserve the
caption for the overall meaning, scope, and source, rather than using it to
carry every state-specific explanation.

Use progressive disclosure for derivations, implementation details, and
secondary limitations. Keep a limitation visible if hiding it would make the
main claim misleading. A compact artifact may not need panels or tabs at all.

## State and motion

Derive a view model once per meaningful input change:

```js
const result = evaluate(inputs);
renderVisual(result);
renderExplanation(result);
renderReadout(result);
```

For categorical events, show actual states rather than interpolating truth.
For continuous models, distinguish the measured value from a target or a
decorative transition. State units and identify illustrative, nonphysical motion.

Use native buttons and form inputs when they fit. A meaningful update may be
announced in a polite status region. Do not announce every animation frame.
The current state must remain visible after the user stops interacting.

## Minimal API

`paired-explainer.mjs` exports these functions:

| API | Contract |
|---|---|
| `wireReferences(root)` | Pair elements sharing space-separated `data-ref` IDs. Return `{refresh, destroy}`. |
| `createStepper({steps, initial, onChange})` | Pure bounded sequence. Return `getState`, `go(index)`, `next`, `previous`, `reset`. No initial callback and no timers. |
| `mountStepper(root, {steps, initial, render, describePosition})` | Add controls and linked references to static HTML. Call `render(snapshot, root)` initially and once for each changed index. Return the controller plus `refreshReferences` and `destroy`. |
| `referenceIds(value)`, `sharesReference(value, activeIds)` | Pure token helpers for matching and tests. IDs are never interpreted as selectors. |

`initial` defaults to `0`. A snapshot is
`{index, step, total, canPrevious, canNext}`. Treat `step` and the input objects
as immutable. `go` clamps finite numeric indices to the sequence and truncates
fractions. `reset` returns to step `0`, even if a different initial step was used.

### Link prose and drawing

Use the same ID on the matching pieces. Add keyboard access to the useful
anchors; do not make every decorative part a tab stop.

```html
<g data-ref="spring" tabindex="0" role="group" aria-label="Spring">
  <!-- Anatomy SVG geometry, or any ordinary SVG -->
</g>
<p>The <span class="pe-ref" data-ref="spring" tabindex="0">spring</span>
  extends when the applied force increases.</p>
```

```js
import { wireReferences } from './paired-explainer.mjs';
const links = wireReferences(document.querySelector('main'));
// If a renderer replaces anchored elements, refresh once after rendering:
links.refresh();
// When removing the explanation from an app:
// links.destroy();
```

The listener uses delegated pointer and focus events, so newly rendered nodes
work too. Matching elements receive `data-ref-active`. Pointer and keyboard
focus are additive; leaving a hovered element does not erase another element's
keyboard highlight. The supplied CSS changes underline or outline as well as
color, and keeps all labels readable. Hover is supplementary: every claim must
remain available without it. `mountStepper` already wires references; do not
wire them a second time on the same root.

### Connect a stepper to one factual state

```html
<div class="pe-controls" data-step-controls hidden>
  <button type="button" data-step-go="-1">Previous</button>
  <span data-step-status>1 / 3</span>
  <button type="button" data-step-go="1">Next</button>
  <button type="button" data-step-reset>Reset</button>
  <label>Step <input data-step-index type="range" min="0" max="2" value="0"></label>
</div>
```

```js
import { mountStepper } from './paired-explainer.mjs';
mountStepper(root, {
  steps: states,
  render({ step }, root) {
    const view = evaluate(step); // Calculate once.
    renderGeometry(root, view);
    renderNumbers(root, view);
    renderExplanation(root, view);
  },
  describePosition: (index, total) => `${index + 1} / ${total}`,
});
```

These rendering functions are author-supplied. The module does not infer facts
or generate a second model from text. Controls appear only after the initial
render succeeds. Native buttons and the optional range input remain keyboard
operable. Keep state-specific prose in a polite status region; do not announce
every frame. For continuous controls, call your pure model and renderer from
the input handler, and use `wireReferences` without a stepper.

For a self-contained HTML file, the provided build script inlines the runtime
and CSS. The runtime has no imports; the build removes its `export` keywords.
Retain the complete upstream MIT notice when shipping an inlined derivative.

## Static, narrow-screen, and print behavior

Write meaningful HTML before enhancement. The starter's initial figure values,
initial explanation, and all-state summary are generated from the same model.
Controls start hidden. If JavaScript is disabled, the initial drawing and the
complete text sequence remain. A fallback should explain the result, not just
say that the browser needs JavaScript.

Use this DOM order for each pair:

```text
.pe-pair
  figure.pe-visual
    drawing
    figcaption
  .pe-explanation
    current explanation
    relevant controls
```

The supplied CSS puts the pair side by side on wide screens and stacks the
explanation directly below its visual below `45rem`. Repeat the pair for another
figure; do not put all figures first and all explanations at the page bottom.

Print hides controls and keeps the current state and the full text sequence.
It does not change the model to another step during printing. If understanding
depends on comparing geometry across states, include static small multiples too.
Reduced motion leaves controls functional; the starter has no timed animation.

## Evidence and checks

Inspect the whole artifact rather than cropping only the drawing. Try the
initial state, at least one changed state, and a relevant limit or reset. For
each, read the actual explanation and compare it with the visible evidence.

Check a narrow viewport, keyboard interaction, non-color cues, and the fallback
content. Test reduced motion if anything moves. Report untested accessibility
behavior precisely; semantic markup alone does not establish screen-reader usability.

The Node tests cover the bounded state controller, token matching, hover/focus
ownership through a small event adapter, model/readout agreement, static build
content, and license integrity. They do not establish browser layout, real
keyboard behavior, screen-reader usability, or human understanding. Inspect the
generated page in a browser for those applicable checks, and report the scope
of the checks actually run.

A useful optional prediction question changes one input and asks for the
consequence. Include the answer and reason, optionally in a disclosure. Do not
require readers to pass a quiz to access the explanation.
