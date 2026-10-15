export interface FileActor {
  accountId: string;
  sessionId: string;
}
interface FileDescriptor {
  id: string;
  objectKey: string;
  bytes: number;
  sha256: string;
  mimeType: string;
}
interface DeletionResult {
  fixture_id: string;
  task_id: string;
  estado: 'delete_pending' | 'deleted';
  version: number;
}
export interface DeletionJob {
  id: string;
  fixtureId: string;
  objectKey: string;
  attempts: number;
}
export interface FileRepository {
  issue(actor: FileActor, id: string, tokenHash: string, now: Date): Promise<Date>;
  authorize(actor: FileActor, id: string, tokenHash: string, now: Date): Promise<FileDescriptor>;
  delete(
    actor: FileActor,
    id: string,
    key: string,
    version: number,
    requestHash: string,
    now: Date,
  ): Promise<DeletionResult>;
  ready(now: Date): Promise<DeletionJob[]>;
  claim(job: DeletionJob, now: Date, lease: Date): Promise<boolean>;
  complete(job: DeletionJob, lease: Date, now: Date): Promise<void>;
  retry(id: string, lease: Date, dueAt: Date): Promise<void>;
}
