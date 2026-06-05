# Usage

This repo currently ships the `release-prep` skill for release preparation.
It keeps release decisions evidence-backed and approval-gated.

## Install

This package uses the portable Agent Skills layout:

```text
skills/release/release-prep/SKILL.md
```

Use whichever install path your agent harness supports.

### Generic

Clone the repository and add `skills/` or `skills/release/release-prep` to your agent's skill paths.

```bash
git clone https://github.com/barlevalon/skills.git
```

### npm packages

Install all skills:

```text
@barlevalon/skills
```

Install only this skill:

```text
@barlevalon/release-prep-skill
```

### Pi

```bash
pi install npm:@barlevalon/skills
pi install npm:@barlevalon/release-prep-skill
pi install git:github.com/barlevalon/skills
pi install /path/to/skills
pi install /path/to/skills/skills/release/release-prep
```

## Prompts

```text
Prepare the next release.
```

```text
Draft release notes since the last tag.
```

```text
Recommend the next SemVer bump and cite evidence.
```

```text
Create a project-local release policy for this repo.
```

```text
Plan a hotfix release for this fix.
```

## Expected workflow

1. The agent discovers local release policy and tooling.
2. The agent identifies product boundaries and previous release tags.
3. The agent classifies changes by user/operator impact.
4. The agent recommends a version with evidence.
5. The agent drafts changelog or release notes.
6. The agent reports GO / CONDITIONAL / NO-GO readiness.
7. The user explicitly approves any tag, push, publish, deploy, or release mutation.

## Project-local policy

For repeatable releases, ask the skill to create a local policy such as:

```text
docs/agents/release-workflow.md
```

That policy should capture repo-specific facts: product boundaries, tag format,
changelog path, validation commands, publisher workflow, and rollback notes.
