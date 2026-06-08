---
name: worktrunk
description: Use Worktrunk for git worktree workflows whenever working in a git repository. Prefer `wt` over manual branch/worktree lifecycle commands when creating task branches, switching contexts, spawning parallel agents, merging locally, cleaning up merged branches, configuring hooks, or inspecting multi-worktree status. Triggers include git workflow requests, branch creation, branch switching, worktrees, parallel agents, stacked branches, merge cleanup, hook setup, and worktree status.
allowed-tools: Bash(wt:*), Bash(git:*), Bash(gh:*), Bash(tmux:*)
---

# Worktrunk

Use Worktrunk as the default workflow layer for git repositories.

Worktrunk does not replace all git commands. Use it for worktree and branch lifecycle operations, and use plain git for low-level inspection like `git diff`, `git show`, `git log`, `git commit`, and `git push`.

## Core Rules

1. Prefer `wt switch` over manual `git switch`, `git checkout`, `git worktree add`, or `cd`-based worktree navigation when the task involves changing working context.
2. Prefer `wt switch --create <branch>` for new task branches.
3. Prefer `wt switch --create <branch> --base=@` for stacked work that should build on the current branch.
4. Prefer `wt list` to understand all active worktrees before proposing branch cleanup or parallel work.
5. Prefer `wt merge` for local merge-and-cleanup workflows, and `wt remove` for deleting merged worktrees after remote PR merges.
6. Never use raw `git worktree add/remove` unless Worktrunk cannot express the operation.

## Start Here

When a task touches git inside a repository, orient with:

```bash
git rev-parse --show-toplevel
git status --short --branch
wt list
```

If the task may involve CI or branches without worktrees, use:

```bash
wt list --full --branches
```

This gives the agent a worktree-aware view before making changes.

## Preferred Workflows

### New task branch

Create a new worktree instead of reusing the current directory:

```bash
wt switch --create feature-branch
```

If the user also wants to launch a tool immediately:

```bash
wt switch --create feature-branch -x '<command>'
```

Arguments after `--` are passed through to the command:

```bash
wt switch --create feature-branch -x claude -- 'Implement the feature'
```

### Switch contexts

Use Worktrunk shortcuts whenever they fit:

```bash
wt switch ^
wt switch -
wt switch @
wt switch pr:123
```

### Parallel agent handoff

When spawning another agent or long-running parallel task, create a dedicated worktree and launch it inside `tmux`:

```bash
tmux new-session -d -s feature-auth "wt switch --create feature-auth -x claude -- 'Implement auth flow'"
```

Use branch-based tmux session names derived from `{{ branch | sanitize }}` when templating hooks or commands.

### Stacked work

When the next task should build on the current branch instead of the default branch:

```bash
wt switch --create feature-part-2 --base=@
```

### Local merge workflow

If the user wants a local merge into the default branch, prefer:

```bash
wt merge
```

Useful variants:

```bash
wt merge develop
wt merge --no-remove
wt merge --no-squash
```

### Cleanup after remote merge

If a PR merged on GitHub and the local worktree just needs cleanup:

```bash
wt remove
```

### Mark branch status

Use markers when they help coordinate parallel work:

```bash
wt config state marker set "🤖"
wt config state marker set "💬" --branch feature-auth
wt config state marker clear --branch feature-auth
```

## Hooks And Project Automation

When the user asks to set up project automation, prefer `.config/wt.toml` hooks instead of one-off shell rituals.

Common patterns:

- `post-create` for blocking setup like dependency installation or env file generation
- `post-start` for background tasks like dev servers, cache copying, or watchers
- `pre-commit` for fast validation
- `pre-merge` for tests and builds that gate `wt merge`
- `post-remove` for cleanup of background services

Read `references/common-patterns.md` before writing hook configs.

## Decision Rules

- Use `wt` for branch/worktree lifecycle.
- Use `git` for diff/log/show/commit/push level operations.
- Use `gh` with `wt switch pr:<n>` when a GitHub PR branch needs a local worktree.
- Use `tmux` for background agent sessions or long-running commands tied to a worktree.

## Avoid These Anti-Patterns

- Creating a feature branch in the current directory when a dedicated worktree is more appropriate
- Running `git worktree add` manually when `wt switch --create` would do it
- Manually deleting worktree directories instead of `wt remove`
- Using ad hoc branch names without checking `wt list` first when several parallel branches already exist
- Using `git switch` to retarget a worktree unless the task specifically requires changing branches in place

## Common Failure Cases

- Branch does not exist: use `wt switch --create <branch>`
- Target path occupied: switch to the existing worktree or use `--clobber` only when the stale path is clearly safe to remove
- Shell does not change directories: run `wt config shell install`
- Hooks block progress: use `--no-verify` only when the user wants hooks skipped, otherwise inspect `.config/wt.toml` and logs
- Need the default branch name without assuming `main`: use `wt config state default-branch`

## Quick Reference

```bash
wt list
wt list --full --branches
wt switch --create feature-x
wt switch --create feature-y --base=@
wt switch pr:123
wt merge
wt remove
wt config show --full
wt config state default-branch
```

## References

| Reference | When to Read |
|-----------|--------------|
| [references/common-patterns.md](references/common-patterns.md) | Before configuring hooks or parallel-agent workflows |
