import type { FileActor, FileRepository } from '../ports/file-repository.js';
import type { FileStorage } from '../ports/file-storage.js';
import { fileHash, verifyFile } from '../../domain/file-policy.js';
import { FileFault } from '../../domain/file-fault.js';
export class ReadPrivateFile {
  constructor(
    private readonly repository: FileRepository,
    private readonly storage: FileStorage,
  ) {}
  async execute(actor: FileActor, id: string, capability: string) {
    const tokenHash = fileHash(capability);
    const expected = await this.repository.authorize(actor, id, tokenHash, new Date());
    if (!/^[A-Za-z0-9_-]{43}$/.test(capability)) throw new FileFault('capability');
    const content = await this.storage.read(expected.objectKey);
    verifyFile(content.data, content.mime, expected);
    await this.repository.authorize(actor, id, tokenHash, new Date());
    return content.data;
  }
}
