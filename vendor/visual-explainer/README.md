# visual-explainer provenance

The paired explanation layer adapts the linked highlighting, reader-controlled
stepper, shared live-model, layout, and fallback patterns from
[nicobailon/visual-explainer](https://github.com/nicobailon/visual-explainer),
pinned to commit `69cd7395cee2979aa7301ebe51bb4c2ba5f5ef9e`.

The upstream project is MIT licensed, Copyright (c) 2025 Nico Bailon.
Its unchanged [LICENSE](LICENSE) is included here. [SOURCES.json](SOURCES.json)
records the exact URLs and SHA-256 hashes of the files reviewed. The source
snapshots are not bundled; the adapted code lives in
[`assets/paired-explainer`](../../assets/paired-explainer/).

The integration makes these deliberate changes:

- The `data-ref` contract remains; delegated events support content replaced by
  a renderer. Keyboard focus persists when the pointer leaves another element.
- The sequence is a pure bounded controller. Rendering uses one state object;
  controls advance only on reader action. There is no player or autoplay timer.
- Text remains visible while related elements gain a thicker underline or
  dashed outline. Other labels do not fade.
- The starter uses local system fonts, inlined CSS and JavaScript, and no CDN.
- Static HTML contains the initial state and a text account of every state.
  Print retains the current state and that account without changing app state.
- On narrow screens, each visual is followed by its explanation and controls.
- Prose length, tables, uncertainty, and exact values are chosen for the subject.
  The integration does not adopt upstream quotas for figures or numerical charts,
  nor its blanket removal of hedging language.

The queue model, build code, state-machine tests, and paired-module API are new
integration work. The original visual-explainer authors have not endorsed this
project. This directory is attribution and provenance, not a second active skill.
