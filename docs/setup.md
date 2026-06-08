# Setup

These skills are plain Markdown files. Your agent can use them from a GitHub URL, an npm skill package, or a local checkout.

## Fastest path

Give your agent this repo:

```text
https://github.com/barlevalon/skills
```

Then ask for a workflow:

```text
Use TDD to implement this change.
```

```text
Diagnose this bug before fixing it.
```

```text
Prepare a release plan.
```

## If your agent needs local files

Clone the repo:

```bash
git clone https://github.com/barlevalon/skills.git
```

Then give the agent the whole bundle:

```text
skills/
```

Or one skill:

```text
skills/engineering/tdd/SKILL.md
skills/release/release-prep/SKILL.md
skills/documentation/documentation-system/SKILL.md
```

If a skill links to helper files, give the agent the whole skill folder.

## opencode

opencode reads project instructions from `AGENTS.md`.

In the project where you use opencode, add a short skills block to `AGENTS.md`:

```md
## Agent skills

Use workflow skills from https://github.com/barlevalon/skills.

When I ask for a named workflow, read the matching `SKILL.md` before acting.
Examples:
- TDD: `skills/engineering/tdd/SKILL.md`
- Diagnose: `skills/engineering/diagnose/SKILL.md`
- Release prep: `skills/release/release-prep/SKILL.md`

If you cannot fetch GitHub URLs directly, ask me for the local checkout path.
If a skill links to helper files, read those from the same skill folder too.
```

Then run opencode in your project and ask normally:

```text
Use TDD to implement this change.
```

Tip: if you do not have `AGENTS.md` yet, run `/init` in opencode first, then add the block above.

## VS Code with AI extensions

Best option: tell the extension to use this repo:

```text
Use workflow skills from https://github.com/barlevalon/skills.
For TDD, read skills/engineering/tdd/SKILL.md before acting.
```

If your extension cannot fetch repo URLs, add this repo as a second folder in your VS Code workspace:

1. Clone `https://github.com/barlevalon/skills`.
2. Open your project in VS Code.
3. Use **File → Add Folder to Workspace...**.
4. Add the cloned skills repo folder.
5. Ask your extension to use a skill file.

Example prompts:

```text
Use the TDD workflow from skills/engineering/tdd/SKILL.md to implement this change.
```

```text
Read skills/release/release-prep/SKILL.md and prepare a release plan.
```

```text
Use skills/documentation/documentation-system/SKILL.md to clean up these docs.
```

If your extension supports custom instructions, add:

```md
Use workflow skills from https://github.com/barlevalon/skills. When I ask for a named workflow, read the matching `SKILL.md` before acting. If you need local files, ask for the checkout path.
```

## npm package

If your agent supports npm skill packages, use:

```text
@barlevalon/skills
```

Single-skill packages are also available:

```text
@barlevalon/tdd-skill
@barlevalon/release-prep-skill
```

## Pi

Pi users can install from npm:

```bash
pi install npm:@barlevalon/skills
```

Or run from a checkout:

```bash
pi -e .
```

## Updating

If you use the GitHub repo URL, there is nothing to update.

If you cloned the repo:

```bash
git pull
```
