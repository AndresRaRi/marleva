import type { FileRepository, DeletionJob } from '../ports/file-repository.js';
import type { FileStorage } from '../ports/file-storage.js';
import { deliveryRetryAt } from '../../domain/outbox-policy.js';
export class ProcessFileDeletions {
  constructor(
    private readonly repository: FileRepository,
    private readonly storage: FileStorage,
    private readonly clock = () => new Date(),
  ) {}
  async execute() {
    for (const job of await this.repository.ready(this.clock())) {
      const now = this.clock(),
        lease = new Date(+now + 15000);
      if (!(await this.repository.claim(job, now, lease))) continue;
      await this.process(job, lease);
    }
  }
  private async process(job: DeletionJob, lease: Date) {
    try {
      await this.storage.remove(job.objectKey);
      if (!(await this.storage.absent(job.objectKey))) throw new Error('Borrado sin confirmar');
      await this.repository.complete(job, lease, this.clock());
    } catch {
      await this.repository.retry(job.id, lease, deliveryRetryAt(job.attempts, this.clock()));
    }
  }
}
