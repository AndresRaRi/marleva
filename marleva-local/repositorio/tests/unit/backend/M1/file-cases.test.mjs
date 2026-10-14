import { it, expect, vi } from 'vitest';
import { IssueFileAccess } from '../../../../apps/api/src/modules/m1/application/use-cases/issue-file-access.ts';
import { DeletePrivateFile } from '../../../../apps/api/src/modules/m1/application/use-cases/delete-private-file.ts';
import { ProcessFileDeletions } from '../../../../apps/api/src/modules/m1/application/use-cases/process-file-deletions.ts';
import { ReadPrivateFile } from '../../../../apps/api/src/modules/m1/application/use-cases/read-private-file.ts';
import { fileHash } from '../../../../apps/api/src/modules/m1/domain/file-policy.ts';
const now = new Date('2026-10-14T12:00:00Z');
const actor = { accountId: 'a', sessionId: 's' };
it('MAR-M1-UT-BE-111-C | SEQ011:S040 | permiso aleatorio persiste solo hash; denegación no emite', async () => {
  const issue = vi.fn().mockResolvedValue(new Date(+now + 1000));
  const service = new IssueFileAccess({ issue });
  const first = await service.execute(actor, 'f'),
    second = await service.execute(actor, 'f');
  expect(first.capability).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(second.capability).not.toBe(first.capability);
  expect(issue.mock.calls[0][2]).toBe(fileHash(first.capability));
  expect(issue.mock.calls[0]).not.toContain(first.capability);
  issue.mockRejectedValue(new Error('foreign'));
  await expect(service.execute(actor, 'foreign')).rejects.toThrow('foreign');
});
it('MAR-M1-UT-BE-111-D | SEQ011:S105 | repetición misma versión conserva huella; cambio no equivale', async () => {
  const deletion = vi.fn().mockResolvedValue({ estado: 'delete_pending' });
  const service = new DeletePrivateFile({ delete: deletion });
  await service.execute(actor, 'f', 'fixture-idempotency-key', 1);
  await service.execute(actor, 'f', 'fixture-idempotency-key', 1);
  await service.execute(actor, 'f', 'fixture-idempotency-key', 2);
  expect(deletion.mock.calls[0][4]).toBe(deletion.mock.calls[1][4]);
  expect(deletion.mock.calls[2][4]).not.toBe(deletion.mock.calls[0][4]);
  deletion.mockRejectedValue(new Error('conflict'));
  await expect(service.execute(actor, 'f', 'fixture-idempotency-key', 2)).rejects.toThrow(
    'conflict',
  );
});
it('MAR-M1-UT-BE-111-E | SEQ011:S120/S130 | claim perdido no borra; ausencia no confirmada reintenta', async () => {
  const job = { id: 'j', objectKey: 'fixture', attempts: 0 };
  const repository = {
    ready: async () => [job],
    claim: vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true),
    complete: vi.fn(),
    retry: vi.fn(),
  };
  const storage = { remove: vi.fn(), absent: vi.fn().mockResolvedValue(false) };
  const worker = new ProcessFileDeletions(repository, storage, () => now);
  await worker.execute();
  expect(storage.remove).not.toHaveBeenCalled();
  await worker.execute();
  expect(repository.complete).not.toHaveBeenCalled();
  expect(repository.retry).toHaveBeenCalledWith(
    'j',
    new Date(+now + 15000),
    new Date(+now + 60000),
  );
  storage.absent.mockResolvedValue(true);
  await worker.execute();
  expect(repository.complete).toHaveBeenCalledWith(job, new Date(+now + 15000), now);
});
it('MAR-M1-UT-BE-111-F | SEQ011:S120 | fallo de Storage conserva primer trabajo y permite segundo', async () => {
  const jobs = [
    { id: 'j1', objectKey: 'first', attempts: 0 },
    { id: 'j2', objectKey: 'second', attempts: 1 },
  ];
  const repository = {
    ready: async () => jobs,
    claim: async () => true,
    complete: vi.fn(),
    retry: vi.fn(),
  };
  const storage = {
    remove: vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined),
    absent: vi.fn().mockResolvedValue(true),
  };
  await new ProcessFileDeletions(repository, storage, () => now).execute();
  expect(repository.retry).toHaveBeenCalledTimes(1);
  expect(repository.complete).toHaveBeenCalledWith(jobs[1], expect.any(Date), now);
});
it('MAR-M1-UT-BE-111-G | SEQ011:S070/S085 | token mal formado no llega a Storage; lectura válida revalida', async () => {
  const data = Buffer.from('fixture');
  const repository = {
    authorize: vi.fn().mockResolvedValue({
      objectKey: 'fixture',
      bytes: data.length,
      sha256: fileHash(data),
      mimeType: 'text/plain',
    }),
  };
  const storage = { read: vi.fn().mockResolvedValue({ data, mime: 'text/plain' }) };
  const reader = new ReadPrivateFile(repository, storage);
  await expect(reader.execute(actor, 'f', 'short')).rejects.toMatchObject({ kind: 'capability' });
  expect(storage.read).not.toHaveBeenCalled();
  repository.authorize.mockClear();
  expect(await reader.execute(actor, 'f', 'a'.repeat(43))).toEqual(data);
  expect(repository.authorize).toHaveBeenCalledTimes(2);
});
