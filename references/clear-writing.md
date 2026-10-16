# Clear writing without changing the claim

Use this reference when writing an explanation or revising its captions.
These are clarity guidelines inspired by Simplified Technical English (STE).
They are not ASD-STE100 certification rules, and “80% STE” is not a measured score.

## Preserve meaning first

Before shortening a statement, identify its actor, action, condition, scope,
quantity, time, and confidence. Keep those that the source supplies. Do not fill
in missing facts to make the sentence easier to write.

| Source | Faithful explanation | Meaning lost by this rewrite |
|---|---|---|
| It is possible that the request failed because the server timed out. | The request may have failed because the server timed out. | The server timeout caused the failure. |
| Retry only if the operation is idempotent and no response arrives within 5 seconds. | If no response arrives within 5 seconds, retry only if repeating the operation has the same effect. | Retry after 5 seconds. |
| The results are consistent with reduced latency, but do not establish a causal effect. | The results fit a reduction in latency. They do not establish that the change caused it. | The change reduced latency. |
| The record was removed. | The record was removed. | The agent removed the record. |
| Up to 4 requests can share a worker in this model. | This model allows at most 4 requests per worker. | Each worker runs 4 requests. |

Splitting a sentence can change which claim a qualifier applies to. If the
source leaves the scope of uncertainty unclear, keep the ambiguity visible or
resolve it from evidence. Prefer exact scope over a cleaner rhythm.

Keep “may,” “could,” “sometimes,” “only if,” “unless,” and negative statements
when they carry meaning. Remove repeated filler around a qualifier, not the
qualifier itself. Preserve time distinctions such as a completed action whose
result remains available. Keep passive voice if the actor is unknown.

## Write for the reader

1. State the answer before its supporting detail.
2. Use concrete verbs and name the subject when the source identifies it.
3. Keep one central idea per sentence and one topic per paragraph.
4. Use one term for one concept across prose, labels, controls, and accessible names.
5. Define a necessary technical term when it first matters. Keep its precise name.
6. Put a condition next to the action it controls. Show a sequence as steps.
7. Give a concrete example, with invented values marked as examples.
8. Keep the causal link. Do not split it away merely to shorten the sentence.

For English, aim for short sentences: about 20 words for an instruction and
25 for a description can reveal sentences worth revisiting. These are prompts
for review, not hard limits. A longer accurate sentence beats a shorter false one.

For Chinese, use natural clauses and explicit conditions. English word counts,
English verb lists, and the bundled English linter do not apply. For other
languages, adapt the clarity principles to that language; do not present an
English heuristic as a language-independent measure.

## Connect the wording to the figure

Write the claim and the visible evidence together. For each meaningful state,
tell the reader where to look, what changed, and what that change means.
Keep factual text tied to the same model state as the numbers and highlights.

An analogy needs its mapping and its limits. For example, a lock can illustrate
a cache-key comparison. It does not explain cache eviction or memory allocation.
A detailed machine cannot supply facts missing from the model.

## Optional English lint

The bundled upstream script checks some English writing patterns. It never
rewrites files. It uses regular expressions, not a grammar or meaning model.
Run from the repository root:

```sh
python3 vendor/ste/scripts/ste-lint.py --selftest
python3 vendor/ste/scripts/ste-lint.py --json path/to/english-copy.md
node --test tests/ste.test.mjs
```

Review the findings; do not make a zero count a publication requirement. The
upstream program calls some findings “hard” and returns exit 1 for them. Here,
that means “review these patterns,” not “the explanation is wrong.” In
particular, `check`, `verify`, and `validate` may name different actions in a
technical domain. Keep distinct terms if their meanings differ. Disable a rule
only after identifying why it does not apply:

```sh
python3 vendor/ste/scripts/ste-lint.py --json --disable synonym-rotation path/to/english-copy.md
```

The linter does not flag uncertainty as a writing defect. It still cannot detect
when a rewrite drops uncertainty, negation, a condition, a unit, or a causal
limit. Both a correct claim and its opposite can pass. Compare the explanation
with the source before accepting it. A clean report is not evidence of factual
accuracy, reader understanding, or ASD-STE100 compliance.

The regression cases exercise the tool's boundaries, including meaningful
uncertainty and a false rewrite that receives no findings. They are not tests
that an LLM will always preserve meaning.

## Source

This reference adapts meaning-preservation principles from
[danyuchn/asd-ste100-skill at commit 3944283](https://github.com/danyuchn/asd-ste100-skill/blob/3944283c183eea13fe5bd902b572da3b4de8bf44/SKILL.md).
The unmodified lint script and MIT notice are in [vendor/ste](../vendor/ste/README.md).
No official ASD-STE100 dictionary is included.
