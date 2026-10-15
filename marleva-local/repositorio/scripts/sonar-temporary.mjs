import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { isIPv4 } from 'node:net';
import { sonarApi, waitSonar, allPages } from './sonar-api.mjs';
import { fingerprint, introduced, assertNoNew } from './sonar-policy.mjs';
import { command, snapshot, scanner, save, sourceFiles } from './sonar-runtime.mjs';
if (process.platform !== 'linux' || process.arch !== 'x64')
  throw new Error('Ensayo Sonar homologado solo para Linux x64; no emulación ARM64');
const manifest = JSON.parse(readFileSync('infra/ci/sonar.json', 'utf8'));
const name = 'marleva-sonar-' + randomBytes(6).toString('hex');
const folder = path.resolve('artifacts/ci/sonar', name);
mkdirSync(folder, { recursive: true, mode: 0o700 });
const startedAt = Date.now();
const password = 'Marleva-' + randomBytes(24).toString('hex') + '!9a';
let credential = 'Basic ' + Buffer.from('admin:admin').toString('base64');
let url;
let api;
const summary = { date: new Date().toISOString(), manifest, snapshots: {}, status: 'failed' };
let started = false;
async function analyze(label, tokenFile) {
  const source = path.join(folder, label);
  const revision = summary.revisions[label];
  const project = name + '-' + label;
  await api('/api/projects/create', { project, name: project }, 'POST');
  const taskId = scanner(
    manifest,
    source,
    project,
    revision,
    tokenFile,
    name,
    folder + '/' + label + '.log',
  );
  summary.snapshots[label] = { revision, taskId, fixture: label === 'negative', status: 'pending' };
  const task = await waitSonar(
    () => api('/api/ce/task', { id: taskId }),
    (r) => {
      if (r.task?.status === 'FAILED' || r.task?.status === 'CANCELED')
        throw new Error('Análisis Sonar falló');
      return r.task?.status === 'SUCCESS';
    },
  );
  summary.snapshots[label].status = 'collecting';
  summary.snapshots[label].analysisId = task.task.analysisId;
  const analysis = await api('/api/ce/task', { id: taskId, additionalFields: 'warnings' });
  summary.snapshots[label].warnings = analysis.task?.warnings ?? null;
  if (!Array.isArray(analysis.task?.warnings) || analysis.task.warnings.length)
    throw new Error('Análisis Sonar con advertencias o diagnóstico incompleto');
  const issues = await allPages(api, '/api/issues/search', { components: project }, 'issues');
  const hotspots = await allPages(api, '/api/hotspots/search', { project }, 'hotspots');
  const files = await allPages(
    api,
    '/api/components/tree',
    { component: project, qualifiers: 'FIL' },
    'components',
  );
  if (label === 'negative')
    summary.negativeFixtureDetected = issues.some(
      (issue) =>
        issue.component?.endsWith(':apps/api/src/sonar-negative-fixture.ts') &&
        issue.rule?.endsWith(':S1186'),
    );
  const expectedFiles = sourceFiles(source);
  const actualFiles = files.map((file) => file.path).sort();
  summary.snapshots[label].expectedFiles = expectedFiles.length;
  summary.snapshots[label].actualFiles = files.length;
  if (!expectedFiles.length || JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles))
    throw new Error('Inventario de archivos analizados incompleto');
  const gate = await api('/api/qualitygates/project_status', { projectKey: project });
  save(folder + '/' + label + '-inventory.json', { revision, task, issues, hotspots, files, gate });
  summary.snapshots[label] = {
    revision,
    fixture: label === 'negative',
    status: 'analyzed',
    analysisId: task.task.analysisId,
    issues: issues.length,
    hotspots: hotspots.length,
    files: files.length,
    nativeGate: gate.projectStatus?.status,
  };
  return [
    ...issues.map((i) => fingerprint(i, source, project)),
    ...hotspots.map((i) => 'hotspot:' + fingerprint(i, source, project)),
  ];
}
try {
  summary.revisions = {};
  for (const [label, sha] of Object.entries({
    base: process.env.SONAR_BASE_SHA || manifest.base,
    head: process.env.SONAR_HEAD_SHA || 'HEAD',
  }))
    summary.revisions[label] = snapshot(sha, path.join(folder, label));
  command('docker', ['pull', '--platform', manifest.platform, manifest.server]);
  command('docker', ['pull', '--platform', manifest.platform, manifest.scanner]);
  command('docker', [
    'network',
    'create',
    '--internal',
    '--label',
    'marleva.sonar=temporary',
    name,
  ]);
  command('docker', [
    'run',
    '-d',
    '--platform',
    manifest.platform,
    '--name',
    name,
    '--network',
    name,
    '--label',
    'marleva.sonar=temporary',
    '--memory',
    manifest.serverMemory,
    '-e',
    'SONAR_TELEMETRY_ENABLE=false',
    '--ulimit',
    'nofile=131072:131072',
    '--ulimit',
    'nproc=8192:8192',
    manifest.server,
  ]);
  started = true;
  const networks = JSON.parse(
    command('docker', ['inspect', '--format', '{{json .NetworkSettings.Networks}}', name]),
  );
  const address = networks[name]?.IPAddress;
  if (!isIPv4(address)) throw new Error('Sonar no tiene dirección IPv4 en su red propia');
  url = 'http://' + address + ':9000';
  api = sonarApi(url, () => credential);
  await waitSonar(
    async () => {
      try {
        const state = await api('/api/system/status');
        summary.lastStatus = state.status;
        if (state.status === 'DB_MIGRATION_NEEDED')
          throw new Error('Sonar requiere migración de su base temporal: ' + state.status);
        return state;
      } catch (error) {
        if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('HTTP 503')) return {};
        throw error;
      }
    },
    (r) => r.status === 'UP',
  );
  summary.serverVersion = await (
    await fetch(url + '/api/server/version', { signal: AbortSignal.timeout(30000) })
  ).text();
  await api(
    '/api/users/change_password',
    { login: 'admin', previousPassword: 'admin', password },
    'POST',
  );
  credential = 'Basic ' + Buffer.from('admin:' + password).toString('base64');
  const { token } = await api('/api/user_tokens/generate', { name }, 'POST');
  if (typeof token !== 'string' || token.length < 20) throw new Error('Sonar no generó token');
  credential = 'Bearer ' + token;
  const tokenFile = path.join(folder, '.env.scanner');
  writeFileSync(tokenFile, 'SONAR_TOKEN=' + token + '\nSONAR_HOST_URL=http://' + name + ':9000\n', {
    mode: 0o600,
  });
  const base = await analyze('base', tokenFile);
  const head = await analyze('head', tokenFile);
  summary.introduced = introduced(base, head);
  assertNoNew(base, head);
  const negativeFolder = path.join(folder, 'negative');
  summary.revisions.negative = snapshot(summary.revisions.head, negativeFolder);
  writeFileSync(
    path.join(negativeFolder, 'apps/api/src/sonar-negative-fixture.ts'),
    'export function sonarNegativeFixture(): void {}\n',
  );
  const negative = await analyze('negative', tokenFile);
  if (!summary.negativeFixtureDetected) throw new Error('Sonar no detectó fixture negativa S1186');
  try {
    assertNoNew(head, negative);
  } catch (error) {
    if (error.message !== 'Sonar: incidencias nuevas bloqueantes') throw error;
    summary.negativeEndToEnd = true;
  }
  if (!summary.negativeEndToEnd) throw new Error('Sonar no bloqueó fixture negativa');
  summary.status = 'success';
} catch (error) {
  summary.error = error.message;
  throw error;
} finally {
  try {
    if (started) {
      try {
        const log = command('docker', ['logs', name], { maxBuffer: 16 * 1024 * 1024 });
        writeFileSync(folder + '/server.log', log, { mode: 0o600 });
        summary.serverDiagnostics = log
          .split('\n')
          .filter((line) =>
            /ERROR|Exception|Caused by|SonarQube|operational|Process|migration|Database|stopped/.test(
              line,
            ),
          )
          .slice(-20)
          .map((line) => line.replace(/[A-Za-z0-9_-]{20,}/g, '[redactado]'));
        const state = JSON.parse(
          command('docker', ['inspect', '--format', '{{json .State}}', name]),
        );
        summary.serverState = {
          status: state.Status,
          exitCode: state.ExitCode,
          oomKilled: state.OOMKilled,
        };
        summary.resources = command('docker', [
          'stats',
          '--no-stream',
          '--format',
          '{{.MemUsage}}',
          name,
        ]).trim();
      } finally {
        command('docker', ['stop', name]);
      }
    }
  } finally {
    summary.elapsedMs = Date.now() - startedAt;
    save(folder + '/summary.json', summary);
    console.log(
      'Sonar temporal:',
      summary.status,
      '; resumen privado en ' + path.relative(process.cwd(), folder + '/summary.json'),
    );
  }
}
