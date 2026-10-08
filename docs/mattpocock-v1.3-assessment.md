# Matt Pocock skills 1.3 adoption assessment

Assessed on 2026-10-05. Recommendation: selectively adopt useful additions, but do not install the whole upstream collection or overwrite maintained local workflows.

## Baseline and evidence

- `barlevalon/skills` checkout and GitHub HEAD both resolve to `47c73bb61fd389912d43c07101cdd780308adb97`, package version **2.3.0**. The worktree was clean before this assessment.
- Pi registers `npm:@barlevalon/skills` in `~/.pi/agent/settings.json`. Its installed `catalog/` and `skills/` files match the checkout byte-for-byte; this is not an installed-package drift problem.
- The package contains **4 maintained skills + 28 upstream skills**, including **18 Matt skills pinned to v1.2.3**, commit `6acc160e4e0cd062dbbbd7a1b26ae92855edf07e`. The maintained `tdd` deliberately replaces upstream TDD.
- Compared those 18 complete skill directories against **v1.3.1**, commit `24fe0ef7737efae15c87225755e9f6f5965e4888`. Seventeen have textual changes; `implement` is unchanged. Many changes are punctuation and equivalent rephrasing, not new engineering methods.
- Also inspected local `setup-matt-pocock-skills`, `teach`, `show-me`, `open-pr`, and `coordinator`, plus available skill/subagent discovery.
- v1.3.0 is `984a2c023c9fb42bb6ea40c70a652284a109dc05`. The v1.3.1 patch updates `ask-matt` and the diagnosing-bugs documentation, plus release metadata. It does not change any of the current 18 curated skill implementations. Prefer v1.3.1 if refreshing, but do not attribute additional curated-skill improvements to the patch.

