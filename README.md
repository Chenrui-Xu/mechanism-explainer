# Mechanism Explainer

**Explain how things work with clear writing, interactive diagrams, and detailed SVG illustrations.**

An agent skill that connects the words, the picture, and the model. Change a value
and the diagram, readout, and explanation update together. Use it to explain
software behavior, physical systems, and technical ideas while preserving the
conditions and limits that make the explanation true.

[**Try the live examples**](https://chenrui-xu.github.io/mechanism-explainer/)
· [Read the skill](SKILL.md)
· [Download a release](https://github.com/Chenrui-Xu/mechanism-explainer/releases/latest)
· [MIT License](LICENSE)

```sh
npx skills add Chenrui-Xu/mechanism-explainer
```

[![A spring balance with controls, a displacement readout, and an adjacent explanation](docs/spring-balance.png)](https://chenrui-xu.github.io/mechanism-explainer/spring-balance/)

## Try it

| Example | What to change | What to look for |
|---|---|---|
| [Spring balance](https://chenrui-xu.github.io/mechanism-explainer/spring-balance/) | Double force or stiffness | The Anatomy drawing, extension, and explanation agree. |
| [Cache key](https://chenrui-xu.github.io/mechanism-explainer/cache-key/) | Change a document or model version | The highlighted mismatch explains why the cached result cannot be reused. |
| [Queue walkthrough](https://chenrui-xu.github.io/mechanism-explainer/paired-template/) | Advance one step; hover or focus a named part | Text and shapes highlight together as the state changes. |

These are small educational models with visible assumptions, not simulations
of every detail. Each example is a standalone HTML file with no external assets.

## How the three parts work together

| Part | What it contributes | What this skill adds or changes |
|---|---|---|
| **STE-inspired writing** | Clear sentences, stable terms, and preservation of conditions and uncertainty; an optional English checker from [asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill) | Preserve meaning before shortening a sentence. English word counts are not universal rules. |
| **[Visual Explainer](https://github.com/nicobailon/visual-explainer)** | Linked text and figure emphasis, step-by-step explanations, and shared model state | A reusable [paired explanation module and template](assets/paired-explainer/) with keyboard support and useful static content. |
| **[Anatomy](https://github.com/wheresryan22/anatomy)** | Solid SVG geometry, isometric projection, shading, mechanical parts, and drawing checks | The actual [SVG core is bundled](vendor/anatomy/). Use physical illustrations when they explain the mechanism; allow useful labels and choose detail by purpose. |

The workflow starts with the reader's question and a one-sentence answer. It then
chooses prose, a table, a diagram, or a physical illustration. For interactive
work, one model drives the graphic, readout, and current explanation. Checks
cover agreement between those outputs as well as layout and operation.

The skill does not require every answer to become a machine or an application.
Anatomy's WebGL, true 3D engine, React wrappers, and community publishing are
outside this bundle. No separate Anatomy installation is needed for the
included SVG examples.

Repository content and examples are in English. Generated explanations default
to English unless the user explicitly requests another language. Adapt clarity
rules to that language; English word counts and the bundled English checker do
not apply to every language.

## Install as a skill

The [skills CLI](https://github.com/vercel-labs/skills) discovers the root
`SKILL.md` and lets you select your agent and installation scope:

```sh
npx skills add Chenrui-Xu/mechanism-explainer
```

For a manual installation, use the instructions below.

The repository root is the skill folder: it contains `SKILL.md`. Clone or copy
**the whole repository** into the skills directory supported by your agent,
with the folder name `mechanism-explainer`. Keep `assets/`, `references/`, and
`vendor/` beside `SKILL.md`; copying only that file omits the integrated tools.

```sh
# Replace the example destination with your agent's actual skills directory.
git clone https://github.com/Chenrui-Xu/mechanism-explainer.git /path/to/your/skills/mechanism-explainer
```

The instructions are plain Markdown and do not depend on a particular agent
runtime. Follow your agent's normal skill-discovery or reload procedure. Reading
and applying the guidance requires no package installation. Building examples,
running the checker, and running browser tests have the requirements below.

## Use

```text
Use $mechanism-explainer to explain how this cache key controls reuse.
Assume the reader knows basic programming. Preserve the conditions in my source.
Show what changes when one key field differs, and explain the analogy's limits.
```

```text
Use $mechanism-explainer to explain how spring stiffness affects extension.
Start with one sentence that answers the question. Let me change force and stiffness.
Keep the drawing, values, and explanation tied to the same state.
State the linear model's limits and identify its values as educational examples.
```

Use the invocation syntax your agent supports. You can also ask it to read
`SKILL.md` directly and follow its workflow.

## Examples and reusable pieces

- [Cache key](examples/cache-key/index.html): an English explanation with matching,
  changed-document, and changed-model states. [Source and model](examples/cache-key/).
- [Spring balance](examples/spring-balance/index.html): an Anatomy SVG figure with
  force, stiffness, displacement, and an adjacent explanation. [Build source](examples/spring-balance/build.mjs).
- [Paired starter](assets/paired-explainer/index.html): a queue example with linked
  text and shapes, previous/next controls, a step slider, and a static summary.
  Adapt the [template](assets/paired-explainer/template.html) and
  [module](assets/paired-explainer/paired-explainer.mjs) for another concept.

The built HTML pages are standalone and have no external assets. Use the
[live gallery](https://chenrui-xu.github.io/mechanism-explainer/), download the
repository and open the HTML locally, or run the preview server below. A GitHub
file page shows source; it does not run the example.

## Build and check

Use Node.js 20.10 or later and Python 3.8 or later. Node.js 22 or later is
recommended for the bundled Anatomy browser tools. Python runs the optional
English checker and its regression tests; it needs only the standard library.

```sh
npm ci
npm run build
npm test
npm run validate
npx playwright install chromium
npm run test:browser
npm run preview
```

`npm run preview` serves the built examples at `http://127.0.0.1:4173`.
Build the static gallery with `npm run build:site`; its output is `_site/`.
The paired starter can also be rebuilt directly:

```sh
node assets/paired-explainer/build.mjs
```

The tests cover model calculations, state transitions, source integrity, and
selected browser behavior. Browser checks inspect desktop and narrow layouts,
controls, fallback content, and output agreement. Read the
[behavioral evaluation cases](evals/cases.md) when changing the skill's workflow.
The [release check record](evals/release-checks.md) separates the current revision
from historical v0.1.0 evidence and states the tested scope.
An automated pass does not establish factual accuracy, complete accessibility,
or improved learning; review the source claims and the rendered explanation.

For English prose, optionally run:

```sh
python3 vendor/ste/scripts/ste-lint.py --json path/to/english-copy.md
```

The checker is read-only and reports heuristic findings. Its nonzero status is
a prompt for review, not a release requirement. It can flag valid terminology
and cannot detect lost meaning. The checker is for English only. This project
includes no official ASD-STE100 dictionary and makes no STE-compliance claim.
See [clear writing](references/clear-writing.md) for examples and limitations.

## Contribute

Include the explanation that fails, the intended reader, and the improved
output. For code changes, run the build, tests, and validation above. For writing
or workflow changes, use a relevant behavioral case and compare meaning before
and after. Keep a limitation visible when hiding it would change the main claim.

Keep repository documentation, source text, bundled example interfaces, and
preview screenshots in English. The validator checks distributed text and HTML
language declarations. Generated explanations default to English; an explicit
user request can select another language.

Original work is copyright (c) 2026 Mechanism Explainer contributors under the [MIT License](LICENSE).
The three upstream projects retain their MIT notices and pinned provenance;
see [ATTRIBUTION.md](ATTRIBUTION.md) and the
[source comparison](references/public-sources.md). This project is independent
and does not imply endorsement by those projects or the ASD-STE100 maintainers.
