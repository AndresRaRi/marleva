import { it, expect } from 'vitest';
import { cloudScope } from '../../../../scripts/sonar-cloud-scope.mjs';
const baseline =
  'INFO 64 files indexed (done)\nINFO Hit the cache for 0 out of 64\nINFO Miss the cache for 64 out of 64: ANALYSIS_MODE_INELIGIBLE [64/64]';
const unchanged =
  'INFO 64 files indexed (done)\nINFO Hit the cache for 64 out of 64\nINFO Miss the cache for 0 out of 64';
it('Cloud | logs reales de base y PR sin cambios prueban procesados y caché por separado', () => {
  expect(cloudScope(baseline, 64)).toMatchObject({
    indexedFiles: 64,
    uncachedFiles: 64,
    cachedFiles: 0,
  });
  expect(cloudScope(unchanged, 64)).toMatchObject({
    indexedFiles: 64,
    uncachedFiles: 0,
    cachedFiles: 64,
  });
});
it.each([
  ['', 64],
  [baseline, 65],
  [baseline.replace('Hit the cache for 0', 'Hit the cache for 1'), 64],
  [unchanged.replace('Miss the cache for 0 out of 64', 'Miss the cache for 0 out of 63'), 64],
  [baseline, 0],
])('Cloud | inventario incompleto nunca produce verde', (log, count) => {
  expect(() => cloudScope(log, count)).toThrow();
});
