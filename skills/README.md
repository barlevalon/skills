# Skills

Portable Agent Skills maintained in this repository.

This package is a bootstrap plus a small set of local skills/syntheses. Canonical third-party skills are fetched from upstream during install instead of vendored here.

## Local skills

| Skill | Why it lives here | Influences / credits |
|---|---|---|
| [`caveman-commit`](caveman-commit/SKILL.md) | Local commit-message policy fork | Based on `JuliusBrussee/caveman`'s `caveman-commit` skill |
| [`documentation-system`](documentation-system/SKILL.md) | Local documentation workflow | Inspired by Divio's four-quadrant documentation system |
| [`tdd`](tdd/SKILL.md) | Local synthesis of test-first discipline | Influenced by Matt Pocock's `tdd` skill and Obra's `test-driven-development` superpower |
| [`release-prep`](release-prep/SKILL.md) | Local release preparation workflow | Authored for this package's release process |

## Upstream skills installed by bootstrap

Default bootstrap fetches canonical skills directly from upstream repositories, including Matt Pocock workflow skills, Bento presentations, Caveman mode/help, Ponytail's minimal-code workflows, Vercel `find-skills`, Worktrunk, Cursor's thermo-nuclear review skill, and selected Plannotator review skills.

Convention for local skills:

```text
skills/<skill>/SKILL.md
```
