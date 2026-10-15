import { config } from '../../../../config.js';
import type { FileStorage } from '../../application/ports/file-storage.js';
import { FileFault } from '../../domain/file-fault.js';
export class LocalPrivateStorage implements FileStorage {
  private readonly settings = config();
  private async request(key: string, method: 'GET' | 'DELETE') {
    try {
      return await fetch(
        this.settings.SUPABASE_URL +
          '/storage/v1/object/authenticated/m1-private/' +
          key.split('/').map(encodeURIComponent).join('/'),
        {
          method,
          headers: {
            Authorization: 'Bearer ' + this.settings.SUPABASE_SERVICE_KEY,
            apikey: this.settings.SUPABASE_SERVICE_KEY,
          },
          signal: AbortSignal.timeout(5000),
        },
      );
    } catch {
      throw new FileFault('dependency');
    }
  }
  async read(key: string) {
    const response = await this.request(key, 'GET');
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      throw new FileFault('dependency');
    }
    const mime = (response.headers.get('content-type') ?? '').split(';')[0].trim();
    const reader = response.body.getReader(),
      chunks: Uint8Array[] = [];
    try {
      await readChunks(reader, chunks);
      return { data: Buffer.concat(chunks), mime };
    } catch (error) {
      await reader.cancel().catch(() => undefined);
      if (error instanceof FileFault) throw error;
      throw new FileFault('dependency');
    } finally {
      reader.releaseLock();
    }
  }
  async remove(key: string) {
    // Storage deletion has its own route; authenticated is only a download prefix.
    const url = this.settings.SUPABASE_URL + '/storage/v1/object/m1-private';
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + this.settings.SUPABASE_SERVICE_KEY,
          apikey: this.settings.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefixes: [key] }),
        signal: AbortSignal.timeout(5000),
      });
      await response.body?.cancel();
      if (!response.ok) throw new FileFault('dependency');
    } catch {
      throw new FileFault('dependency');
    }
  }
  async absent(key: string) {
    const response = await this.request(key, 'GET');
    if (response.ok) {
      await response.body?.cancel();
      return false;
    }
    if (response.status === 404) {
      await response.body?.cancel();
      return true;
    }
    // Local Supabase Storage wraps NoSuchKey in HTTP400; never treat any 400 as absence.
    if (response.status === 400) {
      const body: unknown = await response.json().catch(() => null);
      if (noSuchKey(body)) return true;
    } else {
      await response.body?.cancel();
    }
    throw new FileFault('dependency');
  }
}

async function readChunks(reader: ReadableStreamDefaultReader<Uint8Array>, chunks: Uint8Array[]) {
  let size = 0;
  for (;;) {
    const next = await reader.read();
    if (next.done) return;
    size += next.value.byteLength;
    if (size > 1048576) throw new FileFault('integrity');
    chunks.push(next.value);
  }
}
function noSuchKey(body: unknown) {
  return (
    !!body &&
    typeof body === 'object' &&
    'code' in body &&
    body.code === 'NoSuchKey' &&
    'statusCode' in body &&
    String(body.statusCode) === '404'
  );
}
