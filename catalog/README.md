# Pi aggregate catalog

This directory makes `@barlevalon/skills` a complete Pi package.

- `sources.json` selects upstream skills and pins immutable commits.
- `skills/` contains generated upstream snapshots. Do not edit them directly.
- `licenses/` preserves upstream license and provenance notices.
- Maintained skills remain under `../skills/` and take precedence over upstream names.

Refresh after deliberately updating refs and commits in `sources.json`:

```bash
npm run catalog:sync
npm run catalog:check
npm run validate
```

Prefer upstream release tags. For sources without releases, pin and review an exact commit from the default branch.
