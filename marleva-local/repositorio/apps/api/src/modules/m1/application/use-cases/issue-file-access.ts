import { randomBytes } from 'node:crypto';
import type { FileActor, FileRepository } from '../ports/file-repository.js';
import { fileHash } from '../../domain/file-policy.js';
export class IssueFileAccess {
  constructor(private readonly repository: FileRepository) {}
  async execute(actor: FileActor, id: string) {
    const capability = randomBytes(32).toString('base64url');
    const expiresAt = await this.repository.issue(actor, id, fileHash(capability), new Date());
    return { capability, expires_at: expiresAt.toISOString(), fixture_id: id };
  }
}
