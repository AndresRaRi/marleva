import type { NoticeBoundary } from '../../domain/notice-cursor.js';
export type NoticeRow = {
  id: string;
  accountId: string;
  kind: string;
  text: string;
  createdAt: string;
};
export interface NoticeRepository {
  page(accountId: string, take: number, boundary?: NoticeBoundary): Promise<NoticeRow[]>;
}
