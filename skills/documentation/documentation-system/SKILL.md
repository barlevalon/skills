---
name: documentation-system
description: Apply Divio's four-quadrant documentation system to write, audit, classify, restructure, and review technical documentation. Use when creating or improving tutorials, how-to guides, reference docs, explanations, docs IA, README sections, docs plans, or when documentation feels mixed, bloated, incomplete, or hard to navigate.
metadata:
  source: https://docs.divio.com/documentation-system/
  framework: Divio Documentation System / Grand Unified Theory of Documentation
---

# Documentation System

Use Divio's documentation model: there is no single thing called documentation. There are four modes, each with one job:

| Mode | User need | Orientation | Form | Primary promise |
|---|---|---|---|---|
| Tutorial | "Help me start" | learning | lesson | beginner achieves something concrete |
| How-to guide | "Help me solve this" | goal | recipe | experienced user reaches a specific outcome |
| Reference | "Tell me exactly what this is" | information | description | machinery described accurately and consistently |
| Explanation | "Help me understand" | understanding | discussion | context, tradeoffs, and why become clear |

Keep modes separate. Mixing modes is usually the defect.

## Operating workflow

1. Identify reader state.
   - Newcomer learning? Tutorial.
   - User with a concrete goal? How-to.
   - User looking up API/CLI/config facts? Reference.
   - User asking why, context, design, tradeoffs? Explanation.
2. Pick exactly one primary mode per document.
3. Move off-mode material elsewhere or convert it into links.
4. Write in the mode's shape.
5. Review with the quadrant checklist.
6. If auditing existing docs, produce a split/merge plan before rewriting.

## Classification rules

Ask:

- Does title start with "How to ..." and answer a specific problem? `how-to`.
- Does it teach a beginner through a safe, meaningful first project chosen by the author? `tutorial`.
- Is it structured like code/API/CLI/config and only describes facts? `reference`.
- Does it discuss concepts, background, reasons, alternatives, or tradeoffs? `explanation`.

If more than one is true, classify by dominant user need, then extract the rest.

## Mode rules

### Tutorial

Use when the reader needs guided first success.

Must:
- Be a lesson, not a manual.
- Take responsibility for what the learner does and in what order.
- Use concrete steps with visible results quickly.
- Keep the path robust and repeatable.
- Prefer a meaningful small accomplishment over completeness.
- Include only minimum explanation needed to finish.
- Link to explanations/reference instead of embedding them.

Avoid:
- Detours, options, edge cases, abstractions, best-practice debates.
- Assuming expert judgment.
- Steps not tested end-to-end.

Template:

```md
# Build/Do <small meaningful thing>

In this tutorial, you will <concrete outcome>.

## Prerequisites
- <minimal known-good setup>

## 1. <First visible step>
<exact action>

Expected result: <what they should see>

## 2. <Next step>
...

## What you achieved
- <concrete accomplishments>

## Next steps
- <link to how-to/reference/explanation>
```

### How-to guide

Use when the reader has a specific goal and enough background to ask for it.

Must:
- Answer "How do I ...?"
- Start at a reasonable point, not from absolute zero.
- Provide ordered steps toward one practical result.
- Focus on outcome, not teaching.
- Allow limited adaptation for common variants.
- Leave out unrelated details.
- Link to explanation/reference for context and full facts.

Avoid:
- Beginner teaching.
- Conceptual essays.
- Exhaustive option catalogues.
- Vague titles like "Authentication" when "How to enable LDAP authentication" fits.

Template:

```md
# How to <achieve specific result>

Use this guide when <situation>.

## Prerequisites
- <assumed knowledge/setup>

## Steps
1. <action>
2. <action>
3. <action>

## Verify
<expected result/check>

## Variations
- If <case>, do <adjustment>.

## Related
- <reference/explanation links>
```

### Reference

Use when the reader needs accurate lookup information about machinery.

Must:
- Describe only.
- Mirror code/API/CLI/config structure where possible.
- Be complete, accurate, and consistent.
- Use stable headings and repeated field formats.
- Include examples only to illustrate usage.
- Record constraints, defaults, types, parameters, errors, side effects, compatibility.

Avoid:
- Teaching journeys.
- Task recipes beyond basic invocation/use.
- Background essays or rationale.
- Opinion unless clearly part of semantics/constraints.

Template:

```md
# <API/command/module/config name>

Brief factual description.

## Signature / Syntax
`<exact form>`

## Parameters / Options / Fields
| Name | Type | Required | Default | Description |
|---|---:|---:|---:|---|

## Returns / Output
<facts>

## Behavior
<rules, constraints, side effects>

## Errors
| Error | Cause | Notes |
|---|---|---|

## Examples
<minimal illustrative examples>

## See also
- <how-to/explanation links>
```

### Explanation

Use when the reader needs context, reasons, or a bigger mental model.

Must:
- Clarify and illuminate a topic.
- Discuss why things are as they are.
- Compare alternatives and tradeoffs.
- Include background, history, constraints, design rationale.
- Be readable away from code/task pressure.

Avoid:
- Ordered task instructions.
- API catalogues.
- Pretending an opinion is a fact.
- Making the reader hunt through essays for operational steps.

Template:

```md
# Understanding <topic>

<Short framing: why this topic matters.>

## Context
<background and problem space>

## Mental model
<core concepts and relationships>

## Why it works this way
<constraints, decisions, history>

## Alternatives and tradeoffs
<option A vs B, when each matters>

## Consequences
<practical implications without step-by-step instructions>

## Related
- <tutorial/how-to/reference links>
```

## Audit checklist

For each document, report:

```md
## Documentation audit: <doc>

Primary mode: tutorial | how-to | reference | explanation
Reader need: <need>
Pass/fail: <summary>

### Off-mode material
- <section>: belongs in <mode> because <reason>

### Missing material
- <needed doc/section>: <mode> because <reason>

### Proposed structure
- <keep>
- <move/split>
- <rewrite>

### Immediate edits
1. <smallest valuable edit>
2. <next edit>
```

## Writing output contract

When asked to write docs:

1. State selected mode in one line.
2. Write the doc in that mode.
3. Add "Related docs" links/stubs for displaced modes.
4. Do not mix modes to be helpful. Link instead.

When asked to plan docs IA:

```md
docs/
  tutorials/
    <lesson>.md
  how-to/
    how-to-<goal>.md
  reference/
    <api-or-component>.md
  explanation/
    <concept>.md
```

Smaller projects may omit empty quadrants, but keep labels and intent clear when material exists.

## Review gates

Reject or revise if:
- Tutorial has untested or invisible-result steps.
- How-to lacks a specific goal.
- Reference explains rationale instead of describing facts.
- Explanation contains command sequences users must follow.
- One document tries to be all four modes.

Use this final note when helpful: "This content is useful, but belongs in <mode>, not here. Link it."
