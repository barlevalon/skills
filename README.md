# skills

[![CI](https://github.com/barlevalon/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/barlevalon/skills/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/%40barlevalon%2Fskills.svg)](https://www.npmjs.com/package/@barlevalon/skills)

Reusable `SKILL.md` workflows for AI coding agents.

A skill is a small folder with a `SKILL.md` instruction file and, when needed, supporting references, scripts, or templates. Agents load the skill when the task matches it, then read helper files only as needed.

## Start

Give your agent this repo:

```text
https://github.com/barlevalon/skills
```

Then ask for a workflow:

```text
Use TDD to implement this change.
Diagnose this bug before fixing it.
Prepare a release plan.
```

If your agent cannot read GitHub URLs, clone the repo and give it the local `skills/` folder or a complete skill folder.

```bash
git clone https://github.com/barlevalon/skills.git
```

## Use with your tool

- opencode / Codex: add an `AGENTS.md` rule. See [setup](docs/setup.md#opencode-and-codex).
- Cursor: add a `.cursor/rules` rule. See [setup](docs/setup.md#cursor).
- VS Code Copilot: add `.github/copilot-instructions.md`. See [setup](docs/setup.md#vs-code-copilot).
- Continue: add a `.continue/rules` rule. See [setup](docs/setup.md#continue).
- Cline: add a `.clinerules/` rule. See [setup](docs/setup.md#cline).
- Package-aware tools: use `@barlevalon/skills`.

## Pick a skill

| Work | Skill |
|---|---|
| Plan a feature | `write-a-prd`, `prd-to-plan`, `grill-with-docs` |
| Debug | `diagnose` |
| Build test-first | `tdd` |
| Prototype | `prototype` |
| Improve architecture | `improve-codebase-architecture` |
| Review code | `thermo-nuclear-code-quality-review` |
| Write docs | `documentation-system` |
| Write or edit skills | `writing-great-skills` |
| Release | `release-prep` |
| Commit message | `caveman-commit` |
| Handoff | `handoff` |
| Visual explanation | `plannotator-visual-explainer` |

Full list: [docs/usage.md](docs/usage.md)

## Docs

- [Setup](docs/setup.md)
- [Workflow map](docs/workflow.md)
- [Skill reference](docs/usage.md)
- [Maintainer release process](docs/release.md)

## Credits

- `caveman`, `caveman-commit`, `caveman-help`: based on `JuliusBrussee/caveman` by Julius Brussee.
- `diagnose`, `grill-with-docs`, `handoff`, `improve-codebase-architecture`, `prd-to-plan`, `prototype`, `write-a-prd`, `writing-great-skills`, `zoom-out`: based on `mattpocock/skills` by Matt Pocock.
- `find-skills`: based on `vercel-labs/skills` by Vercel.
- `worktrunk`: based on `max-sixty/worktrunk` by Maximilian Roos.
- `thermo-nuclear-code-quality-review`: based on `cursor/plugins` by Cursor.
- `plannotator-*`: based on `backnotprop/plannotator` by backnotprop.

## License

MIT
