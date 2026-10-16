import type { PhotoInput, ReadyPhoto, EncodedPhoto } from '../../domain/photo.js';
import type { Actor } from '../../domain/offer-transition.js';
export interface PhotoRepository {
  check(input: PhotoInput, actor: Actor, hash: string): Promise<ReadyPhoto | null>;
  attach(photo: ReadyPhoto, actor: Actor): Promise<ReadyPhoto>;
}
export interface PhotoStore {
  quarantine(id: string, bytes: Buffer): Promise<string>;
  save(id: string, size: 'card' | 'detail', bytes: Buffer): Promise<void>;
  read(id: string, size: 'card' | 'detail'): Promise<Buffer>;
}
export interface PhotoProcessor {
  process(path: string): Promise<{ card: EncodedPhoto; detail: EncodedPhoto }>;
}
export interface PublicPhotoReader {
  find(id: string): Promise<Pick<ReadyPhoto, 'id' | 'derivatives'> | null>;
}
