import { it, expect, vi } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createDecipheriv, scryptSync } from 'node:crypto';
import { consistentCloudInventory } from '../../../../scripts/sonar-cloud-inventory.mjs';
import { encryptCloudEvidence } from '../../../../scripts/sonar-cloud-evidence.mjs';

const snapshot = (value, count = 1) => ({
  issues: Array.from({ length: count }, (_, key) => ({ key: String(key) })),
  measures: { measures: value === undefined ? [] : [{ metric: 'violations', value }] },
});

it('CI-SONAR-INV-003 | waits for complete issue publication, preserving every observation', async () => {
  const read = vi.fn().mockResolvedValueOnce(snapshot('2')).mockResolvedValue(snapshot('2', 2));
  const verify = vi.fn();
  const persist = vi.fn();
  const pause = vi.fn();
  const result = await consistentCloudInventory(read, verify, persist, undefined, pause);
  expect(result.issues).toHaveLength(2);
  expect(result.inventoryAttempts).toBe(2);
  expect(verify).toHaveBeenCalledTimes(4);
  expect(persist.mock.calls.map(([attempt, data]) => [attempt, data.issues.length])).toEqual([
    [1, 1],
    [2, 2],
  ]);
  expect(pause).toHaveBeenCalledWith(2000);
});

it('CI-SONAR-INV-003 | persistent discrepancy blocks after a bounded wait', async () => {
  const read = vi.fn().mockResolvedValue(snapshot('2'));
  const pause = vi.fn();
  const verify = vi.fn();
  await expect(consistentCloudInventory(read, verify, vi.fn(), undefined, pause)).rejects.toThrow(
    'no coincide',
  );
  expect(read).toHaveBeenCalledTimes(8);
  expect(verify).toHaveBeenCalledTimes(16);
  expect(pause.mock.calls.map(([milliseconds]) => milliseconds)).toEqual([
    2000, 4000, 8000, 16000, 32000, 32000, 32000,
  ]);
});

it.each([undefined, '', 'invalid', '-1', '1.5', '9007199254740992'])(
  'CI-SONAR-INV-003 | missing or invalid main measure blocks: %s',
  async (value) => {
    const pause = vi.fn();
    await expect(
      consistentCloudInventory(async () => snapshot(value), vi.fn(), vi.fn(), undefined, pause),
    ).rejects.toThrow('ausente o inválida');
    expect(pause).not.toHaveBeenCalled();
  },
);
it('CI-SONAR-INV-003 | PR without a count retains its documented limited scope', async () => {
  const result = await consistentCloudInventory(
    async () => snapshot(undefined, 0),
    vi.fn(),
    vi.fn(),
    '11',
    vi.fn(),
  );
  expect(result.inventoryAttempts).toBe(1);
});
it('CI-SONAR-INV-003 | concurrent revision interrupts instead of retrying an unrelated result', async () => {
  const verify = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValue(new Error('revision'));
  const pause = vi.fn();
  await expect(
    consistentCloudInventory(async () => snapshot('1'), verify, vi.fn(), undefined, pause),
  ).rejects.toThrow('revision');
  expect(pause).not.toHaveBeenCalled();
});
it('CI-SONAR-INV-003 | transport failure is not an incomplete inventory to ignore', async () => {
  const pause = vi.fn();
  await expect(
    consistentCloudInventory(
      async () => {
        throw new Error('HTTP 503');
      },
      vi.fn(),
      vi.fn(),
      undefined,
      pause,
    ),
  ).rejects.toThrow('HTTP 503');
  expect(pause).not.toHaveBeenCalled();
});
it('CI-SONAR-INV-003 | encrypted evidence includes attempts and excludes unrelated files', () => {
  const folder = mkdtempSync(path.join(tmpdir(), 'marleva-cloud-evidence-'));
  mkdirSync(path.join(folder, 'negative-result'));
  writeFileSync(path.join(folder, 'negative-result/inventory-attempt-1.json'), '{"issues":1}');
  writeFileSync(path.join(folder, 'negative-result/private.env'), 'excluded');
  writeFileSync(path.join(folder, '.scanner.env'), 'excluded');
  encryptCloudEvidence(folder, 'fixture');
  const encoded = JSON.parse(readFileSync(path.join(folder, 'evidence.enc'), 'utf8'));
  const decipher = createDecipheriv(
    'aes-256-gcm',
    scryptSync('fixture', Buffer.from(encoded.salt, 'base64'), 32),
    Buffer.from(encoded.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(encoded.tag, 'base64'));
  const contents = JSON.parse(
    Buffer.concat([
      decipher.update(Buffer.from(encoded.ciphertext, 'base64')),
      decipher.final(),
    ]).toString(),
  );
  expect(contents).toEqual({ 'negative-result/inventory-attempt-1.json': '{"issues":1}' });
});
