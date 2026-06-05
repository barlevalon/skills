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

## Publishing requirements

GitHub Actions needs an npm automation token in the repository secret:

```text
NPM_TOKEN
```

The publish workflow uses npm provenance and `--access public`.

## Manual dry run

```bash
npm publish --dry-run --access public
```

Do not publish manually unless GitHub Actions is unavailable and the release has
been approved.
