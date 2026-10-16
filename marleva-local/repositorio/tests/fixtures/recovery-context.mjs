import assert from 'node:assert/strict';
import path from 'node:path';
import { recoveryNames } from './recovery-guard.mjs';
export function recoveryContext(env = process.env) {
  const run = env.MARLEVA_RECOVERY_RUN;
  if (!run)
    return {
      isolated: false,
      project: 'marleva-m1',
      network: 'marleva-private',
      fixture: 'artifacts/recovery/fixtures.private.json',
      ledger: 'artifacts/recovery/deletions.private.json',
      keys: 'artifacts/recovery/target-keys',
      sourceApi: 'http://127.0.0.1:3000',
      report: (name) => `tests/results/recovery-${name}.json`,
    };
  assert.match(run, /^\d{13}$/);
  assert.equal(env.MARLEVA_STACK_CONTEXT, 'b12-source-006', 'No usar origen de otro chat');
  const names = recoveryNames(run),
    folder = 'artifacts/recovery/' + names.prefix;
  return {
    isolated: true,
    run,
    names,
    folder,
    project: 'marleva-b12-source-006',
    network: 'marleva-b12-source-006-loopback',
    envFile: path.resolve('artifacts/recovery/source-006/.env'),
    fixture: folder + '/fixtures.private.json',
    ledger: folder + '/deletions.private.json',
    keys: folder + '/target-keys',
    sourceApi: 'http://127.0.0.1:3106',
    report: (name) => `tests/results/recovery-integral-${run}-${name}.json`,
  };
}
