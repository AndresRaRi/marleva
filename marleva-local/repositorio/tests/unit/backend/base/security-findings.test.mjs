import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { classifyFindings } from '../../../../scripts/security-classify-findings.mjs';
import { verifyBackports } from '../../../../scripts/security-backport-evidence.mjs';
import { securityPatchPackages } from '../../../../scripts/security-patch-packages.mjs';
import { securityLockfile } from '../../../../scripts/security-lockfile.mjs';
const manifest = JSON.parse(readFileSync('infra/ci/security-backports.json', 'utf8'));
const workspace = parse(readFileSync('pnpm-workspace.yaml', 'utf8'));
const lock = securityLockfile(readFileSync('pnpm-lock.yaml', 'utf8'));
const report = {
  results: [
    {
      packages: [
        {
          package: { name: 'braces', version: '3.0.3', ecosystem: 'npm' },
          vulnerabilities: [{ id: 'GHSA-vfj7-8cjw-p6xm' }],
        },
      ],
    },
  ],
};
const verified = [
  {
    name: 'braces',
    version: '3.0.3',
    advisories: ['GHSA-vfj7-8cjw-p6xm'],
    regression: 'PASS',
    patch: 'patches/braces@3.0.3.patch',
  },
];
it('Preserves raw findings and classifies only exact verified correction', () => {
  const before = structuredClone(report);
  expect(classifyFindings(report, verified, 1)).toMatchObject({
    rawStatus: 1,
    pending: [],
    resolved: [{ state: 'resolved_with_pedigree' }],
  });
  expect(report).toEqual(before);
});
it('Missing or failed regression evidence leaves findings blocking', () => {
  expect(classifyFindings(report, [], 1).pending).toHaveLength(1);
  expect(
    classifyFindings(report, [{ ...verified[0], regression: 'FAIL' }], 1).pending,
  ).toHaveLength(1);
});
it.each(['id', 'version', 'ecosystem'])('Unrecognized %s cannot inherit a correction', (field) => {
  const changed = structuredClone(report);
  if (field === 'id') changed.results[0].packages[0].vulnerabilities[0].id = 'GHSA-new-unknown';
  else changed.results[0].packages[0].package[field] = 'different';
  expect(classifyFindings(changed, verified, 1).pending).toHaveLength(1);
});
it('Scanner errors and absent reports cannot turn green', () => {
  for (const status of [null, 2, 127, 128])
    expect(() => classifyFindings(report, verified, status)).toThrow();
  expect(() => classifyFindings({}, verified, 1)).toThrow();
  expect(() => classifyFindings({ results: [] }, verified, 1)).toThrow();
  expect(() => classifyFindings({ results: [{}] }, verified, 1)).toThrow();
});
it.each(['patch', 'installed', 'lock', 'workspace'])('Rejects changed %s evidence', (field) => {
  const changed = structuredClone(manifest);
  const changedLock = structuredClone(lock);
  const changedWorkspace = structuredClone(workspace);
  if (field === 'patch') changed.packages.braces.sha256 = 'invalid';
  if (field === 'installed') changed.packages.braces.files['lib/parse.js'] = 'invalid';
  if (field === 'lock') changedLock.patchedDependencies['braces@3.0.3'] = 'invalid';
  if (field === 'workspace') changedWorkspace.patchedDependencies['braces@3.0.3'] = 'invalid';
  expect(() =>
    verifyBackports(changed, changedWorkspace, changedLock, securityPatchPackages()),
  ).toThrow();
});
it('Missing consumers cannot be certified as patched', () => {
  expect(() => verifyBackports(manifest, workspace, lock, [])).toThrow();
});
