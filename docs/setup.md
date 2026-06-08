# Setup

These skills are plain Markdown files. The easiest setup is to clone the repo and let your agent read the skill you want.

## 1. Clone the repo

```bash
git clone https://github.com/barlevalon/skills.git
```

## 2. Give your agent the right file or folder

Use the whole bundle:

```text
skills/
```

Use one skill:

```text
skills/engineering/tdd/SKILL.md
skills/release/release-prep/SKILL.md
skills/documentation/documentation-system/SKILL.md
```

If a skill links to helper files, give the agent the whole skill folder.

## 3. Ask for the workflow

```text
Use TDD to implement this change.
```

```text
Diagnose this bug before fixing it.
```

```text
Prepare a release plan.
```

## npm package

The bundle is also on npm:

```bash
npm install @barlevalon/skills
```

Use npm when your agent has first-class support for npm skill packages. In that case, load:

```text
@barlevalon/skills
```

Single-skill packages are also available:

```text
@barlevalon/tdd-skill
@barlevalon/release-prep-skill
```

## Pi

Pi users can install from npm:

```bash
pi install npm:@barlevalon/skills
```

Or run from a checkout:

```bash
pi -e .
```

## Updating

If you cloned the repo:

```bash
git pull
```

If you installed from npm:

```bash
npm update @barlevalon/skills
```
