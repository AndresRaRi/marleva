import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const require = createRequire(import.meta.url);
const lighthouse = createRequire(require.resolve('@lhci/cli/package.json'));
const api = createRequire(new URL('../apps/api/package.json', import.meta.url));
const prisma = createRequire(api.resolve('prisma/package.json'));
const client = createRequire(new URL('../apps/client/package.json', import.meta.url));
const expo = createRequire(client.resolve('expo/package.json'));
const cli = createRequire(expo.resolve('@expo/cli'));
const query = cli('query-string');
assert.deepEqual(
  { ...query.parse('nombre=Jos%C3%A9&espacio=a+b&simbolo=%26') },
  { nombre: 'José', espacio: 'a b', simbolo: '&' },
);
assert.equal(
  query.stringify({ nombre: 'José', espacio: 'a b', simbolo: '&' }),
  'espacio=a%20b&nombre=Jos%C3%A9&simbolo=%26',
);
assert.equal(query.parse('x=%E0%A4%A').x, '%E0%A4%A');
assert.equal(prisma('mysql2/package.json').version, '3.23.1');
assert.equal(typeof prisma('mysql2/promise').createPool, 'function');
const configuration = createRequire(prisma.resolve('@prisma/config'));
assert.deepEqual(
  configuration('deepmerge-ts').deepmerge(
    { migrations: { path: 'migrations' } },
    { migrations: { seed: 'fixture' } },
  ),
  { migrations: { path: 'migrations', seed: 'fixture' } },
);
const proxy = createRequire(lighthouse.resolve('proxy-agent'));
const pac = createRequire(proxy.resolve('pac-proxy-agent'));
const uri = createRequire(pac.resolve('get-uri'));
const ftp = new (uri('basic-ftp').Client)();
try {
  for (const method of ['access', 'lastMod', 'list', 'downloadTo', 'close'])
    assert.equal(typeof ftp[method], 'function');
} finally {
  ftp.close();
}
assert.equal(lighthouse('tmp/package.json').version, '0.2.7');
assert.equal(lighthouse('uuid/package.json').version, '11.1.1');
const directory = path.resolve('artifacts/security/compat');
mkdirSync(directory, { recursive: true, mode: 0o700 });
const yamlFixture = path.join(directory, 'lighthouserc.yaml');
writeFileSync(yamlFixture, 'ci:\n  collect:\n    numberOfRuns: 3\n');
assert.deepEqual(lighthouse('@lhci/utils/src/lighthouserc.js').loadRcFile(yamlFixture), {
  ci: { collect: { numberOfRuns: 3 } },
});
const temporary = lighthouse('tmp').fileSync({ tmpdir: directory, postfix: '.txt' });
try {
  writeFileSync(temporary.name, 'fixture temporal de compatibilidad');
  assert.equal(readFileSync(temporary.name, 'utf8'), 'fixture temporal de compatibilidad');
} finally {
  temporary.removeCallback();
}
const project = require('xcode').project('ficticio.pbxproj');
project.hash = { project: { objects: {} } };
const ids = Array.from({ length: 20 }, () => project.generateUuid());
assert(ids.every((id) => /^[0-9A-F]{24}$/.test(id)));
assert.equal(new Set(ids).size, 20);
console.log(
  'Consumidores de mysql2, tmp, uuid, deepmerge y FTP cargan y conservan las API comprobadas; no prueba servidor MySQL/FTP ni build iOS.',
);
