#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkbox, confirm, select, Separator } from '@inquirer/prompts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cwd = process.cwd();
const MARKER = 'skills';
const LOCAL_SOURCE = 'barlevalon';
const MATT_SOURCE = 'matt';
const MATT_REPO = 'mattpocock/skills';
const DEFAULT_MATT_REF = 'main';
const BOOTSTRAP_PROJECT_BUNDLE = 'matt-v1.1';
const RENAMED_SKILLS = new Map([
  ['write-a-prd', 'to-spec'],
  ['prd-to-plan', 'to-tickets'],
]);

const MATT_BUNDLES = new Map([
  ['matt-core', {
    label: 'Matt core flow',
    skills: ['grilling', 'to-spec', 'to-tickets', 'implement', 'code-review', 'tdd'],
  }],
  ['matt-wayfinder', {
    label: 'Matt Wayfinder flow',
    skills: ['wayfinder', 'research', 'prototype', 'grilling', 'domain-modeling'],
  }],
  ['matt-v1.1', {
    label: 'Matt v1.1 workflow',
    skills: ['grilling', 'grill-with-docs', 'to-spec', 'to-tickets', 'implement', 'code-review', 'tdd', 'wayfinder', 'research', 'prototype', 'domain-modeling', 'codebase-design', 'improve-codebase-architecture'],
  }],
]);

const HARNESS_OPTIONS = [
  { id: 'pi', label: 'Pi' },
  { id: 'opencode', label: 'OpenCode' },
  { id: 'vscode', label: 'VS Code: Copilot + Claude + Codex extensions' },
  { id: 'claude-code', label: 'Claude Code' },
];

const HELP = `skills install

Bootstrap Alon's agentic environment.

With no flags, installs Matt workflow skills into the current repo,
barlevalon personal/global skills into your user-level skill folders,
and reports pre-existing skill folders left untouched.

Usage:
  npx @barlevalon/skills@latest install
  npx @barlevalon/skills@latest install --agent vscode --skill tdd --skill diagnose
  npx @barlevalon/skills@latest install --bundle matt-core --agent vscode --project --yes
  npx @barlevalon/skills@latest install --source matt --skill wayfinder --yes

Options:
  -a, --agent <name>    Harness to install for: pi, opencode, vscode, claude-code, all
  -s, --skill <name>    Skill to install. Use '*' or all for every skill
      --source <name>   Skill source: barlevalon (default), matt
      --bundle <name>   Skill bundle: matt-core, matt-wayfinder, matt-v1.1
      --ref <ref>       Git ref for external sources (default: main)
  -g, --global          Install to user scope where supported
  -p, --project         Install to project scope (default)
      --all             Select all harnesses and all skills (do not combine with --bundle)
  -y, --yes             Do not prompt; accept defaults
      --force           Replace existing unmanaged skill directories or switch managed sources
      --list            List available skills
  -h, --help            Show this help
`;

