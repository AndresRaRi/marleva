import assert from 'node:assert/strict';
export function classifyFindings(report, verified, rawStatus) {
  assert([0, 1].includes(rawStatus), 'OSV did not finish a valid scan');
  assert(Array.isArray(report.results), 'OSV report missing');
  const resolved = [],
    pending = [];
  for (const result of report.results) {
    assert(Array.isArray(result.packages), 'OSV package results missing');
    for (const item of result.packages) {
      assert(Array.isArray(item.vulnerabilities), 'OSV vulnerabilities missing');
      const pkg = item.package;
      assert(pkg?.name && pkg?.version && pkg?.ecosystem, 'OSV identity missing');
      for (const vulnerability of item.vulnerabilities) {
        assert(typeof vulnerability.id === 'string', 'OSV advisory missing');
        const fix = verified.find(
          (p) =>
            p.regression === 'PASS' &&
            pkg.ecosystem === 'npm' &&
            p.name === pkg.name &&
            p.version === pkg.version &&
            p.advisories.includes(vulnerability.id),
        );
        const finding = {
          name: pkg.name,
          version: pkg.version,
          ecosystem: pkg.ecosystem,
          id: vulnerability.id,
        };
        if (fix) resolved.push({ ...finding, state: 'resolved_with_pedigree', patch: fix.patch });
        else pending.push({ ...finding, state: 'unresolved' });
      }
    }
  }
  assert(rawStatus !== 1 || resolved.length + pending.length > 0, 'OSV failed without findings');
  return { rawStatus, resolved, pending };
}
