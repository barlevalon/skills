---
name: pr
description: Draft an evidence-backed PR description and open PR creation in the browser after approval.
disable-model-invocation: true
license: MIT
---

# Pull request

Own the workflow from reviewing the branch to opening the PR creation page. This skill is self-contained; it does not invoke other skills.

## 1. Gather context

- Respect the repository's tracker rules. If a ticket is required but missing, ask for it before starting repository work. Never create a ticket to satisfy that requirement.
- Check git status, current branch, remotes, and repository instructions. If the worktree is dirty, ask which changes belong and how to proceed; leave unrelated changes untouched.
- Resolve the target repository and base branch from the user's request, an existing PR, branch configuration, or the repository's default branch. Verify the base ref; ask when the target is ambiguous rather than assuming `main`.
- Read the branch diff and commits: `git diff "$base_ref"...HEAD --` and `git log "$base_ref"..HEAD --oneline`. Read changed files and relevant context. If there is no branch diff, explain that before proceeding.
- Read the repository's PR template and required ticket references. Check whether this branch already has a PR; if so, draft for that PR rather than opening a duplicate.
- Gather actual validation evidence from the session or artifacts. Run additional checks only when authorized; otherwise record what has not been verified.

Done when the target, included changes, required references, and available evidence are clear.

## 2. Draft title and body

Use a short title, at most 72 characters unless the repository specifies otherwise. Explain what changed and why in normal prose.

The repository's template and required fields take precedence. Fit the following information into that template; use this shape when none exists:

```markdown
## Summary

<what changed and why; the smallest useful sketch when it clarifies the change>

## Evidence

- **Before:** <observed failure, output, or screenshot>
- **After:** <observed passing check, output, or screenshot>
- **Not verified:** <remaining checks or unavailable evidence, if any>

## Merge Danger

**Door:** <one-way or two-way; why>
**Blast radius:** <affected users, consumers, data, or systems>
**Rollback:** <practical reversal steps, or why reversal is not straightforward>

## References

<required ticket/spec links, if any>
```

- **Summary:** choose one small diff, file/call tree, pseudocode block, or Mermaid diagram only when it explains more clearly than prose. Keep real names and relevant boundaries; do not paste the whole diff.
- **Evidence:** prefer screenshots for visual changes and exact commands with observed results for behavior changes. If before-evidence is unavailable, say so. Label illustrative pseudocode as illustration, not execution evidence; never invent runs, screenshots, or passing checks. Redact secrets and private data.
- **Merge danger:** a two-way door is practically reversible; a one-way door includes destructive migrations or external effects a code revert cannot undo. State the actual scope and rollback constraints, not a generic risk label.
- **References:** preserve required Jira or other tracker identifiers. Use automatic closing keywords only when the tracker workflow and intended closure warrant them.

Present the title and body before taking publication actions. A request to draft a description ends here.

## 3. Open creation after approval

Show the target repository, base/head branches, and any proposed commit, push, or browser action. Obtain explicit approval for actions not already authorized.

- If committing is approved, stage only the agreed files and commit them. Never commit unrelated work or require a commit merely to draft a body.
- If pushing is approved, push the agreed branch to the confirmed remote. Do not force-push or create a fork as a shortcut.
- After a commit or branch update, re-read the final diff and refresh the description and validation claims.
- For a new GitHub PR, write the body to a temporary file outside the repository and open the creation page:

```bash
gh pr create --web --repo "$repo" --base "$base" --head "$head" \
  --title "$title" --body-file "$body_file"
```

Set every variable from the verified target and approved draft; use explicit `--head` so the command does not implicitly push or fork. If authentication or browser opening fails, report the failure and provide the draft; do not switch to direct creation.

For an existing PR, provide the revised draft and link; leave remote edits for explicit approval. Never create directly, merge, or close tickets as part of this workflow.

Done when the approved creation page is open, or a draft and clear blocker have been delivered. Opening the page is not proof that a PR was submitted.
