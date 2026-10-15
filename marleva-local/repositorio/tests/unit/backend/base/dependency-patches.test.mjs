import { it } from 'vitest';
import { securityPatchPackages } from '../../../../scripts/security-patch-packages.mjs';
import { checkBraces } from '../../../../scripts/security-braces-regression.mjs';
import { checkForge } from '../../../../scripts/security-forge-regression.mjs';
for (const item of securityPatchPackages())
  it(`Security backport ${item.name}: ${item.root}`, () => {
    if (item.name === 'braces') checkBraces(item.api);
    else checkForge(item.api);
  });
