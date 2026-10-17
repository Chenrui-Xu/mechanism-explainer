---
name: mechanism-explainer
description: Explain technical ideas with clear prose and coordinated diagrams or interactive models. Use for teaching mechanisms, tracing processes, or making an existing visual explanation easier to understand. Choose prose alone when a visual adds no value.
license: MIT
---

# Mechanism Explainer

Help the reader explain why something happens and predict what happens next.
Choose the representation around that learning goal. Visual polish supports it.

This skill includes a STE style checker, an adapted visual-explainer template,
and the Anatomy SVG drawing core. No other installed skill is required.
Resolve resource paths relative to this skill's directory, not the user's project.

## Start with the explanation

Infer the reader's background and intended use from the request. Use English
for explanations and artifacts unless the user explicitly requests another
output language. Do not infer publication language from conversation language.
Ask only when missing information would change the answer substantially.
For a short answer, keep this planning internal.

Before drawing, identify:

- **Question:** What should the reader be able to explain or decide?
- **Takeaway:** What is the answer, in one direct sentence?
- **Mechanism:** What causes what, under which conditions?
- **Evidence:** Which facts are supplied, sourced, derived, or assumed?
- **Boundary:** Where would this explanation or analogy stop working?

Preserve quantities, units, negation, scope, conditions, and uncertainty from
the source. Do not turn “may help” into “will work” to make a sentence cleaner.
Keep an unresolved fact unresolved. Label invented example values as examples.
Do not invent an actor, obligation, or cause to turn passive prose into active
prose. Retain the passive when the source does not identify who acts.

For a multi-state explanation, make a small working table before implementation:

| Claim | Source or assumption | Visible evidence | Reader action | Explanation at that state |
|---|---|---|---|---|
| What is true? | Why do we believe it? | What shows it? | What changes it, if anything? | Why did that happen? |

Omit unnecessary columns for a static explanation. The table is a planning aid,
not mandatory material in the final answer.

## Select a useful form

Honor the user's requested format. Otherwise use the least complex form that
lets the reader see the important relationship.

| Reader's problem | Useful starting form |
|---|---|
| A definition, conclusion, or short argument | Prose and a concrete example |
| Comparing alternatives or checking exact values | Table or chart |
| Following dependencies, branches, or information flow | Labeled diagram |
| Understanding shape, assembly, force, or spatial movement | Physical illustration or cutaway |
| Predicting outcomes after changing an input | Interactive model |
| Following a timed process | User-controlled steps; add animation if timing matters |

These are choices, not a ladder of quality. A video is optional when requested
or when time and narration are essential; pair it with a transcript and a still
summary. Do not turn a simple question into an application.

Use a physical analogy only if its behavior preserves the important relation.
Map each important part to a concept and state a relevant mismatch. If the
analogy needs more explanation than the concept, use a direct representation.

For an isometric mechanical figure, read [the Anatomy adapter](references/anatomy-adapter.md).
For the page and interaction contract, read [paired explanations](references/paired-explanations.md).
For a guided explanation, adapt [the template source](assets/paired-explainer/template.html)
and its [build script](assets/paired-explainer/build.mjs); preview the generated
[standalone page](assets/paired-explainer/index.html). See [cache-key comparison](examples/cache-key/index.html) for a
discrete model and [spring balance](examples/spring-balance/index.html) for an
Anatomy illustration driven by continuous inputs. Their adjacent build scripts
produce standalone HTML files.

## Write the text with the visual

Read [clear writing](references/clear-writing.md) for meaning-preserving edits,
language-specific guidance, and the optional English style checker.

Lead with the answer. Use concrete verbs, stable terms, and sentences with a
clear subject. Introduce necessary technical terms when they first matter.
Keep the causal link, even when that requires a longer sentence.

Honor an explicitly requested output language. Adapt sentence structure to that
language; do not apply an English word-count threshold to other languages.
In English, short sentences are useful guidance, not a compliance score. This skill does not
certify ASD-STE100 compliance or use a percentage as a quality metric.

Write the explanation while defining the scene, not after finishing the art:

- Tell the reader **where to look**, **what changed**, and **why it matters**.
- Keep the current explanation adjacent to the relevant visual or control.
- Use the same term in the label, control, explanation, and accessible name.
- Allow short labels, numbered anchors, and arrows when they clarify meaning.
  Use arrows for a defined relation, such as data flow or force, consistently.
- Let the image show geometry or change. Let the text explain cause, conditions,
  and limitations. Avoid making both channels repeat an entire description.

Do not impose a minimum part count. Add detail that identifies a real component,
reveals an interaction, or meets the user's requested visual finish. Keep
essential parts readable at the final display size.

## Implement one coherent state

For an interactive artifact, derive geometry, labels, numeric outputs, and
state-specific text from the same model state. Use a pure calculation function
where it reduces the chance of disagreement. Keep decorative animation separate
from the factual result; easing must not invent intermediate categorical states.

Provide useful initial content before interaction. Start guided explanations
paused. Give the reader explicit controls for steps, reset, or exploration as
needed. Do not restart a tour while the reader is inspecting a result.

Expose essential information without hover. Use keyboard-operable controls,
visible focus, and meaningful accessible names. Do not encode a difference with
color alone. Retain a readable text explanation if graphics or JavaScript fail.
Reduced motion must preserve the mechanism through steps or still states.

At a narrow viewport, place the current explanation immediately after the
visual it describes. Avoid putting all illustrations above all explanations.

## Verify the explanation, then the finish

Check what actually matters for the selected form:

1. **Meaning:** Does the takeaway follow from the sources? Are assumptions and
   analogy limits visible? Did simplification change certainty or omit a condition?
2. **Agreement:** Do text, labels, numbers, and highlights agree in the initial,
   changed, boundary, and reset states? Test applicable states, not invented ones.
3. **Use:** Inspect the entire explanation, including captions, at desktop and
   narrow widths. Check keyboard access, focus, and reduced motion when relevant.
4. **Understanding:** Can a fresh reader answer the original question and predict
   a nearby case? If using a model reviewer, call it a proxy, not a human study.
5. **Craft:** Inspect readability, overlap, occlusion, motion, and performance
   proportionally to the artifact. Use renderer-specific checks when applicable.

If meaning is wrong, fix it before adding visual detail. A geometry audit does
not establish explanatory accuracy. A screenshot does not prove understanding.

Use [evaluation cases](evals/cases.md) when changing this skill substantially.
For a brief response, these checks can stay internal. Do not force a quiz or a
review checklist into every answer. For consequential review, surface only the
few unresolved claims the user needs to verify, with a concrete way to do so.

## Deliver

Give the main takeaway and the artifact or answer. State material assumptions
and any checks that remain incomplete. Separate measured results from expected
benefits; do not claim this skill improves learning without a reader evaluation.

Keep outputs local unless publication is requested. If publication is requested,
follow the user's chosen destination and retain the notices for reused work.
