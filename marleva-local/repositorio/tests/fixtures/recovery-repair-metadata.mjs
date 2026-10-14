import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const copy = JSON.parse(readFileSync('tests/results/recovery-copy.json'));
const fixture = JSON.parse(readFileSync('artifacts/recovery/fixtures.private.json'));
const prefix = copy.names.prefix;
assert.match(prefix, /^marleva-b12-\d{13}$/);
const docker = (args, input) =>
  execFileSync('docker', args, { input, encoding: 'utf8', timeout: 60000 });
const target = prefix + '-storage-provider';
const info = JSON.parse(docker(['inspect', target]))[0];
assert.equal(info.Config.Labels['marleva.b12.run'], prefix.slice(12));
assert.ok(info.Mounts.some((m) => m.Name === copy.names.storageTarget && m.Destination === '/mnt'));
const rows = JSON.parse(
  docker([
    'exec',
    prefix + '-db-provider',
    'psql',
    '-U',
    'supabase_admin',
    '-d',
    'postgres',
    '-Atc',
    "SELECT coalesce(json_agg(json_build_object('name',name,'version',version,'metadata',metadata)),'[]') FROM storage.objects WHERE bucket_id='m1-private'",
  ]),
);
const entries = fixture.files.map((file) => {
  const row = rows.find((r) => r.name === file.key);
  assert.ok(row);
  assert.equal(row.metadata.mimetype, 'text/plain');
  assert.equal(Number(row.metadata.size), file.bytes);
  assert.equal(row.metadata.cacheControl, 'max-age=3600');
  assert.match(row.version, /^[a-f0-9-]{36}$/);
  return {
    ...file,
    version: row.version,
    mime: row.metadata.mimetype,
    cache: row.metadata.cacheControl,
  };
});
const code = `const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),x=require('fs-xattr');
const entries=JSON.parse(fs.readFileSync(0,'utf8'));let repaired=0;
for(const e of entries){const f=path.resolve('/mnt/stub/stub/m1-private',e.key,e.version);assert.ok(f.startsWith('/mnt/stub/stub/m1-private/'));const before=fs.readFileSync(f);assert.equal(before.length,e.bytes);assert.equal(crypto.createHash('sha256').update(before).digest('hex'),e.sha256);x.setAttributeSync(f,'user.supabase.content-type',e.mime);x.setAttributeSync(f,'user.supabase.cache-control',e.cache);assert.equal(x.getAttributeSync(f,'user.supabase.content-type').toString(),e.mime);assert.equal(x.getAttributeSync(f,'user.supabase.cache-control').toString(),e.cache);assert.deepEqual(fs.readFileSync(f),before);repaired++}console.log(JSON.stringify({repaired,hashesUnchanged:true}))`;
const result = JSON.parse(
  docker(['exec', '-i', target, 'node', '-e', code], JSON.stringify(entries)),
);
assert.equal(result.repaired, 3);
const report = {
  date: new Date().toISOString(),
  copyPrefix: prefix,
  ...result,
  method:
    'Reconstrucción limitada desde metadata SQL y parámetros de fixtures conocidos; no preservación original',
  limits: ['Backups/origen intactos', 'Copia nueva con atributos todavía pendiente'],
};
writeFileSync(
  'tests/results/recovery-metadata-repair.json',
  JSON.stringify(report, null, 2) + '\n',
);
console.log(JSON.stringify(report));
