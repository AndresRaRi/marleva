import { it, expect } from 'vitest';
import { cloudScope, verifyCloudFileMeasure } from '../../../../scripts/sonar-cloud-scope.mjs';
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

it('Cloud | total main and PR delta have distinct scopes', () => {
  expect(verifyCloudFileMeasure('64', 64)).toEqual({
    measureScope: 'main_total',
    measuredFiles: 64,
  });
  expect(verifyCloudFileMeasure(undefined, 64, '5')).toEqual({
    measureScope: 'pull_request_delta',
  });
  expect(verifyCloudFileMeasure('1', 65, '5')).toEqual({
    measureScope: 'pull_request_delta',
    measuredFiles: 1,
  });
});
it.each([
  [undefined, 64, undefined],
  ['63', 64, undefined],
  ['66', 65, '5'],
  ['-1', 65, '5'],
  ['1.5', 65, '5'],
  ['invalid', 65, '5'],
])('Cloud | invalid measure blocks %j', (value, count, pr) => {
  expect(() => verifyCloudFileMeasure(value, count, pr)).toThrow();
});
