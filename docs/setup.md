# Setup guide

This repo is a portable bundle of agent skills for an engineering workflow: planning, TDD, review, documentation, handoff, and release prep.

## Install the full workflow bundle

```bash
pi install npm:@barlevalon/skills
```

This installs every public skill in the repo.

## Install one skill

Each skill is also packaged separately:

```bash
pi install npm:@barlevalon/tdd-skill
pi install npm:@barlevalon/release-prep-skill
```

Use this when you want a small setup or want to avoid name collisions.

## Use a local checkout while editing skills

```bash
git clone https://github.com/barlevalon/skills.git
cd skills
npm ci
npm run ci
pi -e .
```

To load only one local skill:

```bash
pi -e ./skills/engineering/tdd
```

## Avoid duplicate skill conflicts

If Pi reports a collision like this:

```text
"tdd" collision:
  ✓ auto (user) ~/.agents/skills/tdd/SKILL.md
  ✗ .../@barlevalon/skills/.../tdd/SKILL.md (skipped)
```

it means the same skill exists in two places. The user/local copy wins and the npm copy is skipped.

Pick one source of truth:

- Use the npm bundle: remove the duplicate local copy under `~/.agents/skills/` or `~/.pi/agent/skills/`.
- Use local development: keep the local copy and ignore the packaged copy.

## What is intentionally excluded

This public bundle avoids private or machine-specific skills, including Slack/company workflows, personal note-vault paths, desktop-specific system configuration, printer setup, and local environment CLIs.

## Validate before publishing

```bash
npm run ci
```

This checks skill frontmatter, package metadata, root packaging, and individual skill packaging.
