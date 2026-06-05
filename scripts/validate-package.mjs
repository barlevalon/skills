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

if (pkg.name !== 'manual-release-skill') fail('package name must be manual-release-skill');
if (!pkg.keywords?.includes('agent-skills')) fail('package keywords must include agent-skills');
if (!pkg.keywords?.includes('pi-package')) fail('package keywords must include pi-package for Pi gallery compatibility');
if (pkg.pi && (!Array.isArray(pkg.pi.skills) || pkg.pi.skills.length === 0)) {
  fail('package.json pi compatibility metadata must declare pi.skills when present');
}

for (const skillPath of pkg.pi?.skills ?? []) {
  if (!exists(skillPath)) fail(`declared skill path does not exist: ${skillPath}`);
}

const skillFile = 'skills/manual-release/SKILL.md';
if (!exists(skillFile)) fail(`${skillFile} missing`);

const skill = fs.readFileSync(path.join(root, skillFile), 'utf8');
const match = skill.match(/^---\n([\s\S]*?)\n---\n/);
if (!match) {
  fail('skill frontmatter missing');
} else {
  const frontmatter = parseFrontmatter(match[1]);

  const name = frontmatter.name;
  const description = frontmatter.description;
  if (name !== 'manual-release') fail('skill name must be manual-release');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name ?? '')) fail('skill name must be kebab-case');
  if (!description) fail('skill description missing');
  if ((description ?? '').length > 1024) fail('skill description exceeds 1024 characters');
  if (/^description: .*:\s+/.test(match[1])) {
    fail('description must use block scalar when it contains colon-space text');
  }
}

for (const requiredFile of ['README.md', 'LICENSE', 'CHANGELOG.md', 'docs/usage.md', 'docs/release.md']) {
  if (!exists(requiredFile)) fail(`${requiredFile} missing`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log('package validation passed');

function parseFrontmatter(text) {
  const fields = {};
  const lines = text.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    if (/^\s/.test(line)) continue;

    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!match) {
      fail(`invalid frontmatter line: ${line}`);
      continue;
    }

    const [, key, rawValue] = match;
    if (rawValue === '>' || rawValue === '|') {
      const block = [];
      for (let next = index + 1; next < lines.length && /^\s+/.test(lines[next]); next += 1) {
        block.push(lines[next].trim());
        index = next;
      }
      fields[key] = block.join(rawValue === '>' ? ' ' : '\n');
      continue;
    }
    fields[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
  }
  return fields;
}
