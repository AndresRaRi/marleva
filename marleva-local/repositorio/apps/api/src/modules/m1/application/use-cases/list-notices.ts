import type { NoticeRepository } from '../ports/notice-repository.js';
import { encodeNoticeCursor, type NoticeBoundary } from '../../domain/notice-cursor.js';

export class ListNotices {
  constructor(private readonly repository: NoticeRepository) {}

  async execute(accountId: string, limit: number, boundary?: NoticeBoundary) {
    const rows = await this.repository.page(accountId, limit + 1, boundary);
    const items = rows.slice(0, limit);
    const last = items.at(-1);
    return {
      items,
      next_cursor:
        rows.length > limit && last
          ? encodeNoticeCursor({ accountId, id: last.id, createdAt: last.createdAt })
          : null,
    };
  }
}
