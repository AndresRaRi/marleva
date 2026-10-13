import { Prisma } from '../../../../generated/prisma/client.js';
import type { Database } from '../../../../database.js';
import type { NoticeBoundary } from '../../domain/notice-cursor.js';
import type { NoticeRepository, NoticeRow } from '../../application/ports/notice-repository.js';

export class PrismaNoticeRepository implements NoticeRepository {
  constructor(private readonly db: Database) {}

  page(accountId: string, take: number, boundary?: NoticeBoundary): Promise<NoticeRow[]> {
    // SQL retains PostgreSQL microseconds; Date/Prisma conversion would lose the cursor boundary.
    const after = boundary
      ? Prisma.sql`AND ("createdAt", id) < (${boundary.createdAt}::timestamptz, ${boundary.id}::uuid)`
      : Prisma.empty;
    return this.db.$queryRaw<NoticeRow[]>(Prisma.sql`
      SELECT id, "accountId", kind, text,
        to_char("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"
      FROM marleva."Notice" AS notice
      WHERE "accountId" = ${accountId}::uuid ${after}
      ORDER BY notice."createdAt" DESC, notice.id DESC LIMIT ${take}
    `);
  }
}
