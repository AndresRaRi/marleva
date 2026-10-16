import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
if (process.env.MARLEVA_M3_CHECK !== '1') throw Error('Ensayo propio M3 requerido.');
const sessions = JSON.parse(await readFile('artifacts/m3/private-session.json', 'utf8'));
if (Date.parse(sessions.expires) <= Date.now())
  throw Error('Sesiones ficticias expiradas; reiniciar solo composición M3.');
const browser = await chromium.launch({
  channel: process.env.M3_CI === '1' ? undefined : 'chrome',
  headless: true,
});
const report = {
  date: new Date().toISOString(),
  browser: browser.version(),
  source:
    'Expo M3 + dos composiciones Nest + PostgreSQL + procesador real; identidad ficticia inyectada',
  cases: [],
  screenshots: [],
  limits:
    'No acredita proveedor M1/M2/M8 real, MFA de personas, Safari, iOS/Android o WCAG completo.',
};
const shots = 'docs/revision/M3/capturas';
await mkdir(shots, { recursive: true });
const title = 'Pan ficticio integral ' + Date.now();
const record = (id) => report.cases.push({ id, passed: true });
async function actorPage(token) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addCookies([
    {
      name: 'm3_fixture_session',
      value: token,
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Strict',
      secure: false,
    },
  ]);
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8103', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Mis ofertas', exact: true }).click();
  await page.getByRole('heading', { name: 'Mis ofertas', exact: true }).waitFor();
  return page;
}
async function shot(page, name) {
  const file = shots + '/' + name + '.png';
  await page.screenshot({ path: file, fullPage: true });
  report.screenshots.push(file);
}
async function openReview(page) {
  await page.getByRole('button', { name: 'Volver al catálogo', exact: true }).click();
  await page.getByRole('button', { name: 'Mis ofertas', exact: true }).click();
  await page.getByRole('button', { name: 'Por revisar', exact: true }).click();
  await page
    .getByText(title, { exact: true })
    .locator('..')
    .getByRole('button', { name: 'Revisar oferta', exact: true })
    .click();
  await page.getByRole('heading', { name: 'Revisar versión', exact: true }).waitFor();
}
let owner, reviewer, offerId;
try {
  owner = await actorPage(sessions.owner);
  await owner.getByRole('button', { name: 'Nueva oferta', exact: true }).waitFor();
  await shot(owner, '04-mis-ofertas');
  await owner.getByRole('button', { name: 'Nueva oferta', exact: true }).click();
  await owner.getByRole('textbox', { name: 'Título', exact: true }).fill(title);
  await owner
    .getByRole('textbox', { name: 'Descripción', exact: true })
    .fill('Oferta ficticia para comprobar el recorrido completo de M3 sin datos reales.');
  await owner.getByRole('button', { name: 'Comida y postres', exact: true }).click();
  await owner.getByRole('button', { name: 'Continuar', exact: true }).click();
  await owner.getByRole('textbox', { name: 'Precio en pesos MXN', exact: true }).fill('120.50');
  await owner.getByRole('textbox', { name: 'Cantidad disponible', exact: true }).fill('5');
  await owner.getByRole('button', { name: 'Gran Santa Fe I', exact: true }).click();
  await owner.getByRole('button', { name: 'Entrega', exact: true }).click();
  await owner
    .getByRole('textbox', { name: 'Ingredientes', exact: true })
    .fill('Plátano, harina y huevo ficticios');
  await owner.getByRole('textbox', { name: 'Alérgenos', exact: true }).fill('Trigo y huevo');
  await owner
    .getByRole('textbox', { name: 'Conservación', exact: true })
    .fill('Mantener en recipiente cerrado');
  await owner.getByRole('button', { name: 'Continuar', exact: true }).click();
  let dropped = false;
  const keys = [];
  await owner.route('http://127.0.0.1:3104/v1/offers', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    keys.push(route.request().headers()['idempotency-key']);
    if (!dropped) {
      dropped = true;
      const actual = await route.fetch();
      assert.equal(actual.status(), 200);
      offerId = (await actual.json()).id;
      await route.abort('failed');
      return;
    }
    await route.continue();
  });
  await owner.getByRole('button', { name: 'Guardar borrador', exact: true }).click();
  await owner.getByText('Tus datos se conservan', { exact: false }).waitFor();
  assert.equal(await owner.getByText('Paso 3 de 3', { exact: true }).count(), 1);
  await owner.getByRole('button', { name: 'Guardar borrador', exact: true }).click();
  await owner.getByText('Borrador guardado.', { exact: false }).waitFor();
  assert.equal(keys.length, 2);
  assert.equal(keys[0], keys[1]);
  await owner.unroute('http://127.0.0.1:3104/v1/offers');
  record('MAR-M3-IT-FE-004-LOST-RESPONSE-IDEMPOTENT');
  const image = await sharp({
    create: { width: 640, height: 480, channels: 3, background: '#c65438' },
  })
    .png()
    .toBuffer();
  await owner
    .getByLabel('Añadir foto', { exact: true })
    .setInputFiles({ name: 'foto-ficticia.png', mimeType: 'image/png', buffer: image });
  await owner.getByText('1 de 6 fotos', { exact: true }).waitFor();
  await owner.waitForFunction(() =>
    [...document.images].some(
      (img) => img.src.startsWith('data:image/jpeg') && img.complete && img.naturalWidth > 0,
    ),
  );
  record('MAR-M3-IT-FE-009-PRIVATE-UPLOAD-PREVIEW');
  await shot(owner, '05-borrador-con-foto');
  const axeForm = await new AxeBuilder({ page: owner }).analyze();
  assert.equal(axeForm.violations.length, 0, JSON.stringify(axeForm.violations.map((v) => v.id)));
  report.axe = { form: axeForm.violations.map((v) => v.id) };
  await owner.getByRole('button', { name: 'Enviar a revisión', exact: true }).click();
  await owner.getByText('Tu oferta se envió a revisión.', { exact: false }).waitFor();
  record('MAR-M3-IT-FE-005-SUBMIT');
  await owner.getByRole('button', { name: 'Volver a mis ofertas', exact: true }).click();
  reviewer = await actorPage(sessions.reviewer);
  await reviewer.getByRole('button', { name: 'Por revisar', exact: true }).click();
  await reviewer
    .getByText(title, { exact: true })
    .locator('..')
    .getByRole('button', { name: 'Revisar oferta', exact: true })
    .click();
  await reviewer
    .getByRole('textbox', { name: 'Motivo de la decisión', exact: true })
    .fill('Revisión ficticia de datos y foto de la versión exacta.');
  await reviewer.waitForFunction(() =>
    [...document.images].some(
      (img) => img.src.startsWith('data:image/jpeg') && img.complete && img.naturalWidth > 0,
    ),
  );
  await shot(reviewer, '06-revision-con-foto');
  const axeReview = await new AxeBuilder({ page: reviewer }).analyze();
  assert.equal(
    axeReview.violations.length,
    0,
    JSON.stringify(axeReview.violations.map((v) => v.id)),
  );
  report.axe.review = axeReview.violations.map((v) => v.id);
  await reviewer.getByRole('button', { name: 'Aprobar', exact: true }).click();
  await reviewer.getByText('Decisión guardada.', { exact: true }).waitFor();
  record('MAR-M3-IT-FE-006-APPROVE-OTHER-ACTOR');
  const publicResponse = await owner.request.get(
    'http://127.0.0.1:3103/v1/catalog/offers/' + offerId,
  );
  assert.equal(publicResponse.status(), 200);
  const publicOffer = await publicResponse.json();
  assert.equal(publicOffer.price_cents, 12050);
  assert.equal(publicOffer.photos.length, 1);
  assert.equal((await owner.request.get(publicOffer.photos[0].url)).status(), 200);
  record('MAR-M3-IT-FE-002-PUBLISHED-INTEGRATED');
  await owner
    .getByText(title, { exact: true })
    .locator('..')
    .getByRole('button', { name: 'Abrir oferta', exact: true })
    .click();
  await owner.getByRole('button', { name: 'Continuar', exact: true }).click();
  await owner.getByRole('textbox', { name: 'Cantidad disponible', exact: true }).fill('3');
  await owner.getByRole('button', { name: 'Continuar', exact: true }).click();
  await owner.getByRole('button', { name: 'Guardar borrador', exact: true }).click();
  await owner.getByText('Borrador guardado.', { exact: false }).waitFor();
  const edited = await (
    await owner.request.get('http://127.0.0.1:3104/v1/offers/' + offerId)
  ).json();
  assert.equal(edited.versions[0].stock, 5);
  assert.equal(edited.versions.at(-1).stock, 3);
  assert.equal(
    (await owner.request.get('http://127.0.0.1:3103/v1/catalog/offers/' + offerId)).status(),
    404,
  );
  record('MAR-M3-IT-FE-004-IMMUTABLE-VERSION-STOCK');
  await owner.getByRole('button', { name: 'Enviar a revisión', exact: true }).click();
  await owner.getByText('Tu oferta se envió a revisión.', { exact: false }).waitFor();
  await owner.getByRole('button', { name: 'Volver a mis ofertas', exact: true }).click();
  await openReview(reviewer);
  await reviewer
    .getByRole('textbox', { name: 'Motivo de la decisión', exact: true })
    .fill('Corrección ficticia de la descripción.');
  await reviewer.getByRole('button', { name: 'Pedir corrección', exact: true }).click();
  await reviewer.getByText('Decisión guardada.', { exact: true }).waitFor();
  record('MAR-M3-IT-FE-006-CORRECTION');
  await owner
    .getByText(title, { exact: true })
    .locator('..')
    .getByRole('button', { name: 'Abrir oferta', exact: true })
    .click();
  await owner
    .getByRole('textbox', { name: 'Descripción', exact: true })
    .fill('Oferta ficticia corregida y completa para el recorrido de M3 sin datos reales.');
  await owner.getByRole('button', { name: 'Continuar', exact: true }).click();
  await owner.getByRole('button', { name: 'Continuar', exact: true }).click();
  await owner.getByRole('button', { name: 'Enviar a revisión', exact: true }).click();
  await owner.getByText('Tu oferta se envió a revisión.', { exact: false }).waitFor();
  await owner.getByRole('button', { name: 'Volver a mis ofertas', exact: true }).click();
  await openReview(reviewer);
  await reviewer
    .getByRole('textbox', { name: 'Motivo de la decisión', exact: true })
    .fill('Corrección ficticia revisada en una versión nueva.');
  await reviewer.getByRole('button', { name: 'Aprobar', exact: true }).click();
  await reviewer.getByText('Decisión guardada.', { exact: true }).waitFor();
  await owner.getByRole('button', { name: 'Volver al catálogo', exact: true }).click();
  await owner.getByRole('button', { name: 'Mis ofertas', exact: true }).click();
  await owner
    .getByText(title, { exact: true })
    .locator('..')
    .getByRole('button', { name: 'Pausar oferta', exact: true })
    .click();
  await owner.getByText('Oferta pausada.', { exact: false }).waitFor();
  assert.equal(
    (await owner.request.get('http://127.0.0.1:3103/v1/catalog/offers/' + offerId)).status(),
    404,
  );
  record('MAR-M3-IT-FE-007-PAUSE-WITHDRAWAL');
  for (const width of [320, 1280]) {
    await owner.setViewportSize({ width, height: 900 });
    assert.equal(
      await owner.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
  }
  record('MAR-M3-IT-FE-004-RESPONSIVE');
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = String(error);
  if (owner) await shot(owner, 'fallo-gestion');
  if (reviewer) await shot(reviewer, 'fallo-revision');
  throw error;
} finally {
  await browser.close();
  await writeFile('tests/results/m3-management-web.json', JSON.stringify(report, null, 2) + '\n');
}
