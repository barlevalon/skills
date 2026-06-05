---
name: manual-release
description: >
  AI-assisted manual release workflow for software repos. Use when preparing
  releases, choosing SemVer bumps, drafting changelogs or release notes,
  validating release readiness, replacing commit-driven release automation, or
  creating project-local release policy. Conservative by default: discovers
  local tooling/policy, cites git/PR evidence, and never tags, pushes,
  publishes, or deploys without explicit approval.
---

# Manual Release

Prepare releases from repository evidence, not blind commit-message automation.

Core stance:

- Commit log is for contributors.
- Changelog and release notes are for users/operators.
- AI may draft and classify; humans approve release meaning.
- CI should build/publish deterministic artifacts when possible.
- Never tag, push, publish, deploy, or mutate release history without explicit user approval.

## Use When

Use this skill when user asks to:

- prepare a release
- draft changelog or release notes
- decide next version
- replace `release-please`, `semantic-release`, `standard-version`, or similar automation
- inspect changes since last tag
- create a release checklist
- define project-local release policy
- run a hotfix release plan

Do **not** use for normal commit-message generation. Use repo commit convention or commit skill instead.

## Safety Rules

Default mode is **read-only discovery and drafting**.

Allowed without extra approval:

- read files
- inspect git logs, tags, diffs, branches, status
- inspect GitHub PRs/releases/issues with read-only commands
- run local test/build dry-runs when normal for repo
- draft changelog/release notes/release plan
- edit changelog/version files only if user asked to prepare release files

Require explicit approval before:

- `git tag`
- `git push`, including `--tags`
- `gh release create/edit/delete`
- package publish commands: `npm publish`, `cargo publish`, `twine upload`, `goreleaser release`, etc.
- production deploy commands
- deleting or rewriting tags/releases
- force-push or history rewrite

If approval is needed, state exact command(s), target, and impact first.

If worktree is dirty and release prep needs edits, inspect status and ask before touching overlapping files.

## Local Policy First

Before release analysis, search for project policy and release config.

Read relevant files if present:

- `AGENTS.md`
- `CONTRIBUTING.md`
- `README.md`
- `CHANGELOG.md` or package-specific changelogs
- `docs/agents/*release*`
- `docs/*release*`
- `.github/workflows/*release*`
- `.github/workflows/*publish*`
- `.github/workflows/*goreleaser*`
- `release-please-config.json`
- `.release-please-manifest.json`
- `.releaserc*`
- `semantic-release` config
- `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `.goreleaser.yaml`
- `changeset` config: `.changeset/`

If local policy exists, follow it over this generic workflow. Surface conflicts explicitly.

If no local policy exists, infer cautiously and ask clarifying questions before mutating files or publishing.

## Discovery Commands

Use commands appropriate to repo. Prefer read-only first.

```bash
git status --short
git tag --sort=-creatordate | head -20
git describe --tags --abbrev=0 2>/dev/null || true
git log --oneline --decorate -40
find . -maxdepth 3 -iname '*changelog*' -o -iname '*release*' -o -iname '.releaserc*'
find .github/workflows -maxdepth 1 -type f 2>/dev/null | sort
```

If GitHub CLI is authenticated and repo uses PRs:

```bash
gh release list --limit 10
gh pr list --state merged --limit 50 --json number,title,labels,author,mergedAt,mergeCommit
```

For exact release range:

```bash
last_tag=$(git describe --tags --abbrev=0 2>/dev/null || true)
git log --reverse --date=short --pretty=format:'%h%x09%ad%x09%an%x09%s' "$last_tag"..HEAD
```

If no tag exists, use first release boundary from changelog, package version, or ask user.

## Determine Product Boundary

Identify what is being released.

Examples:

- single CLI binary
- library package
- backend service
- Docker image
- Terraform module
- documentation site
- monorepo package subset

Evidence sources:

- tag patterns
- changelog location
- package manifests
- release workflows
- artifact config
- prior GitHub releases
- path filters in workflows

If multiple products exist, do not collapse them into one release without confirmation. Produce one release plan per product.

## Classify Changes

Classify by **user/operator impact**, not by commit type alone.

Primary sections:

- Added — new capabilities users can use
- Fixed — bugs corrected
- Changed — behavior, UX, performance, compatibility, defaults
- Security — vulnerability fixes or hardening users should know
- Deprecated — still works, planned removal
- Removed — no longer available
- Breaking — incompatible changes needing action
- Internal — useful for maintainers, usually not release notes

Signals to inspect:

- commits since previous tag
- merged PR titles/bodies/labels
- issue links
- changed paths
- tests added/changed
- API/schema/CLI flag changes
- docs changes around behavior
- migration files
- config/default changes

Conventional Commits are useful evidence when present, not authority. If commits are scoped-only or mixed format, infer from diff/PRs and flag uncertainty.

## Version Decision

Recommend SemVer bump from user-visible compatibility.

- Major: breaking public API/CLI/config/data behavior, required migration, removed feature, incompatible contract
- Minor: backward-compatible new capability or meaningful enhancement
- Patch: backward-compatible bug fix, security hardening, docs-only release if project releases docs, small compatibility fix
- No release: only internal changes outside product boundary, or no user/operator impact

Always cite evidence:

```text
Recommended bump: minor
Evidence:
- abc123 env: add topology command — new CLI command
- def456 api: add backend deployment-status contract — new client-visible endpoint
No breaking changes found in CLI flags, API contract, or config defaults.
```

If evidence is ambiguous, ask. Do not guess silently.

## Draft Changelog

Prefer existing project format. If absent, use Keep a Changelog style:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- ...

### Fixed
- ...

### Changed
- ...

### Security
- ...

### Breaking
- ...
```

