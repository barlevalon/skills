# Awesome skills

A curated list of agent skills worth exploring, plus bespoke personal skills and deliberate forks.

Upstream projects are linked, not mirrored. This repository has no installer, package manifests, or publishing pipeline. Pick the skills that fit the work rather than loading every workflow at once.

## Upstream picks

### Engineering workflows

| Project | Worth a look for |
|---|---|
| [Cursor pstack](https://github.com/cursor/plugins/tree/main/pstack) | Engineering playbooks, investigation, competing designs, adversarial review, and verification. |
| [Matt Pocock's skills](https://github.com/mattpocock/skills) | Spec-to-ticket workflows, Wayfinder exploration, domain modeling, and learning across sessions. |
| [Ponytail](https://github.com/DietrichGebert/ponytail) | Minimal-code implementation, complexity audits, simplification debt, and focused reviews. |
| [Cursor Team Kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit) | CLI/UI checks, deslop, and the thermo-nuclear code-quality review. |

### Communication and presentation

| Project | Worth a look for |
|---|---|
| [Bento](https://github.com/nyblnet/bento) | Building presentations with `bento-slides`. |
| [Caveman](https://github.com/JuliusBrussee/caveman) | Terse communication modes and commit-message guidance. |

### Discovery and worktrees

| Project | Worth a look for |
|---|---|
| [Vercel Skills](https://github.com/vercel-labs/skills) | Finding skills through `find-skills`. |
| [Worktrunk](https://github.com/max-sixty/worktrunk) | Git worktree management and its accompanying agent skill. |

Follow each project's documentation for setup, supported harnesses, limitations, and licensing. Links track upstream; there are no local snapshots or release pins to keep in sync.

## Personal skills

Only maintained local workflows, forks, and syntheses live under [`skills/`](skills/README.md).

| Skill | Purpose |
|---|---|
| [caveman-commit](skills/caveman-commit/SKILL.md) | Scope-first, release-aware commit messages without unnecessary prose. |
| [documentation-system](skills/documentation-system/SKILL.md) | Write and improve documentation using Diátaxis. |
| [pr](skills/pr/SKILL.md) | Draft an evidence-backed PR and open its creation page after approval. |
| [release-prep](skills/release-prep/SKILL.md) | Assess release readiness, choose version bumps, and prepare release notes. |
| [tdd](skills/tdd/SKILL.md) | A personal test-first synthesis with explicit RED/GREEN/REFACTOR evidence. |

Read a skill's `SKILL.md` before using it. To use a personal skill locally, copy its complete folder to a skill directory supported by the chosen harness, including references and its license. Nothing here installs or enables skills automatically. Choose one implementation when skill names overlap with another collection.

Each personal skill's README records its sources and influences. Personal forks are not substitutes for tracking their upstream projects.

## Former packages and installer

The npm packages, cross-harness bootstrap, and bundled upstream catalog are retired from this repository. Previously published npm artifacts are unchanged; this checkout is no longer a package or an installer. Existing installations are not modified automatically.

The last packaged repository state is preserved at [`v3.0.0`](https://github.com/barlevalon/skills/tree/v3.0.0). For ongoing use, follow the upstream links or select individual personal skill folders instead.

## License

Repository-authored material is [MIT licensed](LICENSE). Retained forks carry their own license notices; linked upstream projects have their own licenses.
