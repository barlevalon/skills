# Changelog

All notable changes to this package are documented here.

## Unreleased

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
