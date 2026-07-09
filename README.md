# barlevalon/skills

[![CI](https://github.com/barlevalon/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/barlevalon/skills/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/%40barlevalon%2Fskills.svg)](https://www.npmjs.com/package/@barlevalon/skills)

Reusable Agent Skills for AI-assisted engineering workflows.

A skill is a directory with a `SKILL.md` entry point plus any helper references, scripts, or templates it needs. Agents see the skill name and description first, then load the full skill only when the task matches.

## Install

Run the installer:

```bash
npx @barlevalon/skills@latest install
```

It opens an interactive picker for harnesses, skills, and scope, then writes the right files for each tool.

Supported targets:

- Pi
- OpenCode
- VS Code with Copilot, Claude, or Codex extensions
- Claude Code

Examples:

```bash
npx @barlevalon/skills@latest install --agent vscode --skill tdd --skill diagnose --yes
npx @barlevalon/skills@latest install --bundle matt-core --agent vscode --project --yes
npx @barlevalon/skills@latest install --bundle matt-wayfinder --agent vscode --project --yes
npx @barlevalon/skills@latest install --agent claude-code --skill release-prep --global --yes
npx @barlevalon/skills@latest install --all --yes
```

Matt Pocock workflow bundles are fetched directly from `github:mattpocock/skills` at install time instead of vendored here.

See [docs/setup.md](docs/setup.md) for options and manual fallback setup.

## Use

Ask your agent for a workflow:

```text
Use tdd to implement this change.
Use diagnose before fixing this bug.
Use release-prep for the next release.
```

## Pick a skill

| Work | Skills |
|---|---|
| Plan a feature | `write-a-prd`, `prd-to-plan`, `grill-with-docs`, `grilling` |
| Debug | `diagnose` |
| Build test-first | `tdd` |
| Prototype | `prototype` |
| Improve architecture | `improve-codebase-architecture`, `codebase-design`, `domain-modeling`, `zoom-out` |
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
- `codebase-design`, `diagnose`, `domain-modeling`, `grilling`, `grill-with-docs`, `handoff`, `improve-codebase-architecture`, `prd-to-plan`, `prototype`, `write-a-prd`, `writing-great-skills`, `zoom-out`: based on `mattpocock/skills` by Matt Pocock.
- `find-skills`: based on `vercel-labs/skills` by Vercel.
- `worktrunk`: based on `max-sixty/worktrunk` by Maximilian Roos.
- `thermo-nuclear-code-quality-review`: based on `cursor/plugins` by Cursor.
- `plannotator-*`: based on `backnotprop/plannotator` by backnotprop.

## License

MIT
