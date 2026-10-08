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
| `domain-modeling` | `mattpocock/skills` | sharpening GLOSSARY.md language and ADR decisions |
| `grilling` | `mattpocock/skills` | reusable plan/design interview loop |
| `grill-with-docs` | `mattpocock/skills` | stress-testing plans against docs and ADRs |
| `implement` | `mattpocock/skills` | implementing a prepared ticket |
| `improve-codebase-architecture` | `mattpocock/skills` | deeper modules, cleaner seams, testability |
| `research` | `mattpocock/skills` | evidence-backed project research |
| `retro` | `mattpocock/skills` | explicitly invoked retrospective on the agent environment |
| `setup-matt-pocock-skills` | `mattpocock/skills` | explicitly configuring a project's tracker, optional triage labels, and domain layout |
| `teach` | `mattpocock/skills` | explicitly teaching a topic across sessions in a learning workspace |
| `to-spec` | `mattpocock/skills` | turning a conversation into a spec |
| `to-tickets` | `mattpocock/skills` | breaking a spec/plan into tracer-bullet tickets |
| `prototype` | `mattpocock/skills` | throwaway UI or logic prototypes |
| `wayfinder` | `mattpocock/skills` | mapping large work into investigation tickets |
| `wizard` | `mattpocock/skills` | generating interactive scripts for human-only procedures |
| `tdd` | local fork | red/green/refactor implementation |
| `worktrunk` | `max-sixty/worktrunk` | branch and worktree workflow |
| `thermo-nuclear-code-quality-review` | `cursor/plugins` | strict maintainability review |
| `handoff` | `mattpocock/skills` | compacting a session for another agent |
| `to-questionnaire` | `mattpocock/skills` | collecting decisions asynchronously from another person |
| `wait-what` | `mattpocock/skills` | re-pitching an unclear or overly verbose response |
| `writing-for-agents` | `mattpocock/skills` | writing and editing predictable agent-facing instructions |
| `release-prep` | local | changelog, version choice, release validation |
| `pr` | local synthesis | explicitly invoked PR drafting, evidence, merge risk, and approval-gated browser creation |

All 21 selected Matt skills are unchanged upstream directories pinned to v1.3.1. Maintained `tdd` stays separate and reads `GLOSSARY.md` without changing its RED/GREEN/REFACTOR discipline. Complete the [deployment checklist](matt-v1.3-deployment.md) before adopting the new domain convention and shared Pi loading rule. The catalog does not perform that cutover automatically.

`setup-matt-pocock-skills` is bundled unchanged at v1.3.1, matching the GLOSSARY-based domain readers. It configures a project, not the skill selection or installation. The file-bootstrap workflow bundles include it alongside their consumers. See [project configuration](setup.md#configure-a-projects-workflows).

`teach` is bundled unchanged at v1.3.1, including all four workspace-format references. It adds reusable lesson-component guidance, retrieval practice, spacing, and confirmation before mission changes. It belongs in the global file-bootstrap selection, not the project engineering bundles. See [learning workspaces](setup.md#learn-across-sessions).

## Local package paths

Maintained local skills/forks in this repository:

```text
skills/caveman-commit/
skills/documentation-system/
skills/tdd/
skills/release-prep/
skills/pr/
```

The `SKILL.md` file is the entry point. Helper files in the same folder are part of the skill.
