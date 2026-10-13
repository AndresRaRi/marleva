import { it, expect } from 'vitest';
import {
  fileHash,
  fileExpiry,
  verifyFile,
} from '../../../../apps/api/dist/modules/m1/domain/file-policy.js';
import { deletionInput } from '../../../../apps/api/dist/modules/m1/presentation/dtos/file-request.js';
import { ReadPrivateFile } from '../../../../apps/api/dist/modules/m1/application/use-cases/read-private-file.js';
it('MAR-M1-UT-BE-111-A | SEQ011:S030/S080 | TTL limitado por sesión e integridad antes de respuesta', () => {
  const now = new Date('2026-10-13T12:00:00Z');
  expect(+fileExpiry(now, new Date(+now + 600000)) - +now).toBe(300000);
  expect(+fileExpiry(now, new Date(+now + 1000)) - +now).toBe(1000);
  expect(() => fileExpiry(now, now)).toThrow();
  const data = Buffer.from('ficticio'),
    expected = { bytes: data.length, sha256: fileHash(data), mimeType: 'text/plain' };
  expect(() => verifyFile(data, 'text/plain', expected)).not.toThrow();
  for (const invalid of [Buffer.from('alterado'), Buffer.alloc(0), Buffer.alloc(1048577)])
    expect(() => verifyFile(invalid, 'text/plain', expected)).toThrow();
  expect(() => verifyFile(data, 'text/html', expected)).toThrow();
  for (const body of [
    { expected_version: 0 },
    { expected_version: 1, accountId: 'ajeno' },
    [],
    null,
    { expected_version: 1.2 },
  ])
    expect(() => deletionInput(body, 'fixture-key-12345')).toThrow();
  expect(deletionInput({ expected_version: 1 }, 'fixture-key-12345').version).toBe(1);
});
it('MAR-M1-UT-BE-111-B | SEQ011:S085 | revocación durante Storage impide emitir bytes', async () => {
  let checks = 0;
  const data = Buffer.from('ficticio');
  const repository = {
    authorize: async () => {
      if (++checks === 2) throw new Error('revocada');
      return {
        objectKey: 'ficticio',
        bytes: data.length,
        sha256: fileHash(data),
        mimeType: 'text/plain',
      };
    },
  };
  const storage = { read: async () => ({ data, mime: 'text/plain' }) };
  await expect(
    new ReadPrivateFile(repository, storage).execute(
      { accountId: 'a', sessionId: 's' },
      'f',
      'a'.repeat(43),
    ),
  ).rejects.toThrow('revocada');
  expect(checks).toBe(2);
});
