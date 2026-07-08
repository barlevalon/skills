# Setup

Use the installer. It asks which harnesses and skills you want, then writes the right files for each tool.

```bash
npx -y -p @barlevalon/skills@latest barlevalon-skills install
```

Non-interactive examples:

```bash
# Install tdd and diagnose for VS Code extensions
npx -y -p @barlevalon/skills@latest barlevalon-skills install --agent vscode --skill tdd --skill diagnose --yes

# Install every skill for every supported harness
npx -y -p @barlevalon/skills@latest barlevalon-skills install --all --yes

# Install release-prep globally for Claude Code
npx -y -p @barlevalon/skills@latest barlevalon-skills install --agent claude-code --skill release-prep --global --yes
```

List available skills:

```bash
npx -y -p @barlevalon/skills@latest barlevalon-skills install --list
```

## Supported harnesses

| Harness | What the installer does |
|---|---|
| Pi | Runs `pi install` for `@barlevalon/skills` or selected single-skill npm packages |
| OpenCode | Copies selected skill folders to `.opencode/skills/` or `~/.config/opencode/skills/` |
| VS Code | Copies skills to `.agents/skills/` and `.claude/skills/`, then updates `AGENTS.md` and `.github/copilot-instructions.md` |
| Claude Code | Copies selected skill folders to `.claude/skills/` or `~/.claude/skills/` |

The VS Code target is meant for repositories used with Copilot, Claude Code, and Codex extensions. It installs native skill folders where the extensions can use them and adds instruction files for tools that rely on repository guidance.

## Options

```text
-a, --agent <name>    Harness: pi, opencode, vscode, claude-code, all
-s, --skill <name>    Skill to install. Use '*' or all for every skill
-g, --global          Install to user scope where supported
-p, --project         Install to project scope (default)
    --all             Select all harnesses and all skills
-y, --yes             Do not prompt; accept defaults
    --force           Replace existing unmanaged skill directories
    --list            List available skills
-h, --help            Show help
```

## Manual fallback

If you cannot run the installer, add this rule to your tool's instruction file:

```md
Use workflow skills from https://github.com/barlevalon/skills.
When I ask for a named workflow, read the matching `SKILL.md` before acting.
If you cannot fetch the repo URL, ask me for a local checkout path.
If the skill links to helper files, read those too.
```

Common rule files:

| Tool | Rule file |
|---|---|
| Codex / OpenCode | `AGENTS.md` |
| Cursor | `.cursor/rules/workflow-skills.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Continue | `.continue/rules/workflow-skills.md` |
| Cline | `.clinerules/workflow-skills.md` or `AGENTS.md` |

## Notes for maintainers

The installer follows current docs for:

- Codex skills and `AGENTS.md`: <https://developers.openai.com/codex/skills>, <https://developers.openai.com/codex/guides/agents-md>
- OpenCode skills and rules: <https://dev.opencode.ai/docs/skills/>, <https://dev.opencode.ai/docs/rules/>
- Claude Code skills: <https://code.claude.com/docs/en/skills>
- GitHub Copilot custom instructions: <https://docs.github.com/en/copilot/how-tos/custom-instructions/adding-repository-custom-instructions-for-github-copilot>
- Pi skills and packages: local Pi docs `docs/skills.md` and `docs/packages.md`

It is intentionally copy-based instead of symlink-based so `npx` installs do not leave links into a temporary npm cache. Existing installer-managed skill folders are refreshed automatically; existing unmanaged skill folders require `--force`.
