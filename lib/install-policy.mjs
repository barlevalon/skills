import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT_PACKAGE = /^(?:npm:)?@barlevalon\/skills(?:@.+)?$/;
const MATT_TDD = /^github:mattpocock\/skills@[^:]+:skills\/engineering\/tdd$/;
const MAINTAINED_TDD = /^package:@barlevalon\/skills:skills\/tdd$/;

export function piPackageRegistered(options = {}) {
  const home = options.home ?? os.homedir();
  const cwd = options.cwd ?? process.cwd();
  const agentDir = options.agentDir ?? process.env.PI_CODING_AGENT_DIR ?? path.join(home, '.pi/agent');
  const settingsFiles = [path.join(agentDir, 'settings.json'), path.join(cwd, '.pi/settings.json')];

  return settingsFiles.some((settingsFile) => {
    if (!fs.existsSync(settingsFile)) return false;
    try {
      const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      return (settings.packages ?? []).some((entry) => {
        if (typeof entry === 'object' && entry?.skills?.length === 0) return false;
        const source = typeof entry === 'string' ? entry : entry?.source;
        return ROOT_PACKAGE.test(source ?? '');
      });
    } catch {
      return false;
    }
  });
}

export function isManagedInstall(target) {
  return fs.existsSync(path.join(target, '.barlevalon-installed'));
}

export function readInstallMarker(target) {
  const marker = path.join(target, '.barlevalon-installed');
  if (!fs.existsSync(marker)) return null;
  const fields = {};
  for (const line of fs.readFileSync(marker, 'utf8').split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) fields[match[1]] = match[2];
  }
  return fields;
}

export function canRefreshManagedInstall(existingSource, newSource) {
  if (!existingSource || existingSource === newSource) return true;
  if ((MATT_TDD.test(existingSource) && MAINTAINED_TDD.test(newSource)) || (MAINTAINED_TDD.test(existingSource) && MATT_TDD.test(newSource))) return true;
  const existing = classifyInstallSource(existingSource);
  const next = classifyInstallSource(newSource);
  if (existing.kind === 'local' && next.kind === 'local') return true;
  if (existing.kind === 'github' && next.kind === 'github') {
    return existing.repo === next.repo && existing.relativeDir === next.relativeDir;
  }
  return false;
}

export function isObsoleteGlobalTddSource(source) {
  return MAINTAINED_TDD.test(source ?? '');
}

export function removeManagedInstall(target, acceptedSource) {
  if (!fs.existsSync(target)) return { status: 'absent' };
  if (!isManagedInstall(target)) return { status: 'unmanaged' };
  const source = readInstallMarker(target)?.source;
  if (!acceptedSource(source)) return { status: 'different-source', source };
  fs.rmSync(target, { recursive: true, force: true });
  return { status: 'removed', source };
}

function classifyInstallSource(source) {
  const github = source.match(/^github:([^@]+)@([^:]+):(.+)$/);
  if (github) return { kind: 'github', repo: github[1], ref: github[2], relativeDir: github[3] };
  const localPackage = source.match(/^package:@barlevalon\/skills:(.+)$/);
  if (localPackage) return { kind: 'local', relativeDir: localPackage[1] };
  return { kind: 'local', relativeDir: source };
}
