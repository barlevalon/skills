# Changelog

All notable changes to this package are documented here.

## Unreleased

## [0.7.7] - 2026-07-09

### Fixed
- Preflight skill-folder conflicts across every target before copying, then report all conflicts together without leaving a half-installed state.

## [0.7.6] - 2026-07-09

### Changed
- Make the default installer command a KISS bootstrap for Alon's agentic environment: repo workflow skills from Matt upstream plus global barlevalon personal skills.
- Remove the confusing interactive skill-source picker from the default flow.

### Added
- Report pre-existing skill folders that were left untouched after bootstrap.

## [0.7.5] - 2026-07-08

### Added
- Add installer support for external Matt Pocock skill bundles fetched directly from `github:mattpocock/skills`.
- Add `--source`, `--bundle`, and `--ref` installer options.

## [0.7.4] - 2026-07-08

### Changed
- Remove opinionated “recommended” wording from the scope picker labels.

## [0.7.3] - 2026-07-08

### Changed
- Use interactive checkbox/select prompts for harness, skill, and scope selection.
- Show compact skill names in installer lists instead of full descriptions.

### Fixed
- Copy skills correctly when the installer runs from npm's temporary `node_modules` cache.

## [0.7.2] - 2026-07-08

### Fixed
- Rename the installer binary to `skills` so `npx @barlevalon/skills install` works directly.

## [0.7.1] - 2026-07-08

### Fixed
- Document a package-exec installer command that works even inside a local checkout of this package.

## [0.7.0] - 2026-07-08

### Added
- Add an npm installer CLI for choosing supported harnesses and skills interactively.
- Support installer targets for Pi, OpenCode, VS Code agent extensions, and Claude Code.

### Changed
- Make README and setup docs installer-first, with manual setup as fallback.

## [0.6.0] - 2026-07-02

### Changed
- Expand `worktrunk` with current upstream config, hook, approval, alias, LLM commit, and troubleshooting guidance.

## [0.5.0] - 2026-07-02

### Added
- Add reusable `grilling`, `domain-modeling`, and `codebase-design` skills.

### Changed
- Compose `grill-with-docs` and `improve-codebase-architecture` from reusable grilling, domain-modeling, and codebase-design disciplines.
- Move architecture review output toward Matt Pocock's visual HTML report flow.

## [0.4.0] - 2026-07-02

### Added
- Add `writing-great-skills` for evaluating and improving skill predictability.

### Changed
- Simplify public setup and usage documentation for repository-based skill loading.

## [0.3.0] - 2026-06-08

### Added
- Expand the repository into a comprehensive workflow bundle of public skills.
- Add setup, workflow, and usage documentation for harness-neutral skill loading.

### Changed
- Make npm installation the default quickstart path.
- Clarify that root and individual skill package versions are released independently.

## [0.2.0] - 2026-06-06

### Added
- Add customized `caveman-commit`, `grill-with-docs`, and `tdd` skills with per-skill package metadata and creator credits.

## [0.1.4] - 2026-06-06

### Fixed
- Point Pi package manifests at `SKILL.md` files so README files are not discovered as skills.

## [0.1.3] - 2026-06-06

### Changed
- Restructure the package as a skills monorepo under `skills/<category>/<skill>/`.
- Rename package metadata from `manual-release-skill` to `@barlevalon/skills`.
- Rename the skill from `manual-release` to `release-prep` and move it to `skills/release/release-prep/`.
- Add per-skill package metadata so `release-prep` can be installed independently.

## [0.1.2] - 2026-06-05

### Fixed
- Fix Trusted Publisher workflow by avoiding setup-node registry token config and using a current npm CLI.

## [0.1.1] - 2026-06-05

### Fixed
- Use block scalar frontmatter for the skill description so YAML parsers accept colon-space text.
- Strengthen package validation for multiline skill frontmatter.

## [0.1.0] - 2026-06-05

### Added
- Add `manual-release` skill for evidence-backed manual release preparation.
- Add Agent Skill package manifest for npm and git installation.
- Add CI validation and npm publish workflow.
- Add usage and maintainer release documentation.
