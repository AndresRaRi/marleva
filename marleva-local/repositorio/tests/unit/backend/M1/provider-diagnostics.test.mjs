import { expect, it } from 'vitest';
import {
  providerErrorShape,
  summarizeProviderLog,
} from '../../../../scripts/ci-provider-diagnostics.mjs';
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
    shapes: { error: 1 },
  });
  expect(JSON.stringify(summarizeProviderLog(log))).not.toMatch(/fixture|secret|private|sensitive/);
});
it('MAR-CI-PROVIDER-002 | solo códigos completos y etiquetas fijas', () => {
  expect(summarizeProviderLog('ERROR SQLSTATE secret-value\nERROR SQLSTATE ABCDEF')).toEqual({
    errorLines: 2,
    sqlStates: {},
    categories: {},
    unclassified: 2,
    shapes: { error: 2 },
  });
  expect(summarizeProviderLog('')).toEqual({
    errorLines: 0,
    sqlStates: {},
    categories: {},
    unclassified: 0,
    shapes: {},
  });
});

it('MAR-CI-PROVIDER-003 | error encadenado conserva solo vocabulario técnico cerrado', () => {
  const message = JSON.stringify({
    error:
      'error finding user: sql: Scan error on column index 5 name email: cannot scan NULL into *string; SELECT token FROM private_table; fixture@example.test Bearer abcdef1234567890',
    msg: 'private-key-value',
    request_id: 'private-request-id',
  });
  expect(providerErrorShape(message)).toBe(
    'error finding user sql scan error column index cannot scan null into string select',
  );
  expect(providerErrorShape(JSON.stringify({ msg: 'secret error', token: 'sensitive' }))).toBe('');
  expect(providerErrorShape('ERROR sql connection already closed password=private-value')).toBe(
    'error sql connection already closed',
  );
});
it('MAR-CI-PROVIDER-004 | limita palabras y formas sin devolver contenido desconocido', () => {
  expect(providerErrorShape('error '.repeat(100)).split(' ')).toHaveLength(40);
  const log = Array.from({ length: 40 }, (_, n) => 'ERROR ' + 'sql '.repeat(n + 1)).join('\n');
  const report = summarizeProviderLog(log);
  expect(Object.keys(report.shapes)).toHaveLength(33);
  expect(report.shapes.other).toBe(8);
  expect(report.unclassified).toBe(40);
});

it('MAR-CI-PROVIDER-005 | distingue causas técnicas y descarta valores y nombres', () => {
  expect(
    providerErrorShape(
      'ERROR database error: cannot assign requested address. password=private-value',
    ),
  ).toBe('error database error cannot assign requested address');
  expect(
    providerErrorShape(
      'ERROR cannot serialize access due to concurrent update; private@example.test',
    ),
  ).toBe('error cannot serialize access due concurrent update');
  expect(
    providerErrorShape(
      JSON.stringify({
        error:
          'failed to fetch user: database error: cannot acquire pool; user@example.test token=private-key',
      }),
    ),
  ).toBe('failed fetch user database error cannot acquire pool');
});
