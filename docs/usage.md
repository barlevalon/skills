# Skill reference

Ask for a skill by name, or describe the work and let the agent choose.

```text
Use the tdd skill.
Use diagnosing-bugs before fixing this bug.
Use release-prep for the next release.
```

## Default bootstrap skill set

The no-flag installer combines maintained local skills with canonical upstream skills fetched at install time.

| Skill | Source | Use it for |
|---|---|---|
| `caveman` | `JuliusBrussee/caveman` | concise responses |
| `caveman-help` | `JuliusBrussee/caveman` | caveman mode reference |
| `caveman-commit` | local fork | commit messages |
| `find-skills` | `vercel-labs/skills` | finding more skills |
| `documentation-system` | local | tutorials, how-tos, reference docs, explanations |
| `codebase-design` | `mattpocock/skills` | reusable deep-module design vocabulary |
| `diagnosing-bugs` | `mattpocock/skills` | hard bugs and regressions |
| `domain-modeling` | `mattpocock/skills` | sharpening CONTEXT.md language and ADR decisions |
| `grilling` | `mattpocock/skills` | reusable plan/design interview loop |
| `grill-with-docs` | `mattpocock/skills` | stress-testing plans against docs and ADRs |
| `improve-codebase-architecture` | `mattpocock/skills` | deeper modules, cleaner seams, testability |
| `to-spec` | `mattpocock/skills` | turning a conversation into a spec |
| `to-tickets` | `mattpocock/skills` | breaking a spec/plan into tracer-bullet tickets |
| `prototype` | `mattpocock/skills` | throwaway UI or logic prototypes |
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
