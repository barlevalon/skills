import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogRoot = path.join(root, 'catalog');
const manifest = JSON.parse(fs.readFileSync(path.join(catalogRoot, 'sources.json'), 'utf8'));
const expected = new Map();
const expectedLicenses = new Set();
const failures = [];

for (const source of manifest.sources ?? []) {
  if (!/^[0-9a-f]{40}$/.test(source.commit ?? '')) fail(`${source.id} must lock a full commit SHA`);
  if (!source.ref) fail(`${source.id} ref missing`);
  if (!source.repo?.includes('/')) fail(`${source.id} repo must use owner/name`);
  if (!source.licenses?.length && !source.declaredLicense) fail(`${source.id} license metadata missing`);
  for (const relativeLicense of source.licenses ?? []) {
    const suffix = source.licenses.length > 1 ? `-${path.basename(relativeLicense)}` : '';
    expectedLicenses.add(`${source.id}${suffix}.txt`);
  }
  if (source.declaredLicense) {
    if (!source.licenseEvidence?.length) fail(`${source.id} declaredLicense requires licenseEvidence`);
    expectedLicenses.add(`${source.id}-NOTICE.txt`);
    if (source.declaredLicense === 'MIT') expectedLicenses.add(`${source.id}-MIT.txt`);
  }

  for (const [name, sourcePath] of Object.entries(source.skills ?? {})) {
    if (expected.has(name)) fail(`duplicate catalog skill ${name}`);
    expected.set(name, { source, sourcePath });
  }
}

const generatedRoot = path.join(catalogRoot, 'skills');
const generatedNames = fs.readdirSync(generatedRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const name of generatedNames) {
  const skillRoot = path.join(generatedRoot, name);
  const skillFile = path.join(skillRoot, 'SKILL.md');
  const provenanceFile = path.join(skillRoot, '.barlevalon-source.json');
  if (!expected.has(name)) fail(`unexpected generated skill ${name}`);
  if (!fs.existsSync(skillFile)) fail(`${name}/SKILL.md missing`);
  if (!fs.existsSync(provenanceFile)) fail(`${name} provenance missing`);
  if (!fs.existsSync(skillFile) || !fs.existsSync(provenanceFile) || !expected.has(name)) continue;

  const frontmatter = fs.readFileSync(skillFile, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const declaredName = frontmatter.match(/^name:\s*["']?([^\n"']+)/m)?.[1]?.trim();
  if (declaredName !== name) fail(`${name} frontmatter declares ${declaredName ?? 'no name'}`);
  if (!/^description:\s*(?:\S|[>|])/m.test(frontmatter)) fail(`${name} description missing`);

  const provenance = JSON.parse(fs.readFileSync(provenanceFile, 'utf8'));
  const { source, sourcePath } = expected.get(name);
  const wanted = { repo: source.repo, ref: source.ref, commit: source.commit, path: sourcePath };
  if (JSON.stringify(provenance) !== JSON.stringify(wanted)) fail(`${name} provenance does not match sources.json`);

  for (const symlink of findSymlinks(skillRoot)) fail(`${name} contains symlink ${path.relative(skillRoot, symlink)}`);
}

for (const name of expected.keys()) {
  if (!generatedNames.includes(name)) fail(`generated skill ${name} missing`);
}

const licensesRoot = path.join(catalogRoot, 'licenses');
const actualLicenses = fs.readdirSync(licensesRoot, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort();
for (const name of actualLicenses) {
  if (!expectedLicenses.has(name)) fail(`unexpected catalog license ${name}`);
  if (fs.statSync(path.join(licensesRoot, name)).size === 0) fail(`catalog license ${name} is empty`);
}
for (const name of expectedLicenses) {
  if (!actualLicenses.includes(name)) fail(`catalog license ${name} missing`);
}

const localNames = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, 'skills', entry.name, 'SKILL.md')))
  .map((entry) => entry.name);
for (const name of localNames) {
  if (expected.has(name)) fail(`local skill ${name} collides with generated catalog`);
}

if (failures.length) {
  for (const failure of failures) console.error(`catalog validation failed: ${failure}`);
  process.exit(1);
}
console.log(`catalog validation passed (${localNames.length} local + ${expected.size} upstream skills)`);

function fail(message) {
  failures.push(message);
}

function findSymlinks(directory, found = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) found.push(entryPath);
    else if (entry.isDirectory()) findSymlinks(entryPath, found);
  }
  return found;
}
