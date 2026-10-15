import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { cloudMcp } from './sonar-cloud-mcp.mjs';
import { encryptCloudEvidence } from './sonar-cloud-evidence.mjs';
import { command, save } from './sonar-runtime.mjs';
import { fingerprint, assertNoNew, introduced } from './sonar-policy.mjs';
import {
  prepareCloudCopy,
  createCloudNegative,
  scanCloud,
  completedAnalysis,
  cloudInventory,
  cloudProfile,
  copyCloudCoverage,
  verifyCloudRevision,
} from './sonar-cloud-runtime.mjs';

const manifest = JSON.parse(readFileSync('infra/ci/sonar-cloud.json', 'utf8'));
const root = command('git', ['rev-parse', '--show-toplevel']).trim();
const token = process.env.SONAR_TOKEN;
if (!token || process.platform !== 'linux' || process.arch !== 'x64')
  throw new Error('Sonar Cloud exige credencial protegida y runner Linux x64 homologado');
const head = command('git', [
  'rev-parse',
  '--verify',
  process.env.SONAR_HEAD_SHA + '^{commit}',
]).trim();
const base = command('git', [
  'rev-parse',
  '--verify',
  process.env.SONAR_BASE_SHA + '^{commit}',
]).trim();
const output = path.resolve(
  'artifacts/ci/sonar-cloud',
  process.env.GITHUB_RUN_ID || String(Date.now()),
);
mkdirSync(output, { recursive: true });
const tokenFile = path.join(output, '.scanner.env');
writeFileSync(tokenFile, 'SONAR_TOKEN=' + token + '\n', { mode: 0o600 });
const summary = {
  base,
  head,
  project: manifest.project,
  status: 'running',
  startedAt: new Date().toISOString(),
  analyses: {},
};
let mcp;
const pr = process.env.SONAR_PULL_REQUEST || undefined;
const prContext = pr
  ? [
      '-Dsonar.pullrequest.key=' + pr,
      '-Dsonar.pullrequest.branch=' + process.env.SONAR_HEAD_BRANCH,
      '-Dsonar.pullrequest.base=main',
    ]
  : ['-Dsonar.branch.name=main'];

function fingerprints(inventory, folder) {
  return [...inventory.issues, ...inventory.hotspots].map((issue) =>
    fingerprint(issue, folder, manifest.project),
  );
}
async function analyze(label, sha, context, pullRequest, negative = false) {
  save(path.join(output, label + '-profile.json'), await cloudProfile(token, manifest));
  const folder = prepareCloudCopy(root, path.join(output, label), sha);
  if (label !== 'base') copyCloudCoverage(process.cwd(), folder);
  const revision = negative ? createCloudNegative(folder) : sha;
  const scan = scanCloud(
    manifest,
    root,
    folder,
    revision,
    context,
    tokenFile,
    path.join(output, label + '.log'),
  );
  const task = await completedAnalysis(
    token,
    scan.taskId,
    { project: manifest.project, pullRequest },
    (metadata) => save(path.join(output, label + '-task.json'), metadata),
  );
  await verifyCloudRevision(token, manifest.project, pullRequest, task.id);
  const inventory = await cloudInventory(
    mcp,
    manifest.project,
    pullRequest,
    task,
    folder,
    path.join(output, label + '-result'),
  );
  const measuredFiles = inventory.measures.measures.find(
    (measure) => measure.metric === 'files',
  )?.value;
  await verifyCloudRevision(token, manifest.project, pullRequest, task.id);
  if (
    (measuredFiles === undefined && !pullRequest) ||
    (measuredFiles !== undefined && Number(measuredFiles) !== scan.sourceFiles.length)
  )
    throw new Error('Inventario de archivos no coincide con análisis Cloud');
  summary.analyses[label] = {
    revision,
    sourceSha: sha,
    ...scan,
    analysisId: task.analysisId,
    gate: inventory.gate.status,
    nativeConditions: inventory.gate.conditions,
    warnings: task.warningCount,
    analysisWarnings: task.analysisWarnings,
    integrationWarnings: task.integrationWarnings,
    issues: inventory.issues.length,
    hotspots: inventory.hotspots.length,
  };
  save(path.join(output, 'summary.json'), summary);
  return { inventory, keys: fingerprints(inventory, folder) };
}
async function proveNegative(baseline) {
  const negative = await analyze('negative', head, prContext, pr, true);
  const detected = negative.inventory.issues.some(
    (issue) =>
      issue.rule === manifest.negativeRule &&
      issue.component.endsWith(':apps/api/src/sonar-negative-fixture.ts'),
  );
  if (
    !detected ||
    negative.inventory.gate.status !== 'ERROR' ||
    !introduced(baseline.keys, negative.keys).length ||
    summary.analyses.negative.exitCode === 0
  )
    throw new Error('Negativa no demuestra regla, gate y bloqueo esperados');
  let blocked = false;
  try {
    assertNoNew(baseline.keys, negative.keys);
  } catch {
    blocked = true;
  }
  if (!blocked) throw new Error('El comparador no bloqueó el defecto real');
  summary.negativeBlocked = true;
  summary.negativeRule = manifest.negativeRule;
}
async function restoreCorrected(baseline) {
  const corrected = await analyze('corrected', head, prContext, pr);
  assertNoNew(baseline.keys, corrected.keys);
  if (corrected.inventory.gate.status !== 'OK') throw new Error('Corrección sin gate nativo verde');
}
try {
  mcp = await cloudMcp(token, manifest.organization);
  summary.mcp = mcp.server;
  const baseline = await analyze('base', base, ['-Dsonar.branch.name=main']);
  const positive = await analyze('head', head, prContext, pr);
  assertNoNew(baseline.keys, positive.keys);
  if (positive.inventory.gate.status !== 'OK') throw new Error('Gate nativo del cambio rechazado');
  save(
    path.join(output, 'negative-rule.json'),
    await mcp.call('show_rule', { key: manifest.negativeRule }),
  );
  let negativeError;
  let correctionError;
  try {
    await proveNegative(baseline);
  } catch (error) {
    negativeError = error;
  } finally {
    try {
      await restoreCorrected(baseline);
    } catch (error) {
      correctionError = error;
    }
  }
  if (negativeError && correctionError)
    throw new AggregateError(
      [negativeError, correctionError],
      'Fallaron negativa y restauración: ' + negativeError.message + '; ' + correctionError.message,
      { cause: negativeError },
    );
  if (correctionError) throw correctionError;
  if (negativeError) throw negativeError;
  summary.status = 'passed';
} catch (error) {
  summary.status = 'failed';
  summary.error = error.message;
  process.exitCode = 1;
} finally {
  summary.finishedAt = new Date().toISOString();
  save(path.join(output, 'summary.json'), summary);
  encryptCloudEvidence(output, token);
  console.log(JSON.stringify(summary, null, 2));
}
