# Worktrunk Common Patterns

Current docs checked against Worktrunk `v0.28.2`.

## Project Hook Template

Use this as a starting point for `.config/wt.toml`:

```toml
[post-create]
deps = "npm ci"

[post-start]
copy = "wt step copy-ignored"
server = "npm run dev -- --port {{ branch | hash_port }}"

[pre-commit]
lint = "npm run lint"
typecheck = "npm run typecheck"

[pre-merge]
test = "npm test"
build = "npm run build"

[post-remove]
server = "lsof -ti :{{ branch | hash_port }} -sTCP:LISTEN | xargs kill 2>/dev/null || true"

[list]
url = "http://localhost:{{ branch | hash_port }}"
```

## Parallel Agent Launch

Prefer a dedicated worktree plus a detached tmux session:

```bash
tmux new-session -d -s feature-api "wt switch --create feature-api -x claude -- 'Implement API endpoint'"
```

If the agent should build on the current branch:

```bash
tmux new-session -d -s feature-api-v2 "wt switch --create feature-api-v2 --base=@ -x claude -- 'Build on the current branch changes'"
```

## Status Inspection

For a fast overview:

```bash
wt list
```

For CI, branch-only entries, and richer context:

```bash
wt list --full --branches
```

## Safe Merge Choices

Local merge back to the default branch:

```bash
wt merge
```

Preserve the worktree after merge:

```bash
wt merge --no-remove
```

Keep commit history instead of squash:

```bash
wt merge --no-squash
```

## Remote PR Cleanup

After the PR merges remotely, clean up the local worktree:

```bash
wt remove
```

## Useful State Commands

```bash
wt config show --full
wt config state default-branch
wt config state marker set "🚧"
wt config state marker clear --branch feature-auth
```

## Decision Cheatsheet

- New task branch: `wt switch --create <branch>`
- New stacked branch: `wt switch --create <branch> --base=@`
- Jump back to default branch: `wt switch ^`
- Jump to previous worktree: `wt switch -`
- Open PR branch locally: `wt switch pr:<number>`
- Merge locally and clean up: `wt merge`
- Remove merged worktree after remote merge: `wt remove`
