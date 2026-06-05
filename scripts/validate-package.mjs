import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => {
  console.error(`validation failed: ${message}`);
  process.exitCode = 1;
};

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const exists = (file) => fs.existsSync(path.join(root, file));
const relative = (file) => path.relative(root, file).split(path.sep).join('/');

const pkg = readJson('package.json');

if (!pkg.name || !pkg.name.includes('skills')) fail('package name must identify this as a skills package');
if (!pkg.version) fail('package version missing');
if (!pkg.description?.toLowerCase().includes('skills')) fail('package description must describe the skills collection');
if (!pkg.keywords?.includes('agent-skills')) fail('package keywords must include agent-skills');
if (!pkg.keywords?.includes('pi-package')) fail('package keywords must include pi-package for Pi gallery compatibility');
if (!Array.isArray(pkg.files) || !pkg.files.includes('skills')) fail('package files must include skills');
if (!pkg.pi || !Array.isArray(pkg.pi.skills) || pkg.pi.skills.length === 0) {
  fail('package.json pi compatibility metadata must declare pi.skills');
}

for (const skillPath of pkg.pi?.skills ?? []) {
  if (!skillPath.endsWith('/SKILL.md')) {
    fail(`root pi.skills entries must point at SKILL.md files, not directories: ${skillPath}`);
  }
  if (!matchesSkillPath(skillPath)) fail(`declared skill path does not match any skill: ${skillPath}`);
}

for (const requiredFile of ['README.md', 'LICENSE', 'CHANGELOG.md', 'docs/usage.md', 'docs/release.md', 'skills/README.md']) {
  if (!exists(requiredFile)) fail(`${requiredFile} missing`);
}

const skillFiles = findFiles(path.join(root, 'skills'), 'SKILL.md');
if (skillFiles.length === 0) fail('no skills found under skills/');

const names = new Map();
for (const file of skillFiles) {
  const skillFile = relative(file);
  const parts = skillFile.split('/');
  if (parts.length < 4) fail(`${skillFile} must live under skills/<category>/<skill>/SKILL.md`);

  const categoryReadme = `skills/${parts[1]}/README.md`;
  if (!exists(categoryReadme)) fail(`${categoryReadme} missing for ${skillFile}`);

  const skillDir = parts.slice(0, -1).join('/');
  const skillPackageFile = `${skillDir}/package.json`;
  if (!exists(skillPackageFile)) {
    fail(`${skillPackageFile} missing; each skill must be individually installable`);
  }

  const skill = fs.readFileSync(file, 'utf8');
  const match = skill.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    fail(`${skillFile} frontmatter missing`);
    continue;
  }

  const frontmatter = parseFrontmatter(match[1], skillFile);
  const name = frontmatter.name;
  const description = frontmatter.description;

  if (!name) fail(`${skillFile} frontmatter name missing`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name ?? '')) fail(`${skillFile} skill name must be kebab-case`);
  if ((name ?? '').length > 64) fail(`${skillFile} skill name exceeds 64 characters`);
  if (!description) fail(`${skillFile} description missing`);
  if ((description ?? '').length > 1024) fail(`${skillFile} description exceeds 1024 characters`);
  if (/^description: .*:\s+/m.test(match[1])) {
    fail(`${skillFile} description must use block scalar when it contains colon-space text`);
  }
  if (names.has(name)) fail(`duplicate skill name ${name}: ${names.get(name)} and ${skillFile}`);
  names.set(name, skillFile);

  if (exists(skillPackageFile)) {
    validateSkillPackage(skillPackageFile, name, skillDir);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`package validation passed (${skillFiles.length} skill${skillFiles.length === 1 ? '' : 's'})`);

function matchesSkillPath(pattern) {
  const normalizedPattern = pattern.replace(/^\.\//, '');
  const regex = new RegExp(`^${normalizedPattern.split('*').map(escapeRegex).join('[^/]+')}$`);
  return findFiles(path.join(root, 'skills'), 'SKILL.md').some((file) => regex.test(relative(file)));
}

function escapeRegex(text) {
  return text.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function validateSkillPackage(packageFile, skillName, skillDir) {
  const skillPackage = readJson(packageFile);
  if (!skillPackage.name) fail(`${packageFile} package name missing`);
  if (!skillPackage.name.includes(skillName)) fail(`${packageFile} package name should include skill name ${skillName}`);
  if (!skillPackage.version) fail(`${packageFile} version missing`);
  if (!skillPackage.description) fail(`${packageFile} description missing`);
  if (!skillPackage.keywords?.includes('agent-skills')) fail(`${packageFile} keywords must include agent-skills`);
  if (!skillPackage.keywords?.includes('pi-package')) fail(`${packageFile} keywords must include pi-package`);
  if (!Array.isArray(skillPackage.files) || !skillPackage.files.includes('SKILL.md')) {
    fail(`${packageFile} files must include SKILL.md`);
  }
  if (!skillPackage.pi || !Array.isArray(skillPackage.pi.skills) || !skillPackage.pi.skills.includes('./SKILL.md')) {
    fail(`${packageFile} pi.skills must include ./SKILL.md so README.md is not discovered as a skill`);
  }
  for (const requiredFile of ['README.md', 'LICENSE']) {
    if (!exists(`${skillDir}/${requiredFile}`)) fail(`${skillDir}/${requiredFile} missing`);
  }
}

function findFiles(directory, filename) {
  if (!fs.existsSync(directory)) return [];

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const matches = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      matches.push(...findFiles(entryPath, filename));
    } else if (entry.isFile() && entry.name === filename) {
      matches.push(entryPath);
    }
  }
  return matches.sort((left, right) => relative(left).localeCompare(relative(right)));
}

function parseFrontmatter(text, file) {
  const fields = {};
  const lines = text.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    if (/^\s/.test(line)) continue;

    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!match) {
      fail(`${file} invalid frontmatter line: ${line}`);
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
    fields[key] = rawValue.trim().replace(/^["']|["']$/g, '');
  }
  return fields;
}
