# Public sources and integration choices

The v0.2.0 integration retains the three public sources pinned for v0.1.0. This is a
record of source reuse and design choices, not a benchmark of learning outcomes.
Exact file paths, license notices, and hashes are recorded in the linked manifests.

| Source | Contribution shipped here | Integration choice |
|---|---|---|
| [danyuchn/asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill/tree/3944283c183eea13fe5bd902b572da3b4de8bf44) | Unmodified English lint script, plus adapted meaning-preservation guidance | Preserve conditions, uncertainty, negation, quantities, time, and unknown actors. Treat lint findings as review prompts. |
| [nicobailon/visual-explainer](https://github.com/nicobailon/visual-explainer/tree/69cd7395cee2979aa7301ebe51bb4c2ba5f5ef9e) | Adapted paired-page template, linked text/figure highlighting, and stepper module | Keep the current explanation next to the visual. Use the same model state for claims, values, and highlights. |
| [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy/tree/e9488296a44211c42701ff71705b7901470ec78f) | Twelve unmodified files: license, SVG geometry kit, and browser-check tools | Use physical illustrations where they explain a mechanism. Permit helpful labels and choose detail by purpose. |

## How they combine

Writing establishes the claim and its conditions. The paired-page layer connects
that claim to visible evidence and user actions. Anatomy supplies one rendering
option when the concept benefits from physical form, depth, or mechanical motion.
A direct diagram, chart, table, or prose remains available when it serves the
reader better.

Visual Explainer already provides coordinated prose, figures, and state-driven
explanations. Its pinned
[diagram reference](https://github.com/nicobailon/visual-explainer/blob/69cd7395cee2979aa7301ebe51bb4c2ba5f5ef9e/plugins/visual-explainer/references/diagrams.md)
and [page template](https://github.com/nicobailon/visual-explainer/blob/69cd7395cee2979aa7301ebe51bb4c2ba5f5ef9e/plugins/visual-explainer/templates/page.html)
are sources for this integration. The project combines those established
patterns with explicit meaning checks and an included Anatomy SVG renderer.

The buildable [spring-balance example](../examples/spring-balance/) exercises
all three concerns: clear claims, state-linked explanation, and an Anatomy
figure. The [cache-key example](../examples/cache-key/) uses a simpler diagram,
and the [paired starter](../assets/paired-explainer/) exposes reusable interaction
primitives. No separate upstream installation is needed for these components.

## Resolve conflicts rather than accumulate rules

- Keep a necessary condition or qualifier even if it makes a sentence longer.
- Use English word-count guidance only for English. Keep natural Chinese clauses.
- Explain cause and limits in prose; use the figure to show relationships and change.
- Allow labels, anchors, and arrows when their meaning is clear and consistent.
- Use a physical analogy only when its mapping holds, and state where it fails.
- Choose the number of parts by explanatory purpose and requested finish.
- Give readers explicit control over guided steps. Preserve useful static content.
- Check text/model agreement separately from drawing geometry and visual polish.

## Scope and records

The writing checker does not validate factual meaning or certify ASD-STE100
compliance. The official standard and dictionary are not included. The Anatomy
subset excludes WebGL, the true 3D runtime, React wrappers, and community
publishing. The adapted paired module is a focused implementation rather than
a copy of Visual Explainer's full plugin.

See [attribution](../ATTRIBUTION.md) for the retained MIT notices and division
between upstream material and original contributions. Source records:

- [STE source and hashes](../vendor/ste/upstream.json)
- [Visual Explainer sources and adaptations](../vendor/visual-explainer/SOURCES.json)
- [Anatomy source and hashes](../vendor/anatomy/MANIFEST.json)
