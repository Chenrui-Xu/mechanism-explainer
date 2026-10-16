# Anatomy adapter: explain a mechanism with a real drawing kit

Use Anatomy when physical position, contact, force, geometry, or motion helps
the reader understand the subject. Start with a plain diagram when the subject
is a hierarchy, a dependency graph, or a pipeline. A polished machine must earn
its place by making a specific relationship easier to see.

The SVG core is bundled in [vendor/anatomy](../vendor/anatomy/README.md).
It is an actual offline dependency, not an instruction to install another
skill. [The MIT notice](../vendor/anatomy/LICENSE) applies to copied code.
[MANIFEST.json](../vendor/anatomy/MANIFEST.json) records its source hashes.
The bundled files match upstream commit
[`e9488296a44211c42701ff71705b7901470ec78f`](https://github.com/wheresryan22/anatomy/tree/e9488296a44211c42701ff71705b7901470ec78f).

## The contract between model, drawing, and words

Before geometry, write:

1. The sentence the reader should be able to explain afterward.
2. The inputs, outputs, units, and valid range.
3. Which visible part represents each quantity, and what a movement means.
4. What the mechanism omits or could wrongly imply.
5. One example and one counterexample that test the explanation.

Compute a state once. Pass that state to the figure, readout, labels, and prose.
Do not calculate an output separately in the caption. Distinguish physical
units from screen scale. If a visual length is illustrative, say so when it
could be mistaken for a measurement.

The [spring model](../examples/spring-balance/model.mjs) computes `x = F / k`
in metres. Its [build script](../examples/spring-balance/build.mjs) converts that
same extension to millimetres, moves the carriage, rebuilds the spring, and
updates the explanation. Changing stiffness represents a different ideal
spring; the drawn coil is not a specification for its real dimensions.

## What changes from Anatomy

Preserve solid volume, purposeful detail, correct occlusion, readable emphasis,
and model-driven numbers. Change the presentation defaults as follows:

- There is no minimum part count. Add a part when it supports the mechanism,
  identifies the object, or makes a relevant constraint visible.
- Use labels and connectors when readers need them. Keep explanatory text
  nearby in normal HTML; do not make all information tiny SVG text.
- Put the main takeaway before the drawing. Put the current state's meaning
  beside it. Explain cause and consequence, not only component names.
- Prefer a static initial state with explicit controls. Do not auto-play an
  idle tour. Motion needs a pause control and a reduced-motion alternative.
- A dense machine is an option, not the default for every explanation.
- Allow direct updates for user-controlled teaching models. If motion is
  eased, derive displayed values from the displayed state so prose does not
  jump ahead of the drawing.
- Test the entire explanation, including prose below or beside the card.
  A screenshot of only the SVG is incomplete.

These choices are part of this merged skill. Do not load the upstream
instruction file and reintroduce conflicting defaults.

## Use the bundled kit

All paths below are relative to the repository root. Build scripts need
Node.js 20.10+ and have no npm dependencies.

```js
import * as k from '../../vendor/anatomy/kit/iso-kit.mjs';

const base = { x: -80, y: -35, w: 160, d: 70, r: 5 };
const P = k.fitProjection(k.boxCorners(base, -10, 40), 600, 340,
  { pad: 28, azimuth: 35, elevation: 30 });
const baseSvg = k.solidSvg(k.slabOf(base, -10, 10, P, 6, 1),
  { tone: 'mid' });
```

This import path works from a directory like `examples/spring-balance/`.
Use the following small API set first:

| Need | Bundled API |
|---|---|
| Project world coordinates | `fitProjection(points,width,height,options)`, `iso([x,y,z],P)` |
| Sort back to front | `depthOf(point,P)`; larger means nearer |
| Solid plates and feet | `slabOf(plan,z,height,P)`, `cylinder(x,y,r,z,height,P)` |
| Render four-tone solids | `solidSvg(paths,{tone,lit,inner})` |
| Surface detail | `planOutline`, `ring`, `topTicks`, `sideTicks`, `knurl` |
| Spring around an axis | `coil(from,to,[cy,cz],radius,turns,'x',P)` returns back/front paths |
| Move a rigid part | `translateAlong(P,[dx,dy,dz])` |
| Lines and dots | `segment(a,b,P)`, `lineSvg(path,{tone})`, `dotsSvg(points,options)` |
| Accessible SVG and styles | `figureSvg({width,height,label,body})`, `ISO_CSS` |
| Round bodies, arbitrary axis | [lathe.mjs](../vendor/anatomy/kit/lathe.mjs) |
| Pipes and cables | [tube.mjs](../vendor/anatomy/kit/tube.mjs) |
| Geometry checks | [audit.mjs](../vendor/anatomy/kit/audit.mjs) |

Use [iso-kit.ts](../vendor/anatomy/kit/iso-kit.ts) for signatures and types,
or the [original working build](../examples/spring-balance/build.mjs) for
executable usage. The ESM runtime and CSS are also bundled. WebGL, React
wrappers, true 3D, and community publishing are not included.

The standalone example embeds `iso-kit.mjs` after removing its `export`
keywords. It also embeds its model and the no-dependency
[paired-explainer module](../assets/paired-explainer/paired-explainer.mjs).
This is appropriate for these known, import-free modules; do not treat it as
a general JavaScript bundler. Keep the applicable license notice in exported
HTML when embedding runtime code.

## Pair prose with the drawing

Assign stable `data-ref` values to meaningful groups and matching text.
Call `wireReferences(container)` from the bundled module. The same identifier
can appear more than once, such as on a carriage and its force arrow.

```html
<g data-ref="spring" tabindex="0" role="group" aria-label="Spring">…</g>
<span data-ref="spring" tabindex="0">Stiffness: how hard it is to stretch.</span>
```

Provide a clear focus style. Keep the corresponding explanation visible even
when a reader cannot hover. A parent SVG with interactive descendants should
use `role="group"`, not an image role that hides those descendants. Use native
buttons and labelled range inputs for controls. Keep required information out
of hover-only tooltips.

## Verify the relevant risks

Rebuild and test the model:

```sh
node examples/spring-balance/build.mjs
node --test examples/spring-balance/model.test.mjs
```

Then serve the repository over localhost HTTP and inspect the example at
desktop width and 390 px. The [bundled tools](../vendor/anatomy/README.md)
capture full explanations and drive controls using Chrome or Chromium.
Inspect every saved screenshot; a successful capture is not a visual review.

Check zero, ordinary values, and both input extremes. Check that the output
value, picture, description, and control state agree. Use the keyboard for
sliders, presets, and paired references. Check that reduced motion does not
remove the explanation and that there is no horizontal overflow.

For pipe-heavy or deeply interlocked figures, use the bundled geometry audit
with real shapes. Do not claim an audit was run merely because its module is
included. The spring example tests its model and interaction contract; it is
an educational schematic, not an audited engineering assembly.

Report the exact checks performed. Passing numerical tests does not establish
that a reader understood the lesson; use a short prediction question when
evaluating instructional quality.
