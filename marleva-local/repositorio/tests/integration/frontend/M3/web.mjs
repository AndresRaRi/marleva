import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const report = {
  date: new Date().toISOString(),
  browser: browser.version(),
  source: 'Expo web M3 + API Nest/PG propios',
  cases: [],
  screenshots: [],
  limits:
    'Chrome headless; no Safari ni builds Android/iOS/físicos; axe no acredita WCAG completo.',
};
const record = (id) => report.cases.push({ id, passed: true });
const shots = 'docs/revision/M3/capturas';
await mkdir(shots, { recursive: true });
try {
  const loaded = page.waitForResponse(
    (response) => response.url().includes('/v1/catalog/offers') && response.status() === 200,
  );
  await Promise.all([
    page.goto('http://127.0.0.1:8103', { waitUntil: 'domcontentloaded' }),
    loaded,
  ]);
  await page.getByRole('button', { name: 'Ver oferta', exact: true }).first().waitFor();
  record('MAR-M3-IT-FE-001-LOAD');
  const requests = [];
  page.on('request', (request) => {
    if (request.url().includes('/v1/catalog/offers')) requests.push(request.url());
  });
  await page.getByRole('textbox', { name: 'Buscar productos o servicios' }).fill('Pan');
  assert.equal(requests.length, 0);
  record('MAR-M3-PF-FE-001-NO-RENDER-REQUESTS');
  const search = page.waitForResponse((response) => response.url().includes('q=Pan'));
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await search;
  await page.getByRole('button', { name: 'Ver oferta', exact: true }).first().waitFor();
  await page.waitForFunction(() =>
    [...document.images].some(
      (img) => img.src.includes('/v1/catalog/photos/') && img.complete && img.naturalWidth > 0,
    ),
  );
  record('MAR-M3-IT-FE-009-CATALOG-IMAGE');
  await page.screenshot({ path: shots + '/01-catalogo.png', fullPage: true });
  report.screenshots.push(shots + '/01-catalogo.png');
  const next = page.waitForResponse((response) => response.url().includes('cursor='));
  await page.getByRole('button', { name: 'Ver más ofertas', exact: true }).click();
  await next;
  record('MAR-M3-IT-FE-001-PAGE');
  await page.getByRole('button', { name: 'Ver oferta', exact: true }).first().click();
  await page.getByRole('button', { name: /Ver oferente:/ }).waitFor();
  record('MAR-M3-IT-FE-002-DETAIL');
  await page.waitForFunction(() =>
    [...document.images].some(
      (img) => img.src.includes('/detail') && img.complete && img.naturalWidth > 0,
    ),
  );
  record('MAR-M3-IT-FE-009-DETAIL-IMAGES');
  await page.screenshot({ path: shots + '/02-detalle.png', fullPage: true });
  report.screenshots.push(shots + '/02-detalle.png');
  const detailAxe = await new AxeBuilder({ page }).analyze();
  assert.equal(
    detailAxe.violations.length,
    0,
    JSON.stringify(detailAxe.violations.map((item) => item.id)),
  );
  await page.getByRole('button', { name: /Ver oferente:/ }).click();
  await page.getByRole('button', { name: 'Ver oferta', exact: true }).first().waitFor();
  record('MAR-M3-IT-FE-003-SELLER');
  await page.screenshot({ path: shots + '/03-oferente.png', fullPage: true });
  report.screenshots.push(shots + '/03-oferente.png');
  await page.getByRole('button', { name: 'Volver al catálogo', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Buscar productos o servicios' })
    .fill('sin-resultados-' + Date.now());
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await page.getByText('No encontramos ofertas con estos filtros.', { exact: false }).waitFor();
  record('MAR-M3-IT-FE-001-EMPTY');
  await page.route('**/v1/catalog/offers?**', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: '{"codigo":"UNAVAILABLE"}',
    }),
  );
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await page.getByRole('button', { name: 'Volver a intentar', exact: true }).waitFor();
  record('MAR-M3-IT-FE-001-ERROR-CONTROLLED');
  await page.unroute('**/v1/catalog/offers?**');
  await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click();
  await page.getByRole('button', { name: 'Ver oferta', exact: true }).first().waitFor();
  await page.getByRole('button', { name: 'Filtros', exact: true }).click();
  const filtered = page.waitForResponse(
    (response) => response.url().includes('category=classes') && response.status() === 200,
  );
  await page.getByRole('button', { name: 'Clases', exact: true }).click();
  const filterBody = await (await filtered).json();
  assert.ok(filterBody.items.length > 0);
  assert.ok(filterBody.items.every((item) => item.category === 'classes'));
  await page.getByRole('button', { name: 'Cerrar filtros', exact: true }).click();
  record('MAR-M3-IT-FE-001-FILTER');
  await page.getByRole('textbox', { name: 'Buscar productos o servicios' }).fill('repostería');
  const keyboard = page.waitForResponse(
    (response) => response.url().includes('q=reposter') && response.status() === 200,
  );
  await page.getByRole('textbox', { name: 'Buscar productos o servicios' }).press('Enter');
  await keyboard;
  await page.getByRole('button', { name: 'Ver oferta', exact: true }).first().waitFor();
  record('MAR-M3-IT-FE-001-KEYBOARD');
  await page.route('**/v1/catalog/offers/*', (route) =>
    route.fulfill({ status: 404, contentType: 'application/json', body: '{"codigo":"NOT_FOUND"}' }),
  );
  await page.getByRole('button', { name: 'Ver oferta', exact: true }).first().click();
  await page.getByText('Esta oferta ya no está disponible.', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: /Ver oferente:/ }).count(), 0);
  await page.unroute('**/v1/catalog/offers/*');
  await page.getByRole('button', { name: 'Volver a intentar', exact: true }).click();
  await page.getByRole('button', { name: /Ver oferente:/ }).waitFor();
  record('MAR-M3-IT-FE-002-RETIRED-RECOVERY');
  await page.getByRole('button', { name: 'Volver al catálogo', exact: true }).click();
  assert.equal(
    await page.getByRole('textbox', { name: 'Buscar productos o servicios' }).inputValue(),
    'repostería',
  );
  record('MAR-M3-IT-FE-001-RETURN-FILTERS');
  await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click();
  await page.getByRole('button', { name: 'Ver oferta', exact: true }).first().waitFor();
  const axe = await new AxeBuilder({ page }).analyze();
  report.axe = {
    catalog: axe.violations.map((item) => item.id),
    detail: detailAxe.violations.map((item) => item.id),
  };
  assert.equal(axe.violations.length, 0, JSON.stringify(report.axe));
  for (const viewport of [
    { width: 320, height: 640 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    record('MAR-M3-IT-FE-001-WIDTH-' + viewport.width);
  }
  await page.route('**/v1/catalog/photos/**', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
  );
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('La foto no está disponible.', { exact: true }).first().waitFor();
  await page.getByRole('button', { name: 'Ver oferta', exact: true }).first().waitFor();
  record('MAR-M3-IT-FE-009-FALLBACK-CONTROLLED');
  await page.unroute('**/v1/catalog/photos/**');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() =>
    [...document.images].some(
      (img) => img.src.includes('/v1/catalog/photos/') && img.complete && img.naturalWidth > 0,
    ),
  );
  record('MAR-M3-IT-FE-009-IMAGE-RECOVERY');
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = String(error);
  await page.screenshot({ path: shots + '/fallo-web.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
  await writeFile('tests/results/m3-web.json', JSON.stringify(report, null, 2) + '\n');
}
