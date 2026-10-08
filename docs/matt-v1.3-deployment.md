# Deploy the Matt v1.3.1 refresh

This checklist is a deployment gate, not an installer script. The package stages 21 unchanged Matt skill directories at one immutable v1.3.1 commit. Maintained TDD keeps its testing discipline and now reads `GLOSSARY.md`. Project files, global instructions, and standalone skills are not migrated automatically.

Complete this cutover only with separate owner approval for installation, project edits, standalone-skill retirement, and any mise capture/sync. Passing catalog, test, validation, or pack checks does not satisfy the live steps below.

## 1. Identify actual domain glossaries and active consumers

Inventory the projects and worktrees where the skills are used. Read each candidate before classifying it: a file called `CONTEXT.md` is not necessarily a domain glossary. Inspect instruction pointers, documentation links, scripts, and existing `docs/agents/domain.md` files, including untracked local configuration where relevant.

The read-only local inventory found two distinct domain glossaries:

```text
~/repos/barlevalon/kielbasa/CONTEXT.md
~/repos/barlevalon/connie/CONTEXT.md
```

There were six copies including three Kielbasa worktrees and the Connie prototype worktree. No domain maps or `GLOSSARY.md` files were found in the scanned ungated repositories. This is an inventory snapshot, not an exhaustive claim about every host, clone, or learning workspace.

Jira-gated xPnA, xPnAOps, and xcl repositories/worktrees were excluded. Identify the relevant ticket or obtain an explicit gate override before inspecting or changing their domain documentation. Do not create a ticket automatically.

## 2. Coordinate the naming cutover

Check each worktree's status and coordinate with its owner through the normal workmux lifecycle. Preserve unrelated changes. Review and approve each project's migration before changing files.

For confirmed domain glossaries, the target naming is:

```text
CONTEXT.md          becomes GLOSSARY.md
CONTEXT-MAP.md      becomes GLOSSARY-MAP.md
```

Update the corresponding instruction pointers, map links, and other live consumers in the same cutover. If a destination already exists, stop and reconcile its purpose/content with the owner rather than overwriting it. Preserve glossary content; do not bulk-rename unrelated context files or create two competing glossaries. ADR locations remain unchanged.

Pause affected domain-writing workflows during the cutover: old skills can recreate `CONTEXT.md` after a rename, while new skills can create a divergent `GLOSSARY.md` before migration. Resume them only after their files, instruction pointers, and loaded skills agree. Existing worktrees need owner coordination; do not rewrite another task's branch automatically.

## 3. Resolve standalone ownership and install

Before enabling the package versions, review the standalone `setup-matt-pocock-skills` and `teach` directories and their mise declarations. Preserve any local customizations and learning-workspace data. Retire conflicting copies and their restoration declarations only with separate approval; do not remove unmarked directories automatically or restore them over package-owned skills.

Use the selected install ownership model and an explicitly approved package release or local source. File bootstrap still fetches the selected Matt ref (default `main`); the retained `matt-v1.2` bundle name is a selection identifier, not a release pin. Use an explicit approved ref when reproducibility is required.

Restart affected Pi sessions or reload skill discovery after the approved installation. Keep affected workflows paused until the shared loading rule and runtime check below are complete; restart sessions that still carry old loaded skill instructions before resuming domain-writing work.

## 4. After deployment, apply and verify shared Pi reference loading

The [shared loading rule](setup.md#skill-loading-across-harnesses) is documented, but its global application is deferred until the package changes are deployed. On the inspected host, `~/.agents/AGENTS.md` is the canonical tracked file and `~/.pi/agent/AGENTS.md` is its mise-managed symlink. Mise automatically captures edits and is configured for GitHub sync. Obtain separate approval for that normal capture/sync before applying the rule; do not bypass ownership or silently change watcher policy.

Load skill references through Pi's `read` tool when the upstream text names an unavailable `Skill` tool. Preserve explicit-only invocation and existing action approvals. Leave generated upstream snapshots unchanged.

In an owner-approved fresh Pi session or disposable workspace, explicitly invoke `grill-with-docs` on a harmless example. Verify that it reads both `grilling/SKILL.md` and `domain-modeling/SKILL.md`, resolves supporting references, and uses the migrated glossary convention. Check actual tool calls rather than trusting a verbal claim. This runtime smoke test remains pending; package checks do not prove the global rule is active.

## Completion evidence

- Every affected project/worktree has one authoritative glossary convention and correct pointers; unrelated `CONTEXT.md` files remain unchanged.
- Maintained TDD and upstream domain readers agree with those files.
- The Pi runtime smoke test actually loads both references through `read`.
- Setup, retro, and teach remain explicit-only and are discovered once each, with no standalone-copy conflicts.
- Learning records, missions, resources, and existing lesson assets are preserved.
- All catalog/package checks pass for the exact candidate being installed.

Until these checks have evidence, the source refresh is staged, not a completed deployment.
