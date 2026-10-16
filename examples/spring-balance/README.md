# Spring balance: one model, drawing, and explanation

This original example uses the bundled Anatomy SVG core and this project's
paired-explainer module. The HTML has no network dependencies. Its language
is Chinese; its calculation uses SI units.

From the repository root:

```sh
node examples/spring-balance/build.mjs
node --test examples/spring-balance/model.test.mjs
```

Serve the repository over localhost HTTP to inspect `index.html`. Building
requires Node.js 20.10+, and does not require a package install. Rebuilding
embeds the local runtime, CSS, model, and license notices into one HTML file.

The ideal equilibrium model is `x = F / k`, with force `F` in newtons,
stiffness `k` in newtons per metre, and extension `x` in metres. The display
converts metres to millimetres. These are educational values, not measurements.
The rail uses one world-coordinate unit per millimetre; camera projection
turns world units into screen pixels.

| Input or picture | Meaning |
|---|---|
| Force slider | External force magnitude, from 0 to 12 N |
| Stiffness slider | Spring stiffness, from 100 to 600 N/m |
| Carriage movement | The calculated extension from the zero-force position |
| Brown dimension line | That same extension, not total spring length |
| Green arrow | Applied force direction and relative magnitude |
| Coil appearance | Recognizable spring, not a real material or manufacturing specification |

The example starts at 6 N and 300 N/m, giving 20 mm. Its presets test a doubled
force (40 mm), doubled stiffness (10 mm), and zero force (0 mm). Native range
inputs and buttons work with the keyboard. Focus or hover links each quantity
to the matching part of the picture. There is no automatic playback. On phones,
the current explanation follows the picture before the controls. Without
JavaScript, the baseline remains readable and the controls stay disabled.

`model.test.mjs` checks the known calculations, all 525 selectable input pairs,
the valid drawing range, and invalid inputs. Browser interaction and visual
checks are separate; do not infer them from the model test result.

After installing the repository's development dependencies and Playwright
Chromium, run the real browser checks from the repository root:

```sh
node --test tests/browser/spring.test.mjs
```

These checks use a localhost-only server, block external requests, and cover
1280 px and 390 px layouts, presets, slider limits, keyboard focus, paired
references, the no-JavaScript fallback, and reduced motion. They write
`test-results/spring-1280.png` and `test-results/spring-390.png` for visual review.

This is a static, linear, frictionless model. It does not simulate vibration,
yielding, fracture, manufacturing tolerances, or real spring stiffness from
coil dimensions. The drawing has not passed an engineering assembly audit.
