import { open } from 'node:fs/promises';
import { constants } from 'node:fs';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fail, CatalogError } from '../../domain/catalog.js';
import type { EncodedPhoto } from '../../domain/photo.js';
import type { PhotoProcessor } from '../../application/ports/photos.js';
interface Output {
  card: Omit<EncodedPhoto, 'content'> & { content: string };
  detail: Omit<EncodedPhoto, 'content'> & { content: string };
}
export class SharpPhotoProcessor implements PhotoProcessor {
  private busy = false;
  constructor(private readonly timeoutMs = 5000) {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000)
      throw Error('Invalid timeout');
  }

  async process(path: string): Promise<{ card: EncodedPhoto; detail: EncodedPhoto }> {
    if (this.busy)
      return fail('PHOTO_BUSY', 'Estamos procesando otra foto. Vuelve a intentar.', 503);
    this.busy = true;
    try {
      const input = await this.readOriginal(path).catch(() => {
        throw new CatalogError(503, 'PHOTO_READ', 'No pudimos leer la foto. Vuelve a intentar.');
      });
      return await this.run(input);
    } finally {
      this.busy = false;
    }
  }
  private async readOriginal(path: string): Promise<Buffer> {
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const stat = await file.stat();
      if (!stat.isFile() || stat.size > 5000000) throw Error('Invalid original');
      return await file.readFile();
    } finally {
      await file.close();
    }
  }
  private run(input: Buffer): Promise<{ card: EncodedPhoto; detail: EncodedPhoto }> {
    return new Promise((resolve, reject) => {
      const child = execFile(
        process.execPath,
        [
          '--max-old-space-size=96',
          fileURLToPath(new URL('./sharp-photo-worker.js', import.meta.url)),
        ],
        { timeout: this.timeoutMs, maxBuffer: 8000000, encoding: 'utf8' },
        (error, stdout) => {
          if (error) {
            reject(
              new CatalogError(
                error.killed || error.code !== 1 ? 503 : 422,
                'PHOTO_DECODE',
                'No pudimos procesar la foto. Usa otro JPEG o PNG e intenta de nuevo.',
              ),
            );
            return;
          }
          try {
            const value = JSON.parse(stdout) as Output;
            resolve({
              card: { ...value.card, content: Buffer.from(value.card.content, 'base64') },
              detail: { ...value.detail, content: Buffer.from(value.detail.content, 'base64') },
            });
          } catch {
            reject(new Error('PHOTO_DECODE'));
          }
        },
      );
      child.stdin?.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code !== 'EPIPE') reject(error);
      });
      child.stdin?.end(input);
    });
  }
}
