import assert from 'node:assert/strict';
import path from 'node:path';
export const readinessServices = ['auth', 'storage', 'inbucket', 'db'];
export function assertReadinessTarget(container, service, folder) {
  assert.ok(readinessServices.includes(service));
  assert.ok(path.isAbsolute(folder));
  assert.equal(container.Name, '/supabase_' + service + '_marleva-ci');
  assert.equal(container.Config.Labels['com.supabase.cli.project'], 'marleva-ci');
  assert.equal(container.Config.Labels['com.supabase.cli.workdir'], path.resolve(folder));
  assert.equal(container.State.Running, true);
}
