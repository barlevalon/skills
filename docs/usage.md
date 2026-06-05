# Usage

`manual-release` is a skill for release preparation, not a release bot.
It keeps release decisions evidence-backed and approval-gated.

## Install

From npm:

```bash
pi install npm:pi-manual-release
```

From GitHub:

```bash
pi install git:github.com/barlevalon/pi-manual-release@v0.1.0
```

From a local checkout:

```bash
pi install /path/to/pi-manual-release
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
