# pr

One explicitly invoked workflow for reviewing a branch, drafting a PR description, and opening GitHub's creation page after approval. No dependencies on other skills.

Use `/skill:pr` in Pi, or explicitly ask an agent to use the `pr` skill. A description-only request stops at the draft.

The default body contains Summary, Evidence, Merge Danger, and relevant References. Repository templates and tracker requirements take precedence. Commit and push actions require approval; the browser remains the final submission step.

## Distribution

Included in the root package and maintained-skill file bootstrap. Individual package metadata lives in [package.json](package.json); publication is a separate approval-gated step.

Entry point: [SKILL.md](SKILL.md).

## Credits

Maintained synthesis of:

- Workmux's [`open-pr`](https://github.com/raine/workmux/blob/a6ca872cb997889e4d2b004d81baf89ec2e2bbba/skills/open-pr/SKILL.md): branch context and browser-based PR creation.
- Matt Pocock's [`pr` at v1.3.1](https://github.com/mattpocock/skills/blob/24fe0ef7737efae15c87225755e9f6f5965e4888/skills/engineering/pr/SKILL.md): evidence and merge-danger framing.
- Dex Horthy / Humanlayer's [`show-me`](https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md), credited by Matt's skill: concise visual summaries.

This version adds explicit action approvals, repository-template precedence, ticket preservation, honest evidence reporting, and duplicate-PR handling. Upstream skills are influences, not runtime dependencies.
