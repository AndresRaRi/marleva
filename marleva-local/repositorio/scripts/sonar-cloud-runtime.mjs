import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  openSync,
  closeSync,
  readFileSync,
  writeFileSync,
  symlinkSync,
  existsSync,
  chmodSync,
  copyFileSync,
} from 'node:fs';
import path from 'node:path';
import { command, save, sourceFiles } from './sonar-runtime.mjs';

export function prepareCloudCopy(root, folder, sha) {
  command('git', ['worktree', 'add', '--detach', folder, sha], { cwd: root });
  const workspace = path.join(folder, 'marleva-local/repositorio');
  chmodSync(workspace, 0o777);
  for (const relative of ['node_modules', 'apps/api/node_modules', 'apps/client/node_modules']) {
    const target = path.join(workspace, relative);
    if (!existsSync(target))
      symlinkSync(path.join(root, 'marleva-local/repositorio', relative), target);
  }
  return workspace;
}
export function createCloudNegative(folder) {
  const file = 'apps/api/src/sonar-negative-fixture.ts';
  writeFileSync(
    path.join(folder, file),
    'export function sonarNegativeFixture(value: string): boolean {\n  return value.length > 0 && value.length > 0;\n}\n',
  );
  command('git', ['add', file], { cwd: folder });
  command(
    'git',
    [
      '-c',
      'user.name=Marleva CI fixture',
      '-c',
      'user.email=ci@example.test',
      'commit',
      '-m',
      'test: introducir defecto Sonar solo en copia de ensayo',
    ],
    { cwd: folder },
  );
  return command('git', ['rev-parse', 'HEAD'], { cwd: folder }).trim();
}
export function scanCloud(manifest, root, folder, sha, context, tokenFile, logFile) {
  const descriptor = openSync(logFile, 'w', 0o600);
  let result;
  try {
    const args = [
      'run',
      '--platform',
      manifest.platform,
      '--memory',
      manifest.scannerMemory,
      '--env-file',
      tokenFile,
      '-e',
      'SCANNER_WORKDIR_PATH=' + folder + '/.scannerwork',
      '-v',
      root + ':' + root + ':ro',
      '-v',
      folder + ':' + folder,
      '-w',
      folder,
      manifest.scanner,
      '-Dsonar.host.url=https://sonarcloud.io',
      '-Dsonar.organization=' + manifest.organization,
      '-Dsonar.projectKey=' + manifest.project,
      '-Dsonar.projectVersion=' + sha,
      '-Dsonar.scm.revision=' + sha,
      '-Dsonar.projectBaseDir=' + folder,
      '-Dsonar.scanner.metadataFilePath=' + folder + '/.scannerwork/report-task.txt',
      '-Dsonar.sources=apps/api/src,apps/client/app,apps/client/src',
      '-Dsonar.exclusions=apps/api/src/generated/**',
      '-Dsonar.typescript.tsconfigPaths=apps/api/tsconfig.json,apps/client/tsconfig.json',
      '-Dsonar.sourceEncoding=UTF-8',
      '-Dsonar.scanner.skipJreProvisioning=true',
      '-Dsonar.qualitygate.wait=true',
      ...(existsSync(path.join(folder, 'coverage/lcov.info'))
        ? ['-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info']
        : []),
      ...context,
    ];
    result = spawnSync('docker', args, {
      stdio: ['ignore', descriptor, descriptor],
      timeout: 600000,
    });
  } finally {
    closeSync(descriptor);
  }
  const log = readFileSync(logFile, 'utf8');
  if (
    result.error ||
    ![0, 2].includes(result.status) ||
    /Failed to (?:parse|analyze|create.*program)|ERROR.*(?:TypeScript|JavaScript)/i.test(log)
  )
    throw new Error('Scanner Cloud falló; revisar log conservado');
  if (result.status !== 0 && !/QUALITY GATE STATUS: FAILED/.test(log))
    throw new Error('El fallo no corresponde a un gate nativo rechazado');
  const task = Object.fromEntries(
    readFileSync(path.join(folder, '.scannerwork/report-task.txt'), 'utf8')
      .trim()
      .split('\n')
      .map((line) => line.split('=')),
  );
  if (!task.ceTaskId) throw new Error('Scanner sin tarea verificable');
  return {
    exitCode: result.status,
    taskId: task.ceTaskId,
    sourceFiles: sourceFiles(folder),
    diagnostics: log
      .split('\n')
      .filter((line) =>
        /WARN|ERROR|files? (?:to be analyzed|analyzed)|Quality profile|QUALITY GATE/.test(line),
      ),
  };
}
export function copyCloudCoverage(from, folder) {
  mkdirSync(path.join(folder, 'coverage'), { recursive: true });
  copyFileSync(path.join(from, 'coverage/lcov.info'), path.join(folder, 'coverage/lcov.info'));
}
export async function completedAnalysis(token, taskId) {
  const response = await fetch(
    'https://sonarcloud.io/api/ce/task?id=' + encodeURIComponent(taskId),
    {
      headers: { Authorization: 'Bearer ' + token },
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!response.ok) throw new Error('No se pudo comprobar tarea Cloud');
  const { task } = await response.json();
  if (task?.status !== 'SUCCESS' || !task.analysisId || (task.warnings?.length ?? 0) > 0)
    throw new Error('Tarea Cloud incompleta o con advertencias');
  return task;
}
export async function cloudProfile(token, manifest) {
  async function read(route, parameters) {
    const response = await fetch(
      'https://sonarcloud.io/api/' + route + '?' + new URLSearchParams(parameters),
      {
        headers: { Authorization: 'Bearer ' + token },
        signal: AbortSignal.timeout(30000),
      },
    );
    if (!response.ok) throw new Error('No se pudo comprobar perfil Cloud');
    return response.json();
  }
  const result = await read('qualityprofiles/search', {
    project: manifest.project,
    organization: manifest.organization,
    language: 'ts',
  });
  if (result.profiles?.length !== 1 || result.profiles[0].key !== manifest.profile.key)
    throw new Error('Perfil TypeScript distinto del comprobado');
  const active = await read('rules/search', {
    qprofile: manifest.profile.key,
    activation: 'true',
    rule_key: manifest.negativeRule,
  });
  if (active.total !== 1 || active.rules?.[0]?.key !== manifest.negativeRule)
    throw new Error('Regla negativa no activa');
  return { profile: result.profiles[0], rule: active.rules[0] };
}
export async function cloudInventory(mcp, project, pullRequest, task, folder, output) {
  const context = pullRequest ? { pullRequest } : { branch: 'main' };
  const issues = await mcp.pages(
    'search_sonar_issues_in_projects',
    { projectKeys: [project], ...context, issueStatuses: ['OPEN', 'CONFIRMED'] },
    'issues',
  );
  const hotspots = await mcp.pages(
    'search_security_hotspots',
    { projectKey: project, ...context },
    'hotspots',
  );
  const gate = await mcp.call('get_project_quality_gate_status', { analysisId: task.analysisId });
  const measures = await mcp.call('get_component_measures', {
    projectKey: project,
    ...context,
    metricKeys: ['files', 'ncloc', 'lines', 'violations', 'coverage'],
  });
  const inventory = { task, issues, hotspots, gate, measures, folder };
  mkdirSync(output, { recursive: true });
  save(path.join(output, 'inventory.json'), inventory);
  return inventory;
}
export async function verifyCloudRevision(token, project, pullRequest, taskId) {
  const parameters = new URLSearchParams({
    component: project,
    ...(pullRequest ? { pullRequest } : { branch: 'main' }),
  });
  const response = await fetch('https://sonarcloud.io/api/ce/component?' + parameters, {
    headers: { Authorization: 'Bearer ' + token },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error('No se pudo comprobar revisión Cloud');
  const result = await response.json();
  if (result.current?.id !== taskId || result.current.status !== 'SUCCESS' || result.queue?.length)
    throw new Error('Otro análisis modificó o está modificando el contexto Cloud');
}
