import { checkSecretControls } from './check-secret-controls.mjs';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { ensureCiTool } from './ci-tool.mjs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { securityPatchPackages } from './security-patch-packages.mjs';
import { verifyBackports } from './security-backport-evidence.mjs';
import { classifyFindings } from './security-classify-findings.mjs';
import { addSecurityPedigree } from './security-sbom-pedigree.mjs';
import { securityLockfile } from './security-lockfile.mjs';
const root = path.resolve('../..'),
  folder = path.resolve('artifacts/security');
mkdirSync(folder, { recursive: true, mode: 0o700 });
const outcomes = [];
function run(name, binary, args, options = {}) {
  const result = spawnSync(binary, args, { encoding: 'utf8', env: process.env, ...options });
  const status = result.status ?? 1;
  outcomes.push({ name, status });
  if (result.error) throw result.error;
  if (result.stderr)
    console.log(`${name}: ${status === 0 ? 'correcto' : 'falló'}; ${result.stderr.slice(0, 2000)}`);
  return result;
}
run('Compatibilidad de correcciones', process.execPath, ['scripts/security-compat.mjs']);
const sbom = run('SBOM', 'pnpm', [
  'sbom',
  '--sbom-format',
  'cyclonedx',
  '--sbom-spec-version',
  '1.6',
  '--lockfile-only',
  '--out',
  folder + '/sbom.cdx.json',
]);
if (sbom.status === 0) {
  const data = JSON.parse(readFileSync(folder + '/sbom.cdx.json', 'utf8'));
  if (data.bomFormat !== 'CycloneDX' || !data.components?.length)
    throw new Error('SBOM vacío o inválido');
}
const licenses = run('Licencias', 'pnpm', ['licenses', 'list', '--json']);
if (licenses.status === 0) {
  const data = JSON.parse(licenses.stdout);
  const known = new Set([
    'MIT',
    'Apache-2.0',
    'LGPL-3.0-only',
    'BSD-3-Clause',
    'Python-2.0',
    'CC-BY-4.0',
    'ISC',
    'BSD-2-Clause',
    'MPL-2.0',
    'BlueOak-1.0.0',
    '0BSD',
    '(MIT OR Apache-2.0)',
    '(MIT OR CC0-1.0)',
    '(MIT AND CC-BY-3.0)',
    'CC0-1.0',
    'Unlicense',
  ]);
  // The legacy metadata says BSD; its shipped text is the three-clause license.
  const reviewedBsd = (data.BSD ?? []).every(
    (item) =>
      item.name === 'parse-cache-control' &&
      item.versions.join() === '1.0.1' &&
      item.paths.length > 0 &&
      item.paths.every(
        (folder) =>
          createHash('sha256')
            .update(readFileSync(path.join(folder, 'LICENSE')))
            .digest('hex') === '111f42b37daecc6c387d037ef25955bd269e7f9a46a736d5257a23560534763f',
      ),
  );
  // M3 pins this reviewed prebuilt library; other LGPL-or-later packages remain blocked.
  const reviewedVips = (data['LGPL-3.0-or-later'] ?? []).every(
    (item) =>
      /^@img\/sharp-libvips-(darwin|linux|linuxmusl|win32)-[a-z0-9]+$/u.test(item.name) &&
      item.versions.join() === '1.3.4',
  );
  const reviewedMit0 = (data['MIT-0'] ?? []).every(
    (item) =>
      ({
        '@csstools/color-helpers': '6.1.2',
        '@csstools/css-syntax-patches-for-csstree': '1.1.15',
      })[item.name] === item.versions.join() &&
      item.paths.length > 0 &&
      item.paths.every(
        (folder) =>
          createHash('sha256')
            .update(readFileSync(path.join(folder, 'LICENSE.md')))
            .digest('hex') === '947e32047a166cd05f04e45938d172b412c07cbee0b9735afd14bae30e02c2f6',
      ),
  );
  const pending = Object.keys(data).filter(
    (license) =>
      !known.has(license) &&
      !(license === 'BSD' && reviewedBsd) &&
      !(license === 'LGPL-3.0-or-later' && reviewedVips) &&
      !(license === 'MIT-0' && reviewedMit0),
  );
  writeFileSync(folder + '/licenses.json', JSON.stringify(data, null, 2) + '\n');
  if (pending.length)
    outcomes.push({ name: 'Licencias por revisar: ' + pending.join(', '), status: 1 });
}
const osv = await ensureCiTool('osv');
mkdirSync(folder + '/python', { recursive: true });
writeFileSync(folder + '/python/requirements.txt', readFileSync('infra/ci/requirements.lock'));
const osvResult = run('OSV original', osv, [
  'scan',
  'source',
  '--lockfile',
  path.resolve('pnpm-lock.yaml'),
  '--lockfile',
  folder + '/python/requirements.txt',
  '--format',
  'json',
  '--output-file',
  folder + '/osv.json',
]);
const verified = verifyBackports(
  JSON.parse(readFileSync('infra/ci/security-backports.json', 'utf8')),
  parse(readFileSync('pnpm-workspace.yaml', 'utf8')),
  securityLockfile(readFileSync('pnpm-lock.yaml', 'utf8')),
  securityPatchPackages(),
);
const findings = classifyFindings(
  JSON.parse(readFileSync(folder + '/osv.json', 'utf8')),
  verified,
  osvResult.status,
);
writeFileSync(
  folder + '/backports.json',
  JSON.stringify({ verified, ...findings }, null, 2) + '\n',
);
writeFileSync(
  'tests/results/security-findings.json',
  JSON.stringify(
    {
      date: new Date().toISOString(),
      scope: 'Complete npm/Python lockfiles; raw OSV retained; local patches verified in this scan',
      ...findings,
    },
    null,
    2,
  ) + '\n',
);
if (sbom.status === 0)
  writeFileSync(
    folder + '/sbom-verified.cdx.json',
    JSON.stringify(
      addSecurityPedigree(JSON.parse(readFileSync(folder + '/sbom.cdx.json', 'utf8')), verified),
      null,
      2,
    ) + '\n',
  );
