---
name: caveman-commit
description: >
  Ultra-compressed commit message generator. Uses release-aware scoped commit
  subjects: scope-first by default, optional Conventional Commit type when it
  carries useful or project-required metadata. Cuts noise while preserving
  intent and reasoning. Use when user says "write a commit", "commit message",
  "generate commit", "/commit", or invokes /caveman-commit. Auto-triggers when
  staging changes.
---

Write commit messages terse and exact. Scope first. No fluff. Why over what.

## Format

Default subject:

```text
<scope>: <imperative summary>
```

Typed subject, when useful or required by project:

```text
<type>(<scope>): <imperative summary>
```

Breaking typed subject:

```text
<type>(<scope>)!: <imperative summary>
```

## Subject Rules

- Pick meaningful **scope** first: subsystem, user-facing area, domain concept, package, workflow, or module.
- Use imperative mood: "add", "fix", "remove" — not "added", "adds", "adding".
- ≤50 chars when possible, hard cap 72.
- No trailing period.
- Match project convention for capitalization after colon.
- Avoid file-location noise when domain scope is clearer.

## When To Use Type

Use plain scoped form when type adds no useful signal:

```text
env: show unknown runtime fields
backend: persist Slack intake before ACK
ci: skip Go checks for backend-only changes
```

Use Conventional Commit type when:

- project policy requires it
- release automation or changelog tooling still consumes it
- PR title will become squash commit and type helps reviewers
- TDD phase needs explicit signal: `test`, `fix`, `refactor`
- change is clearly `docs`, `ci`, `build`, `test`, `refactor`, `perf`, `revert`
- breaking change needs `!` / `BREAKING CHANGE:` trailer

Types:

```text
feat fix perf refactor docs test chore build ci style revert
```

Type is metadata, not substitute for good scope.

## Body Rules

Skip body when subject is self-explanatory.

Add body for:

- non-obvious why
- RED/GREEN/TDD evidence
- breaking changes
- security fixes
- data migrations
- reverts
- release commits
- linked issues/PRs when useful

Body rules:

- Wrap around 72 chars.
- Bullets use `-`.
- Explain why/risk/evidence, not line-by-line diff.
- Reference issues/PRs at end: `Closes #42`, `Refs #17`.

## What NEVER Goes In

- "This commit does X", "I", "we", "now", "currently" — diff shows what.
- "As requested by..." — use `Co-authored-by` trailer if needed.
- "Generated with Claude Code" or any AI attribution.
- Emoji unless project convention requires.
- Restating file name when scope already says it.

## Examples

Simple scoped:

```text
env: show unknown runtime fields
```

Typed because project/changelog wants feature metadata:

```text
feat(api): add GET /users/:id/profile

Mobile client needs profile data without the full user payload
to reduce LTE bandwidth on cold-launch screens.

Closes #128
```

TDD RED commit:

```text
test(env): cover missing runtime version

go test ./internal/env -run TestMissingRuntimeVersion
fails because unknown runtime fields are dropped.
```

TDD GREEN commit:

```text
fix(env): show unknown runtime fields

go test ./internal/env -run TestMissingRuntimeVersion
```

Breaking API change:

```text
feat(api)!: rename /v1/orders to /v1/checkout

BREAKING CHANGE: clients on /v1/orders must migrate to /v1/checkout
before 2026-06-01. Old route returns 410 after that date.
```

Release prep:

```text
release: v1.16.0

Validation:
- go test ./...
```

## Auto-Clarity

Always include body for breaking changes, security fixes, data migrations,
release prep, and reverts. Never compress these into subject-only — future
debuggers need context.

If project has its own commit-message policy, follow it over this global skill.

## Boundaries

Only generates the commit message. Does not run `git commit`, does not stage
files, does not amend. Output message as code block ready to paste.
"stop caveman-commit" or "normal mode": revert to verbose commit style.
