# Release checks

This records implementation checks and an agent trial,
not a human learning study or a guarantee about future generated explanations.

## v0.2.0: Mechanism Explainer

Checked on 2026-10-16. The project is now named Mechanism Explainer, with the
skill identifier `mechanism-explainer`. Public documentation, examples, images,
and release notes use English. Generated explanations also default to English;
an explicit request for another output language overrides that default.

- All three examples rebuilt with the new name.
- All 19 unit tests and 13 Chromium browser tests passed.
- Desktop and phone screenshots of the renamed spring example were inspected;
  the README preview was refreshed from the desktop capture.
- The gallery was checked in Chromium at 1280, 390, and 320 px: its image loaded,
  all three relative example routes returned 200, and there was no horizontal
  overflow or page error. Desktop and phone screenshots were inspected.
- Skill format, 63 distributable files, local links, English-content checks,
  and all recorded unmodified upstream file hashes passed validation.
- A fresh agent, without inherited context or expected outputs, read isolated
  copies of the skill and its clear-writing resource. It handled three requests:
  a prompt in another language produced two English sentences; an explicit
  language request was honored; and an English rewrite retained an unknown
  actor, a condition, uncertainty, and the limit on causal interpretation.

This was one agent given three requests together. Its harness required prose
responses and prohibited creating applications, so it did not independently
test format selection. It was not a human study or reliability measurement.
The source hashes tested were:

- `SKILL.md`: `f6f26971e271560419837114b87bf9c8907307042fb36fd97adc0aee6a5b7da0`
- `references/clear-writing.md`: `b2f3b4ef0713df3d489ce663a6d6a27d3eaf8d6a67398c87a9d51be1f7cd348d`

The earlier v0.1.0 public release and its screenshot artifacts were withdrawn.
Development history remains intact; the historical trial below is retained as
historical evidence, not relabeled as English work.

## v0.1.1: English-content revision

This revision changes maintained documentation, example interfaces, source text,
and preview images to English. The skill continues to follow the reader's
requested language when it generates an explanation. The three upstream
revisions remain unchanged.

The repository validator now checks distributed text for Han characters and
checks HTML language declarations. The README documents this release convention.
That language check is a release-content check, not a measure of writing quality
or proof that every string is English.

Re-run on 2026-10-16 after the English conversion:

- All three standalone examples rebuilt successfully.
- Skill format, local links, English-content checks, and upstream hashes passed.
- All 19 unit tests and 13 Chromium browser tests passed.
- Desktop and 390 px screenshots of the translated examples were inspected.
  English labels, controls, and state explanations fit without horizontal overflow.
- The README preview image was replaced with the English spring example.

The results below retain the separate v0.1.0 history. The independent agent
trial was not repeated for this translation-only revision.

## v0.1.0: historical implementation checks

Checked on 2026-10-16, before the English-content revision.

| Check | Result and scope |
|---|---|
| Skill format | Official skill-creator quick validator passed |
| Resources and provenance | Local links resolve; all copied upstream files match recorded hashes; three upstream commits and MIT notices are present |
| Unit suite | 19 tests passed, including the upstream English checker self-test, cache conditions, step state, linked references, and preview allowlist |
| Spring model | The unit suite exercises all 525 selectable force/stiffness combinations, SI conversion, invalid input, and meaningful comparisons |
| Browser suite | 13 Chromium tests passed at 1280 px and 390 px where applicable |
| Visual review | Desktop and mobile screenshots of the three bundled pages were inspected; spring mobile order is figure → explanation → controls |
| Build | Three standalone HTML files rebuild from local source with no runtime network dependencies |

Browser tests check controls, visible keyboard focus, shared text/number/graphic
updates, preset and boundary states, reference highlighting, narrow layout,
no-JavaScript content, and reduced-motion operation. The paired starter also
checks its print summary. The loaded pages make no external requests and report
no JavaScript or console errors in the tested states.

The tests caught and prompted fixes for stale example numbers, mobile reading
order, misleading enabled controls without JavaScript, screenshot output paths
containing spaces, and malformed requests to the local preview server.

Run the commands in [README](../README.md#build-and-check). GitHub Actions repeats
the implementation checks on Linux and uploads browser screenshots. The release
preview is generated from a local browser screenshot; the image in the current
repository is updated for the English-content revision.

## v0.1.0: historical independent skill trial

A separate agent received an isolated copy of the v0.1.0 skill and three requests. It
read the skill and its routed resources, without the existing evaluation cases
or test files. The trial checked these behaviors:

1. A two-sentence Chinese cache-key definition stayed as prose and gave a
   concrete example; it did not build an unnecessary application.
2. A simplified English rewrite kept an unknown actor unknown, retained the
   noncausal interpretation of results, and preserved both retry conditions.
3. A new Chinese water-tank explanation used the shipped paired runtime with a
   new model and renderer. Its volume states were 3 L → 5 L → 4 L. Geometry,
   readout, equation, and explanation came from one view model, and its physical
   assumptions were explicit.

The new artifact passed 11 non-browser checks, including execution of its
generated JavaScript with a small DOM adapter and independent arithmetic
checks. Its build succeeded from outside its output directory. No resource
path failed. The trial found an ambiguous source entry point; `SKILL.md` now
distinguishes the editable template/build script from the generated preview.

This is a functional agent trial. It does not show how well people learn from
the outputs. The new water-tank output is separate from the three maintained
release examples; its checks do not expand the browser-suite claims above.
The Chinese-language trial outputs are historical evidence. They are not bundled
as v0.1.1 examples and were not relabeled as English outputs.

## Limits of this check

No formal ASD-STE100 certification, real assistive-technology user test, human
comprehension study, or manufacturing geometry audit was performed. The English
checker can accept a false rewrite; meaning still requires source comparison.
The bundled Anatomy subset provides SVG drawing tools, not its complete WebGL
or true 3D stack.
