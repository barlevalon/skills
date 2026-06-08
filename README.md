# skills

[![CI](https://github.com/barlevalon/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/barlevalon/skills/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/%40barlevalon%2Fskills.svg)](https://www.npmjs.com/package/@barlevalon/skills)

Portable Agent Skills for AI-assisted engineering workflows.

## Skills

### Communication

- [`caveman`](skills/communication/caveman/SKILL.md) — Ultra-compressed communication mode. Cuts token usage ~75% by speaking like caveman while keeping full technical accuracy. Supports intensit…
- [`caveman-commit`](skills/communication/caveman-commit/SKILL.md) — Ultra-compressed commit message generator. Uses release-aware scoped commit subjects: scope-first by default, optional Conventional Commit t…
- [`caveman-help`](skills/communication/caveman-help/SKILL.md) — Quick-reference card for all caveman modes, skills, and commands. One-shot display, not a persistent mode

### Discovery

- [`find-skills`](skills/discovery/find-skills/SKILL.md) — Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can

### Documentation

- [`documentation-system`](skills/documentation/documentation-system/SKILL.md) — Apply Divio's four-quadrant documentation system to write, audit, classify, restructure, and review technical documentation

### Engineering

- [`diagnose`](skills/engineering/diagnose/SKILL.md) — Disciplined diagnosis loop for hard bugs and performance regressions. Reproduce → minimise → hypothesise → instrument → fix → regression-tes…
- [`grill-with-docs`](skills/engineering/grill-with-docs/SKILL.md) — Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation (CONTEXT.md, A…
- [`improve-codebase-architecture`](skills/engineering/improve-codebase-architecture/SKILL.md) — Find deepening opportunities in a codebase, informed by the domain language in CONTEXT.md and the decisions in docs/adr/
- [`prd-to-plan`](skills/engineering/prd-to-plan/SKILL.md) — Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices, saved as a local Markdown file in ./plans/
- [`prototype`](skills/engineering/prototype/SKILL.md) — Build a throwaway prototype to flesh out a design before committing to it. Routes between two branches — a runnable terminal app for state/b…
- [`tdd`](skills/engineering/tdd/SKILL.md) — Test-driven development with red-green-refactor loop
- [`worktrunk`](skills/engineering/worktrunk/SKILL.md) — Use Worktrunk for git worktree workflows whenever working in a git repository. Prefer `wt` over manual branch/worktree lifecycle commands wh…
- [`write-a-prd`](skills/engineering/write-a-prd/SKILL.md) — Create a PRD through user interview, codebase exploration, and module design
- [`zoom-out`](skills/engineering/zoom-out/SKILL.md) — Tell the agent to zoom out and give broader context or a higher-level perspective

### Evaluation

- [`thermo-nuclear-code-quality-review`](skills/evaluation/thermo-nuclear-code-quality-review/SKILL.md) — Run an extremely strict maintainability review for abstraction quality, giant files, and spaghetti-condition growth

### Handoff

- [`handoff`](skills/handoff/handoff/SKILL.md) — Compact the current conversation into a handoff document for another agent to pick up

### Release

- [`release-prep`](skills/release/release-prep/SKILL.md) — AI-assisted release preparation workflow for software repos

### Review

- [`plannotator-compound`](skills/review/plannotator-compound/SKILL.md) — Analyze a user's Plannotator plan archive to extract denial patterns, feedback taxonomy, evolution over time, and actionable prompt improvem…
- [`plannotator-setup-goal`](skills/review/plannotator-setup-goal/SKILL.md) — Turn an idea or objective into a goal package for /goal
- [`plannotator-visual-explainer`](skills/review/plannotator-visual-explainer/SKILL.md) — Generate self-contained HTML visualizations with Plannotator theming

## Install

### npm

Install all skills:

```bash
pi install npm:@barlevalon/skills
```

Install one skill:

```bash
pi install npm:@barlevalon/tdd-skill
pi install npm:@barlevalon/release-prep-skill
```

Packages declare Pi compatibility through `package.json`:

```json
{
  "pi": {
    "skills": ["./skills/*/*/SKILL.md"]
  }
}
```

### Git

```bash
git clone https://github.com/barlevalon/skills.git
```

Then point your agent harness at the package root, `skills/`, or a specific skill directory such as `skills/engineering/tdd`.

### Local checkout

```bash
pi -e .
pi -e ./skills/engineering/tdd
```

## Layout

```text
skills/
  <category>/
    <skill>/
      SKILL.md
      package.json
      README.md
      LICENSE
```

New skills should use `skills/<category>/<skill>/SKILL.md`, include a local `package.json`, and keep skill names globally unique. Skill packages version independently from the root bundle.

## Credits

- `caveman`, `caveman-commit`, `caveman-help`: based on `JuliusBrussee/caveman` by Julius Brussee.
- `diagnose`, `grill-with-docs`, `handoff`, `improve-codebase-architecture`, `prd-to-plan`, `prototype`, `write-a-prd`, `zoom-out`: based on `mattpocock/skills` by Matt Pocock.
- `find-skills`: based on `vercel-labs/skills` by Vercel.
- `worktrunk`: based on `max-sixty/worktrunk` by Maximilian Roos.
- `thermo-nuclear-code-quality-review`: based on `cursor/plugins` by Cursor.
- `plannotator-*`: based on `backnotprop/plannotator` by backnotprop.

## Validation

```bash
npm ci
npm run ci
```

## Documentation

- [Setup guide](docs/setup.md)
- [Workflow guide](docs/workflow.md)
- [Usage quick reference](docs/usage.md)
- [Maintainer release process](docs/release.md)
- [Changelog](CHANGELOG.md)

## License

MIT
