#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cwd = process.cwd();
const MARKER = 'skills';

const HARNESS_OPTIONS = [
  { id: 'pi', label: 'Pi' },
  { id: 'opencode', label: 'OpenCode' },
  { id: 'vscode', label: 'VS Code: Copilot + Claude + Codex extensions' },
  { id: 'claude-code', label: 'Claude Code' },
];

const HELP = `skills install

Install barlevalon workflow skills for supported agent harnesses.

Usage:
  npx @barlevalon/skills@latest install
  npx @barlevalon/skills@latest install --agent vscode --skill tdd --skill diagnose
  npx @barlevalon/skills@latest install --all --yes

Options:
  -a, --agent <name>    Harness to install for: pi, opencode, vscode, claude-code, all
  -s, --skill <name>    Skill to install. Use '*' or all for every skill
  -g, --global          Install to user scope where supported
  -p, --project         Install to project scope (default)
      --all             Select all harnesses and all skills
  -y, --yes             Do not prompt; accept defaults
      --force           Replace existing unmanaged skill directories
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

  const skills = discoverSkills();

  if (args.list) {
    for (const skill of skills) console.log(`${skill.name}\t${skill.category}\t${skill.description}`);
    return;
  }

  if (command !== 'install') throw new Error(`unknown command: ${command}`);

  const rl = readline.createInterface({ input, output });
  try {
    const yes = Boolean(args.yes);
    const scope = args.global ? 'global' : 'project';
    const harnessInput = args.all
      ? ['all']
      : args.agent?.length
        ? args.agent
        : yes
          ? ['vscode']
          : await chooseMany(rl, 'Install for which harnesses?', HARNESS_OPTIONS, ['vscode']);
    const skillInput = args.all
      ? ['all']
      : args.skill?.length
        ? args.skill
        : yes
          ? ['all']
          : await chooseMany(rl, 'Install which skills?', skills.map((skill) => ({ id: skill.name, label: `${skill.name} — ${skill.description}` })), ['all']);
    const chosenHarnesses = normalizeHarnesses(harnessInput);
    const chosenSkills = normalizeSkills(skillInput, skills);

    const selectedSkills = skills.filter((skill) => chosenSkills.includes(skill.name));
    if (selectedSkills.length === 0) throw new Error('no skills selected');
    if (chosenHarnesses.length === 0) throw new Error('no harnesses selected');

    const plan = buildPlan(chosenHarnesses, selectedSkills, scope);
    printPlan(plan, selectedSkills);

    let confirmed = yes;
    if (!yes) {
      confirmed = await askYesNo(rl, 'Proceed?', true);
      if (!confirmed) return;
    }

    for (const harness of chosenHarnesses) {
      if (harness === 'pi') installPi(selectedSkills, scope);
      else if (harness === 'opencode') installSkillCopies(selectedSkills, scope === 'global' ? path.join(os.homedir(), '.config/opencode/skills') : path.join(cwd, '.opencode/skills'), args.force);
      else if (harness === 'claude-code') installSkillCopies(selectedSkills, scope === 'global' ? path.join(os.homedir(), '.claude/skills') : path.join(cwd, '.claude/skills'), args.force);
      else if (harness === 'vscode') installVSCode(selectedSkills, args.force, confirmed);
      else throw new Error(`unsupported harness: ${harness}`);
    }

    console.log('\nInstalled. Ask your agent for a workflow, for example:');
    console.log('  Use tdd to implement this change.');
    console.log('  Use diagnose before fixing this bug.');
  } finally {
    rl.close();
  }
}

function parseArgs(argv) {
  const args = { _: [], agent: [], skill: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--list') args.list = true;
    else if (arg === '--all') args.all = true;
    else if (arg === '--yes' || arg === '-y') args.yes = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--global' || arg === '-g') args.global = true;
    else if (arg === '--project' || arg === '-p') args.project = true;
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

function discoverSkills() {
  const skillsRoot = path.join(root, 'skills');
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
      skills.push({ name, description, category: category.name, dir, packageName });
    }
  }

  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

async function chooseMany(rl, title, options, defaults = []) {
  console.log(`\n${title}`);
  options.forEach((option, index) => console.log(`  ${index + 1}. ${option.label}`));
  const suffix = defaults.length ? ` [${defaults.join(', ')}]` : '';
  const answer = (await rl.question(`Choose numbers/names, comma-separated, or all${suffix}: `)).trim();
  return answer ? splitArg(answer) : defaults;
}

async function askYesNo(rl, question, defaultValue) {
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

function buildPlan(harnesses, skills, scope) {
  const plan = [];
  for (const harness of harnesses) {
    if (harness === 'pi') plan.push(`Pi: install ${skills.length === discoverSkills().length ? '@barlevalon/skills' : `${skills.length} single-skill package(s)`} to ${scope} settings`);
    if (harness === 'opencode') plan.push(`OpenCode: copy ${skills.length} skill folder(s) to ${scope === 'global' ? '~/.config/opencode/skills' : '.opencode/skills'}`);
    if (harness === 'claude-code') plan.push(`Claude Code: copy ${skills.length} skill folder(s) to ${scope === 'global' ? '~/.claude/skills' : '.claude/skills'}`);
    if (harness === 'vscode') plan.push('VS Code: copy skills to .agents/skills and .claude/skills, then update AGENTS.md and .github/copilot-instructions.md');
  }
  return plan;
}

function printPlan(plan, skills) {
  console.log('\nPlan:');
  for (const line of plan) console.log(`- ${line}`);
  console.log(`\nSkills: ${skills.map((skill) => skill.name).join(', ')}`);
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

function installVSCode(skills, replaceAnySkillDir, confirmed) {
  installSkillCopies(skills, path.join(cwd, '.agents/skills'), replaceAnySkillDir);
  installSkillCopies(skills, path.join(cwd, '.claude/skills'), replaceAnySkillDir);
  upsertManagedBlock(path.join(cwd, 'AGENTS.md'), agentsBlock(skills), confirmed);
  upsertManagedBlock(path.join(cwd, '.github/copilot-instructions.md'), copilotBlock(skills), confirmed);
}

function installSkillCopies(skills, targetRoot, replaceAnySkillDir) {
  fs.mkdirSync(targetRoot, { recursive: true });
  for (const skill of skills) {
    const target = path.join(targetRoot, skill.name);
    copyDirectory(skill.dir, target, replaceAnySkillDir);
    console.log(`copied ${skill.name} -> ${path.relative(cwd, target) || target}`);
  }
}

function copyDirectory(source, target, replaceAnySkillDir) {
  if (fs.existsSync(target)) {
    if (!replaceAnySkillDir && !isManagedInstall(target)) {
      throw new Error(`${target} already exists and was not created by this installer; rerun with --force to replace it`);
    }
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.cpSync(source, target, { recursive: true, dereference: true, filter: (file) => !file.includes(`${path.sep}node_modules${path.sep}`) });
  fs.writeFileSync(path.join(target, '.barlevalon-installed'), `source=${source}\ninstalledAt=${new Date().toISOString()}\n`);
}

function isManagedInstall(target) {
  return fs.existsSync(path.join(target, '.barlevalon-installed'));
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
