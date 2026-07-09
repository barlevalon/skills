# barlevalon/skills

[![CI](https://github.com/barlevalon/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/barlevalon/skills/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/%40barlevalon%2Fskills.svg)](https://www.npmjs.com/package/@barlevalon/skills)

Alon's one-command bootstrap for an agentic engineering environment.

A skill is a directory with a `SKILL.md` entry point plus any helper references, scripts, or templates it needs. Agents see the skill name and description first, then load the full skill only when the task matches.

## Install

Run the installer:

```bash
npx @barlevalon/skills@latest install
```

With no flags it does the normal bootstrap:

- installs Matt Pocock workflow skills into the current repo under `.agents/skills` and `.claude/skills`
- updates repo instruction files for agents that need them
- installs this package's maintained local skills/forks globally
- installs canonical upstream global skills from Caveman, Matt, Vercel, Worktrunk, Cursor, and Plannotator
- reports any pre-existing skill folders it left untouched

Advanced escape hatches:

```bash
npx @barlevalon/skills@latest install --agent vscode --skill tdd --skill release-prep --yes
npx @barlevalon/skills@latest install --bundle matt-core --agent vscode --project --yes
npx @barlevalon/skills@latest install --bundle matt-wayfinder --agent vscode --project --yes
npx @barlevalon/skills@latest install --source matt --skill diagnosing-bugs --agent vscode --project --yes
npx @barlevalon/skills@latest install --agent claude-code --skill release-prep --global --yes
npx @barlevalon/skills@latest install --all --yes
```

Third-party workflow skills are fetched directly from their upstream GitHub repositories at install time instead of vendored here.

See [docs/setup.md](docs/setup.md) for options and manual fallback setup.

## Use

Ask your agent for a workflow:

```text
Use tdd to implement this change.
Use diagnosing-bugs before fixing this bug.
Use release-prep for the next release.
```

## Pick a skill

| Work | Skills |
|---|---|
| Plan a feature | `to-spec`, `to-tickets`, `grill-with-docs`, `grilling` |
| Debug | `diagnosing-bugs` |
| Build test-first | `tdd` |
| Prototype | `prototype` |
| Improve architecture | `improve-codebase-architecture`, `codebase-design`, `domain-modeling` |
| Review code | `thermo-nuclear-code-quality-review` |
| Write docs | `documentation-system` |
| Write or edit skills | `writing-great-skills` |
| Release | `release-prep` |
| Commit message | `caveman-commit` |
| Concise mode | `caveman`, `caveman-help` |
| Handoff | `handoff` |
| Visual explanation | `plannotator-visual-explainer` |

Full list: [docs/usage.md](docs/usage.md)

## Local skills in this package

| Skill | Why it lives here | Influences / credits |
|---|---|---|
| `caveman-commit` | local commit-message policy fork | based on `JuliusBrussee/caveman` |
| `documentation-system` | local documentation workflow | inspired by Divio's four-quadrant documentation model |
| `tdd` | local TDD discipline synthesis | influenced by Matt Pocock's `tdd` skill and Obra's `test-driven-development` superpower |
| `release-prep` | local release preparation workflow | authored for this package's release process |

## Upstream sources

Default bootstrap fetches canonical skills from:

- `JuliusBrussee/caveman`
- `mattpocock/skills`
- `vercel-labs/skills`
- `max-sixty/worktrunk`
- `cursor/plugins`
- `backnotprop/plannotator`

## Docs

- [Setup](docs/setup.md)
- [Workflow map](docs/workflow.md)
- [Skill reference](docs/usage.md)
- [Maintainer release process](docs/release.md)

## License

MIT