Write for users/operators:

- merge multiple implementation commits into one user-facing entry
- avoid raw commit-message dumps
- avoid internal-only noise unless release audience needs it
- mention migration/compatibility impact clearly
- cite PRs/commits where useful
- do not include AI attribution

For CLI tools, note command/flag/output changes.
For APIs, note endpoint/schema/contract changes.
For services, note deploy/config/ops impact.
For libraries, note public API and migration impact.

## Release Readiness Gate

Before recommending tag/publish, produce GO / CONDITIONAL / NO-GO.

Check:

1. **Source state** — clean worktree or expected release-file edits only
2. **Branch state** — on expected branch, up to date with remote if relevant
3. **CI state** — required checks green or known local validation passed
4. **Tests/build** — project validation commands run or intentionally skipped with reason
5. **Changelog/release notes** — drafted and reviewed
6. **Version files** — updated consistently if repo uses version files
7. **Artifacts** — build/publish mechanism identified
8. **Breaking changes** — documented with migration notes
9. **Security/secrets** — no obvious secret leak; dependency/security checks considered
10. **Rollback** — at least one rollback path named

Decision meanings:

- **GO** — safe to proceed after user approval
- **CONDITIONAL** — can proceed if listed mitigations accepted
- **NO-GO** — blocker should be fixed first

Output format:

```text
Release readiness: CONDITIONAL
Blockers: none
Risks:
- CI not checked locally; GitHub checks should be verified before tagging.
Required approval before:
- git tag vX.Y.Z
- git push origin main vX.Y.Z
```

## Prepare Release Files

Only edit files if user asks to prepare release files.

Common edits:

- changelog entry
- version file/package manifest
- release notes draft
- project-local release policy doc

Commit message for release prep, if user asks:

```text
release: vX.Y.Z
```

Body only if needed:

```text
Prepare changelog and version metadata for vX.Y.Z.

Validation:
- <command>
```

## Tag and Publish Plan

Prefer deterministic CI for artifact publishing.

Good pattern:

1. release prep commit merged to main
2. tag created from exact main SHA
3. push tag
4. CI builds/publishes artifacts from tag
5. verify release artifacts/checksums

When presenting commands, separate plan from execution:

```bash
git checkout main
git pull --ff-only
git tag vX.Y.Z
git push origin main vX.Y.Z
```

Do not run these until approved.

## Hotfix Mode

For urgent patch releases:

1. identify last known good tag
2. identify minimal fix commit(s)
3. choose branch strategy: release branch from tag or main if project allows
4. run minimal targeted validation plus safety checks
5. draft patch changelog with incident/security context if appropriate
6. state rollback path
7. require explicit approval before tag/publish

Hotfixes still need release notes. Future debuggers need context.

## Project-Local Policy Creation

If repo lacks release policy and user wants one, create `docs/agents/release-workflow.md` or nearest project convention path.

Include:

- product boundary
- release artifacts
- tag format
- changelog path/style
- SemVer rules specific to project
- required validation commands
- CI workflow names that publish artifacts
- manual approval gates
- rollback notes
- commit/PR title convention if relevant

Keep global skill generic; put repo facts in project policy.

## Final Response Template

For discovery/draft:

```text
Product: <product>
Current version/tag: <tag>
Range: <old>..<new>
Recommended bump: <major|minor|patch|none>
Confidence: <high|medium|low>

User-facing changes:
- Added: ...
- Fixed: ...
- Changed: ...
- Breaking: ...

Evidence:
- <commit/PR/path>

Readiness: <GO|CONDITIONAL|NO-GO>
Blockers:
- ...
Risks:
- ...

Next approval needed:
- ...
```

For local policy proposal:

```text
Detected release model:
- Product: ...
- Tag format: ...
- Publisher: ...
- Changelog: ...

Questions before writing policy:
1. ...
2. ...
```
