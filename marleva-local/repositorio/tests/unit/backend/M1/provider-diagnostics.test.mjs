import { expect, it } from 'vitest';
import { summarizeProviderLog } from '../../../../scripts/ci-provider-diagnostics.mjs';
it('MAR-CI-PROVIDER-001 | clasifica SQLSTATE y causa sin publicar mensajes privados', () => {
  const log = [
    'INFO normal startup',
    'ERROR user fixture@example.test secret=private-value prepared statement missing (SQLSTATE 26000)',
    'FATAL remaining connection slots are reserved (SQLSTATE 53300)',
    'ERROR context deadline exceeded',
    'ERROR arbitrary sensitive message',
  ].join('\n');
  expect(summarizeProviderLog(log)).toEqual({
    errorLines: 4,
    sqlStates: { 26000: 1, 53300: 1 },
    categories: { preparedStatement: 1, connectionLimit: 1, timeout: 1 },
    unclassified: 1,
  });
  expect(JSON.stringify(summarizeProviderLog(log))).not.toMatch(/fixture|secret|private|sensitive/);
});
it('MAR-CI-PROVIDER-002 | solo códigos completos y etiquetas fijas', () => {
  expect(summarizeProviderLog('ERROR SQLSTATE secret-value\nERROR SQLSTATE ABCDEF')).toEqual({
    errorLines: 2,
    sqlStates: {},
    categories: {},
    unclassified: 2,
  });
  expect(summarizeProviderLog('')).toEqual({
    errorLines: 0,
    sqlStates: {},
    categories: {},
    unclassified: 0,
  });
});
