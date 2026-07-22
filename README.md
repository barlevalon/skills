# barlevalon/skills

[![CI](https://github.com/barlevalon/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/barlevalon/skills/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/%40barlevalon%2Fskills.svg)](https://www.npmjs.com/package/@barlevalon/skills)

Alon's one-command bootstrap for an agentic engineering environment.

A skill is a directory with a `SKILL.md` entry point plus any helper references, scripts, or templates it needs. Agents see the skill name and description first, then load the full skill only when the task matches.

## Install

Choose one install path.

For Pi-managed global skills with Pi-owned update discovery:

```bash
pi install npm:@barlevalon/skills
```

This loads the complete curated catalog—maintained skills plus pinned upstream releases—globally in Pi. Update it with `pi update --extensions`.

For scoped copies across supported harnesses:

```bash
npx @barlevalon/skills@latest install
```

With no flags the installer does the normal file-based bootstrap:

- installs the curated repo workflow bundle—Matt Pocock workflows plus the maintained `tdd` fork—under `.agents/skills` and `.claude/skills`
- updates repo instruction files for agents that need them
- installs this package's global-purpose maintained skills/forks globally; maintained `tdd` stays repo-local
- installs canonical upstream global skills from Bento, Caveman, Ponytail, Matt, Vercel, Worktrunk, Cursor, and Plannotator
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

Do not combine Pi-managed and file-based installs unless duplicate skill names are intentional. The installer detects an existing Pi package and asks before creating Pi-visible copies; non-interactive overlap requires `--allow-pi-overlap`.

Migrating from file bootstrap to Pi ownership? [Remove installer-managed copies first](docs/setup.md#migrate-from-file-bootstrap-to-pi).

The npm package contains a reproducible aggregate catalog pinned to upstream releases and reviewed commits for Pi. The file-based installer continues fetching selected third-party skills directly from their upstream repositories.

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
| Minimize implementation complexity | `ponytail` |
| Prototype | `prototype` |
| Improve architecture | `improve-codebase-architecture`, `codebase-design`, `domain-modeling` |
| Review code | `thermo-nuclear-code-quality-review`, `ponytail-review` |
| Audit repository complexity | `ponytail-audit` |
| Track deliberate simplification debt | `ponytail-debt` |
| Create presentations | `bento-slides` |
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

Pi installs use the immutable refs recorded in [`catalog/sources.json`](catalog/sources.json). File-based bootstrap fetches canonical skills from:

- `nyblnet/bento`
- `JuliusBrussee/caveman`
- `DietrichGebert/ponytail`
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