main().catch((error) => {
  console.error(`\ninstall failed: ${error.message}`);
  process.exit(1);
});

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] ?? 'install';

  if (args.help || command === 'help') {
    console.log(HELP);
    return;
  }

  if (command !== 'install') throw new Error(`unknown command: ${command}`);

  const rl = input.isTTY && output.isTTY ? null : readline.createInterface({ input, output });
  let loaded;
  try {
    const yes = Boolean(args.yes);
    if (isBootstrapInstall(args)) {
      loaded = await installBootstrap(args, rl, yes);
      return;
    }

    const skillSet = await chooseSkillSet(args, rl, yes);
    loaded = loadSkills(skillSet, args);
    const skills = loaded.skills;

    if (args.list) {
      const listedSkills = skillSet.bundle ? selectBundleSkills(skillSet.bundle, skills) : skills;
      console.log(`Available skills (${skillSet.label}):`);
      for (const skill of listedSkills) console.log(`- ${skill.name} (${skill.category})`);
      console.log(skillSet.source === LOCAL_SOURCE
        ? '\nDescriptions: https://github.com/barlevalon/skills#pick-a-skill'
        : `\nSource: github:${MATT_REPO}@${skillSet.ref}`);
      return;
    }

    const harnessInput = args.all
      ? ['all']
      : args.agent?.length
        ? args.agent
        : yes
          ? ['vscode']
          : await chooseHarnesses(rl);
    const skillInput = skillSet.bundle
      ? MATT_BUNDLES.get(skillSet.bundle).skills
      : args.all
        ? ['all']
        : args.skill?.length
          ? args.skill
          : yes
            ? ['all']
            : await chooseSkills(rl, skills);
    const chosenHarnesses = normalizeHarnesses(harnessInput);
    const chosenSkills = normalizeSkills(skillInput, skills);
    const scope = args.global
      ? 'global'
      : args.project
        ? 'project'
        : yes
          ? 'project'
          : await chooseScope(rl, chosenHarnesses);

    const selectedSkills = skills.filter((skill) => chosenSkills.includes(skill.name));
    if (selectedSkills.length === 0) throw new Error('no skills selected');
    if (chosenHarnesses.length === 0) throw new Error('no harnesses selected');

    const plan = buildPlan(chosenHarnesses, selectedSkills, scope, skillSet);
    printPlan(plan, selectedSkills, skillSet);

    let confirmed = yes;
    if (!yes) {
      confirmed = await askYesNo(rl, 'Proceed?', true);
      if (!confirmed) return;
    }

    assertCanInstallSkillCopies(copyTargetsForHarnesses(chosenHarnesses, selectedSkills, scope, skillSet), args.force);

    for (const harness of chosenHarnesses) {
      if (harness === 'pi') {
        if (skillSet.source === LOCAL_SOURCE) installPi(selectedSkills, scope);
        else installSkillCopies(selectedSkills, scope === 'global' ? path.join(os.homedir(), '.agents/skills') : path.join(cwd, '.agents/skills'), args.force);
      }
      else if (harness === 'opencode') installSkillCopies(selectedSkills, scope === 'global' ? path.join(os.homedir(), '.config/opencode/skills') : path.join(cwd, '.opencode/skills'), args.force);
      else if (harness === 'claude-code') installSkillCopies(selectedSkills, scope === 'global' ? path.join(os.homedir(), '.claude/skills') : path.join(cwd, '.claude/skills'), args.force);
      else if (harness === 'vscode') installVSCode(selectedSkills, scope, args.force, confirmed);
      else throw new Error(`unsupported harness: ${harness}`);
    }

    console.log('\nInstalled. Ask your agent for a workflow, for example:');
    for (const line of examplePrompts(selectedSkills, skillSet)) console.log(`  ${line}`);
  } finally {
    loaded?.cleanup?.();
    rl?.close();
  }
}

function parseArgs(argv) {
  const args = { _: [], agent: [], skill: [], source: [], bundle: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--list') args.list = true;
    else if (arg === '--all') args.all = true;
    else if (arg === '--yes' || arg === '-y') args.yes = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--global' || arg === '-g') args.global = true;
    else if (arg === '--project' || arg === '-p') args.project = true;
    else if (arg === '--source') args.source.push(...splitArg(argv[++i]));
    else if (arg.startsWith('--source=')) args.source.push(...splitArg(arg.slice('--source='.length)));
    else if (arg === '--bundle') args.bundle.push(...splitArg(argv[++i]));
    else if (arg.startsWith('--bundle=')) args.bundle.push(...splitArg(arg.slice('--bundle='.length)));
    else if (arg === '--ref') args.ref = argv[++i];
    else if (arg.startsWith('--ref=')) args.ref = arg.slice('--ref='.length);
    else if (arg === '--agent' || arg === '-a') args.agent.push(...splitArg(argv[++i]));
    else if (arg.startsWith('--agent=')) args.agent.push(...splitArg(arg.slice('--agent='.length)));
    else if (arg === '--skill' || arg === '-s') args.skill.push(...splitArg(argv[++i]));
    else if (arg.startsWith('--skill=')) args.skill.push(...splitArg(arg.slice('--skill='.length)));
    else args._.push(arg);
  }
  return args;
}

function splitArg(value) {
  if (!value) return [];
  return String(value).split(',').map((part) => part.trim()).filter(Boolean);
}

function isBootstrapInstall(args) {
  return !args.list
    && !args.all
    && !args.global
    && !args.project
    && !args.ref
    && args.agent.length === 0
    && args.skill.length === 0
    && args.source.length === 0
    && args.bundle.length === 0;
}

