# Usage

This package ships a portable workflow bundle of Agent Skills.

## Install

Install all skills:

```bash
pi install npm:@barlevalon/skills
```

Install one skill:

```bash
pi install npm:@barlevalon/tdd-skill
pi install npm:@barlevalon/release-prep-skill
```

Use a local checkout while developing:

```bash
pi -e .
pi -e ./skills/engineering/tdd
```

## Workflow map

- Commit messages: `caveman-commit`
- Diagnosis and bug fixing: `diagnose`, `tdd`
- Planning and product docs: `write-a-prd`, `prd-to-plan`, `grill-with-docs`
- Architecture review: `improve-codebase-architecture`
- Prototyping: `prototype`
- Review/evaluation: `plannotator-*`, `thermo-nuclear-code-quality-review`
- Release prep: `release-prep`
- Documentation work: `documentation-system`
- Skill discovery: `find-skills`
- Handoffs: `handoff`

## Example prompts

```text
Write a commit message for the staged changes.
```

```text
Use TDD to implement this bug fix.
```

```text
Grill this plan against the domain docs before we build it.
```

```text
Run a strict code-quality review.
```

```text
Prepare the next release and recommend the SemVer bump.
```
