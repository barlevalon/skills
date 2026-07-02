# Skill reference

Ask for a skill by name, or describe the work and let the agent choose.

```text
Use the tdd skill.
Use diagnose before fixing this bug.
Use release-prep for the next release.
```

## Full list

| Skill | Use it for |
|---|---|
| `caveman` | concise responses |
| `caveman-commit` | commit messages |
| `caveman-help` | caveman mode reference |
| `find-skills` | finding more skills |
| `documentation-system` | tutorials, how-tos, reference docs, explanations |
| `codebase-design` | reusable deep-module design vocabulary |
| `diagnose` | hard bugs and regressions |
| `domain-modeling` | sharpening CONTEXT.md language and ADR decisions |
| `grilling` | reusable plan/design interview loop |
| `grill-with-docs` | stress-testing plans against docs and ADRs |
| `improve-codebase-architecture` | deeper modules, cleaner seams, testability |
| `prd-to-plan` | turning a PRD into implementation phases |
| `prototype` | throwaway UI or logic prototypes |
| `tdd` | red/green/refactor implementation |
| `worktrunk` | branch and worktree workflow |
| `write-a-prd` | creating a PRD |
| `zoom-out` | broader context before changing code |
| `thermo-nuclear-code-quality-review` | strict maintainability review |
| `handoff` | compacting a session for another agent |
| `writing-great-skills` | writing and editing predictable skills |
| `release-prep` | changelog, version choice, release validation |
| `plannotator-compound` | learning from rejected plans |
| `plannotator-setup-goal` | turning an objective into a reviewed goal package |
| `plannotator-visual-explainer` | HTML visual explanations |

## Paths

Give the agent a complete skill folder:

```text
skills/engineering/tdd/
skills/engineering/diagnose/
skills/engineering/codebase-design/
skills/engineering/domain-modeling/
skills/release/release-prep/
skills/documentation/documentation-system/
skills/productivity/writing-great-skills/
```

The `SKILL.md` file is the entry point. Helper files in the same folder are part of the skill.
