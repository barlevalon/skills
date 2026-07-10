import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogRoot = path.join(root, 'catalog');
const skillsRoot = path.join(catalogRoot, 'skills');
const licensesRoot = path.join(catalogRoot, 'licenses');
const manifest = JSON.parse(fs.readFileSync(path.join(catalogRoot, 'sources.json'), 'utf8'));
const checkoutRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'barlevalon-catalog-'));
const stagingRoot = fs.mkdtempSync(path.join(catalogRoot, '.sync-'));
const stagedSkillsRoot = path.join(stagingRoot, 'skills');
const stagedLicensesRoot = path.join(stagingRoot, 'licenses');
const checkOnly = process.argv.includes('--check');

try {
  fs.mkdirSync(stagedSkillsRoot, { recursive: true });
  fs.mkdirSync(stagedLicensesRoot, { recursive: true });

  for (const source of manifest.sources) {
    const checkout = path.join(checkoutRoot, source.id);
    console.error(`Fetching github:${source.repo}@${source.ref} (${source.commit.slice(0, 12)})...`);
    fs.mkdirSync(checkout, { recursive: true });
    run('git', ['-C', checkout, 'init', '--quiet']);
    run('git', ['-C', checkout, 'remote', 'add', 'origin', `https://github.com/${source.repo}.git`]);
    run('git', ['-C', checkout, 'fetch', '--quiet', '--depth', '1', 'origin', source.commit]);
    run('git', ['-C', checkout, '-c', 'advice.detachedHead=false', 'checkout', '--quiet', '--detach', 'FETCH_HEAD']);
    const commit = run('git', ['-C', checkout, 'rev-parse', 'HEAD'], { capture: true }).trim();
    if (commit !== source.commit) {
      throw new Error(`${source.repo}@${source.ref} resolved to ${commit}, expected locked commit ${source.commit}`);
    }

    for (const [name, relativeDir] of Object.entries(source.skills)) {
      const skillRoot = path.join(checkout, relativeDir);
      const skillFile = path.join(skillRoot, 'SKILL.md');
      if (!fs.existsSync(skillFile)) throw new Error(`${source.repo} missing ${relativeDir}/SKILL.md`);
      assertSafeSymlinks(skillRoot, checkout);

      const destination = path.join(stagedSkillsRoot, name);
      if (fs.existsSync(destination)) throw new Error(`duplicate catalog skill: ${name}`);
      copyDirectory(skillRoot, destination);
      fs.writeFileSync(path.join(destination, '.barlevalon-source.json'), `${JSON.stringify({
        repo: source.repo,
        ref: source.ref,
        commit: source.commit,
        path: relativeDir,
      }, null, 2)}\n`);
    }

    for (const relativeLicense of source.licenses ?? []) {
      const license = path.join(checkout, relativeLicense);
      if (!fs.existsSync(license)) throw new Error(`${source.repo} missing license ${relativeLicense}`);
      const suffix = source.licenses.length > 1 ? `-${path.basename(relativeLicense)}` : '';
      fs.copyFileSync(license, path.join(stagedLicensesRoot, `${source.id}${suffix}.txt`));
    }

    if (source.declaredLicense) {
      if (!source.licenseEvidence?.length) throw new Error(`${source.repo} declaredLicense requires licenseEvidence`);
      for (const relativeEvidence of source.licenseEvidence) {
        const evidence = path.join(checkout, relativeEvidence);
        if (!fs.existsSync(evidence)) throw new Error(`${source.repo} missing license evidence ${relativeEvidence}`);
        if (!fs.readFileSync(evidence, 'utf8').toLowerCase().includes(source.declaredLicense.toLowerCase())) {
          throw new Error(`${source.repo} license evidence ${relativeEvidence} does not mention ${source.declaredLicense}`);
        }
      }
      const evidenceList = source.licenseEvidence.join(', ');
      const notice = `${source.repo}@${source.ref} declares ${source.declaredLicense} in ${evidenceList}.\nSource: https://github.com/${source.repo}/tree/${source.commit}\n`;
      fs.writeFileSync(path.join(stagedLicensesRoot, `${source.id}-NOTICE.txt`), notice);
      if (source.declaredLicense === 'MIT') {
        fs.writeFileSync(path.join(stagedLicensesRoot, `${source.id}-MIT.txt`), mitLicense(source.repo));
      }
    }
  }

  if (checkOnly) {
    assertDirectoriesEqual(stagedSkillsRoot, skillsRoot, 'catalog skills');
    assertDirectoriesEqual(stagedLicensesRoot, licensesRoot, 'catalog licenses');
    console.log(`Catalog matches ${fs.readdirSync(stagedSkillsRoot).length} locked upstream skills.`);
  } else {
    replaceDirectory(stagedSkillsRoot, skillsRoot);
    replaceDirectory(stagedLicensesRoot, licensesRoot);
    console.log(`Synced ${fs.readdirSync(skillsRoot).length} upstream skills.`);
  }
} finally {
  fs.rmSync(checkoutRoot, { recursive: true, force: true });
  fs.rmSync(stagingRoot, { recursive: true, force: true });
}

function copyDirectory(source, destination) {
  fs.cpSync(source, destination, {
    recursive: true,
    dereference: true,
    filter: (file) => !path.relative(source, file).split(path.sep).includes('node_modules'),
  });
}

function assertSafeSymlinks(directory, checkoutRoot) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      const resolved = fs.realpathSync(entryPath);
      const relative = path.relative(checkoutRoot, resolved);
      if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`external symlink target rejected: ${entryPath}`);
    } else if (entry.isDirectory()) {
      assertSafeSymlinks(entryPath, checkoutRoot);
    }
  }
}

function replaceDirectory(staged, target) {
  const backup = `${target}.backup-${process.pid}`;
  fs.rmSync(backup, { recursive: true, force: true });
  if (fs.existsSync(target)) fs.renameSync(target, backup);
  try {
    fs.renameSync(staged, target);
    fs.rmSync(backup, { recursive: true, force: true });
  } catch (error) {
    fs.rmSync(target, { recursive: true, force: true });
    if (fs.existsSync(backup)) fs.renameSync(backup, target);
    throw error;
  }
}

function assertDirectoriesEqual(expectedRoot, actualRoot, label) {
  const expected = directoryDigest(expectedRoot);
  const actual = directoryDigest(actualRoot);
  if (expected !== actual) throw new Error(`${label} differ from locked upstream sources; run npm run catalog:sync and review the diff`);
}

function directoryDigest(directory) {
  if (!fs.existsSync(directory)) return 'missing';
  const hash = crypto.createHash('sha256');
  for (const file of listFiles(directory)) {
    hash.update(path.relative(directory, file).split(path.sep).join('/'));
    hash.update('\0');
    hash.update(fs.readFileSync(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function listFiles(directory, found = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) listFiles(entryPath, found);
    else if (entry.isFile()) found.push(entryPath);
    else throw new Error(`unsupported generated catalog entry: ${entryPath}`);
  }
  return found;
}

function mitLicense(repo) {
  return `MIT License\n\nCopyright (c) ${repo} contributors\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: options.capture ? 'pipe' : 'inherit' });
  if (result.error?.code === 'ENOENT') throw new Error(`${command} is required`);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed${result.stderr ? `: ${result.stderr.trim()}` : ''}`);
  return result.stdout ?? '';
}
