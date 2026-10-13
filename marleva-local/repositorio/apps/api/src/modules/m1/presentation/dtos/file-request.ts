import { FileFault } from '../../domain/file-fault.js';
export function fixtureId(value: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))
    throw new FileFault('missing');
  return value;
}
export function deletionInput(body: unknown, key: string | undefined) {
  if (
    !key ||
    key.length < 16 ||
    key.length > 128 ||
    /[^\x21-\x7e]/.test(key) ||
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  )
    throw new FileFault('input');
  const fields = body as Record<string, unknown>;
  if (
    Object.keys(fields).length !== 1 ||
    !Number.isSafeInteger(fields.expected_version) ||
    (fields.expected_version as number) < 1
  )
    throw new FileFault('input');
  return { key, version: fields.expected_version as number };
}
