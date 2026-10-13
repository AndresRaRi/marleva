import { fail } from '../../../../security.js';
import { decodeNoticeCursor, type NoticeBoundary } from '../../domain/notice-cursor.js';

export class NoticeQuery {
  private constructor(
    public readonly limit: number,
    public readonly boundary?: NoticeBoundary,
  ) {}

  static parse(query: unknown, accountId: string): NoticeQuery {
    try {
      if (!query || typeof query !== 'object' || Array.isArray(query)) throw new Error('query');
      const input = query as Record<string, unknown>;
      if (Object.keys(input).some((key) => !['limit', 'cursor'].includes(key)))
        throw new Error('query');
      if (
        input.limit !== undefined &&
        (typeof input.limit !== 'string' || !/^[1-9]\d?$/.test(input.limit))
      )
        throw new Error('limit');
      const limit = input.limit === undefined ? 24 : Number(input.limit);
      if (limit > 50) throw new Error('limit');
      if (input.cursor !== undefined && typeof input.cursor !== 'string') throw new Error('cursor');
      return new NoticeQuery(
        limit,
        input.cursor === undefined
          ? undefined
          : decodeNoticeCursor(input.cursor as string, accountId),
      );
    } catch {
      fail(
        422,
        'PAGINACION',
        'No pudimos leer esta página de avisos',
        'Vuelve a consultar desde la primera página',
      );
    }
  }
}
