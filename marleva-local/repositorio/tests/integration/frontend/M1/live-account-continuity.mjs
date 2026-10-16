import assert from 'node:assert/strict';
import { liveBrowserData } from '../../../fixtures/live-browser-data.mjs';
import { liveOtp, waitOtpCooldown } from './live-otp.mjs';

function noticesResponse(page) {
  return page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/v1/notifications',
  );
}
async function sessionCredential(page) {
  const cookie = (await page.context().cookies()).find((item) => item.name === 'marleva_session');
  assert.ok(cookie?.value, 'Cookie de sesión real requerida');
  return cookie.value;
}
async function readNotices(page, action) {
  const pending = noticesResponse(page);
  await action();
  const response = await pending;
  assert.equal(response.status(), 200);
  return response.json();
}
async function expireNotices(page, fixture) {
  await fixture.revoke(await sessionCredential(page));
  const pending = noticesResponse(page);
  await page.getByRole('button', { name: 'Cargar más avisos', exact: true }).click();
  assert.equal((await pending).status(), 401);
  await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
  for (const row of fixture.rows)
    assert.equal(await page.getByText(row.text, { exact: true }).count(), 0);
}

export async function verifyLiveAccountContinuity(page, address, challengeStartedAt, audit) {
  const startedAt = Date.now();
  const fixture = await liveBrowserData(address, await sessionCredential(page));
  const requests = [];
  const mutations = [];
  const listener = (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname === '/v1/notifications') requests.push(pathname);
    if (pathname.startsWith('/v1/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method()))
      mutations.push({ pathname, method: request.method() });
  };
  page.on('request', listener);
  try {
    await page.getByRole('tab', { name: 'Avisos', exact: true }).click();
    await page.waitForLoadState('networkidle');
    const before = requests.length;
    let body = await readNotices(page, () =>
      page.getByRole('button', { name: 'Actualizar cuenta', exact: true }).click(),
    );
    const all = [];
    let pages = 0;
    do {
      pages++;
      assert.ok(pages <= 10, 'Paginación acotada');
      for (const item of body.items) {
        assert.equal(item.accountId, fixture.accountId);
        all.push(item);
      }
      if (!body.next_cursor) break;
      body = await readNotices(page, () =>
        page.getByRole('button', { name: 'Cargar más avisos', exact: true }).click(),
      );
    } while (pages < 10);
    assert.equal(body.next_cursor, null, 'Paginación debe terminar');
    assert.equal(requests.length - before, pages, 'Una solicitud por acción aceptada');
    assert.equal(new Set(all.map((item) => item.id)).size, all.length);
    for (const row of fixture.rows) {
      assert.ok(all.some((item) => item.id === row.id));
      await page.getByText(row.text, { exact: true }).waitFor();
      assert.equal(await page.getByText(row.text, { exact: true }).count(), 1);
    }
    await audit('avisos paginados con PG/Auth reales');
    const first = await readNotices(page, () => page.reload({ waitUntil: 'networkidle' }));
    assert.deepEqual(
      first.items.map((item) => item.id),
      all.slice(0, first.items.length).map((item) => item.id),
    );
    assert.ok(first.next_cursor);
    for (const row of all.slice(first.items.length))
      assert.equal(await page.getByText(row.text, { exact: true }).count(), 0);
    await page.getByRole('tab', { name: 'Avisos', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await expireNotices(page, fixture);
    const cooldownWaitMs = await waitOtpCooldown(challengeStartedAt);
    assert.equal(await liveOtp(page, address), fixture.accountId);
    await page.getByText('Avisos de cuenta', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Cargar más avisos', exact: true }).waitFor();
    await audit('retorno a avisos tras OTP real de la misma cuenta');
    await expireNotices(page, fixture);
    const otherAddress = `web-other-${Date.now()}@example.test`;
    assert.notEqual(await liveOtp(page, otherAddress), fixture.accountId);
    await page.getByText('Tu cuenta', { exact: true }).waitFor();
    for (const row of fixture.rows)
      assert.equal(await page.getByText(row.text, { exact: true }).count(), 0);
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    assert.ok(mutations.length === 4, 'Solo dos desafíos y dos verificaciones');
    for (const mutation of mutations) {
      assert.equal(mutation.method, 'POST');
      assert.ok(
        ['/v1/auth/challenges', '/v1/auth/verifications'].includes(mutation.pathname),
        'Sin reproducción automática de mutaciones de negocio',
      );
    }
    return {
      liveIntegration: true,
      provider: 'Supabase Auth local CI',
      datastore: 'PostgreSQL CI',
      seededNotices: fixture.rows.length,
      pages,
      paginationRequests: pages,
      sameAccountReturn: true,
      differentAccountDiscard: true,
      cooldownWaitMs,
      durationExcludingCooldownMs: Date.now() - startedAt - cooldownWaitMs,
    };
  } finally {
    page.off('request', listener);
    await fixture.close();
  }
}
