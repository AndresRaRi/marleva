import { it, expect, vi } from 'vitest';
import { DeliverOutbox } from '../../../../apps/api/src/modules/m1/application/use-cases/deliver-outbox.ts';
import {
  deliveryExpired,
  deliveryRetryAt,
} from '../../../../apps/api/src/modules/m1/domain/outbox-policy.ts';
const now = new Date('2030-01-01T00:00:00Z');
it('MAR-M1-UT-BE-108-E | SEQ008:S035/S050 | frontera24h y backoff1/5/30min', () => {
  expect(deliveryExpired(new Date(+now - 86400000), now)).toBe(true);
  expect(deliveryExpired(new Date(+now - 86399999), now)).toBe(false);
  expect([0, 1, 2, 8].map((n) => +deliveryRetryAt(n, now) - +now)).toEqual([
    60000, 300000, 1800000, 1800000,
  ]);
});
it('MAR-M1-UT-BE-108-F | SEQ008:S035 | trabajo caducado no se envía ni se reclama', async () => {
  const expired = vi.fn(),
    claim = vi.fn(),
    send = vi.fn();
  const item = { id: 'fixture', attempts: 0, createdAt: new Date(+now - 86400000) };
  await new DeliverOutbox(
    { ready: async () => [item], expire: expired, claim },
    { send },
    () => now,
  ).execute();
  expect(expired).toHaveBeenCalled();
  expect(claim).not.toHaveBeenCalled();
  expect(send).not.toHaveBeenCalled();
});
it('MAR-M1-UT-BE-108-G | SEQ008:S030/S050 | claim perdido no envía y fallo conserva reintento', async () => {
  const item = { id: 'fixture', createdAt: now, attempts: 0 };
  let claimed = false;
  const send = vi.fn().mockRejectedValue(new Error('SMTP down')),
    retry = vi.fn();
  const repo = { ready: async () => [item], claim: async () => claimed, retry };
  const deliver = new DeliverOutbox(repo, { send }, () => now);
  await deliver.execute();
  expect(send).not.toHaveBeenCalled();
  claimed = true;
  await deliver.execute();
  expect(retry).toHaveBeenCalledWith(
    'fixture',
    new Date(+now + 15000),
    new Date(+now + 60000),
    false,
  );
});
