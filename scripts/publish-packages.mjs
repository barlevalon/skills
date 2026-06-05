import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dryRun = process.argv.includes('--dry-run');
const packages = [root, ...findSkillPackageDirs()].map((directory) => ({
  directory,
  manifest: JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8')),
}));

for (const { directory, manifest } of packages) {
  const spec = `${manifest.name}@${manifest.version}`;
  if (!dryRun && packageExists(spec)) {
    console.log(`${spec} already exists on npm; skipping publish.`);
    continue;
  }

  const args = ['publish', directory, '--access', 'public'];
  if (dryRun) args.push('--dry-run');
  else args.push('--provenance');

  console.log(`${dryRun ? 'Dry-run' : 'Publishing'} ${spec}`);
  run('npm', args);
}

function findSkillPackageDirs() {
  const skillsDir = path.join(root, 'skills');
  if (!fs.existsSync(skillsDir)) return [];

  const dirs = [];
  for (const category of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryDir = path.join(skillsDir, category.name);
    for (const skill of fs.readdirSync(categoryDir, { withFileTypes: true })) {
      if (!skill.isDirectory()) continue;
      const skillDir = path.join(categoryDir, skill.name);
      if (fs.existsSync(path.join(skillDir, 'package.json'))) dirs.push(skillDir);
    }
  }
  return dirs.sort();
}

function packageExists(spec) {
  const result = spawnSync('npm', ['view', spec, 'version'], { stdio: 'ignore' });
  return result.status === 0;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