async function installBootstrap(args, rl, yes) {
  const projectSkillSet = {
    source: MATT_SOURCE,
    bundle: BOOTSTRAP_PROJECT_BUNDLE,
    ref: DEFAULT_MATT_REF,
    label: MATT_BUNDLES.get(BOOTSTRAP_PROJECT_BUNDLE).label,
  };
  const projectLoaded = loadSkills(projectSkillSet, args);
  try {
    const projectSkills = selectBundleSkills(BOOTSTRAP_PROJECT_BUNDLE, projectLoaded.skills);
    const globalSkills = discoverSkills(root, { source: LOCAL_SOURCE });

    console.log('\nPlan:');
    console.log(`- Repo workflow skills: install ${projectSkills.length} Matt v1.1 skill folder(s) to .agents/skills and .claude/skills`);
    console.log('- Repo instructions: update AGENTS.md and .github/copilot-instructions.md');
    console.log(`- Global personal skills: install ${globalSkills.length} barlevalon skill folder(s) to ~/.agents/skills and ~/.claude/skills`);
    console.log(`\nSource: github:${MATT_REPO}@${projectSkillSet.ref}`);

    const untouchedReport = snapshotUntouchedSkillDirs([
      { label: 'repo .agents/skills', root: path.join(cwd, '.agents/skills'), installedNames: new Set(projectSkills.map((skill) => skill.name)) },
      { label: 'repo .claude/skills', root: path.join(cwd, '.claude/skills'), installedNames: new Set(projectSkills.map((skill) => skill.name)) },
      { label: 'global ~/.agents/skills', root: path.join(os.homedir(), '.agents/skills'), installedNames: new Set(globalSkills.map((skill) => skill.name)) },
      { label: 'global ~/.claude/skills', root: path.join(os.homedir(), '.claude/skills'), installedNames: new Set(globalSkills.map((skill) => skill.name)) },
    ]);

    let confirmed = yes;
    if (!yes) {
      confirmed = await askYesNo(rl, 'Bootstrap this repo and your global agent skills?', true);
      if (!confirmed) return { cleanup: projectLoaded.cleanup };
    }

    assertCanInstallSkillCopies([
      { targetRoot: path.join(cwd, '.agents/skills'), skills: projectSkills },
      { targetRoot: path.join(cwd, '.claude/skills'), skills: projectSkills },
      { targetRoot: path.join(os.homedir(), '.agents/skills'), skills: globalSkills },
      { targetRoot: path.join(os.homedir(), '.claude/skills'), skills: globalSkills },
    ], args.force);

    installVSCode(projectSkills, 'project', args.force, confirmed);
    installSkillCopies(globalSkills, path.join(os.homedir(), '.agents/skills'), args.force);
    installSkillCopies(globalSkills, path.join(os.homedir(), '.claude/skills'), args.force);

    printUntouchedSkillDirs(untouchedReport);

    console.log('\nInstalled. Ask your agent for a workflow, for example:');
    for (const line of examplePrompts(projectSkills, projectSkillSet)) console.log(`  ${line}`);
    return { cleanup: projectLoaded.cleanup };
  } catch (error) {
    projectLoaded.cleanup?.();
    throw error;
  }
}

async function chooseSkillSet(args, rl, yes) {
  const ref = args.ref ?? DEFAULT_MATT_REF;

  if (args.bundle.length > 1) throw new Error('choose only one --bundle');
  if (args.source.length > 1) throw new Error('choose only one --source');
  if (args.bundle.length && args.skill.length) throw new Error('--bundle already selects skills; do not combine it with --skill');
  if (args.bundle.length && args.all) throw new Error('--bundle selects a subset of skills; do not combine it with --all. Use --agent all with --bundle if you want every harness.');

  if (args.bundle.length) {
    if (args.source.length && normalizeSource(args.source[0]) !== MATT_SOURCE) {
      throw new Error('--bundle uses Matt upstream skills; do not combine it with --source barlevalon');
    }
    const bundle = normalizeBundle(args.bundle[0]);
    return { source: MATT_SOURCE, bundle, ref, label: MATT_BUNDLES.get(bundle).label };
  }

  if (args.source.length) {
    const source = normalizeSource(args.source[0]);
    return source === MATT_SOURCE
      ? { source: MATT_SOURCE, bundle: null, ref, label: `Matt upstream (${MATT_REPO}@${ref})` }
      : { source: LOCAL_SOURCE, bundle: null, ref: null, label: 'barlevalon skills' };
  }

  return { source: LOCAL_SOURCE, bundle: null, ref: null, label: 'barlevalon skills' };
}

function snapshotUntouchedSkillDirs(targets) {
  return targets.map((target) => {
    const existing = existingSkillDirNames(target.root);
    const untouched = existing.filter((name) => !target.installedNames.has(name));
    return { label: target.label, root: target.root, names: untouched };
  });
}