outcomes.push({
  name: 'Vulnerabilidades sin corrección comprobada',
  status: findings.pending.length ? 1 : 0,
});
if (findings.pending.length === 0 && osvResult.status === 1)
  outcomes.find((item) => item.name === 'OSV original').blocking = false;
const gitleaks = await ensureCiTool('gitleaks');
checkSecretControls(gitleaks);
run('Gitleaks', gitleaks, [
  'git',
  root,
  '--log-opts=HEAD',
  '--redact',
  '--config',
  path.resolve('infra/ci/gitleaks.toml'),
  '--no-banner',
  '--report-format',
  'json',
  '--report-path',
  folder + '/gitleaks.json',
]);
writeFileSync(
  'tests/results/security-scan.json',
  JSON.stringify(
    {
      date: new Date().toISOString(),
      outcomes,
      limits: [
        'Sin certificación legal; licencias conocidas conservan obligaciones',
        'CLI de GitLeaks analiza historial; informes redactados',
        'OSV examina lockfiles npm/Python completos, incluido desarrollo',
        'OSV original conserva sus avisos; solo parches con hashes y regresiones comprobados se clasifican como corregidos localmente',
      ],
    },
    null,
    2,
  ) + '\n',
);
for (const item of outcomes)
  console.log(
    `${item.name}: ${item.status === 0 ? 'PASS' : item.blocking === false ? 'AVISOS CORREGIDOS LOCALMENTE; ver evidencia' : 'FAIL'}`,
  );
if (outcomes.some((item) => item.status !== 0 && item.blocking !== false))
  throw new Error('Seguridad requiere correcciones; revisar informes sin desactivar controles');
