# manual-release-skill

[![CI](https://github.com/barlevalon/manual-release-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/barlevalon/manual-release-skill/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/manual-release-skill.svg)](https://www.npmjs.com/package/manual-release-skill)

A universal Agent Skill for AI-assisted manual software releases.

It helps agents prepare releases from repository evidence instead of blindly deriving release meaning from commit-message automation.

## What it does

- Discovers local release tooling and policy first
- Inspects tags, commits, PRs, changelogs, workflows, and package manifests
- Recommends SemVer bumps with evidence
- Drafts user/operator-facing changelogs and release notes
- Produces GO / CONDITIONAL / NO-GO release readiness gates
- Requires explicit approval before tag, push, publish, deploy, or release mutation
- Helps create project-local release policy docs

## What it does not do

- It does not auto-publish packages
- It does not assume Conventional Commits are authoritative
- It does not tag, push, deploy, or publish without explicit approval
- It does not replace deterministic CI artifact builders such as GoReleaser

## Install

This repo uses the portable Agent Skills layout:

```text
skills/manual-release/SKILL.md
```

Any Agent Skills-compatible harness can load that skill directory.

### npm

```bash
npm pack manual-release-skill
```

Or install through a harness that supports npm skill packages.

### Git

```bash
git clone https://github.com/barlevalon/manual-release-skill.git
```

Then point your agent harness at `skills/manual-release` or the package root, depending on its skill-loading rules.

### Pi

Pi can install the package directly:

```bash
pi install npm:manual-release-skill
pi install git:github.com/barlevalon/manual-release-skill@v0.1.0
```

Try from a local checkout:

```bash
pi -e ./manual-release-skill
```

## Use

Ask your agent something like:

```text
Prepare a release.
```

```text
Draft release notes since the last tag.
```

```text
Recommend the next version and explain the evidence.
```

```text
Create a project-local release policy.
```

The skill loads as `manual-release`.

## Design stance

- Commit logs are for contributors.
- Changelogs and release notes are for users and operators.
- AI may draft and classify; humans approve release meaning.
- CI should build/publish deterministic artifacts when possible.
- Release actions that mutate remote state need explicit approval.

## Package layout

```text
skills/manual-release/SKILL.md
```

The package also declares Pi compatibility through `package.json`:

```json
{
  "pi": {
    "skills": ["./skills"]
  }
}
```

Other Agent Skills-compatible tools can ignore that field and load the standard `skills/` directory.

## Documentation

- [Usage](docs/usage.md)
- [Maintainer release process](docs/release.md)
- [Changelog](CHANGELOG.md)

## CI/CD

- `CI` validates skill metadata and npm package contents on pushes and PRs.
- `Publish npm package` publishes to npm when a GitHub Release is published.
- Publishing uses npm Trusted Publisher / GitHub OIDC; no npm token secret is required after the package is configured on npm.

## License

MIT
