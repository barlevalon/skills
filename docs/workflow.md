# Workflow guide

Use this as the map for which skill to reach for.

## Start a feature

1. **Shape the idea** with `write-a-prd` when the problem is still fuzzy.
2. **Stress-test the plan** with `grill-with-docs` when terminology, ADRs, or domain boundaries matter.
3. **Break work down** with `prd-to-plan` when a PRD needs tracer-bullet implementation phases.
4. **Prototype** with `prototype` when the state model, UI direction, or interaction is uncertain.

Good prompts:

```text
Write a PRD for this feature.
```

```text
Grill this plan against the repo's context and ADRs.
```

```text
Turn this PRD into a phased tracer-bullet plan.
```

## Implement or fix code

- Use `diagnose` for hard bugs, regressions, and unclear failures.
- Use `tdd` when changing behavior: one failing test, one implementation slice, then refactor.
- Use `worktrunk` when branch/worktree lifecycle matters.

Good prompts:

```text
Diagnose this failure before fixing it.
```

```text
Use TDD to implement this change.
```

```text
Create a worktree for this task with Worktrunk.
```

## Improve architecture

Use `improve-codebase-architecture` when the code works but the shape is fighting you: shallow modules, leaky seams, hard-to-test logic, or tangled dependencies.

```text
Find deepening opportunities in this repo.
```

## Review work

- Use `thermo-nuclear-code-quality-review` for strict maintainability review.
- Use `plannotator-visual-explainer` when a plan, diff, architecture, or table should be turned into an HTML visual explanation.
- Use `plannotator-compound` to analyze patterns in rejected/denied plans and improve future prompts.
- Use `plannotator-setup-goal` to turn an objective into a reviewed goal package.

Good prompts:

```text
Run a thermo-nuclear code quality review on this diff.
```

```text
Create a visual explainer for this architecture change.
```

```text
Analyze my denied plans and find recurring feedback patterns.
```

## Communicate and hand off

- Use `caveman` for concise responses.
- Use `caveman-commit` for commit messages.
- Use `handoff` when a session needs to be continued by a fresh agent.
- Use `zoom-out` when you need broader context before changing code.

Good prompts:

```text
Write a commit message for the staged diff.
```

```text
Hand this off to a fresh agent.
```

```text
Zoom out: how does this area fit into the repo?
```

## Write docs

Use `documentation-system` to classify and improve docs using the tutorial / how-to / reference / explanation split.

```text
Audit these docs using the documentation system.
```

## Prepare releases

Use `release-prep` for release notes, SemVer recommendation, validation, and approval-gated publishing plans.

```text
Prepare the next release and recommend the SemVer bump.
```

## Find more skills

Use `find-skills` when a task would benefit from a specialized skill that is not in this bundle.

```text
Find a skill for browser QA.
```
