import { it, expect } from 'vitest';
import { originWait } from '../../../../apps/api/dist/modules/m1/domain/otp-origin-limit.js';
it('MAR-M1-UT-BE-101-H | SEQ001:S040 | ventana móvil calcula cuándo quedan menos de30', () => {
  const now = new Date('2026-10-13T12:00:00Z'),
    recent = Array.from({ length: 30 }, (_, i) => new Date(+now - 3590000 + i * 100));
  expect(originWait(recent.slice(1), now)).toBe(0);
  expect(originWait(recent, now)).toBe(10);
  expect(originWait([...recent, new Date(+now)], now)).toBe(11);
  expect(originWait(recent, new Date(+now + 10000))).toBe(0);
  expect(originWait(Array(30).fill(new Date(+now - 3600000)), now)).toBe(0);
});
