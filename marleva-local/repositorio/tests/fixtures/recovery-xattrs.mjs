import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const xattr = createRequire('/app/package.json')('fs-xattr');
const [mode, source, destination] = process.argv.slice(2);
assert.ok(['manifest', 'copy'].includes(mode));
assert.equal(source, '/source');
if (mode === 'copy') assert.equal(destination, '/destination');
const manifest = [];
function walk(folder) {
  for (const entry of fs
    .readdirSync(folder, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(folder, entry.name);
    assert.ok(!entry.isSymbolicLink(), 'Symlink no autorizado');
    if (entry.isDirectory()) {
      walk(file);
      continue;
    }
    assert.ok(entry.isFile());
    const attrs = xattr
      .listAttributesSync(file)
      .sort()
      .map((name) => [name, xattr.getAttributeSync(file, name).toString('base64')]);
    if (mode === 'copy') {
      const target = path.join(destination, path.relative(source, file));
      assert.ok(fs.statSync(target).isFile());
      for (const [name, value] of attrs)
        xattr.setAttributeSync(target, name, Buffer.from(value, 'base64'));
      const actual = xattr
        .listAttributesSync(target)
        .sort()
        .map((name) => [name, xattr.getAttributeSync(target, name).toString('base64')]);
      assert.deepEqual(actual, attrs);
    }
    manifest.push([path.relative(source, file), attrs]);
  }
}
walk(source);
process.stdout.write(JSON.stringify(manifest));
