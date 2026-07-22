# Skill reference

Ask for a skill by name, or describe the work and let the agent choose.

```text
Use the tdd skill.
Use diagnosing-bugs before fixing this bug.
Use release-prep for the next release.
```

## Curated skill catalog

`pi install npm:@barlevalon/skills` loads this complete catalog globally from immutable upstream snapshots. The no-flag file installer applies the same curated selection across repo-local and global targets, fetching external skills directly from upstream.

| Skill | Source | Use it for |
|---|---|---|
| `bento-slides` | `nyblnet/bento` | creating and editing self-contained Bento presentations |
| `caveman` | `JuliusBrussee/caveman` | concise responses |
| `caveman-help` | `JuliusBrussee/caveman` | caveman mode reference |
| `caveman-commit` | local fork | commit messages |
| `ponytail` | `DietrichGebert/ponytail` | choosing the smallest implementation that works |
| `ponytail-review` | `DietrichGebert/ponytail` | reviewing a diff for removable complexity |
| `ponytail-audit` | `DietrichGebert/ponytail` | auditing a repository for over-engineering |
| `ponytail-debt` | `DietrichGebert/ponytail` | collecting deliberate simplification markers into a debt ledger |
| `find-skills` | `vercel-labs/skills` | finding more skills |
| `documentation-system` | local | tutorials, how-tos, reference docs, explanations |
| `codebase-design` | `mattpocock/skills` | reusable deep-module design vocabulary |
| `code-review` | `mattpocock/skills` | standards and spec review |
| `diagnosing-bugs` | `mattpocock/skills` | hard bugs and regressions |
| `domain-modeling` | `mattpocock/skills` | sharpening CONTEXT.md language and ADR decisions |
| `grilling` | `mattpocock/skills` | reusable plan/design interview loop |
| `grill-with-docs` | `mattpocock/skills` | stress-testing plans against docs and ADRs |
| `implement` | `mattpocock/skills` | implementing a prepared ticket |
| `improve-codebase-architecture` | `mattpocock/skills` | deeper modules, cleaner seams, testability |
| `research` | `mattpocock/skills` | evidence-backed project research |
| `to-spec` | `mattpocock/skills` | turning a conversation into a spec |
| `to-tickets` | `mattpocock/skills` | breaking a spec/plan into tracer-bullet tickets |
| `prototype` | `mattpocock/skills` | throwaway UI or logic prototypes |
| `wayfinder` | `mattpocock/skills` | mapping large work into investigation tickets |
| `tdd` | local fork | red/green/refactor implementation |
| `worktrunk` | `max-sixty/worktrunk` | branch and worktree workflow |
| `thermo-nuclear-code-quality-review` | `cursor/plugins` | strict maintainability review |
| `handoff` | `mattpocock/skills` | compacting a session for another agent |
| `writing-great-skills` | `mattpocock/skills` | writing and editing predictable skills |
| `release-prep` | local | changelog, version choice, release validation |
| `plannotator-review` | `backnotprop/plannotator` | Plannotator review workflow |
| `plannotator-annotate` | `backnotprop/plannotator` | Plannotator annotations |
| `plannotator-last` | `backnotprop/plannotator` | last Plannotator report |
| `plannotator-visual-explainer` | `backnotprop/plannotator` | visual PR/review explanation |

## Local package paths

Maintained local skills/forks in this repository:

```text
skills/caveman-commit/
skills/documentation-system/
skills/tdd/
skills/release-prep/
```

The `SKILL.md` file is the entry point. Helper files in the same folder are part of the skill.
