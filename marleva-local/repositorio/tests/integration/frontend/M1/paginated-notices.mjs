import assert from 'node:assert/strict';
export async function verifyPaginatedNotices(browser, origin) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const account = { id: 'pagination-fixture', correo: 'pages@example.test', operador: false };
  const items = Array.from({ length: 55 }, (_, index) => ({
    id: `notice-${index}`,
    accountId: account.id,
    kind: 'fixture',
    text: `Aviso paginado ${index}`,
    createdAt: '2026-10-15T12:00:00Z',
  }));
  const cursors = [];
  let fail = true;
  await page.route('**/v1/me', (route) => route.fulfill({ json: account }));
  await page.route('**/v1/notifications*', (route) => {
    const cursor = new URL(route.request().url()).searchParams.get('cursor');
    cursors.push(cursor);
    if (cursor === '24' && fail) {
      fail = false;
      return route.fulfill({
        status: 503,
        json: { codigo: 'DEPENDENCIA', mensaje: 'Carga interrumpida' },
      });
    }
    const offset = Number(cursor ?? 0);
    return route.fulfill({
      json: {
        items: items.slice(offset, offset + 24),
        next_cursor: offset + 24 < items.length ? String(offset + 24) : null,
      },
    });
  });
  try {
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.getByText('Aviso paginado 23', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Cargar más avisos', exact: true }).click();
    await page.getByRole('alert').getByText('Carga interrumpida', { exact: true }).waitFor();
    await page.getByText('Aviso paginado 0', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Cargar más avisos', exact: true }).click();
    await page.getByText('Aviso paginado 47', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Cargar más avisos', exact: true }).click();
    await page.getByText('Aviso paginado 54', { exact: true }).waitFor();
    assert.equal(
      await page.getByRole('button', { name: 'Cargar más avisos', exact: true }).count(),
      0,
    );
    for (const item of items)
      assert.equal(await page.getByText(item.text, { exact: true }).count(), 1);
    assert.deepEqual(cursors, [null, '24', '24', '48']);
    await page.getByRole('button', { name: 'Actualizar cuenta', exact: true }).click();
    await page.getByRole('button', { name: 'Cargar más avisos', exact: true }).waitFor();
    assert.equal(await page.getByText('Aviso paginado 54', { exact: true }).count(), 0);
    assert.equal(cursors.at(-1), null);
    return {
      fixtureBrowser: true,
      items: items.length,
      requests: cursors.length,
      retryPreservesList: true,
      refreshResets: true,
    };
  } finally {
    await context.close();
  }
}
