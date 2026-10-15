import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  chmodSync,
  openSync,
  closeSync,
  readdirSync,
} from 'node:fs';
import path from 'node:path';
export function command(binary, args, options = {}) {
  const result = spawnSync(binary, args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 600000,
    ...options,
  });
  if (result.error || result.status !== 0) throw new Error(`Falló ${binary} ${args[0]}`);
  return result.stdout;
}
export function snapshot(sha, folder) {
  const resolved = command('git', ['rev-parse', '--verify', sha + '^{commit}']).trim();
  mkdirSync(folder, { mode: 0o777 });
  chmodSync(folder, 0o777);
  const archive = command(
    'git',
    [
      'archive',
      resolved + ':marleva-local/repositorio',
      'apps/api/src',
      'apps/api/tsconfig.json',
      'apps/client/app',
      'apps/client/src',
      'apps/client/tsconfig.json',
      'packages/contracts/generated.ts',
    ],
    { encoding: 'buffer', cwd: command('git', ['rev-parse', '--show-toplevel']).trim() },
  );
  command('tar', ['-xf', '-', '-C', folder], { input: archive });
  return resolved;
}
export function scanner(manifest, folder, project, sha, tokenFile, server, output) {
  const log = openSync(output, 'w', 0o600);
  try {
    command(
      'docker',
      [
        'run',
        '--name',
        project + '-scanner',
        '--platform',
        manifest.platform,
        '--network',
        server,
        '--memory',
        manifest.scannerMemory,
        '--env-file',
        tokenFile,
        '-v',
        folder + ':/usr/src',
        '-v',
        path.resolve('node_modules') + ':/usr/src/node_modules:ro',
        '-v',
        path.resolve('apps/api/node_modules') + ':/usr/src/apps/api/node_modules:ro',
        '-v',
        path.resolve('apps/client/node_modules') + ':/usr/src/apps/client/node_modules:ro',
        manifest.scanner,
        '-Dsonar.projectKey=' + project,
        '-Dsonar.projectVersion=' + sha,
        '-Dsonar.sources=apps/api/src,apps/client/app,apps/client/src',
        '-Dsonar.exclusions=apps/api/src/generated/**',
        '-Dsonar.typescript.tsconfigPaths=apps/api/tsconfig.json,apps/client/tsconfig.json',
        '-Dsonar.sourceEncoding=UTF-8',
        '-Dsonar.scm.disabled=true',
      ],
      { stdio: ['ignore', log, log] },
    );
  } finally {
    closeSync(log);
    command('docker', ['stop', project + '-scanner']);
  }
  const analysisLog = readFileSync(output, 'utf8');
  if (
    /Failed to (?:parse|analyze|create.*program)|ERROR.*(?:TypeScript|JavaScript)/i.test(
      analysisLog,
    )
  )
    throw new Error('Scanner omitió análisis por error de lenguaje');
  const text = readFileSync(folder + '/.scannerwork/report-task.txt', 'utf8');
  const task = Object.fromEntries(
    text
      .trim()
      .split('\n')
      .map((line) => line.split('=')),
  );
  if (!task.ceTaskId) throw new Error('Scanner no entregó tarea verificable');
  return task.ceTaskId;
}
export function save(file, value) {
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
}

export function sourceFiles(folder) {
  const result = [];
  function visit(relative) {
    for (const entry of readdirSync(path.join(folder, relative), { withFileTypes: true })) {
      const file = relative + '/' + entry.name;
      if (file === 'apps/api/src/generated') continue;
      if (entry.isDirectory()) visit(file);
      else if (/\.tsx?$/.test(file) && !file.endsWith('.d.ts')) result.push(file);
    }
  }
  for (const area of ['apps/api/src', 'apps/client/app', 'apps/client/src']) visit(area);
  return result.sort();
}
