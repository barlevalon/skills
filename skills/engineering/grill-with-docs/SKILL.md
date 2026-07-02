---
name: grill-with-docs
description: Grilling session that challenges plans against the existing domain model, sharpens terminology, and updates CONTEXT.md/ADRs inline as decisions crystallise.
---

# Grill With Docs

Compose two reusable disciplines:

- **grilling** — interview the user relentlessly about a plan or design until every branch of the decision tree is resolved.
- **domain-modeling** — keep the project's domain language and architectural decisions current as the grilling session reveals them.

Use this when the user wants to stress-test a plan against the project's language, constraints, and documented decisions.

## Process

### 1. Load domain context

Before asking design questions, inspect the project's domain docs when present:

- `CONTEXT-MAP.md` for multi-context repos
- root or context-local `CONTEXT.md`
- relevant ADRs under `docs/adr/`

If no context docs exist, do not create them yet. Create files lazily only when a real term or decision crystallises.

### 2. Run the grilling loop

Apply the grilling discipline:

- Ask one question at a time.
- Provide your recommended answer with each question.
- Walk the design tree by dependencies: resolve prerequisite decisions before downstream ones.
- If a question can be answered by inspecting the codebase, inspect the codebase instead of asking.
- Continue until the plan is concrete enough to implement or the user decides to stop.

Do not dump a questionnaire. One branch, one question, one answer.

### 3. Maintain the domain model inline

Apply the domain-modeling discipline during the conversation:

- If the user uses a term that conflicts with `CONTEXT.md`, call it out immediately and ask which meaning is correct.
- If the user uses vague or overloaded language, propose a precise canonical term.
- Use concrete scenarios to probe edge cases and force boundary decisions.
- Cross-reference code when claims about current behavior are uncertain.
- When a term is resolved, update the appropriate `CONTEXT.md` immediately.

`CONTEXT.md` is a glossary, not an implementation spec. It should contain domain concepts, not implementation details.

Use the format from the domain-modeling skill's `CONTEXT-FORMAT.md` when available.

### 4. Offer ADRs sparingly

Offer an ADR only when all are true:

1. **Hard to reverse** — changing later has meaningful cost.
2. **Surprising without context** — a future reader would wonder why.
3. **Real trade-off** — there were genuine alternatives.

Frame it as:

> Want me to record this as an ADR so future agents do not re-litigate it?

Use the format from the domain-modeling skill's `ADR-FORMAT.md` when available.

## Output

End with:

- resolved decisions
- remaining open questions
- changed docs, if any
- next implementation step, if clear
