# Awesome skills

Start with **[pstack](https://github.com/cursor/plugins/tree/main/pstack) and [Poteto mode](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md)** for agent-assisted engineering. The other recommendations and personal skills here are optional additions or alternatives.

## Main recommendation: pstack and Poteto mode

[pstack](https://github.com/cursor/plugins/tree/main/pstack) is poteto's engineering workflow, distributed as a Cursor plugin. Its core is a set of Markdown skills that a coding agent can adapt to your environment. It connects investigation, design, implementation, review, and verification instead of leaving you to coordinate separate prompts.

Poteto mode is the entry point. It picks a playbook for the task and calls supporting skills as needed. The practices that make it worth using include:

- Reproduce bugs and investigate root causes before fixing them.
- Settle data shapes and interfaces before implementation.
- Use independent attempts and adversarial review to challenge a design or change.
- Verify the actual behavior before declaring the work done.

The recommendation is to use that workflow for non-trivial engineering work, rather than collect every skill below.

In Cursor, follow the [upstream installation instructions](https://github.com/cursor/plugins/tree/main/pstack#install), then configure models with [`setup-pstack`](https://github.com/cursor/plugins/blob/main/pstack/skills/setup-pstack/SKILL.md). Start tasks through Poteto mode with a concrete goal and an observable finish condition:

```text
/poteto-mode retries create duplicate export rows. Reproduce the bug, fix the cause, and verify that retries produce one row.
```

For another environment, ask your agent to adapt the skills and map Cursor-specific tools and commands to the equivalents available there. Check capability gaps rather than assuming every workflow transfers unchanged. The [pstack guide](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/README.md) explains the methodology.

## Upstream picks

These are situational tools and alternative workflows, not a checklist to install alongside pstack. Upstream projects are linked, not mirrored. This repository has no installer, package manifests, or publishing pipeline.

### Engineering workflows

| Project | Worth a look for |
|---|---|
| [Matt Pocock's skills](https://github.com/mattpocock/skills) | Spec-to-ticket workflows, Wayfinder exploration, domain modeling, and learning across sessions. |
| [Ponytail](https://github.com/DietrichGebert/ponytail) | Minimal-code implementation, complexity audits, simplification debt, and focused reviews. |
| [Cursor Team Kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit) | CLI/UI checks, deslop, and the thermo-nuclear code-quality review. |
| [dogfood](https://github.com/vercel-labs/agent-browser/tree/main/skill-data/dogfood) | Exploratory web-app testing with reproducible bug reports, screenshots, and videos. |

### Communication and presentation

| Project | Worth a look for |
|---|---|
| [Bento](https://github.com/nyblnet/bento) | Building presentations with `bento-slides`. |
| [Caveman](https://github.com/JuliusBrussee/caveman) | Terse communication modes and commit-message guidance. |
| [canvas-design](https://github.com/anthropics/skills/tree/main/skills/canvas-design) | Original static designs, posters, and artwork in PNG and PDF. |
| [show-me](https://github.com/humanlayer/skills/tree/main/plugins/show-me/skills/show-me) | Concise visual explanations with diagrams, code-shape sketches, and HTML artifacts. |

### Discovery and worktrees

| Project | Worth a look for |
|---|---|
| [Vercel Skills](https://github.com/vercel-labs/skills) | Finding skills through `find-skills`. |
| [Worktrunk](https://github.com/max-sixty/worktrunk) | Git worktree management and its accompanying agent skill. |

Follow each project's documentation for setup, supported harnesses, limitations, and licensing. Links track upstream; there are no local snapshots or release pins to keep in sync.

## Personal skills

Only maintained local workflows, forks, and syntheses live under [`skills/`](skills/README.md).

| Skill | Purpose |
|---|---|
| [caveman-commit](skills/caveman-commit/SKILL.md) | Scope-first, release-aware commit messages without unnecessary prose. |
| [documentation-system](skills/documentation-system/SKILL.md) | Write and improve documentation using Diátaxis. |
| [pr](skills/pr/SKILL.md) | Draft an evidence-backed PR and open its creation page after approval. |
| [release-prep](skills/release-prep/SKILL.md) | Assess release readiness, choose version bumps, and prepare release notes. |
| [tdd](skills/tdd/SKILL.md) | A personal test-first synthesis with explicit RED/GREEN/REFACTOR evidence. |

Read a skill's `SKILL.md` before using it. To use a personal skill locally, copy its complete folder to a skill directory supported by the chosen harness, including references and its license. Nothing here installs or enables skills automatically. Choose one implementation when skill names overlap with another collection.

Each personal skill's README records its sources and influences. Personal forks are not substitutes for tracking their upstream projects.

## Former packages and installer

The npm packages, cross-harness bootstrap, and bundled upstream catalog are retired from this repository. Previously published npm artifacts are unchanged; this checkout is no longer a package or an installer. Existing installations are not modified automatically.

The last packaged repository state is preserved at [`v3.0.0`](https://github.com/barlevalon/skills/tree/v3.0.0). For ongoing use, follow the upstream links or select individual personal skill folders instead.

## License

Repository-authored material is [MIT licensed](LICENSE). Retained forks carry their own license notices; linked upstream projects have their own licenses.
