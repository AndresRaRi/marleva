import { createHash } from 'node:crypto';
import {
  validatePhoto,
  type PhotoInput,
  type ReadyPhoto,
  type EncodedPhoto,
} from '../../domain/photo.js';
import type { Actor } from '../../domain/offer-transition.js';
import type { PhotoRepository, PhotoStore, PhotoProcessor } from '../ports/photos.js';
function manifest(value: EncodedPhoto) {
  return { bytes: value.bytes, sha256: value.sha256, width: value.width, height: value.height };
}
export class AttachPhoto {
  constructor(
    private readonly repository: PhotoRepository,
    private readonly store: PhotoStore,
    private readonly processor: PhotoProcessor,
  ) {}
  async execute(input: PhotoInput, actor: Actor): Promise<ReadyPhoto> {
    validatePhoto(input);
    const hash = createHash('sha256').update(input.bytes).digest('hex');
    const previous = await this.repository.check(input, actor, hash);
    if (previous) return previous;
    const path = await this.store.quarantine(input.id, input.bytes);
    const output = await this.processor.process(path);
    await this.store.save(input.id, 'card', output.card.content);
    await this.store.save(input.id, 'detail', output.detail.content);
    return this.repository.attach(
      {
        id: input.id,
        version_id: input.version_id,
        position: input.position,
        source_sha256: hash,
        derivatives: { card: manifest(output.card), detail: manifest(output.detail) },
      },
      actor,
    );
  }
}
