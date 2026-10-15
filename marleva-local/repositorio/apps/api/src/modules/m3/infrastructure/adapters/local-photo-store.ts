import { mkdir, writeFile, readFile, open } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { CatalogError } from '../../domain/catalog.js';
import type { PhotoStore } from '../../application/ports/photos.js';
import { photoId } from '../../domain/photo.js';
export class LocalPhotoStore implements PhotoStore {
  constructor(private readonly root = resolve('artifacts/m3/photos')) {}
  private path(id: string, name: string) {
    if (!['original', 'card.jpg', 'detail.jpg'].includes(name)) throw Error('Invalid variant');
    return join(this.root, photoId(id), name);
  }
  async quarantine(id: string, bytes: Buffer): Promise<string> {
    const path = this.path(id, 'original');
    await mkdir(join(this.root, photoId(id)), { recursive: true, mode: 0o700 });
    try {
      await writeFile(path, bytes, { flag: 'wx', mode: 0o600 });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      const stored = await readFile(path);
      if (
        createHash('sha256').update(stored).digest('hex') !==
        createHash('sha256').update(bytes).digest('hex')
      )
        throw new CatalogError(409, 'PHOTO_KEY', 'La clave ya se utilizó con otra foto.');
    }
    return path;
  }
  async save(id: string, size: 'card' | 'detail', bytes: Buffer): Promise<void> {
    await writeFile(this.path(id, size + '.jpg'), bytes, { mode: 0o600, flag: 'wx' }).catch(
      async (error: NodeJS.ErrnoException) => {
        if (error.code !== 'EEXIST') throw error;
        if (!(await this.read(id, size)).equals(bytes)) throw Error('Derivative key already used');
      },
    );
  }
  async read(id: string, size: 'card' | 'detail'): Promise<Buffer> {
    const file = await open(
      this.path(id, size + '.jpg'),
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    try {
      const stat = await file.stat();
      if (!stat.isFile() || stat.size > 5000000) throw Error('Invalid derivative');
      return await file.readFile();
    } finally {
      await file.close();
    }
  }
}
