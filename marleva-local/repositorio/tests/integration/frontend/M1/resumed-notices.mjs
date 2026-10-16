import assert from 'node:assert/strict';
export async function verifyResumedNotices(browser, origin) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  let calls = 0;
  let mode = 'delayed';
  let releaseLate;
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const account = {
    id: 'account-fixture-a',
    correo: 'resume@example.test',
    operador: false,
    estado: 'active',
    pertenencia: 'sin_solicitud',
    acciones_permitidas: [],
  };
  const notice = {
    id: 'notice-fixture',
    accountId: account.id,
    kind: 'fixture',
    text: 'Aviso conservado al reabrir',
    createdAt: '2026-10-15T12:00:00Z',
  };
  await page.route('**/v1/auth/email-changes/current', (route) =>
    route.fulfill({ json: { cambio: null } }),
  );
  await page.route('**/v1/me', (route) => route.fulfill({ json: account }));
  await page.route('**/v1/notifications', async (route) => {
    calls++;
    if (mode === 'delayed') await pending;
    if (mode === 'late') {
      await new Promise((resolve) => {
        releaseLate = resolve;
      });
      return route.fulfill({
        status: 503,
        json: { codigo: 'DEPENDENCIA', mensaje: 'Respuesta tardía descartada' },
      });
    }
    if (mode === 'unavailable')
      return route.fulfill({
        status: 503,
        json: { codigo: 'DEPENDENCIA', mensaje: 'Avisos temporalmente no disponibles' },
      });
    if (mode === 'expired')
      return route.fulfill({ status: 401, json: { codigo: 'SESION', mensaje: 'Inicia sesión' } });
    return route.fulfill({ json: { items: [notice], next_cursor: null } });
  });
  try {
    const started = Date.now();
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.getByText('Consultando avisos…', { exact: true }).waitFor();
    assert.equal(await page.getByText('Todavía no hay avisos.', { exact: true }).count(), 0);
    mode = 'success';
    release();
    await page.getByText(notice.text, { exact: true }).waitFor();
    assert.equal(calls, 1, 'Una consulta por montaje de cuenta');
    const firstLoadMs = Date.now() - started;
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText(notice.text, { exact: true }).waitFor();
    assert.equal(calls, 2, 'La recarga de sesión consulta los avisos');
    mode = 'late';
    await page.getByRole('button', { name: 'Actualizar cuenta', exact: true }).click();
    await page.getByText('Consultando avisos…', { exact: true }).waitFor();
    mode = 'success';
    await page.getByRole('button', { name: 'Actualizar cuenta', exact: true }).click();
    await page.getByText(notice.text, { exact: true }).waitFor();
    releaseLate();
    await page.waitForLoadState('networkidle');
    assert.equal(await page.getByText('Respuesta tardía descartada', { exact: true }).count(), 0);
    mode = 'unavailable';
    await page.getByRole('button', { name: 'Actualizar cuenta', exact: true }).click();
    await page
      .getByRole('alert')
      .getByText('Avisos temporalmente no disponibles', { exact: true })
      .waitFor();
    assert.equal(await page.getByText('Todavía no hay avisos.', { exact: true }).count(), 0);
    await page.getByText('Tu cuenta', { exact: true }).waitFor();
    mode = 'success';
    await page.getByRole('button', { name: 'Actualizar cuenta', exact: true }).click();
    await page.getByText(notice.text, { exact: true }).waitFor();
    assert.equal(calls, 6, 'Un reintento por actualización; sin bucle por render');
    mode = 'expired';
    await page.getByRole('button', { name: 'Actualizar cuenta', exact: true }).click();
    await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
    assert.equal(await page.getByText(notice.text, { exact: true }).count(), 0);
    return {
      fixtureBrowser: true,
      initialPending: true,
      reloadRestoresNotices: true,
      unavailableNotEmpty: true,
      retry: true,
      expiredHidesNotices: true,
      lateResponseDiscarded: true,
      requests: calls,
      firstLoadMs,
    };
  } finally {
    release();
    releaseLate?.();
    await context.close();
  }
}
