import { createHash } from 'node:crypto';
import { fail } from '../../domain/catalog.js';
import type { PublicPhotoReader, PhotoStore } from '../ports/photos.js';
export class ReadPhoto {
  constructor(
    private readonly reader: PublicPhotoReader,
    private readonly store: PhotoStore,
  ) {}
  async execute(id: string, size: 'card' | 'detail'): Promise<Buffer> {
    const photo = await this.reader.find(id);
    if (!photo) return fail('NOT_FOUND', 'Esta foto no está disponible.', 404);
    const bytes = await this.store.read(id, size);
    const expected = photo.derivatives[size];
    if (
      !expected ||
      bytes.length !== expected.bytes ||
      createHash('sha256').update(bytes).digest('hex') !== expected.sha256
    )
      return fail('PHOTO_INTEGRITY', 'No pudimos cargar esta foto. Vuelve a intentar.', 503);
    return bytes;
  }
}
