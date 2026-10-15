import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
export function addSecurityPedigree(sbom, verified) {
  const output = structuredClone(sbom);
  output.vulnerabilities ??= [];
  for (const fix of verified) {
    const component = output.components.find(
      (c) => c.name === fix.name && c.version === fix.version,
    );
    assert(component?.['bom-ref'], 'Patched component absent from SBOM');
    component.pedigree = {
      patches: [
        {
          type: fix.name === 'node-forge' ? 'backport' : 'unofficial',
          diff: {
            text: {
              contentType: 'text/plain',
              encoding: 'base64',
              content: readFileSync(fix.patch).toString('base64'),
            },
          },
          resolves: fix.advisories.map((id) => ({
            type: 'security',
            id,
            source: {
              name: 'GitHub Advisory Database',
              url: `https://github.com/advisories/${id}`,
            },
          })),
        },
      ],
    };
    component.properties = [
      { name: 'marleva:patch:sha256', value: fix.sha256 },
      { name: 'marleva:patch:files', value: JSON.stringify(fix.files) },
      { name: 'marleva:patch:source', value: fix.source },
    ];
    for (const id of fix.advisories)
      output.vulnerabilities.push({
        id,
        source: { name: 'GitHub Advisory Database', url: `https://github.com/advisories/${id}` },
        affects: [{ ref: component['bom-ref'] }],
        analysis: {
          state: 'resolved_with_pedigree',
          detail:
            'Local patch verified against lockfile, installed file hashes and regressions in this scan. Original upstream version retained; not a published fixed release.',
        },
      });
  }
  return output;
}
