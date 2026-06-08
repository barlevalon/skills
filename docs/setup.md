# Setup

These skills are plain Markdown instructions. Use the pattern your agent already supports: repo URL, local files, `AGENTS.md`, editor rules, or npm skill packages.

## Fast path

Give your agent this repo:

```text
https://github.com/barlevalon/skills
```

Then ask for a workflow:

```text
Use the tdd skill.
Use the diagnose skill.
Use the release-prep skill.
```

## Local files

Use a local checkout when your tool cannot fetch GitHub URLs:

```bash
git clone https://github.com/barlevalon/skills.git
```

Give the agent the whole skills bundle:

```text
/path/to/skills/skills/
```

Or give it one complete skill folder:

```text
/path/to/skills/skills/engineering/tdd/
/path/to/skills/skills/release/release-prep/
/path/to/skills/skills/documentation/documentation-system/
```

Prefer the folder over only `SKILL.md`; many skills link helper files next to `SKILL.md`.

## Reusable rule text

Most tools need the same project instruction. Use this text, changing the local path if needed:

```md
Use workflow skills from https://github.com/barlevalon/skills.

When I ask for a named workflow, read the matching `SKILL.md` before acting.
Examples:
- `tdd` -> `skills/engineering/tdd/SKILL.md`
- `diagnose` -> `skills/engineering/diagnose/SKILL.md`
- `release-prep` -> `skills/release/release-prep/SKILL.md`
- `documentation-system` -> `skills/documentation/documentation-system/SKILL.md`

If you cannot fetch the repo URL, ask me for a local checkout path.
If the skill links to helper files, read those too.
```

## Where to put it

### opencode and Codex

Put the reusable rule text in your project `AGENTS.md`.

opencode tip: run `/init` if you do not have `AGENTS.md` yet, then add the rule text.

### Cursor

Create `.cursor/rules/workflow-skills.mdc`:

```mdc
---
description: Use shared workflow skills from barlevalon/skills
alwaysApply: false
---

Use workflow skills from https://github.com/barlevalon/skills.

When I ask for a named workflow, read the matching `SKILL.md` before acting.
If you cannot fetch the repo URL, ask me for a local checkout path.
If the skill links to helper files, read those too.
```

### VS Code Copilot

Put the reusable rule text in `.github/copilot-instructions.md`.

One-off prompt:

```text
Use https://github.com/barlevalon/skills, read skills/engineering/tdd/SKILL.md, then implement this change test-first.
```

### Continue

Create `.continue/rules/workflow-skills.md`:

```md
---
name: Workflow skills
---

Use workflow skills from https://github.com/barlevalon/skills.
When I ask for a named workflow, read the matching `SKILL.md` before acting.
If you cannot fetch the repo URL, ask for a local checkout path.
If the skill links to helper files, read those too.
```

### Cline

Create `.clinerules/workflow-skills.md`:

```md
# Workflow skills

Use workflow skills from https://github.com/barlevalon/skills.
When I ask for a named workflow, read the matching `SKILL.md` before acting.
If you cannot fetch the repo URL, ask for a local checkout path.
If the skill links to helper files, read those too.
```

## Package-aware tools

If your tool supports npm skill packages directly, use:

```text
@barlevalon/skills
```

Single-skill packages are available too:

```text
@barlevalon/tdd-skill
@barlevalon/release-prep-skill
```

## Pi

```bash
pi install npm:@barlevalon/skills
```

or from a checkout:

```bash
pi -e .
```
