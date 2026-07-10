# Maintainer release process

This repo publishes two kinds of npm packages:

- Root bundle: `@barlevalon/skills`
- Individual skill packages: `@barlevalon/<skill>-skill`

Versions are **independent**. Do not bump every package just because one skill changed.

The root package also ships the generated Pi catalog in `catalog/skills/`. `catalog/sources.json` records immutable upstream refs and commits. Refresh catalog snapshots deliberately:

```bash
npm run catalog:sync
npm run catalog:check
npm run validate
```

Commit source-lock and generated catalog changes together. Prefer upstream release tags; use a reviewed commit pin only when a source has no releases.

## Versioning

Use SemVer per package:

- Patch: wording fixes, safety clarifications, docs updates
- Minor: new skill behavior, new workflow sections, or materially better analysis behavior
- Major: incompatible skill behavior or package layout changes

Examples:

- Change only `tdd`: bump `skills/tdd/package.json` only.
- Change only release docs: bump root `package.json` only if the bundled package should be republished.
- Add a new skill: publish that skill at `0.1.0` or `1.0.0` as appropriate; bump the root bundle because its contents changed.
- Change shared repo tooling only: no npm release unless package contents or publish behavior changed.
- Move an upstream catalog pin: bump the root package because Pi-installed contents changed; individual maintained skill packages remain unchanged.

## Pre-release validation

```bash
npm ci
npm run ci
```

`npm run ci` validates package manifests, skill frontmatter, required docs,
the root bundle package, and each individual skill package.

## First npm publish bootstrap

npm Trusted Publisher setup currently requires each package to already exist.
For the first publish of a new package only, publish it manually from a clean checkout:

```bash
npm login
npm whoami
npm run ci
npm publish ./skills/<category>/<skill> --access public
```

After the package exists on npm, configure Trusted Publisher for it:

- Publisher: GitHub Actions
- Repository owner/name: `barlevalon/skills`
- Workflow: `publish.yml`
- Environment: none, unless npm requires one for the package settings

The GitHub workflow has `id-token: write`, avoids `actions/setup-node` `registry-url` token config so npm can use OIDC, upgrades to a current npm, and publishes with provenance:

```bash
node scripts/publish-packages.mjs
```

No `NPM_TOKEN` repository secret is required after Trusted Publisher is configured.
The publish script checks whether each package version already exists on npm and skips already-published versions, so independent package versions are safe.

## Release steps

1. Decide which package(s) need a release.
2. Bump only those package manifests.
3. Update `CHANGELOG.md` for repo-visible changes. For detailed skill-only notes, prefer the skill README or a future per-skill changelog.
4. Commit with a specific subject, for example:

   ```text
   release: tdd-skill v0.2.1
   release: bundle v0.2.1
   ```

5. Push to `main` and verify CI is green.
6. Create and push a tag:

   ```bash
   git tag tdd-skill-v0.2.1
   git push origin main tdd-skill-v0.2.1
   ```

   For a coordinated bundle release, `vX.Y.Z` is fine.

7. Create a GitHub Release for the tag.
8. The `Publish npm packages` workflow publishes only package versions that do not already exist on npm.

## Manual dry run

```bash
node scripts/publish-packages.mjs --dry-run
```

Do not publish manually except for first-package bootstrap or when GitHub Actions is unavailable and the release has been approved.

## Deprecating old vendored skill packages

When a vendored third-party skill moves to direct upstream installation, prefer `npm deprecate` over `npm unpublish`. Deprecation keeps old installs reproducible while warning new users to install the root bootstrap or the canonical upstream skill.

Use explicit approval before running deprecation commands. Template:

```bash
npm deprecate @barlevalon/<skill>-skill@"*" \
  "Deprecated: @barlevalon/skills installs the canonical upstream skill directly; use npx @barlevalon/skills@latest install."
```

Use a more specific message for removed-without-replacement skills, for example `zoom-out`:

```bash
npm deprecate @barlevalon/zoom-out-skill@"*" \
  "Deprecated: this vendored skill was removed; no replacement is installed by @barlevalon/skills."
```

Do not unpublish unless a package is dangerous or legally problematic and npm's unpublish policy allows it.
