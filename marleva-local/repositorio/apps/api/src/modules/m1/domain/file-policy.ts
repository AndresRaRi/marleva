import { createHash } from 'node:crypto';
import { FileFault } from './file-fault.js';
export const fileHash = (value: string | Uint8Array) =>
  createHash('sha256').update(value).digest('hex');
export function fileExpiry(now: Date, sessionExpiry: Date) {
  const expires = new Date(Math.min(+now + 300000, +sessionExpiry));
  if (+expires <= +now) throw new FileFault('session');
  return expires;
}
export function verifyFile(
  data: Uint8Array,
  mime: string,
  expected: { bytes: number; sha256: string; mimeType: string },
) {
  if (
    data.byteLength < 1 ||
    data.byteLength > 1048576 ||
    data.byteLength !== expected.bytes ||
    mime !== expected.mimeType ||
    fileHash(data) !== expected.sha256
  )
    throw new FileFault('integrity');
}