function existingSkillDirNames(rootDir) {
  if (!fs.existsSync(rootDir)) return [];
  return fs.readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function printUntouchedSkillDirs(report) {
  const entries = report.filter((target) => target.names.length > 0);
  if (!entries.length) return;

  console.log('\nExisting skill folders left untouched:');
  for (const target of entries) {
    console.log(`- ${target.label}: ${target.names.join(', ')}`);
  }
}

function normalizeSource(value) {
  const normalized = String(value).toLowerCase();
  if (['barlevalon', 'local', 'alon', 'self'].includes(normalized)) return LOCAL_SOURCE;
  if (['matt', 'mattpocock', 'mattpocock/skills', 'github:mattpocock/skills'].includes(normalized)) return MATT_SOURCE;
  throw new Error(`unknown skill source: ${value}`);
}

function normalizeBundle(value) {
  const normalized = String(value).toLowerCase();
  const aliases = {
    core: 'matt-core',
    wayfinder: 'matt-wayfinder',
    matt: 'matt-v1.1',
    'matt-v1': 'matt-v1.1',
    'v1.1': 'matt-v1.1',
  };
  const bundle = aliases[normalized] ?? normalized;
  if (!MATT_BUNDLES.has(bundle)) throw new Error(`unknown bundle: ${value}`);
  return bundle;
}

function loadSkills(skillSet, args) {
  if (skillSet.source === LOCAL_SOURCE) return { skills: discoverSkills(root, { source: LOCAL_SOURCE }) };

  const checkout = checkoutGitHubRepo(MATT_REPO, skillSet.ref ?? DEFAULT_MATT_REF);
  try {
    const skills = discoverSkills(checkout.dir, {
      source: MATT_SOURCE,
      sourceMarkerPrefix: `github:${MATT_REPO}@${checkout.ref}`,
    });
    if (skillSet.bundle) {
      assertBundleSkillsExist(skillSet.bundle, skills);
    }
    return { skills, cleanup: checkout.cleanup };
  } catch (error) {
    checkout.cleanup();
    throw error;
  }
}

function assertBundleSkillsExist(bundle, skills) {
  const names = new Set(skills.map((skill) => skill.name));
  const missing = MATT_BUNDLES.get(bundle).skills.filter((skill) => !names.has(skill));
  if (missing.length) throw new Error(`${bundle} missing upstream skills: ${missing.join(', ')}`);
}

function selectBundleSkills(bundle, skills) {
  const names = new Set(MATT_BUNDLES.get(bundle).skills);
  return skills.filter((skill) => names.has(skill.name));
}

function checkoutGitHubRepo(repo, ref) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'barlevalon-skills-'));
  const cleanup = () => fs.rmSync(dir, { recursive: true, force: true });
  try {
    const url = `https://github.com/${repo}.git`;
    runGit(['clone', '--depth', '1', url, dir], `clone github:${repo}`);
    if (ref && ref !== DEFAULT_MATT_REF) {
      const fetch = spawnSync('git', ['-C', dir, 'fetch', '--depth', '1', 'origin', ref], { encoding: 'utf8' });
      if (fetch.status === 0) runGit(['-C', dir, 'checkout', 'FETCH_HEAD'], `checkout ${ref}`);
      else runGit(['-C', dir, 'checkout', ref], `checkout ${ref}`);
    }
    const resolved = spawnSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
    const resolvedRef = resolved.status === 0 ? resolved.stdout.trim() : ref;
    return { dir, ref: resolvedRef, cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}

function runGit(args, label) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.error?.code === 'ENOENT') throw new Error('git is required to install external skill sources');
  if (result.status !== 0) throw new Error(`${label} failed: ${(result.stderr || result.stdout).trim()}`);
}

function parseFrontmatter(text) {
  const fields = {};
  const lines = text.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || /^\s/.test(line)) continue;
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (rawValue === '>' || rawValue === '|') {
      const block = [];
      for (let next = index + 1; next < lines.length && /^\s+/.test(lines[next]); next += 1) {
        block.push(lines[next].trim());
        index = next;
      }
      fields[key] = block.join(rawValue === '>' ? ' ' : '\n').trim();
    } else {
      fields[key] = rawValue.trim().replace(/^["']|["']$/g, '');
    }
  }
  return fields;
}

