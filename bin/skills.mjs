#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkbox, confirm, select, Separator } from '@inquirer/prompts';
import {
  canRefreshManagedInstall,
  isManagedInstall,
  isObsoleteGlobalTddSource,
  piPackageRegistered,
  readInstallMarker,
  removeManagedInstall,
} from '../lib/install-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cwd = process.cwd();
const MARKER = 'skills';
const LOCAL_SOURCE = 'barlevalon';
const MATT_SOURCE = 'matt';
const MATT_REPO = 'mattpocock/skills';
const BENTO_REPO = 'nyblnet/bento';
const CAVEMAN_REPO = 'JuliusBrussee/caveman';
const PONYTAIL_REPO = 'DietrichGebert/ponytail';
const VERCEL_SKILLS_REPO = 'vercel-labs/skills';
const WORKTRUNK_REPO = 'max-sixty/worktrunk';
const CURSOR_PLUGINS_REPO = 'cursor/plugins';
const PLANNOTATOR_REPO = 'backnotprop/plannotator';
const DEFAULT_MATT_REF = 'main';
const BOOTSTRAP_PROJECT_BUNDLE = 'matt-v1.1';
const BOOTSTRAP_PLANNOTATOR_SKILLS = ['plannotator-review', 'plannotator-annotate', 'plannotator-last', 'plannotator-visual-explainer'];
const BOOTSTRAP_PONYTAIL_SKILLS = ['ponytail', 'ponytail-review', 'ponytail-audit', 'ponytail-debt'];
const BOOTSTRAP_MATT_GLOBAL_SKILLS = ['diagnosing-bugs', 'handoff', 'writing-great-skills'];
const RENAMED_SKILLS = new Map([
  ['diagnose', 'diagnosing-bugs'],
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
local barlevalon skills plus canonical upstream global skills into your
user-level skill folders, and reports untouched skill folders.

Usage:
  npx @barlevalon/skills@latest install
  npx @barlevalon/skills@latest install --agent vscode --skill tdd --skill release-prep
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
      --allow-pi-overlap Continue when Pi already loads this package globally
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

    const installsLocalPiSubset = chosenHarnesses.includes('pi')
      && skillSet.source === LOCAL_SOURCE
      && selectedSkills.length !== discoverSkills().length;
    const writesPiVisibleCopies = chosenHarnesses.includes('vscode') || (chosenHarnesses.includes('pi') && skillSet.source !== LOCAL_SOURCE);
    if ((writesPiVisibleCopies || installsLocalPiSubset) && !await confirmPiOverlap(args, rl, yes, 'Selected targets add skill sources that Pi will discover.')) return;

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
    else if (arg === '--allow-pi-overlap') args.allowPiOverlap = true;
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

async function confirmPiOverlap(args, rl, yes, reason) {
  if (!piPackageRegistered() || args.allowPiOverlap) return true;
  const message = `${reason} Pi already loads npm:@barlevalon/skills globally, so duplicate names will produce collision warnings.`;
  if (yes) throw new Error(`${message} Remove --yes to choose interactively, or pass --allow-pi-overlap.`);
  console.warn(`\n${message}`);
  return askYesNo(rl, 'Continue with overlapping skill copies?', false);
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
  if (!await confirmPiOverlap(args, rl, yes, 'Default bootstrap writes skill copies that Pi will discover.')) return;

  const projectSkillSet = {
    source: MATT_SOURCE,
    bundle: BOOTSTRAP_PROJECT_BUNDLE,
    ref: DEFAULT_MATT_REF,
    label: MATT_BUNDLES.get(BOOTSTRAP_PROJECT_BUNDLE).label,
  };
  let projectLoaded;
  let upstreamGlobalLoaded;
  let plannotatorLoaded;
  try {
    projectLoaded = loadSkills(projectSkillSet, args);
    upstreamGlobalLoaded = loadBootstrapGlobalUpstreamSkills(DEFAULT_MATT_REF);
    plannotatorLoaded = loadPlannotatorSkills(DEFAULT_MATT_REF);
    const maintainedSkills = discoverSkills(root, { source: LOCAL_SOURCE });
    const maintainedTdd = maintainedSkills.find((skill) => skill.name === 'tdd');
    if (!maintainedTdd) throw new Error('maintained tdd skill missing');
    const projectSkills = selectBundleSkills(BOOTSTRAP_PROJECT_BUNDLE, projectLoaded.skills)
      .map((skill) => skill.name === 'tdd' ? maintainedTdd : skill)
      .sort((left, right) => left.name.localeCompare(right.name));
    const localGlobalSkills = maintainedSkills.filter((skill) => skill.name !== 'tdd');
    const upstreamGlobalSkills = upstreamGlobalLoaded.skills;
    const plannotatorSkills = plannotatorLoaded.skills;
    const globalTargetNames = new Set([...localGlobalSkills, ...upstreamGlobalSkills, ...plannotatorSkills].map((skill) => skill.name));

    console.log('\nPlan:');
    console.log(`- Repo workflow skills: install ${projectSkills.length} curated skill folder(s) to .agents/skills and .claude/skills`);
    console.log('- Repo instructions: update AGENTS.md and .github/copilot-instructions.md');
    console.log('- Global cleanup: remove obsolete installer-managed tdd copies from ~/.agents/skills and ~/.claude/skills');
    console.log(`- Global local skills: install ${localGlobalSkills.length} barlevalon fork/personal skill folder(s) to ~/.agents/skills and ~/.claude/skills`);
    console.log(`- Global upstream skills: install ${upstreamGlobalSkills.length} canonical upstream skill folder(s) to ~/.agents/skills and ~/.claude/skills`);
    console.log(`- Global Plannotator skills: ensure ${plannotatorSkills.length} upstream skill folder(s) in ~/.agents/skills and ~/.claude/skills`);
    console.log(`\nSources: github:${MATT_REPO}@${projectSkillSet.ref}, ${upstreamGlobalLoaded.sources.map((source) => `github:${source.repo}@${source.ref}`).join(', ')}, github:${PLANNOTATOR_REPO}@${plannotatorLoaded.ref}`);

    const untouchedReport = snapshotUntouchedSkillDirs([
      { label: 'repo .agents/skills', root: path.join(cwd, '.agents/skills'), installedNames: new Set(projectSkills.map((skill) => skill.name)) },
      { label: 'repo .claude/skills', root: path.join(cwd, '.claude/skills'), installedNames: new Set(projectSkills.map((skill) => skill.name)) },
      { label: 'global ~/.agents/skills', root: path.join(os.homedir(), '.agents/skills'), installedNames: globalTargetNames },
      { label: 'global ~/.claude/skills', root: path.join(os.homedir(), '.claude/skills'), installedNames: globalTargetNames },
    ]);

    let confirmed = yes;
    if (!yes) {
      confirmed = await askYesNo(rl, 'Bootstrap this repo and your global agent skills?', true);
      if (!confirmed) return { cleanup: () => { projectLoaded.cleanup?.(); upstreamGlobalLoaded.cleanup?.(); plannotatorLoaded.cleanup?.(); } };
    }

    const globalAgentsRoot = path.join(os.homedir(), '.agents/skills');
    const globalClaudeRoot = path.join(os.homedir(), '.claude/skills');

    assertCanInstallSkillCopies([
      { targetRoot: path.join(cwd, '.agents/skills'), skills: projectSkills },
      { targetRoot: path.join(cwd, '.claude/skills'), skills: projectSkills },
      { targetRoot: globalAgentsRoot, skills: localGlobalSkills },
      { targetRoot: globalClaudeRoot, skills: localGlobalSkills },
      { targetRoot: globalAgentsRoot, skills: upstreamGlobalSkills },
      { targetRoot: globalClaudeRoot, skills: upstreamGlobalSkills },
      { targetRoot: globalAgentsRoot, skills: plannotatorSkills },
      { targetRoot: globalClaudeRoot, skills: plannotatorSkills },
    ], args.force);

    removeObsoleteGlobalTdd(globalAgentsRoot);
    removeObsoleteGlobalTdd(globalClaudeRoot);
    installVSCode(projectSkills, 'project', args.force, confirmed);
    installSkillCopies(localGlobalSkills, globalAgentsRoot, args.force);
    installSkillCopies(localGlobalSkills, globalClaudeRoot, args.force);
    installSkillCopies(upstreamGlobalSkills, globalAgentsRoot, args.force);
    installSkillCopies(upstreamGlobalSkills, globalClaudeRoot, args.force);
    installSkillCopies(plannotatorSkills, globalAgentsRoot, args.force);
    installSkillCopies(plannotatorSkills, globalClaudeRoot, args.force);

    printUntouchedSkillDirs(untouchedReport);

    console.log('\nInstalled. Ask your agent for a workflow, for example:');
    for (const line of examplePrompts(projectSkills, projectSkillSet)) console.log(`  ${line}`);
    return { cleanup: () => { projectLoaded.cleanup?.(); upstreamGlobalLoaded.cleanup?.(); plannotatorLoaded.cleanup?.(); } };
  } catch (error) {
    projectLoaded?.cleanup?.();
    upstreamGlobalLoaded?.cleanup?.();
    plannotatorLoaded?.cleanup?.();
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
  const entries = report
    .map((target) => ({
      ...target,
      names: target.names.filter((name) => fs.existsSync(path.join(target.root, name))),
    }))
    .filter((target) => target.names.length > 0);
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

function loadBootstrapGlobalUpstreamSkills(ref) {
  const checkouts = [];
  const sources = [];
  const cleanup = () => {
    for (const checkout of checkouts) checkout.cleanup?.();
  };

  const checkout = (repo) => {
    const result = checkoutGitHubRepo(repo, ref ?? DEFAULT_MATT_REF);
    checkouts.push(result);
    sources.push({ repo, ref: result.ref });
    return result;
  };

  try {
    const skills = [];

    const bento = checkout(BENTO_REPO);
    skills.push(...selectSkillsByName(
      ['bento-slides'],
      discoverFlatSkills(path.join(bento.dir, 'plugins/bento-slides/skills'), 'documents', {
        source: MATT_SOURCE,
        sourceMarkerPrefix: `github:${BENTO_REPO}@${bento.ref}:plugins/bento-slides/skills`,
      }),
      BENTO_REPO,
    ));

    const caveman = checkout(CAVEMAN_REPO);
    skills.push(...selectSkillsByName(
      ['caveman', 'caveman-help'],
      discoverFlatSkills(path.join(caveman.dir, 'skills'), 'communication', {
        source: MATT_SOURCE,
        sourceMarkerPrefix: `github:${CAVEMAN_REPO}@${caveman.ref}:skills`,
      }),
      CAVEMAN_REPO,
    ));

    const ponytail = checkout(PONYTAIL_REPO);
    skills.push(...selectSkillsByName(
      BOOTSTRAP_PONYTAIL_SKILLS,
      discoverFlatSkills(path.join(ponytail.dir, 'skills'), 'engineering', {
        source: MATT_SOURCE,
        sourceMarkerPrefix: `github:${PONYTAIL_REPO}@${ponytail.ref}:skills`,
      }),
      PONYTAIL_REPO,
    ));

    const vercel = checkout(VERCEL_SKILLS_REPO);
    skills.push(...selectSkillsByName(
      ['find-skills'],
      discoverFlatSkills(path.join(vercel.dir, 'skills'), 'discovery', {
        source: MATT_SOURCE,
        sourceMarkerPrefix: `github:${VERCEL_SKILLS_REPO}@${vercel.ref}:skills`,
      }),
      VERCEL_SKILLS_REPO,
    ));

    const matt = checkout(MATT_REPO);
    skills.push(...selectSkillsByName(
      BOOTSTRAP_MATT_GLOBAL_SKILLS,
      discoverSkills(matt.dir, {
        source: MATT_SOURCE,
        sourceMarkerPrefix: `github:${MATT_REPO}@${matt.ref}`,
      }),
      MATT_REPO,
    ));

    const worktrunk = checkout(WORKTRUNK_REPO);
    removeKnownUpstreamSymlink(path.join(worktrunk.dir, 'skills/worktrunk/reference/README.md'), WORKTRUNK_REPO);
    skills.push(...selectSkillsByName(
      ['worktrunk'],
      discoverFlatSkills(path.join(worktrunk.dir, 'skills'), 'engineering', {
        source: MATT_SOURCE,
        sourceMarkerPrefix: `github:${WORKTRUNK_REPO}@${worktrunk.ref}:skills`,
      }),
      WORKTRUNK_REPO,
    ));

    const cursor = checkout(CURSOR_PLUGINS_REPO);
    skills.push(...selectSkillsByName(
      ['thermo-nuclear-code-quality-review'],
      discoverFlatSkills(path.join(cursor.dir, 'cursor-team-kit/skills'), 'evaluation', {
        source: MATT_SOURCE,
        sourceMarkerPrefix: `github:${CURSOR_PLUGINS_REPO}@${cursor.ref}:cursor-team-kit/skills`,
      }),
      CURSOR_PLUGINS_REPO,
    ));

    return { skills: skills.sort((left, right) => left.name.localeCompare(right.name)), sources, cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}

function removeKnownUpstreamSymlink(file, label) {
  if (!fs.existsSync(file)) return;
  const stat = fs.lstatSync(file);
  if (!stat.isSymbolicLink()) throw new Error(`${label} expected known symlink to still be a symlink: ${file}`);
  fs.rmSync(file);
}

function selectSkillsByName(names, skills, label) {
  const byName = new Map(skills.map((skill) => [skill.name, skill]));
  return names.map((name) => {
    const skill = byName.get(name);
    if (!skill) throw new Error(`${label} missing upstream skill: ${name}`);
    return skill;
  });
}

function loadPlannotatorSkills(ref) {
  const checkout = checkoutGitHubRepo(PLANNOTATOR_REPO, ref ?? DEFAULT_MATT_REF);
  try {
    const core = discoverFlatSkills(path.join(checkout.dir, 'apps/skills/core'), 'plannotator-core', {
      source: MATT_SOURCE,
      sourceMarkerPrefix: `github:${PLANNOTATOR_REPO}@${checkout.ref}:apps/skills/core`,
    });
    const extra = discoverFlatSkills(path.join(checkout.dir, 'apps/skills/extra'), 'plannotator-extra', {
      source: MATT_SOURCE,
      sourceMarkerPrefix: `github:${PLANNOTATOR_REPO}@${checkout.ref}:apps/skills/extra`,
    });
    const byName = new Map([...core, ...extra].map((skill) => [skill.name, skill]));
    const skills = BOOTSTRAP_PLANNOTATOR_SKILLS.map((name) => {
      const skill = byName.get(name);
      if (!skill) throw new Error(`Plannotator upstream missing skill: ${name}`);
      return skill;
    });
    return { skills, ref: checkout.ref, cleanup: checkout.cleanup };
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
  return withStatus(`Fetching github:${repo}@${ref ?? DEFAULT_MATT_REF}`, () => {
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
  });
}

function withStatus(label, action) {
  const start = Date.now();
  process.stderr.write(`${label}...`);
  try {
    const result = action();
    process.stderr.write(` done (${formatDuration(Date.now() - start)})\n`);
    return result;
  } catch (error) {
    process.stderr.write(` failed (${formatDuration(Date.now() - start)})\n`);
    throw error;
  }
}

function formatDuration(milliseconds) {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  return `${(milliseconds / 1000).toFixed(1)}s`;
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

function discoverFlatSkills(skillsRoot, category, options = {}) {
  const skills = [];
  for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(skillsRoot, entry.name);
    const skillFile = path.join(dir, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;
    const text = fs.readFileSync(skillFile, 'utf8');
    const frontmatter = parseFrontmatter(text.match(/^---\n([\s\S]*?)\n---/m)?.[1] ?? '');
    const name = frontmatter.name ?? entry.name;
    const description = frontmatter.description ?? '';
    const sourceMarker = options.sourceMarkerPrefix ? `${options.sourceMarkerPrefix}/${entry.name}` : dir;
    skills.push({ name, description, category, dir, source: options.source ?? LOCAL_SOURCE, sourceMarker });
  }
  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

function discoverSkills(packageRoot = root, options = {}) {
  const skillsRoot = path.join(packageRoot, 'skills');
  const skills = [];

  for (const dir of findSkillDirectories(skillsRoot)) {
    const skillFile = path.join(dir, 'SKILL.md');
    const text = fs.readFileSync(skillFile, 'utf8');
    const frontmatter = parseFrontmatter(text.match(/^---\n([\s\S]*?)\n---/m)?.[1] ?? '');
    const name = frontmatter.name ?? path.basename(dir);
    const description = frontmatter.description ?? '';
    const packageFile = path.join(dir, 'package.json');
    const packageName = fs.existsSync(packageFile) ? JSON.parse(fs.readFileSync(packageFile, 'utf8')).name : undefined;
    const relativeDir = path.relative(packageRoot, dir).split(path.sep).join('/');
    const relativeSkillDir = path.relative(skillsRoot, dir).split(path.sep).join('/');
    const category = relativeSkillDir.includes('/') ? relativeSkillDir.split('/')[0] : 'local';
    const sourceMarker = options.sourceMarkerPrefix ? `${options.sourceMarkerPrefix}:${relativeDir}` : `package:@barlevalon/skills:${relativeDir}`;
    skills.push({ name, description, category, dir, packageName, source: options.source ?? LOCAL_SOURCE, sourceMarker });
  }

  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

function findSkillDirectories(skillsRoot) {
  const entries = fs.readdirSync(skillsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const direct = entries
    .map((entry) => path.join(skillsRoot, entry.name))
    .filter((dir) => fs.existsSync(path.join(dir, 'SKILL.md')));
  if (direct.length) return direct;

  const nested = [];
  for (const category of entries) {
    const categoryDir = path.join(skillsRoot, category.name);
    for (const entry of fs.readdirSync(categoryDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = path.join(categoryDir, entry.name);
      if (fs.existsSync(path.join(dir, 'SKILL.md'))) nested.push(dir);
    }
  }
  return nested;
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
  if (names.has('diagnosing-bugs')) examples.push('Use diagnosing-bugs before fixing this bug.');
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

function removeObsoleteGlobalTdd(targetRoot) {
  const target = path.join(targetRoot, 'tdd');
  const result = removeManagedInstall(target, isObsoleteGlobalTddSource);
  if (result.status === 'removed') console.log(`removed obsolete global tdd -> ${displayPath(target)}`);
  else if (result.status === 'unmanaged') console.warn(`kept global tdd at ${displayPath(target)}: not installer-managed`);
  else if (result.status === 'different-source') console.warn(`kept global tdd at ${displayPath(target)}: installer-managed from ${result.source ?? 'an unknown source'}`);
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
