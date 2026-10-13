import path from 'node:path';
process.chdir(path.resolve(new URL('../../../..', import.meta.url).pathname));
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
try {
  await page.goto('https://localhost:8443', { waitUntil: 'networkidle' });
  await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
  await page.screenshot({ path: 'tests/results/web-access.png', fullPage: true });
  await page.screenshot({ path: 'docs/revision/M1/capturas/01-acceso.png', fullPage: true });
  await page.getByLabel('Correo', { exact: true }).fill(`web-${Date.now()}@example.test`);
  const address = await page.getByLabel('Correo', { exact: true }).inputValue();
  await page.getByRole('button', { name: 'Recibir código', exact: true }).click();
  await page.getByLabel('Código de seis cifras', { exact: true }).waitFor();
  await page.screenshot({
    path: 'docs/revision/M1/capturas/02-codigo-pendiente.png',
    fullPage: true,
  });
  let otp = '';
  for (let i = 0; i < 100; i++) {
    const j = await (await fetch('http://127.0.0.1:54324/api/v1/messages')).json();
    const m = j.messages.find((m) => m.To.some((t) => t.Address === address));
    if (m) {
      const d = await (await fetch('http://127.0.0.1:54324/api/v1/message/' + m.ID)).json();
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
    path: 'docs/revision/M1/capturas/03-codigo-invalido.png',
    fullPage: true,
  });
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
  await page.screenshot({ path: 'docs/revision/M1/capturas/04-cuenta.png', fullPage: true });
  await page.getByLabel('Nuevo correo', { exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'docs/revision/M1/capturas/05-cambio-correo.png', fullPage: true });
  await page.getByRole('button', { name: 'Cerrar esta sesión', exact: true }).click();
  await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
  assert.equal(errors.length, 0);
  await page.screenshot({
    path: 'docs/revision/M1/capturas/06-sesion-cerrada.png',
    fullPage: true,
  });
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
        },
        pageErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log('Chrome HTTPS/OTP/cuenta/cookie/almacenamiento/foco/salida: PASS');
} finally {
  await browser.close();
}
