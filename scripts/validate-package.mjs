import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => {
  console.error(`validation failed: ${message}`);
  process.exitCode = 1;
};

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const exists = (file) => fs.existsSync(path.join(root, file));

const pkg = readJson('package.json');

if (pkg.name !== 'pi-manual-release') fail('package name must be pi-manual-release');
if (!pkg.keywords?.includes('pi-package')) fail('package keywords must include pi-package');
if (!pkg.pi || !Array.isArray(pkg.pi.skills) || pkg.pi.skills.length === 0) {
  fail('package.json must declare pi.skills');
}

for (const skillPath of pkg.pi?.skills ?? []) {
  if (!exists(skillPath)) fail(`pi skill path does not exist: ${skillPath}`);
}

const skillFile = 'skills/manual-release/SKILL.md';
if (!exists(skillFile)) fail(`${skillFile} missing`);

const skill = fs.readFileSync(path.join(root, skillFile), 'utf8');
const match = skill.match(/^---\n([\s\S]*?)\n---\n/);
if (!match) {
  fail('skill frontmatter missing');
} else {
  const frontmatter = Object.fromEntries(
    match[1]
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const index = line.indexOf(':');
        if (index === -1) return [line, ''];
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );

  const name = frontmatter.name;
  const description = frontmatter.description;
  if (name !== 'manual-release') fail('skill name must be manual-release');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name ?? '')) fail('skill name must be kebab-case');
  if (!description) fail('skill description missing');
  if ((description ?? '').length > 1024) fail('skill description exceeds 1024 characters');
}

for (const requiredFile of ['README.md', 'LICENSE', 'CHANGELOG.md', 'docs/usage.md', 'docs/release.md']) {
  if (!exists(requiredFile)) fail(`${requiredFile} missing`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log('package validation passed');
