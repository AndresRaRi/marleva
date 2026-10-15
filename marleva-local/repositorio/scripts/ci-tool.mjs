import { readFileSync, existsSync, mkdirSync, writeFileSync, chmodSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(root, 'infra/ci/tools.json'), 'utf8'));
const hash = (value) => createHash('sha256').update(value).digest('hex');
export async function ensureCiTool(name) {
  const tool = manifest.tools[name],
    platform = `${process.platform}-${process.arch}`;
  if (!tool?.assets[platform])
    throw new Error(`Herramienta/plataforma no homologada: ${name}/${platform}`);
  const asset = tool.assets[platform],
    folder = path.join(root, 'infra/local/tools/ci', platform),
    binary = path.join(folder, tool.executable),
    recordFile = binary + '.integrity.json';
  if (existsSync(binary) && existsSync(recordFile)) {
    const record = JSON.parse(readFileSync(recordFile, 'utf8'));
    if (record.archive === asset.sha256 && record.binary === hash(readFileSync(binary)))
      return binary;
  }
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  const response = await fetch(asset.url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`No se pudo descargar ${name}: HTTP${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (hash(data) !== asset.sha256) throw new Error(`Hash incorrecto: ${name}`);
  const downloaded = path.join(folder, `${name}.download`);
  writeFileSync(downloaded, data, { mode: 0o600 });
  if (asset.archive) {
    const extracted = spawnSync('tar', ['-xzf', downloaded, '-C', folder, tool.executable], {
      stdio: 'inherit',
    });
    if (extracted.status !== 0) throw new Error(`No se pudo extraer ${name}`);
  } else renameSync(downloaded, binary);
  chmodSync(binary, 0o700);
  writeFileSync(
    recordFile,
    JSON.stringify({ archive: asset.sha256, binary: hash(readFileSync(binary)) }),
    { mode: 0o600 },
  );
  console.log(`${name} ${tool.version}: hash verificado para ${platform}`);
  return binary;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const binary = await ensureCiTool(process.argv[2]);
  const result = spawnSync(binary, process.argv.slice(3), { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
