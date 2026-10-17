import { it, expect, vi } from 'vitest';
const probe = vi.hoisted(() => vi.fn());
vi.mock('../../../../apps/api/src/readiness.js', () => ({ readiness: probe }));
import { HealthController } from '../../../../apps/api/src/health.controller';
it('MAR-M1-UT-BE-110-LIVE | liveness no consulta ni depende de servicios', () => {
  expect(new HealthController().live()).toEqual({ status: 'alive' });
  expect(probe).not.toHaveBeenCalled();
});
it('MAR-M1-UT-BE-110-CONTROLLER | readiness exige resultado del comprobador', async () => {
  const controller = new HealthController();
  probe.mockResolvedValueOnce({ status: 'ready', mode: 'local', payment: 'simulated' });
  await expect(controller.ready()).resolves.toMatchObject({ status: 'ready' });
  const failure = new Error('fixture-dependency');
  probe.mockRejectedValueOnce(failure);
  await expect(controller.ready()).rejects.toBe(failure);
});