function discoverSkills(packageRoot = root, options = {}) {
  const skillsRoot = path.join(packageRoot, 'skills');
  const categories = fs.readdirSync(skillsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const skills = [];

  for (const category of categories) {
    const categoryDir = path.join(skillsRoot, category.name);
    for (const entry of fs.readdirSync(categoryDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = path.join(categoryDir, entry.name);
      const skillFile = path.join(dir, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;
      const text = fs.readFileSync(skillFile, 'utf8');
      const frontmatter = parseFrontmatter(text.match(/^---\n([\s\S]*?)\n---/m)?.[1] ?? '');
      const name = frontmatter.name ?? entry.name;
      const description = frontmatter.description ?? '';
      const packageFile = path.join(dir, 'package.json');
      const packageName = fs.existsSync(packageFile) ? JSON.parse(fs.readFileSync(packageFile, 'utf8')).name : undefined;
      const relativeDir = path.relative(packageRoot, dir).split(path.sep).join('/');
      const sourceMarker = options.sourceMarkerPrefix ? `${options.sourceMarkerPrefix}:${relativeDir}` : `package:@barlevalon/skills:${relativeDir}`;
      skills.push({ name, description, category: category.name, dir, packageName, source: options.source ?? LOCAL_SOURCE, sourceMarker });
    }
  }

  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

async function chooseHarnesses(rl) {
  if (input.isTTY && output.isTTY) {
    return checkbox({
      message: 'Install for which harnesses?',
      choices: HARNESS_OPTIONS.map((option) => ({ name: option.label, value: option.id, checked: option.id === 'vscode' })),
      required: true,
    });
  }
  return chooseManyFallback(rl, 'Install for which harnesses?', HARNESS_OPTIONS, ['vscode']);
}

async function chooseSkills(rl, skills) {
  if (input.isTTY && output.isTTY) {
    const selected = await checkbox({
      message: 'Install which skills?',
      choices: [
        { name: 'All skills', value: 'all', checked: true },
        new Separator(),
        ...skills.map((skill) => ({ name: `${skill.name} (${skill.category})`, value: skill.name })),
      ],
      required: true,
      pageSize: 15,
    });
    return selected;
  }
  return chooseManyFallback(rl, 'Install which skills?', skills.map((skill) => ({ id: skill.name, label: `${skill.name} (${skill.category})` })), ['all']);
}

async function chooseScope(rl, harnesses) {
  const hasProjectOnlyDocs = harnesses.includes('vscode');
  const projectLabel = hasProjectOnlyDocs
    ? 'Project — write repo-local skill folders and instruction files'
    : 'Project — install for this repository';
  const globalLabel = hasProjectOnlyDocs
    ? 'Global — install user skill folders only; Copilot repo instructions are skipped'
    : 'Global — install for your user account';

  if (input.isTTY && output.isTTY) {
    return select({
      message: 'Install scope?',
      choices: [
        { name: projectLabel, value: 'project' },
        { name: globalLabel, value: 'global' },
      ],
      default: 'project',
    });
  }

  const answer = (await rl.question(`Install scope? project/global [project]: `)).trim().toLowerCase();
  return answer === 'global' || answer === 'g' ? 'global' : 'project';
}

async function chooseManyFallback(rl, title, options, defaults = []) {
  console.log(`\n${title}`);
  options.forEach((option, index) => console.log(`  ${index + 1}. ${option.label}`));
  const suffix = defaults.length ? ` [${defaults.join(', ')}]` : '';
  const answer = (await rl.question(`Choose numbers/names, comma-separated, or all${suffix}: `)).trim();
  return answer ? splitArg(answer) : defaults;
}

async function askYesNo(rl, question, defaultValue) {
  if (input.isTTY && output.isTTY) {
    return confirm({ message: question, default: defaultValue });
  }
  const suffix = defaultValue ? 'Y/n' : 'y/N';
  const answer = (await rl.question(`${question} (${suffix}) `)).trim().toLowerCase();
  if (!answer) return defaultValue;
  return ['y', 'yes'].includes(answer);
}

function normalizeHarnesses(values) {
  const ids = new Set();
  for (const value of values) {
    const normalized = String(value).toLowerCase();
    if (normalized === 'all' || normalized === '*') {
      HARNESS_OPTIONS.forEach((option) => ids.add(option.id));
      continue;
    }
    const numeric = Number(normalized);
    if (Number.isInteger(numeric) && numeric >= 1 && numeric <= HARNESS_OPTIONS.length) {
      ids.add(HARNESS_OPTIONS[numeric - 1].id);
      continue;
    }
    const aliases = {
      claude: 'claude-code',
      claude_code: 'claude-code',
      code: 'vscode',
      copilot: 'vscode',
      codex: 'vscode',
      'vs-code': 'vscode',
    };
    const id = aliases[normalized] ?? normalized;
    if (!HARNESS_OPTIONS.some((option) => option.id === id)) throw new Error(`unknown harness: ${value}`);
    ids.add(id);
  }
  return [...ids];
}

function normalizeSkills(values, skills) {
  const ids = new Set();
  const byName = new Map(skills.map((skill) => [skill.name, skill]));
  for (const value of values) {
    const normalized = String(value).toLowerCase();
    if (normalized === 'all' || normalized === '*') {
      skills.forEach((skill) => ids.add(skill.name));
      continue;
    }
    const numeric = Number(normalized);
    if (Number.isInteger(numeric) && numeric >= 1 && numeric <= skills.length) {
      ids.add(skills[numeric - 1].name);
      continue;
    }
    if (!byName.has(normalized)) throw new Error(`unknown skill: ${value}`);
    ids.add(normalized);
  }
  return [...ids];
}

function buildPlan(harnesses, skills, scope, skillSet = { source: LOCAL_SOURCE }) {
  const plan = [];
  for (const harness of harnesses) {
    if (harness === 'pi') {
      const target = skillSet.source === LOCAL_SOURCE
        ? `install ${skills.length === discoverSkills().length ? '@barlevalon/skills' : `${skills.length} single-skill package(s)`} to ${scope} settings`
        : `copy ${skills.length} skill folder(s) to ${scope === 'global' ? '~/.agents/skills' : '.agents/skills'}`;
      plan.push(`Pi: ${target}`);
    }
    if (harness === 'opencode') plan.push(`OpenCode: copy ${skills.length} skill folder(s) to ${scope === 'global' ? '~/.config/opencode/skills' : '.opencode/skills'}`);
    if (harness === 'claude-code') plan.push(`Claude Code: copy ${skills.length} skill folder(s) to ${scope === 'global' ? '~/.claude/skills' : '.claude/skills'}`);
    if (harness === 'vscode') {
      const target = scope === 'global'
        ? 'copy skills to ~/.agents/skills and ~/.claude/skills (Copilot repo instructions skipped)'
        : 'copy skills to .agents/skills and .claude/skills, then update AGENTS.md and .github/copilot-instructions.md';
      plan.push(`VS Code: ${target}`);
    }
  }
  if (skillSet.source === MATT_SOURCE) plan.unshift(`Source: github:${MATT_REPO}@${skillSet.ref}`);
  return plan;
}

function printPlan(plan, skills, skillSet = { label: 'barlevalon skills' }) {
  console.log('\nPlan:');
  for (const line of plan) console.log(`- ${line}`);
  console.log(`\nSkill set: ${skillSet.label}`);
  console.log(`Skills: ${skills.map((skill) => skill.name).join(', ')}`);
}

function examplePrompts(skills, skillSet) {
  const names = new Set(skills.map((skill) => skill.name));
  const examples = [];
  if (names.has('wayfinder')) examples.push('Use wayfinder to map this feature.');
  if (names.has('to-spec')) examples.push('Use to-spec to turn this plan into a spec.');
  if (names.has('to-tickets')) examples.push('Use to-tickets to break this spec into tickets.');
  if (names.has('tdd')) examples.push('Use tdd to implement this change.');
  if (names.has('diagnose')) examples.push('Use diagnose before fixing this bug.');
  if (examples.length) return examples.slice(0, 2);
  return skills.slice(0, 2).map((skill) => `Use ${skill.name} for this workflow.`);
}

function installPi(skills, scope) {
  const allSkills = discoverSkills();
  const sources = skills.length === allSkills.length
    ? ['npm:@barlevalon/skills']
    : skills.map((skill) => {
        if (!skill.packageName) throw new Error(`missing package name for ${skill.name}`);
        return `npm:${skill.packageName}`;
      });

  for (const source of sources) {
    const args = ['install', source];
    if (scope === 'project') args.push('-l');
    const result = spawnSync('pi', args, { stdio: 'inherit' });
    if (result.error?.code === 'ENOENT') {
      throw new Error(`Pi CLI not found. Install pi or rerun without --agent pi. Manual command: pi ${args.join(' ')}`);
    }
    if (result.status !== 0) throw new Error(`pi install failed for ${source}`);
  }
}

function installVSCode(skills, scope, replaceAnySkillDir, confirmed) {
  if (scope === 'global') {
    installSkillCopies(skills, path.join(os.homedir(), '.agents/skills'), replaceAnySkillDir);
    installSkillCopies(skills, path.join(os.homedir(), '.claude/skills'), replaceAnySkillDir);
    return;
  }

  installSkillCopies(skills, path.join(cwd, '.agents/skills'), replaceAnySkillDir);
  installSkillCopies(skills, path.join(cwd, '.claude/skills'), replaceAnySkillDir);
  upsertManagedBlock(path.join(cwd, 'AGENTS.md'), agentsBlock(skills), confirmed);
  upsertManagedBlock(path.join(cwd, '.github/copilot-instructions.md'), copilotBlock(skills), confirmed);
}

function copyTargetsForHarnesses(harnesses, skills, scope, skillSet) {
  const targets = [];
  for (const harness of harnesses) {
    if (harness === 'pi' && skillSet.source !== LOCAL_SOURCE) {
      targets.push({ targetRoot: scope === 'global' ? path.join(os.homedir(), '.agents/skills') : path.join(cwd, '.agents/skills'), skills });
    }
    if (harness === 'opencode') {
      targets.push({ targetRoot: scope === 'global' ? path.join(os.homedir(), '.config/opencode/skills') : path.join(cwd, '.opencode/skills'), skills });
    }
    if (harness === 'claude-code') {
      targets.push({ targetRoot: scope === 'global' ? path.join(os.homedir(), '.claude/skills') : path.join(cwd, '.claude/skills'), skills });
    }
    if (harness === 'vscode') {
      targets.push({ targetRoot: scope === 'global' ? path.join(os.homedir(), '.agents/skills') : path.join(cwd, '.agents/skills'), skills });
      targets.push({ targetRoot: scope === 'global' ? path.join(os.homedir(), '.claude/skills') : path.join(cwd, '.claude/skills'), skills });
    }
  }
  return targets;
}

function assertCanInstallSkillCopies(targets, replaceAnySkillDir) {
  const conflicts = [];
  const seen = new Set();

  for (const { targetRoot, skills } of targets) {
    for (const skill of skills) {
      const markerSource = skill.sourceMarker ?? skill.dir;
      const target = path.join(targetRoot, skill.name);
      const key = `${target}\0${markerSource}`;
      if (seen.has(key)) continue;
      seen.add(key);

      if (skill.source !== LOCAL_SOURCE) {
        for (const symlink of findSymlinks(skill.dir)) {
          conflicts.push(`${displayPath(target)} cannot be installed because external source contains symlink: ${displayPath(symlink)}`);
        }
      }

      if (!fs.existsSync(target) || replaceAnySkillDir) continue;
      if (!isManagedInstall(target)) {
        conflicts.push(`${displayPath(target)} already exists and was not created by this installer`);
        continue;
      }
      const existingSource = readInstallMarker(target)?.source;
      if (!canRefreshManagedInstall(existingSource, markerSource)) {
        conflicts.push(`${displayPath(target)} is installer-managed from ${existingSource ?? 'an unknown source'} and would switch to ${markerSource}`);
      }
    }
  }

  if (!conflicts.length) return;
  throw new Error(`install conflicts found; no files were changed:\n${conflicts.map((conflict) => `- ${conflict}`).join('\n')}\nRerun with --force to replace these skill folders.`);
}

function displayPath(file) {
  const relative = path.relative(cwd, file);
  return relative && !relative.startsWith('..') ? relative : file.replace(os.homedir(), '~');
}

function findSymlinks(directory, found = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) found.push(entryPath);
    else if (entry.isDirectory()) findSymlinks(entryPath, found);
  }
  return found;
}

function installSkillCopies(skills, targetRoot, replaceAnySkillDir) {
  fs.mkdirSync(targetRoot, { recursive: true });
  removeRenamedManagedSkills(targetRoot, new Set(skills.map((skill) => skill.name)));
  for (const skill of skills) {
    const target = path.join(targetRoot, skill.name);
    copyDirectory(skill.dir, target, replaceAnySkillDir, {
      markerSource: skill.sourceMarker ?? skill.dir,
      rejectSymlinks: skill.source !== LOCAL_SOURCE,
    });
    console.log(`copied ${skill.name} -> ${path.relative(cwd, target) || target}`);
  }
}

function removeRenamedManagedSkills(targetRoot, selectedSkillNames) {
  for (const [oldName, newName] of RENAMED_SKILLS) {
    if (!selectedSkillNames.has(newName)) continue;
    const oldTarget = path.join(targetRoot, oldName);
    if (!fs.existsSync(oldTarget)) continue;
    if (!isManagedInstall(oldTarget)) {
      console.warn(`skipped old ${oldName} at ${path.relative(cwd, oldTarget) || oldTarget}: not installer-managed`);
      continue;
    }
    fs.rmSync(oldTarget, { recursive: true, force: true });
    console.log(`removed old ${oldName} -> ${path.relative(cwd, oldTarget) || oldTarget}`);
  }
}

function copyDirectory(source, target, replaceAnySkillDir, options = {}) {
  const markerSource = options.markerSource ?? source;
  if (options.rejectSymlinks) assertNoSymlinks(source);

  if (fs.existsSync(target)) {
    if (!replaceAnySkillDir && !isManagedInstall(target)) {
      throw new Error(`${target} already exists and was not created by this installer; rerun with --force to replace it`);
    }
    const existingSource = readInstallMarker(target)?.source;
    if (!replaceAnySkillDir && !canRefreshManagedInstall(existingSource, markerSource)) {
      throw new Error(`${target} is installer-managed from ${existingSource ?? 'an unknown source'}; rerun with --force to replace it with ${markerSource}`);
    }
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.cpSync(source, target, {
    recursive: true,
    dereference: true,
    filter: (file) => !path.relative(source, file).split(path.sep).includes('node_modules'),
  });
  fs.writeFileSync(path.join(target, '.barlevalon-installed'), `source=${markerSource}\ninstalledAt=${new Date().toISOString()}\n`);
}

function isManagedInstall(target) {
  return fs.existsSync(path.join(target, '.barlevalon-installed'));
}

function readInstallMarker(target) {
  const marker = path.join(target, '.barlevalon-installed');
  if (!fs.existsSync(marker)) return null;
  const fields = {};
  for (const line of fs.readFileSync(marker, 'utf8').split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) fields[match[1]] = match[2];
  }
  return fields;
}

function canRefreshManagedInstall(existingSource, newSource) {
  if (!existingSource || existingSource === newSource) return true;
  const existing = classifyInstallSource(existingSource);
  const next = classifyInstallSource(newSource);
  if (existing.kind === 'local' && next.kind === 'local') return true;
  if (existing.kind === 'github' && next.kind === 'github') {
    return existing.repo === next.repo && existing.relativeDir === next.relativeDir;
  }
  return false;
}

function classifyInstallSource(source) {
  const github = source.match(/^github:([^@]+)@([^:]+):(.+)$/);
  if (github) return { kind: 'github', repo: github[1], ref: github[2], relativeDir: github[3] };
  const localPackage = source.match(/^package:@barlevalon\/skills:(.+)$/);
  if (localPackage) return { kind: 'local', relativeDir: localPackage[1] };
  return { kind: 'local', relativeDir: source };
}

function assertNoSymlinks(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`external skill contains unsupported symlink: ${entryPath}`);
    if (entry.isDirectory()) assertNoSymlinks(entryPath);
  }
}

