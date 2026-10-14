import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const docker = (args) => execFileSync('docker', args, { encoding: 'utf8', timeout: 60000 });
const image = JSON.parse(docker(['inspect', 'supabase_storage_marleva-m1']))[0].Image;
assert.match(image, /^sha256:[a-f0-9]{64}$/);
const volume = 'marleva-b12-xattrs-' + Date.now();
docker(['volume', 'create', '--label', 'marleva.b12.test=xattrs', volume]);
const base = [
  'run',
  '--rm',
  '--pull=never',
  '--network=none',
  '--read-only',
  '--memory=256m',
  '--cpus=1',
  '--cap-drop=ALL',
  '--security-opt=no-new-privileges',
  '--entrypoint=node',
  '--mount',
  `type=volume,src=${volume},dst=/data`,
];
try {
  docker([
    ...base,
    image,
    '-e',
    `const fs=require('fs'),x=require('fs-xattr');fs.mkdirSync('/data/source',{recursive:true});fs.mkdirSync('/data/destination');fs.writeFileSync('/data/source/text','fixture');fs.copyFileSync('/data/source/text','/data/destination/text');x.setAttributeSync('/data/source/text','user.supabase.content-type','text/plain');x.setAttributeSync('/data/source/text','user.supabase.cache-control','max-age=3600');`,
  ]);
  const helper = [
    ...base,
    '--mount',
    `type=volume,src=${volume},dst=/source,volume-subpath=source,readonly`,
    '--mount',
    `type=volume,src=${volume},dst=/destination,volume-subpath=destination`,
    '--mount',
    `type=bind,src=${path.resolve('tests/fixtures/recovery-xattrs.mjs')},dst=/helper.mjs,readonly`,
    image,
    '/helper.mjs',
  ];
  const expected = JSON.parse(docker([...helper, 'manifest', '/source']));
  assert.equal(expected.length, 1);
  assert.equal(expected[0][1].length, 2);
  assert.deepEqual(JSON.parse(docker([...helper, 'copy', '/source', '/destination'])), expected);
  docker([
    ...base,
    image,
    '-e',
    `const fs=require('fs'),x=require('fs-xattr'),a=require('assert/strict');a.equal(fs.readFileSync('/data/destination/text','utf8'),'fixture');a.equal(x.getAttributeSync('/data/destination/text','user.supabase.content-type').toString(),'text/plain');a.equal(x.getAttributeSync('/data/destination/text','user.supabase.cache-control').toString(),'max-age=3600')`,
  ]);
  writeFileSync(
    'tests/results/recovery-xattrs.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        case: 'MAR-M1-IT-BE-113-G-XATTR',
        passed: true,
        image,
        files: 1,
        attributes: 2,
        limits: ['Prueba del helper en volumen desechable; copia completa nueva todavía pendiente'],
      },
      null,
      2,
    ) + '\n',
  );
  console.log('B12: copia de atributos y contenido ficticio comprobada');
} finally {
  const info = JSON.parse(docker(['volume', 'inspect', volume]))[0];
  assert.equal(info.Labels['marleva.b12.test'], 'xattrs');
  docker(['volume', 'rm', volume]);
}
