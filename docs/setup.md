# Setup

Choose one ownership model.

## Pi-managed global catalog

```bash
pi install npm:@barlevalon/skills
pi update --extensions
```

Pi loads the complete curated catalog globally and owns package update discovery. Upstream snapshots are pinned to immutable commits in `catalog/sources.json`; a new `@barlevalon/skills` release moves those pins.

## Scoped file bootstrap

```bash
npx @barlevalon/skills@latest install
```

Default file bootstrap:

- Repo workflow layer: fetch Matt Pocock v1.1 workflow skills from `github:mattpocock/skills`, copy them to `.agents/skills/` and `.claude/skills/`, then update `AGENTS.md` and `.github/copilot-instructions.md`.
- Global local layer: copy this package's global-purpose maintained skills/forks to `~/.agents/skills/` and `~/.claude/skills/`; maintained `tdd` stays in the repo workflow layer.
- Global upstream layer: fetch canonical non-project skills from `JuliusBrussee/caveman`, `DietrichGebert/ponytail`, `mattpocock/skills`, `vercel-labs/skills`, `max-sixty/worktrunk`, and `cursor/plugins`, then copy them to `~/.agents/skills/` and `~/.claude/skills/`. Matt workflow skills included in the repo layer are not duplicated globally.
- Global Plannotator layer: fetch `plannotator-review`, `plannotator-annotate`, `plannotator-last`, and `plannotator-visual-explainer` from `github:backnotprop/plannotator`, then copy them to `~/.agents/skills/` and `~/.claude/skills/`.
- Existing skill folders that are not part of those target sets are left untouched and listed after install. Existing folders that are part of the target set but not installer-managed are conflicts; use `--force` to replace them all-or-nothing.

Do not combine ownership models unless duplicate names are intentional. When `npm:@barlevalon/skills` already exists in Pi settings, the installer asks before writing Pi-visible copies. With `--yes`, overlap requires explicit `--allow-pi-overlap`.

## Migrate from file bootstrap to Pi

Check repository status first. Then remove only skill directories carrying this installer's `.barlevalon-installed` marker:

```bash
roots=(
  "$HOME/.agents/skills"
  "$HOME/.claude/skills"
  ".agents/skills"
  ".claude/skills"
)

for root in "${roots[@]}"; do
  [ -d "$root" ] || continue
  while IFS= read -r -d '' marker; do
    rm -rf -- "$(dirname "$marker")"
  done < <(find "$root" -mindepth 2 -maxdepth 2 -type f \
    -name .barlevalon-installed -print0)
done
```

Never remove unmarked skill directories. Remove the `<!-- skills:start -->` through `<!-- skills:end -->` block from repo `AGENTS.md` and `.github/copilot-instructions.md`; delete either file only when no other content remains.

Install or update the Pi-owned catalog:

```bash
pi install npm:@barlevalon/skills
# Already registered:
pi update npm:@barlevalon/skills
```

Restart Pi or run `/reload` after migration.

Advanced escape hatches:

```bash
# Install local maintained skills/forks for VS Code extensions
npx @barlevalon/skills@latest install --agent vscode --skill tdd --skill release-prep --yes

# Install Matt Pocock's core flow directly from github:mattpocock/skills
npx @barlevalon/skills@latest install --bundle matt-core --agent vscode --project --yes

# Install Matt Pocock's Wayfinder flow directly from github:mattpocock/skills
npx @barlevalon/skills@latest install --bundle matt-wayfinder --agent vscode --project --yes

# Install one upstream Matt skill directly
npx @barlevalon/skills@latest install --source matt --skill wayfinder --agent vscode --project --yes

# Install every local maintained skill for every supported harness
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
| Pi | Runs `pi install` for local npm skills. For external GitHub sources, copies selected skill folders to `.agents/skills/` or `~/.agents/skills/`, which Pi also reads. |
| OpenCode | Copies selected skill folders to `.opencode/skills/` or `~/.config/opencode/skills/` |
| VS Code | Project scope: copies skills to `.agents/skills/` and `.claude/skills/`, then updates `AGENTS.md` and `.github/copilot-instructions.md`. Global scope: copies skills to `~/.agents/skills/` and `~/.claude/skills/` |
| Claude Code | Copies selected skill folders to `.claude/skills/` or `~/.claude/skills/` |

The VS Code target is meant for repositories used with Copilot, Claude Code, and Codex extensions. Project scope installs native skill folders where extensions can use them and adds instruction files for tools that rely on repository guidance. Global scope skips Copilot repo instructions because those are project files.

For skill descriptions, use the [README skill table](../README.md#pick-a-skill), [skill reference](usage.md), or upstream repositories when installing external bundles.

## External Matt Pocock bundles

The installer can fetch selected skills directly from `github:mattpocock/skills`.

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
    --allow-pi-overlap Continue when Pi already loads this package globally
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
