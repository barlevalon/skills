# Setup

Use the installer. With no flags, it bootstraps the normal agentic environment:

```bash
npx @barlevalon/skills@latest install
```

Default bootstrap:

- Repo workflow layer: fetch Matt Pocock v1.1 workflow skills from `github:mattpocock/skills`, copy them to `.agents/skills/` and `.claude/skills/`, then update `AGENTS.md` and `.github/copilot-instructions.md`.
- Global personal layer: copy this package's barlevalon skills to `~/.agents/skills/` and `~/.claude/skills/`.
- Existing skill folders that are not part of those sets are left untouched and listed after install.

Advanced escape hatches:

```bash
# Install tdd and diagnose from this package for VS Code extensions
npx @barlevalon/skills@latest install --agent vscode --skill tdd --skill diagnose --yes

# Install Matt Pocock's core flow directly from github:mattpocock/skills
npx @barlevalon/skills@latest install --bundle matt-core --agent vscode --project --yes

# Install Matt Pocock's Wayfinder flow directly from github:mattpocock/skills
npx @barlevalon/skills@latest install --bundle matt-wayfinder --agent vscode --project --yes

# Install one upstream Matt skill directly
npx @barlevalon/skills@latest install --source matt --skill wayfinder --agent vscode --project --yes

# Install every skill from this package for every supported harness
npx @barlevalon/skills@latest install --all --yes

# Install release-prep globally for Claude Code
npx @barlevalon/skills@latest install --agent claude-code --skill release-prep --global --yes
```

List available skills without full descriptions:

```bash
npx @barlevalon/skills@latest install --list
npx @barlevalon/skills@latest install --source matt --list
```

## Advanced targets

| Harness | What the installer does |
|---|---|
| Pi | Runs `pi install` for bundled npm skills. For external GitHub sources, copies selected skill folders to `.agents/skills/` or `~/.agents/skills/`, which Pi also reads. |
| OpenCode | Copies selected skill folders to `.opencode/skills/` or `~/.config/opencode/skills/` |
| VS Code | Project scope: copies skills to `.agents/skills/` and `.claude/skills/`, then updates `AGENTS.md` and `.github/copilot-instructions.md`. Global scope: copies skills to `~/.agents/skills/` and `~/.claude/skills/` |
| Claude Code | Copies selected skill folders to `.claude/skills/` or `~/.claude/skills/` |

The VS Code target is meant for repositories used with Copilot, Claude Code, and Codex extensions. Project scope installs native skill folders where extensions can use them and adds instruction files for tools that rely on repository guidance. Global scope skips Copilot repo instructions because those are project files.

For skill descriptions, use the [README skill table](../README.md#pick-a-skill), [skill reference](usage.md), or Matt's upstream repo when installing Matt bundles.

## External Matt Pocock bundles

The installer can fetch selected skills directly from `github:mattpocock/skills` instead of copying a vendored fork from this repo.

Available bundles:

| Bundle | Includes |
|---|---|
| `matt-core` | `grilling`, `to-spec`, `to-tickets`, `implement`, `code-review`, `tdd` |
| `matt-wayfinder` | `wayfinder`, `research`, `prototype`, `grilling`, `domain-modeling` |
| `matt-v1.1` | Matt's v1.1 workflow set: core flow, Wayfinder, and supporting design skills |

Use `--ref <branch-or-commit>` to pin a specific upstream revision. Installed markers record the resolved upstream commit.

`--bundle` selects a fixed Matt skill subset, so do not combine it with `--skill` or `--all`. Use `--agent all --bundle <name>` if you want a bundle installed for every harness.

## Options

```text
-a, --agent <name>    Harness: pi, opencode, vscode, claude-code, all
-s, --skill <name>    Skill to install. Use '*' or all for every skill
    --source <name>   Skill source: barlevalon (default), matt
    --bundle <name>   Skill bundle: matt-core, matt-wayfinder, matt-v1.1
    --ref <ref>       Git ref for external sources (default: main)
-g, --global          Install to user scope where supported
-p, --project         Install to project scope (default)
    --all             Select all harnesses and all skills (do not combine with --bundle)
-y, --yes             Do not prompt; accept defaults
    --force           Replace existing unmanaged skill directories or switch managed sources
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
