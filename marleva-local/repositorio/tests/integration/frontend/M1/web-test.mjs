import { verifyLiveAccountContinuity } from './live-account-continuity.mjs';
import { verifyPaginatedNotices } from './paginated-notices.mjs';
import path from 'node:path';
process.chdir(path.resolve(new URL('../../../..', import.meta.url).pathname));
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { verifyResumedNotices } from './resumed-notices.mjs';
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    (process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined),
  headless: true,
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
const accessibility = [];
const captures = process.env.MARLEVA_CAPTURE_DIR ?? 'docs/revision/M1/capturas';
await mkdir(captures, { recursive: true });
await mkdir('artifacts/ci', { recursive: true });
async function audit(state) {
  const result = await new AxeBuilder({ page }).analyze();
  const violations = result.violations.map(({ id, impact, help, nodes }) => ({
    id,
    impact,
    help,
    targets: nodes.map((node) => node.target),
  }));
  accessibility.push({ state, violations });
  assert.equal(
    violations.length,
    0,
    `Accesibilidad ${state}: ${violations.map((v) => v.id).join(', ')}`,
  );
}
page.on('pageerror', (e) => errors.push(e.message));
try {
  await page.goto(process.env.APP_ORIGIN ?? 'https://localhost:8443', { waitUntil: 'networkidle' });
  await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
  await page.screenshot({ path: 'tests/results/web-access.png', fullPage: true });
  await page.screenshot({ path: captures + '/01-acceso.png', fullPage: true });
  await audit('acceso');
  await page.getByLabel('Correo', { exact: true }).fill(`web-${Date.now()}@example.test`);
  const address = await page.getByLabel('Correo', { exact: true }).inputValue();
  const challengeStartedAt = Date.now();
  await page.getByRole('button', { name: 'Recibir código', exact: true }).click();
  await page.getByLabel('Código de seis cifras', { exact: true }).waitFor();
  await page.screenshot({
    path: captures + '/02-codigo-pendiente.png',
    fullPage: true,
  });
  let otp = '';
  for (let i = 0; i < 100; i++) {
    const mailpit = process.env.MAILPIT_URL ?? 'http://127.0.0.1:54324';
    const j = await (await fetch(mailpit + '/api/v1/messages')).json();
    const m = j.messages.find((m) => m.To.some((t) => t.Address === address));
    if (m) {
      const d = await (await fetch(mailpit + '/api/v1/message/' + m.ID)).json();
      otp = (d.Text + ' ' + d.HTML).match(/\b\d{6}\b/)?.[0] ?? '';
      if (otp) break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(otp, 'Código local no recibido');
  await page
    .getByLabel('Código de seis cifras', { exact: true })
    .fill(otp === '000000' ? '111111' : '000000');
  await page.getByRole('button', { name: 'Verificar código', exact: true }).click();
  await page.getByText('El código no es válido o venció', { exact: true }).waitFor();
  await page.getByLabel('Código de seis cifras', { exact: true }).fill('');
  await page.screenshot({
    path: captures + '/03-codigo-invalido.png',
    fullPage: true,
  });
  await audit('código inválido y campo vacío');
  await page.getByLabel('Código de seis cifras', { exact: true }).fill(otp);
  await page.getByRole('button', { name: 'Verificar código', exact: true }).click();
  await page.getByText('Tu cuenta', { exact: true }).waitFor();
  assert.equal(
    await page.evaluate(() => localStorage.length),
    0,
    'Credenciales no deben ir a localStorage',
  );
  const cookies = await context.cookies();
  const session = cookies.find((c) => c.name === 'marleva_session');
  assert.ok(
    session?.httpOnly && session?.secure && session?.sameSite === 'Strict',
    'Cookie segura',
  );
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => document.activeElement?.tagName);
  assert.notEqual(focus, 'BODY');
  await page.screenshot({ path: 'tests/results/web-account.png', fullPage: true });
  await page.getByText('Tu cuenta', { exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: captures + '/04-cuenta.png', fullPage: true });
  await audit('cuenta');
  await page.getByLabel('Nuevo correo', { exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: captures + '/05-cambio-correo.png', fullPage: true });
  const restored = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/v1/notifications' && response.status() === 200,
  );
  await page.reload({ waitUntil: 'networkidle' });
  const restoredNotices = await (await restored).json();
  await page.getByText('Tu cuenta', { exact: true }).waitFor();
  for (const item of restoredNotices.items)
    await page.getByText(item.text, { exact: true }).first().waitFor();
  if (restoredNotices.items.length === 0)
    await page.getByText('Todavía no hay avisos.', { exact: true }).waitFor();
  const liveAccountContinuity = await verifyLiveAccountContinuity(
    page,
    address,
    challengeStartedAt,
    audit,
  );
  await page.getByRole('button', { name: 'Cerrar esta sesión', exact: true }).click();
  await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
  assert.equal(errors.length, 0);
  await page.screenshot({
    path: captures + '/06-sesion-cerrada.png',
    fullPage: true,
  });
  const resumedNotices = await verifyResumedNotices(
    browser,
    process.env.APP_ORIGIN ?? 'https://localhost:8443',
  );
  const paginatedNotices = await verifyPaginatedNotices(
    browser,
    process.env.APP_ORIGIN ?? 'https://localhost:8443',
  );
  await writeFile(
    'tests/results/web-test.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        browser: await browser.version(),
        viewport: { width: 390, height: 844 },
        cases: {
          https: true,
          otp: true,
          account: true,
          cookie: true,
          noLocalStorage: true,
          keyboardFocus: true,
          logout: true,
          realSessionReloadNotices: true,
          liveAccountContinuity,
          resumedNotices,
          paginatedNotices,
        },
        pageErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log('Chrome HTTPS/OTP/cuenta/cookie/almacenamiento/foco/salida: PASS');
} finally {
  await writeFile(
    'artifacts/ci/axe.json',
    JSON.stringify({ date: new Date().toISOString(), accessibility }, null, 2) + '\n',
  );
  await browser.close();
}
