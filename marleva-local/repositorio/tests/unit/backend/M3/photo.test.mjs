import { SharpPhotoProcessor } from '../../../../apps/api/src/modules/m3/infrastructure/adapters/sharp-photo-processor.ts';
import { it, expect, vi } from 'vitest';
import { randomUUID, createHash } from 'node:crypto';
import { validatePhoto, photoId } from '../../../../apps/api/src/modules/m3/domain/photo.ts';
import { AttachPhoto } from '../../../../apps/api/src/modules/m3/application/use-cases/attach-photo.ts';
import { ReadPhoto } from '../../../../apps/api/src/modules/m3/application/use-cases/read-photo.ts';
import { actor } from '../../../fixtures/m3-fixtures.mjs';
const bytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const input = () => ({
  id: randomUUID(),
  version_id: randomUUID(),
  position: 1,
  mime: 'image/png',
  bytes,
});
const derivative = {
  content: bytes,
  bytes: 8,
  sha256: createHash('sha256').update(bytes).digest('hex'),
  width: 1,
  height: 1,
};
it('MAR-M3-UT-BE-009-P | tipos reales, tamaño, posición y nombres cerrados', () => {
  expect(() => validatePhoto(input())).not.toThrow();
  expect(() =>
    validatePhoto({
      ...input(),
      mime: 'image/jpeg',
      bytes: Buffer.from([255, 216, 255, 0, 0, 0, 0, 0]),
    }),
  ).not.toThrow();
  for (const patch of [
    { position: 0 },
    { position: 7 },
    { position: 1.5 },
    { bytes: Buffer.alloc(5000001) },
    { bytes: Buffer.alloc(0) },
    { bytes: Buffer.alloc(8) },
    { bytes: [] },
    { mime: 'image/jpeg' },
    { mime: 'image/svg+xml' },
    { bytes: Buffer.from('<svg/>') },
  ])
    expect(() => validatePhoto({ ...input(), ...patch })).toThrow();
  for (const id of ['../original', 'https://example.invalid/x', 'a', 'A'.repeat(36)])
    expect(() => photoId(id)).toThrow();
  expect(() => photoId([input().id])).toThrow();
  expect(() => photoId(null)).toThrow();
  expect(photoId(input().id)).toHaveLength(36);
});
it('MAR-M3-UT-BE-009-A | permiso antes de archivo e idempotencia sin volver a procesar', async () => {
  const store = { quarantine: vi.fn(), save: vi.fn(), read: vi.fn() },
    processor = { process: vi.fn() };
  const repository = { check: vi.fn().mockRejectedValue(Error('denied')), attach: vi.fn() };
  const usecase = new AttachPhoto(repository, store, processor);
  await expect(usecase.execute(input(), actor)).rejects.toThrow('denied');
  expect(store.quarantine).not.toHaveBeenCalled();
  repository.check.mockResolvedValue({ id: 'existing' });
  expect(await usecase.execute(input(), actor)).toEqual({ id: 'existing' });
  expect(processor.process).not.toHaveBeenCalled();
});
it('MAR-M3-UT-BE-009-C | solo adjuntar tras ambos derivados y propagar fallo final', async () => {
  const item = input();
  const store = {
    quarantine: vi.fn().mockResolvedValue('/private/original'),
    save: vi.fn(),
    read: vi.fn(),
  };
  const repository = {
    check: vi.fn().mockResolvedValue(null),
    attach: vi.fn().mockImplementation(async (value) => value),
  };
  const processor = {
    process: vi.fn().mockResolvedValue({ card: derivative, detail: derivative }),
  };
  const usecase = new AttachPhoto(repository, store, processor);
  const result = await usecase.execute(item, actor);
  expect(store.save).toHaveBeenNthCalledWith(1, item.id, 'card', bytes);
  expect(store.save).toHaveBeenNthCalledWith(2, item.id, 'detail', bytes);
  expect(result.derivatives.card).not.toHaveProperty('content');
  expect(result.source_sha256).toBe(derivative.sha256);
  repository.attach.mockRejectedValue(Error('version changed'));
  await expect(usecase.execute(item, actor)).rejects.toThrow('version changed');
  processor.process.mockRejectedValue(Error('decode'));
  const calls = repository.attach.mock.calls.length;
  await expect(usecase.execute(item, actor)).rejects.toThrow('decode');
  expect(repository.attach).toHaveBeenCalledTimes(calls);
});
it('MAR-M3-UT-BE-009-R | recurso oculto, integridad y error de almacén no equivalen a foto válida', async () => {
  const reader = { find: vi.fn().mockResolvedValue(null) },
    store = { read: vi.fn(), save: vi.fn(), quarantine: vi.fn() };
  const usecase = new ReadPhoto(reader, store);
  await expect(usecase.execute(randomUUID(), 'card')).rejects.toMatchObject({ status: 404 });
  expect(store.read).not.toHaveBeenCalled();
  reader.find.mockResolvedValue({ id: 'x', derivatives: { card: derivative, detail: derivative } });
  store.read.mockResolvedValue(bytes);
  expect(await usecase.execute(randomUUID(), 'card')).toEqual(bytes);
  store.read.mockResolvedValue(Buffer.alloc(2));
  await expect(usecase.execute(randomUUID(), 'detail')).rejects.toMatchObject({ status: 503 });
  store.read.mockResolvedValue(Buffer.alloc(8));
  await expect(usecase.execute(randomUUID(), 'card')).rejects.toMatchObject({ status: 503 });
  reader.find.mockResolvedValue({ id: 'x', derivatives: {} });
  await expect(usecase.execute(randomUUID(), 'card')).rejects.toMatchObject({ status: 503 });
  store.read.mockRejectedValue(Error('disk'));
  await expect(usecase.execute(randomUUID(), 'card')).rejects.toThrow('disk');
});

it('MAR-M3-UT-BE-009-TIMEOUT | configuración no permite ampliar el plazo de procesamiento', () => {
  for (const value of [0, 5001, NaN, 1.5]) expect(() => new SharpPhotoProcessor(value)).toThrow();
  expect(() => new SharpPhotoProcessor(5000)).not.toThrow();
});
