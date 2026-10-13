import type { FileActor, FileRepository } from '../ports/file-repository.js';
import { fileHash } from '../../domain/file-policy.js';
export class DeletePrivateFile {
  constructor(private readonly repository: FileRepository) {}
  execute(actor: FileActor, id: string, key: string, version: number) {
    return this.repository.delete(
      actor,
      id,
      key,
      version,
      fileHash(JSON.stringify({ fixture_id: id, expected_version: version })),
      new Date(),
    );
  }
}
