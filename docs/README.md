# Docs

## Read these first

- [Setup](setup.md) — installer-first setup for supported agent harnesses.
- [Workflow map](workflow.md) — choose the right skill for the job.
- [Skill reference](usage.md) — full skill list and invocation examples.

## Mental model

A skill is not an app you run. It is a reusable procedure for an agent.

Each skill lives in a folder:

```text
skills/<category>/<skill>/SKILL.md
```

`SKILL.md` gives the agent the workflow. Optional `references/`, `scripts/`, and `assets/` are loaded only when needed.

That is the same progressive-disclosure pattern used by modern agent skill systems: small discovery metadata first, detailed instructions only when relevant, supporting files only on demand.

## Maintainers

- [Release process](release.md)
