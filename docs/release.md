# Maintainer release process

This package is a small skills collection. It currently contains one skill.

## Versioning

Use SemVer for the npm packages:

- Patch: wording fixes, safety clarifications, docs updates
- Minor: new workflow sections or materially better release analysis behavior
- Major: incompatible skill behavior or package layout changes

## Pre-release validation

```bash
npm ci
npm run ci
```

`npm run ci` validates package manifests, skill frontmatter, required docs,
the root bundle package, and each individual skill package.

## First npm publish bootstrap

npm Trusted Publisher setup currently requires each package to already exist.
For the first publish only, publish each package manually from a clean checkout:

```bash
npm login
npm whoami
npm run ci
npm publish --access public
npm publish ./skills/release/release-prep --access public
```

After packages exist on npm, configure Trusted Publisher for future releases for each package:

- Packages: `@barlevalon/skills`, `@barlevalon/release-prep-skill`
- Publisher: GitHub Actions
- Repository owner/name: `barlevalon/skills`
- Workflow: `publish.yml`
- Environment: none, unless npm requires one for the package settings

The GitHub workflow has `id-token: write`, avoids `actions/setup-node` `registry-url` token config so npm can use OIDC, upgrades to a current npm, and publishes with provenance:

```bash
node scripts/publish-packages.mjs
```

No `NPM_TOKEN` repository secret is required after Trusted Publisher is configured.
The workflow checks whether each package version already exists on npm and skips already-published versions, so the bootstrap release can be mirrored on GitHub without failing on duplicate publish.

## Release steps

1. Update root and skill package versions.
2. Update `CHANGELOG.md`.
3. Commit with:

   ```text
   release: vX.Y.Z
   ```

4. Push to `main` and verify CI is green.
5. Create and push a tag:

   ```bash
   git tag vX.Y.Z
   git push origin main vX.Y.Z
   ```

6. Create a GitHub Release for the tag.
7. The `Publish npm packages` workflow publishes the root bundle and individual skill packages to npm when the release is published.

## Manual dry run

```bash
node scripts/publish-packages.mjs --dry-run
```

Do not publish manually except for the first bootstrap publish or when GitHub
Actions is unavailable and the release has been approved.
