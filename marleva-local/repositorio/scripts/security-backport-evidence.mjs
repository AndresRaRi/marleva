import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { checkBraces } from './security-braces-regression.mjs';
import { checkForge } from './security-forge-regression.mjs';
export function verifyBackports(manifest, workspace, lock, packages) {
  const verified = [];
  for (const [name, item] of Object.entries(manifest.packages)) {
    const hash = createHash('sha256').update(readFileSync(item.patch)).digest('hex');
    assert.equal(hash, item.sha256, 'Security patch hash changed');
    assert.equal(workspace.patchedDependencies[`${name}@${item.version}`], item.patch);
    assert.equal(lock.patchedDependencies[`${name}@${item.version}`], hash);
    const consumers = packages.filter((p) => p.name === name);
    assert(consumers.length > 0, 'No installed consumer verified');
    for (const consumer of consumers) {
      assert.equal(consumer.version, item.version);
      assert(Object.keys(item.files).length > 0, 'Missing installed file evidence');
      for (const [file, digest] of Object.entries(item.files))
        assert.equal(
          createHash('sha256')
            .update(readFileSync(path.join(consumer.root, file)))
            .digest('hex'),
          digest,
          'Installed security patch differs',
        );
      if (name === 'braces') checkBraces(consumer.api);
      else if (name === 'node-forge') checkForge(consumer.api);
      else throw new Error('No regression for security patch');
    }
    verified.push({ name, ...item, consumers: consumers.length, regression: 'PASS' });
  }
  return verified;
}
