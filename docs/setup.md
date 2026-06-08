# Setup guide

This repo is a portable bundle of `SKILL.md` workflows. A skill is just a Markdown instruction file plus optional supporting references, scripts, and package metadata.

You can use the skills with any agent harness or editor that supports one of these patterns:

- loading a Markdown instruction file,
- installing an npm package that declares skills,
- adding custom rules/instructions,
- attaching files as context,
- copying a prompt into a chat.

## Option 1: Use a Git checkout

Best for browsing, editing, and tools that can load files from disk.

```bash
git clone https://github.com/barlevalon/skills.git
cd skills
```

Then load one of these paths in your harness/editor:

```text
skills/                         # all skills
skills/engineering/tdd/SKILL.md # one skill
skills/release/release-prep/    # one skill plus support files
```

If your tool only accepts text instructions, open the relevant `SKILL.md` and paste or import its contents.

## Option 2: Load from npm packages

Best for harnesses that understand npm skill packages.

Use your harness's npm/package command with the full bundle:

```text
@barlevalon/skills
```

Or load one skill package when you only need a small workflow:

```text
@barlevalon/tdd-skill
@barlevalon/release-prep-skill
```

Package names follow this pattern:

```text
@barlevalon/<skill-name>-skill
```

To inspect package metadata with npm itself:

```bash
npm view @barlevalon/skills
npm view @barlevalon/tdd-skill
```

## Option 3: Pi install commands

Pi is one supported harness, not a requirement.

Install all skills:

```bash
pi install npm:@barlevalon/skills
```

Install one skill:

```bash
pi install npm:@barlevalon/tdd-skill
pi install npm:@barlevalon/release-prep-skill
```

Use a local checkout while developing:

```bash
pi -e .
pi -e ./skills/engineering/tdd
```

## Option 4: Editor rules or custom instructions

For editors and agents that do not have a skill package format:

1. Pick a skill from [workflow.md](workflow.md).
2. Open its `SKILL.md`.
3. Add that content to your editor's rules, project instructions, or chat context.
4. Include supporting files from the same skill directory if the `SKILL.md` links to them.

Example:

```text
Use the instructions in skills/engineering/tdd/SKILL.md for this task.
```

## Avoid duplicate skill conflicts

If your harness reports that the same skill exists in two places, pick one source of truth.

Common causes:

- one copy installed globally,
- one copy loaded from this repo,
- one copy installed from npm and another copied into a local skills directory.

Fix:

- keep the packaged copy and remove the duplicate local copy, or
- keep the local development copy and disable/remove the packaged copy.

## Validate this repo

For maintainers and contributors:

```bash
npm ci
npm run ci
```

This checks skill frontmatter, package metadata, root packaging, and individual skill packaging.
