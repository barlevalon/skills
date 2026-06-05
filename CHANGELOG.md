# Changelog

All notable changes to this package are documented here.

## Unreleased

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
