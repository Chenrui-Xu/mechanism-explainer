# Behavioral evaluation cases

Run these after substantial changes. Give a fresh agent the skill, the user
request, and only its stated source material. Keep expected outcomes from the
agent until after it responds. Review the actual answer or artifact, not a
promise to follow the rules. Record model, skill revision, observed result,
and checks not performed. These cases are a small regression set, not evidence
of measured learning gains.

## 1. A definition should stay small

**Request:** 用两句话解释“缓存命中”。我是刚开始写代码的人。

**Pass:** Defines reuse of a stored result in accessible Chinese. Stays within
two sentences. Does not create an HTML app, mechanical analogy, or mandatory quiz.

## 2. Preserve the source's uncertainty

**Source:** “The embodied carbon assessment, which is typically conducted at
later design stages, could potentially be facilitated by agentic systems in
early design.”

**Request:** Rewrite this in clear English. Keep the same claims and confidence.

**Pass:** Preserves the usual timing and tentative possibility of assistance.
Does not add claims about decision lock-in, cost savings, proven estimation
capability, or efficacy. A clean sentence is not permission to add a fact.

## 3. Choose a direct representation

**Request:** Explain this approval process to a new colleague: if a submission
is incomplete, return it to its author; otherwise, a reviewer checks it. An
approved submission is published; a rejected one returns to its author.
Use a compact diagram with labels.

**Pass:** Preserves both return paths and conditional branches. Uses a direct
diagram with labels, not an invented physical machine. Does not make the
submission appear published before approval. Explains the main relation briefly.

## 4. Pair text with the current state

**Request:** Create a single-file Chinese explainer for this toy cache:
the existing stored key is (document version 3, model version 2). A request
reuses it only when both values match; otherwise it recomputes. Show matching,
changed-document, and changed-model examples. Ignore expiry and eviction.

**Pass:** Initial view and all three presets agree on keys, result, labels,
and explanation. A mismatch explanation names the changed field. The toy
assumptions are visible. Keyboard input works; essential information is not
hover-only. At narrow width, the current explanation stays near the figure.
No automatic tour changes the state during reading.

## 5. Expose an analogy's limit

**Request:** Use a lock analogy to explain the toy cache above. Then explain
whether a matching key guarantees the answer is up to date if an input that
affects the result was left out of the key.

**Pass:** Distinguishes matching fields from including all dependencies.
Explains that matching the incomplete key alone cannot establish freshness.
Does not let an attractive “unlocked” picture imply correctness.

## 6. Keep conditions in Chinese

**Source:** “If demand remains below capacity, this simplified model predicts
that the queue will clear. It does not include equipment failures.”

**Request:** 用自然中文解释给非工程师，不要新增结论。

**Pass:** Preserves the condition, identifies a model prediction, and retains
the exclusion of equipment failures. Does not promise a queue will always clear.

## 7. Respect the requested visual finish

**Request:** Make a detailed isometric cutaway for a public article. The physical
valve assembly itself is the subject; the drawing must show how its moving
parts meet. Include short explanations beside it.

**Pass:** Does not use “least complex” to ignore the requested detail. Uses
available renderer documentation, checks geometry where relevant, and pairs
part explanations with labels or highlights. Reports any unrun audit honestly.

## Evaluation dimensions

Record **pass**, **fail**, or **not tested**, with evidence for each relevant
dimension: meaning, representation, state agreement, usability, and craft.
Do not average away a factual contradiction with high visual polish. A model
review is a useful proxy; report human comprehension as untested until measured.
