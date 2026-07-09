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
  if (!dryRun && packageExists(manifest.name, manifest.version)) {
    console.log(`${spec} already exists on npm; skipping publish.`);
    continue;
  }

  const args = ['publish', directory, '--access', 'public'];
  if (dryRun) args.push('--dry-run');
  else args.push('--provenance');

  console.log(`${dryRun ? 'Dry-run' : 'Publishing'} ${spec}`);
  runPublish(spec, args);
}

function findSkillPackageDirs() {
  const skillsDir = path.join(root, 'skills');
  if (!fs.existsSync(skillsDir)) return [];

  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(skillsDir, entry.name))
    .filter((skillDir) => fs.existsSync(path.join(skillDir, 'package.json')))
    .sort();
}

function packageExists(name, version) {
  const view = spawnSync('npm', ['view', `${name}@${version}`, 'version'], { stdio: 'ignore' });
  if (view.status === 0) return true;

  // Newly published packages can have dist-tags before the full package document
  // is visible through `npm view`. Treat a matching tag as existing so release
  // workflows do not try to republish during npm registry propagation lag.
  const distTag = spawnSync('npm', ['dist-tag', 'ls', name], { encoding: 'utf8' });
  return distTag.status === 0 && distTag.stdout.split('\n').some((line) => line.trim().endsWith(`: ${version}`));
}

function runPublish(spec, args) {
  const result = spawnSync('npm', args, { encoding: 'utf8' });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status === 0) return;

  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  if (output.includes('previously published versions')) {
    console.log(`${spec} already exists on npm; skipping publish.`);
    return;
  }

  process.exit(result.status ?? 1);
}
