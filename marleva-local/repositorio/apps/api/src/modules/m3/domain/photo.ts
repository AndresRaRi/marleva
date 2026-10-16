import { fail } from './catalog.js';
export interface PhotoInput {
  id: string;
  version_id: string;
  position: number;
  mime: 'image/jpeg' | 'image/png';
  bytes: Buffer;
}
interface Derivative {
  bytes: number;
  sha256: string;
  width: number;
  height: number;
}
export interface EncodedPhoto extends Derivative {
  content: Buffer;
}
interface PhotoManifest {
  card: Derivative;
  detail: Derivative;
}
export interface ReadyPhoto {
  id: string;
  version_id: string;
  position: number;
  source_sha256: string;
  derivatives: PhotoManifest;
}
function signature(bytes: Buffer): string | null {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return 'image/png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  return null;
}
export function validatePhoto(input: PhotoInput): void {
  photoId(input.id);
  photoId(input.version_id);
  if (!Buffer.isBuffer(input.bytes) || input.bytes.length < 8 || input.bytes.length > 5000000)
    fail('PHOTO_SIZE', 'Usa una imagen de hasta 5 MB.');
  const type = signature(input.bytes);
  if (!type || input.mime !== type) fail('PHOTO_FORMAT', 'Usa una imagen JPEG o PNG válida.');
  if (!Number.isInteger(input.position) || input.position < 1 || input.position > 6)
    fail('PHOTO_POSITION', 'Puedes añadir hasta seis fotos.');
}

export function photoId(value: unknown): string {
  if (typeof value !== 'string') fail('PHOTO_ID', 'Identificador de foto inválido.');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(value))
    fail('PHOTO_ID', 'Identificador de foto inválido.');
  return value;
}
