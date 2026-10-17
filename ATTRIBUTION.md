# Attribution and provenance

Mechanism Explainer integrates three public MIT-licensed projects. The source
revisions below were pinned for v0.1.0 and remain unchanged in v0.2.1.
Unmodified files retain their upstream
notices; adapted components identify their source and the integration changes.

## STE-inspired writing and checker

- Upstream: [danyuchn/asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill).
- Revision: [`3944283c183eea13fe5bd902b572da3b4de8bf44`](https://github.com/danyuchn/asd-ste100-skill/tree/3944283c183eea13fe5bd902b572da3b4de8bf44).
- Notice: **Copyright (c) 2026 Dustin Yuchen Teng**.
- License: [MIT notice](vendor/ste/LICENSE).
- Record: [vendor/ste/upstream.json](vendor/ste/upstream.json), including SHA-256 hashes.

`vendor/ste/scripts/ste-lint.py` is copied without modification. The original
license is also copied without modification.
[Clear writing](references/clear-writing.md) adapts the upstream principles of
preserving conditions, scope, confidence, and unknown actors. It treats English
lint findings as review prompts and adds language-specific guidance for Chinese.

This repository does not include the official ASD-STE100 standard or dictionary.
It does not certify compliance with that standard. The checker tests writing
patterns, not truth, semantic equivalence, or reader understanding.

## Visual Explainer

- Upstream: [nicobailon/visual-explainer](https://github.com/nicobailon/visual-explainer).
- Revision: [`69cd7395cee2979aa7301ebe51bb4c2ba5f5ef9e`](https://github.com/nicobailon/visual-explainer/tree/69cd7395cee2979aa7301ebe51bb4c2ba5f5ef9e).
- Notice: **Copyright (c) 2025 Nico Bailon**.
- License: [MIT notice](vendor/visual-explainer/LICENSE).
- Record: [vendor/visual-explainer/SOURCES.json](vendor/visual-explainer/SOURCES.json), with reviewed paths, hashes, and adaptation paths.

The linked-highlighting, stepper, page-layout, and shared-model patterns are
adapted from the upstream skill, diagram reference, page template, and style
guide. They are implemented here in:

- [paired-explainer.mjs](assets/paired-explainer/paired-explainer.mjs)
- [paired-explainer.css](assets/paired-explainer/paired-explainer.css)
- [template.html](assets/paired-explainer/template.html)
- [paired explanations](references/paired-explanations.md)

These are adapted integration files, not an unchanged copy of the full upstream
plugin. The upstream MIT license is retained. Coordination between prose and
visuals is an existing Visual Explainer capability; this project does not claim
to invent it.

## Anatomy SVG core

- Upstream: [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy).
- Revision: [`e9488296a44211c42701ff71705b7901470ec78f`](https://github.com/wheresryan22/anatomy/tree/e9488296a44211c42701ff71705b7901470ec78f).
- Notice: **Copyright (c) 2026 Ryan**.
- License: [MIT notice](vendor/anatomy/LICENSE).
- Record: [vendor/anatomy/MANIFEST.json](vendor/anatomy/MANIFEST.json), including SHA-256 hashes.

The 12 files listed in the manifest are copied without modification and were
verified against that upstream commit. They comprise the license, six SVG kit
files, and five browser-check scripts. This subset provides geometry, projection,
shading, parts, and drawing checks. It does not bundle the full upstream skill,
examples, WebGL, 3D runtime, React wrappers, or gallery-publishing tools.

The [Anatomy adapter](references/anatomy-adapter.md) changes presentation defaults:
use labels when they help, choose detail by explanatory purpose, and give the
reader control over guided sequences. The spring-balance example is original
work that uses the bundled kit; it is not an upstream Anatomy example.

## Original integration work

The combined skill workflow, integration-specific documentation, evaluation
cases, tests, cache-key example, and spring-balance example were prepared for
this project. Original contributions and adaptation changes are copyright
(c) 2026 Mechanism Explainer contributors under the repository's [MIT License](LICENSE). This notice
does not replace upstream copyright notices for reused work.

The project began with a request to combine the ideas of the local
`karpathy-ste100-explain` and `anatomy` skills. The local Karpathy skill's text
is not redistributed. The shipped writing component uses the public source
identified above; the release does not depend on a private skill installation.

Keep the relevant upstream notice and provenance record when redistributing a
vendored or adapted component. The project is independent and does not imply
endorsement by its sources or the ASD-STE100 maintainers.
