import assert from 'node:assert/strict';
import { parseAllDocuments } from 'yaml';
export function securityLockfile(raw) {
  const documents = parseAllDocuments(raw).map((document) => {
    assert.equal(document.errors.length, 0, 'Invalid lockfile YAML');
    return document.toJS();
  });
  const workspaces = documents.filter((document) => document?.patchedDependencies);
  assert.equal(workspaces.length, 1, 'Expected one patched workspace in pnpm lockfile');
  assert.equal(workspaces[0].lockfileVersion, '9.0');
  return workspaces[0];
}
