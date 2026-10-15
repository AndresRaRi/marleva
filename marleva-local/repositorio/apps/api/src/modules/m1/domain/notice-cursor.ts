export type NoticeBoundary = { accountId: string; createdAt: string; id: string };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function encodeNoticeCursor(boundary: NoticeBoundary): string {
  return Buffer.from(
    JSON.stringify({
      v: 1,
      accountId: boundary.accountId,
      createdAt: boundary.createdAt,
      id: boundary.id,
    }),
  ).toString('base64url');
}

function validBoundaryFields(
  item: Record<string, unknown>,
): item is Record<string, unknown> & { id: string; createdAt: string } {
  return (
    typeof item.id === 'string' &&
    uuid.test(item.id) &&
    typeof item.createdAt === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(item.createdAt)
  );
}

export function decodeNoticeCursor(value: string, accountId: string): NoticeBoundary {
  if (value.length > 512 || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('cursor');
  const decoded: unknown = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  const item = cursorObject(decoded);
  if (
    Object.keys(item).sort().join(',') !== 'accountId,createdAt,id,v' ||
    item.v !== 1 ||
    item.accountId !== accountId ||
    !validBoundaryFields(item)
  )
    throw new Error('cursor');
  const milliseconds = item.createdAt.slice(0, 23) + 'Z';
  const time = new Date(milliseconds);
  if (!Number.isFinite(+time) || time.toISOString() !== milliseconds) throw new Error('cursor');
  const boundary = { accountId, createdAt: item.createdAt, id: item.id };
  if (encodeNoticeCursor(boundary) !== value) throw new Error('cursor');
  return boundary;
}

function cursorObject(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('cursor');
  return value as Record<string, unknown>;
}
