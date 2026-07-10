import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  canRefreshManagedInstall,
  isObsoleteGlobalTddSource,
  piPackageRegistered,
  removeManagedInstall,
} from '../lib/install-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function withTemporaryDirectory(run) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'barlevalon-policy-test-'));
  try {
    return run(directory);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

function writeSettings(agentDir, packages) {
  fs.mkdirSync(agentDir, { recursive: true });
  fs.writeFileSync(path.join(agentDir, 'settings.json'), `${JSON.stringify({ packages })}\n`);
}

test('recognizes unversioned and version-pinned Pi package registrations', () => withTemporaryDirectory((directory) => {
  const cwd = path.join(directory, 'repo');
  const agentDir = path.join(directory, 'agent');
  fs.mkdirSync(cwd);

  for (const source of ['npm:@barlevalon/skills', 'npm:@barlevalon/skills@1.0.2', '@barlevalon/skills@latest']) {
    writeSettings(agentDir, [source]);
    assert.equal(piPackageRegistered({ cwd, agentDir }), true, source);
  }
}));

test('ignores Pi package registrations whose skills are disabled', () => withTemporaryDirectory((directory) => {
  const cwd = path.join(directory, 'repo');
  const agentDir = path.join(directory, 'agent');
  fs.mkdirSync(cwd);
  writeSettings(agentDir, [{ source: 'npm:@barlevalon/skills@1.0.2', skills: [] }]);
  assert.equal(piPackageRegistered({ cwd, agentDir }), false);
}));

test('detects project-local Pi package registration', () => withTemporaryDirectory((directory) => {
  const cwd = path.join(directory, 'repo');
  fs.mkdirSync(path.join(cwd, '.pi'), { recursive: true });
  fs.writeFileSync(path.join(cwd, '.pi/settings.json'), '{"packages":["npm:@barlevalon/skills"]}\n');
  assert.equal(piPackageRegistered({ cwd, agentDir: path.join(directory, 'missing-agent') }), true);
}));

test('allows installer-managed Matt and maintained tdd migrations', () => {
  const matt = 'github:mattpocock/skills@abc123:skills/engineering/tdd';
  const maintained = 'package:@barlevalon/skills:skills/tdd';
  assert.equal(canRefreshManagedInstall(matt, maintained), true);
  assert.equal(canRefreshManagedInstall(maintained, matt), true);
  assert.equal(canRefreshManagedInstall('github:other/repo@abc:skills/tdd', maintained), false);
});

test('identifies only the obsolete maintained global tdd source', () => {
  assert.equal(isObsoleteGlobalTddSource('package:@barlevalon/skills:skills/tdd'), true);
  assert.equal(isObsoleteGlobalTddSource('github:mattpocock/skills@abc:skills/engineering/tdd'), false);
  assert.equal(isObsoleteGlobalTddSource(undefined), false);
});

test('removes only installer-managed copies from the accepted source', () => withTemporaryDirectory((directory) => {
  const accepted = path.join(directory, 'accepted');
  fs.mkdirSync(accepted);
  fs.writeFileSync(path.join(accepted, 'SKILL.md'), 'old');
  fs.writeFileSync(path.join(accepted, '.barlevalon-installed'), 'source=package:@barlevalon/skills:skills/tdd\n');
  assert.equal(removeManagedInstall(accepted, isObsoleteGlobalTddSource).status, 'removed');
  assert.equal(fs.existsSync(accepted), false);

  const unmanaged = path.join(directory, 'unmanaged');
  fs.mkdirSync(unmanaged);
  assert.equal(removeManagedInstall(unmanaged, () => true).status, 'unmanaged');
  assert.equal(fs.existsSync(unmanaged), true);

  const different = path.join(directory, 'different');
  fs.mkdirSync(different);
  fs.writeFileSync(path.join(different, '.barlevalon-installed'), 'source=github:other/repo@main:skills/tdd\n');
  assert.equal(removeManagedInstall(different, (source) => source?.startsWith('package:')).status, 'different-source');
  assert.equal(fs.existsSync(different), true);
}));

test('non-interactive bootstrap blocks version-pinned Pi overlap', () => withTemporaryDirectory((directory) => {
  const agentDir = path.join(directory, 'agent');
  writeSettings(agentDir, ['npm:@barlevalon/skills@1.0.2']);
  const result = runInstaller(directory, agentDir, ['install', '--yes']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /duplicate names will produce collision warnings/);
  assert.match(result.stderr, /--allow-pi-overlap/);
}));

test('maintained Pi subset install blocks overlap with registered root package', () => withTemporaryDirectory((directory) => {
  const agentDir = path.join(directory, 'agent');
  writeSettings(agentDir, ['npm:@barlevalon/skills@1.0.2']);
  const result = runInstaller(directory, agentDir, ['install', '--agent', 'pi', '--skill', 'tdd', '--global', '--yes']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Selected targets add skill sources that Pi will discover/);
  assert.match(result.stderr, /--allow-pi-overlap/);
}));

test('full maintained Pi install reuses registered root package without overlap warning', () => withTemporaryDirectory((directory) => {
  const agentDir = path.join(directory, 'agent');
  const binDir = path.join(directory, 'bin');
  const invocation = path.join(directory, 'pi-invocation');
  fs.mkdirSync(binDir);
  fs.writeFileSync(path.join(binDir, 'pi'), `#!/bin/sh\nprintf '%s\\n' "$*" > "${invocation}"\n`);
  fs.chmodSync(path.join(binDir, 'pi'), 0o755);
  writeSettings(agentDir, ['npm:@barlevalon/skills@1.0.2']);

  const result = runInstaller(
    directory,
    agentDir,
    ['install', '--agent', 'pi', '--skill', 'all', '--global', '--yes'],
    { PATH: `${binDir}:${process.env.PATH}` },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(invocation, 'utf8').trim(), 'install npm:@barlevalon/skills');
}));

function runInstaller(cwd, agentDir, args, environment = {}) {
  return spawnSync(process.execPath, [path.join(root, 'bin/skills.mjs'), ...args], {
    cwd,
    env: { ...process.env, PI_CODING_AGENT_DIR: agentDir, ...environment },
    encoding: 'utf8',
  });
}
