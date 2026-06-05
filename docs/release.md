# Maintainer release process

This package is intentionally small: one skill plus documentation.

## Versioning

Use SemVer for the npm package:

- Patch: wording fixes, safety clarifications, docs updates
- Minor: new workflow sections or materially better release analysis behavior
- Major: incompatible skill behavior or package layout changes

## Pre-release validation

```bash
npm ci
npm run ci
```

`npm run ci` validates the package manifest, skill frontmatter, required docs,
and npm package contents.

## First npm publish bootstrap

npm Trusted Publisher setup currently requires the package to already exist.
For the first publish only, publish manually from a clean checkout:

```bash
npm login
npm whoami
npm run ci
npm publish
```

After the package exists on npm, configure Trusted Publisher for future releases:

- Package: `manual-release-skill`
- Publisher: GitHub Actions
- Repository owner/name: `barlevalon/manual-release-skill`
- Workflow: `publish.yml`
- Environment: none, unless npm requires one for the package settings

The GitHub workflow has `id-token: write`, avoids `actions/setup-node` `registry-url` token config so npm can use OIDC, upgrades to a current npm, and publishes with provenance:

```bash
npm publish --provenance --access public
```

No `NPM_TOKEN` repository secret is required after Trusted Publisher is configured.
The workflow checks whether `package.json`'s version already exists on npm and skips publish when it does, so the bootstrap release can be mirrored on GitHub without failing on duplicate publish.

## Release steps

1. Update `package.json` version.
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
7. The `Publish npm package` workflow publishes to npm when the release is published.

## Manual dry run

```bash
npm publish --dry-run --access public
```

Do not publish manually except for the first bootstrap publish or when GitHub
Actions is unavailable and the release has been approved.