Primary sources: [current catalog manifest](https://github.com/barlevalon/skills/blob/47c73bb61fd389912d43c07101cdd780308adb97/catalog/sources.json), [upstream changelog](https://github.com/mattpocock/skills/blob/24fe0ef7737efae15c87225755e9f6f5965e4888/CHANGELOG.md), [v1.3.0 to v1.3.1 comparison](https://github.com/mattpocock/skills/compare/v1.3.0...v1.3.1).

## What is worth adopting

### 1. `pr`: adopt its evidence and risk contract

Upstream adds a reusable PR-body reference with three sections: visual summary, observed before/after evidence, and merge danger (reversibility plus blast radius).

You already have the visual part in local `show-me`; upstream explicitly credits and reproduces that material. The real new value is **evidence and rollback/risk**, not another diagram skill.

Local `open-pr` currently uses Summary / Changes / Testing. Keep it as the explicitly invoked publication workflow; make PR-body guidance authoritative in one place rather than maintaining two conflicting templates. A catalog `pr` reference is useful across writers and harnesses; `open-pr` can consume it. Preserve repository templates and Jira references, distinguish actual observations from illustrative pseudocode, and state when before-evidence is unavailable.

Do not take PR-formatting instructions as permission to commit, push, or publish. Local `open-pr` already directs automatic committing and pushing; that is an existing authority issue, not a v1.3 regression.

Sources: upstream [pr/SKILL.md](https://github.com/mattpocock/skills/blob/24fe0ef7737efae15c87225755e9f6f5965e4888/skills/engineering/pr/SKILL.md), [credits](https://github.com/mattpocock/skills/blob/24fe0ef7737efae15c87225755e9f6f5965e4888/skills/engineering/pr/CREDITS.md); local `~/.pi/agent/skills/open-pr/SKILL.md` and `~/.agents/skills/show-me/SKILL.md`.

### 2. `retro`: adopt, explicitly invoked and recommendation-only

This fills a real gap: learning from a session by improving the agent environment, not immediately refactoring the application.

Useful ideas:

- Inspect primary session evidence.
- Find existing checks before inventing new checks.
- Convert mechanical mistakes into deterministic checks rather than growing instruction files.
- Identify missing navigation pointers, expensive tool usage, and inaccessible information.

Keep its explicit-only invocation. Restrict log reading to the selected session, redact sensitive evidence, and present candidates before editing hooks, CI, or global instructions. Do not adopt the blanket claim that coding standards belong only to reviewers: implementers still need relevant constraints and cheap checks. Its only direct skill dependency is `writing-for-agents`, already present.

Source: upstream [retro/SKILL.md](https://github.com/mattpocock/skills/blob/24fe0ef7737efae15c87225755e9f6f5965e4888/skills/engineering/retro/SKILL.md).

### 3. `setup-matt-pocock-skills`: refresh and give it one owner

This is a more important maintenance gap than adding a router. The package omits setup from both its curated Matt catalog and default workflow bundle, even though several shipped workflows require it. Your machine happens to supply an older local copy through `~/.agents/skills/`, symlinked from `~/.pi/agent/skills/`.

That copy still advertises `to-issues`, `to-prd`, `diagnose`, and `zoom-out`, and configures `CONTEXT.md`. Latest setup uses current names, skips triage-label setup when triage is absent, and simplifies the default domain-layout questions.

Put setup under the same maintained distribution ownership as its consumers, then retire the competing local copy only after checking for local edits. Carry the entire directory, including tracker/domain templates. For Jira and Orca-linked Linear, record the actual workflow, ticket gate, and approval rules; a GitHub remote does not establish GitHub Issues as the work tracker.

Source: upstream [setup directory](https://github.com/mattpocock/skills/tree/24fe0ef7737efae15c87225755e9f6f5965e4888/skills/engineering/setup-matt-pocock-skills); local `~/.agents/skills/setup-matt-pocock-skills/SKILL.md`; current `bin/skills.mjs:31–61`.

### 4. `teach`: refresh the existing local skill if still used

This is not newly introduced in 1.3, but your local copy is older. Latest adds reusable lesson assets, retrieval/spacing/interleaving guidance, lesson cross-links, and confirmation before changing the learning mission.

Refresh the complete skill directory rather than only its entry point. Keep one discovered `teach`; do not add a package copy alongside the local one without a deliberate ownership migration. Learning-workspace data is separate and should not be replaced.

Source: upstream [teach directory](https://github.com/mattpocock/skills/tree/24fe0ef7737efae15c87225755e9f6f5965e4888/skills/productivity/teach); local `~/.pi/agent/skills/teach/`.

## Refresh blockers

### Domain convention changes are a migration, not a cosmetic refresh

Upstream now reads and writes `GLOSSARY.md` / `GLOSSARY-MAP.md` instead of `CONTEXT.md` / `CONTEXT-MAP.md`. It renames the bundled format reference too. This affects domain-modeling, codebase-design, diagnosing-bugs, architecture, wait-what, setup, and upstream TDD.

Your maintained `skills/tdd/SKILL.md:23` and `docs/usage.md:30` still use CONTEXT. Existing project domain files and steering pointers were not inventoried in this assessment.

Before changing the main Matt pin, inspect affected projects and migrate only actual domain glossaries and their references. Do not bulk-rename every file called CONTEXT: some may have a different purpose. Update maintained TDD's reader and setup output with the same convention. Do not let two divergent glossaries appear. A temporary fallback is justified only for demonstrated live consumers that cannot migrate together; it should not become permanent dual-mode policy.

### Explicit Skill-tool wording is not portable to this Pi setup

Upstream replaces several `/skill` references with instructions such as `Call the Skill tool twice, for "grilling" and "domain-modeling"`. This Pi exposes skill loading through `read`, not a `Skill` tool; explicit human invocation is `/skill:name`.

The smallest adaptation is one Pi-side instruction mapping reference-skill loading to reading the advertised SKILL.md and its needed references, while preserving explicit-only orchestration. Smoke-test it before accepting the new pin. Do not rewrite generated snapshots by hand or invent an unavailable tool. If that boundary mapping proves unreliable, make a narrowly owned maintained fork rather than adding an untested compatibility framework.

Sources: upstream `grill-with-docs/SKILL.md:7`, `wayfinder/SKILL.md:77–79,111–115,124`; installed Pi `docs/skills.md`; current `catalog/README.md` and `scripts/sync-catalog.mjs`.

### Installer selection and package pin must agree on the intended scope

Pi loads immutable snapshots selected in `catalog/sources.json`. File bootstrap instead fetches Matt `main`, using a fixed bundle named `matt-v1.2`. Changing the catalog pin alone will not add new skills to the default file bootstrap, and changing the bootstrap will not update the Pi snapshot.

Update both selections deliberately. Setup must accompany workflows that require it. `pr` can be a broadly available writing reference; `retro` stays explicit-only. No need to import upstream packaging, Changesets, or Claude plugin infrastructure: the existing npm/Pi catalog already solves distribution.

## Preserve or defer

- **Preserve maintained TDD.** It enforces observed RED, safe handling of existing code, green refactoring, CLI contract testing, and manual-QA regressions. Upstream explicitly makes the loop red/green only and moves refactoring to review. The fork already includes independent expected values and seam guidance. Update domain naming, not its discipline. Source: `skills/tdd/SKILL.md`, upstream `tdd/SKILL.md:34–38`.
- **Defer `implement-spec`.** Its task graph/frontier idea is useful, but the shipped recipe directs background implementers, resets to an integration baseline, merger agents, draft PR creation, ticket resolution, and worktree cleanup. This is not a drop-in replacement for native Pi plus workmux ownership. Concurrent workers synchronizing before reporting also does not guarantee fast-forward integration after another worker lands. Any adoption needs serialized integration, refreshed validation, explicit ticket/worktree ownership, and approval boundaries. Source: upstream `implement-spec/SKILL.md:23–40`.
- **Skip `ask-matt` for now.** It routes over a collection you intentionally do not ship, including triage, grill-me, and implement-spec. Current workflow docs already provide a selection map. A router with unavailable or rejected targets creates another maintenance obligation.
- **Keep triage optional.** Issue-state mutation and tracker vocabulary need project-specific authorization. Do not install it merely to satisfy a reference, especially when most work is Jira-gated.
- **Keep local merge/rebase/workmux and platform integrations.** Upstream removing `resolving-merge-conflicts` does not imply your worktree lifecycle skills are obsolete. Nothing here replaces Orca, Jira, Slack, Obsidian, crash diagnosis, or desktop skills.
- **Do not import in-progress or narrow misc skills by default.** Writing experiments, shoehorn migration, exercise scaffolding, and Claude-specific git guardrails have no demonstrated need in this task.

## Existing catalog coverage

| Group | Skills | Actual change / decision |
|---|---|---|
| Unchanged | implement | Keep; no v1.3 implementation upgrade. |
| Predominantly wording | research, prototype, wizard, to-questionnaire, writing-for-agents | Refresh with the pin if convenient; not a reason to migrate by themselves. |
| Domain convention | domain-modeling, codebase-design, improve-codebase-architecture, wait-what | Coordinate GLOSSARY migration; wait-what also follows the map. |
| Loading / setup behavior | grill-with-docs, handoff, code-review, to-spec, to-tickets, wayfinder | Map skill loading to Pi; retain the safer request for human setup rather than automatically invoking it. |
| Interview presentation | grilling | Clearer two-question round formatting; the underlying interview discipline is already present. |
| Bug workflow | diagnosing-bugs | Domain rename and cleanup-only ending; secret redaction was already present in your v1.2.3 snapshot. |

Diagnosing-bugs no longer automatically hands off to architecture after the fix. Accept that removal rather than creating another fork solely to restore it; optionally suggest a separate retro or architecture session when evidence warrants it. The scout preferred retaining the old prevention prompt, but optional follow-up achieves that without an automatic explicit-only skill handoff.

Several inherited workflows already delegate or mutate state: research requires a background agent; code-review uses parallel reviewers; wayfinder creates and closes tickets. Those are not introduced by v1.3. Always apply the existing native-Pi, workmux, and ticket-approval rules. Wayfinder's research subagent loading research also needs care to avoid nested delegation.

A separate discovery check found stale `diagnose` and `zoom-out` user agents still advertised by pi-subagents even though matching old skills are under `~/.agents/skills.disabled/`. This is evidence of another discovery surface, not proof of its cause. Check and retire stale profiles deliberately; moving a skill out of Pi skill discovery is not demonstrated to remove its subagent identity.

## Recommended implementation boundary

```text
barlevalon/skills
  keep: maintained TDD, release-prep, documentation-system, caveman-commit
  refresh after blockers: existing Matt pin to v1.3.1
  curate: pr, retro, setup; teach if used

local configuration
  keep: show-me and native platform/worktree integrations
  align: open-pr body guidance and publication approvals
  migrate ownership: old setup / teach copies without duplicates
  adapt: one Pi-side skill-loading rule

not included
  implement-spec, full ask-matt router, automatic triage adoption
```

Implementation should be a catalog/configuration update, not a Git merge of Matt's repository. Generated catalog files remain generated; maintain provenance and license notices. No upstream workflow was executed during assessment.

Acceptance checks for a later approved change:

1. Catalog sync/check, tests, package/catalog validation, and pack checks pass.
2. Pi discovers intended names once; explicit-only setup/retro/teach remain hidden from automatic selection.
3. A grill-with-docs smoke test actually loads both references through Pi.
4. Domain readers and setup output agree; no existing glossary becomes invisible.
5. A PR draft preserves required ticket references and contains actual evidence plus rollback/blast-radius reasoning, without unapproved publication.
6. Retro produces recommendations only; no surprise global steering, hook, CI, or tracker edits.

This assessment added only this report. It did not install, merge, rename domain files, modify skills or settings, commit, push, publish, or mutate any issue tracker.