function upsertManagedBlock(file, body, yes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const start = `<!-- ${MARKER}:start -->`;
  const end = `<!-- ${MARKER}:end -->`;
  const block = `${start}\n${body.trim()}\n${end}`;
  const oldText = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  let newText;
  const regex = new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`);
  if (regex.test(oldText)) newText = oldText.replace(regex, block);
  else newText = `${oldText.trimEnd()}${oldText.trim() ? '\n\n' : ''}${block}\n`;
  if (!yes && fs.existsSync(file) && oldText !== newText && !regex.test(oldText) && oldText.trim()) {
    throw new Error(`${file} exists; rerun with --yes to append managed instructions`);
  }
  fs.writeFileSync(file, newText);
  console.log(`updated ${path.relative(cwd, file) || file}`);
}

function agentsBlock(skills) {
  return `## barlevalon workflow skills

Workflow skills are installed in \`.agents/skills\`.
When asked for a named workflow, read that skill's \`SKILL.md\` before acting.
If the skill links helper files, read those too.

Installed skills:
${skills.map((skill) => `- \`${skill.name}\`: \`.agents/skills/${skill.name}/SKILL.md\``).join('\n')}`;
}

function copilotBlock(skills) {
  return `## barlevalon workflow skills

Use the workflow skills installed in this repository when the user asks for a named workflow. Read the matching \`SKILL.md\` before acting, and read linked helper files when needed.

Installed skills:
${skills.map((skill) => `- \`${skill.name}\`: \`.agents/skills/${skill.name}/SKILL.md\``).join('\n')}`;
}

function escapeRegex(text) {
  return text.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}
