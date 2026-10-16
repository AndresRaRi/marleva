import assert from 'node:assert/strict';
import { assertLiveBrowserTarget } from '../../../fixtures/live-browser-guard.mjs';
import { capturedCode, capturedIds, liveOtp, waitOtpCooldown } from './live-otp.mjs';

async function confirmation(page, address, code, expectedStatus) {
  await page.getByLabel('Buzón que estás verificando', { exact: true }).fill(address);
  await page.getByLabel('Código del cambio', { exact: true }).fill(code);
  const pending = page.waitForResponse((response) =>
    new URL(response.url()).pathname.endsWith('/confirmations'),
  );
  await page.getByRole('button', { name: 'Confirmar buzón', exact: true }).click();
  const response = await pending;
  assert.equal(response.status(), expectedStatus);
  return response.json();
}
async function rejectedSession(page) {
  const pending = page.waitForResponse((response) => new URL(response.url()).pathname === '/v1/me');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal((await pending).status(), 401);
  await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
}

export async function verifyLiveEmailChange(browser, page, origin, audit) {
  const address = `web-${Date.now()}@example.test`;
  assertLiveBrowserTarget(process.env, address);
  const second = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const other = await second.newPage();
  const errors = [];
  other.on('pageerror', (error) => errors.push(error.message));
  const startedAt = Date.now();
  try {
    const accountId = await liveOtp(page, address);
    await page.getByText('Tu cuenta', { exact: true }).waitFor();
    await other.goto(origin, { waitUntil: 'networkidle' });
    await waitOtpCooldown(startedAt);
    assert.equal(await liveOtp(other, address), accountId);
    await other.getByText('Tu cuenta', { exact: true }).waitFor();
    const credentials = async (context) =>
      (await context.cookies()).find((item) => item.name === 'marleva_session')?.value;
    assert.notEqual(
      await credentials(page.context()),
      await credentials(second),
      'Dos sesiones independientes',
    );
    const next = `web-${Date.now()}@example.test`;
    const oldIds = await capturedIds(address);
    const newIds = await capturedIds(next);
    await page.getByLabel('Nuevo correo', { exact: true }).fill(next);
    const change = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/v1/auth/email-changes' &&
        response.request().method() === 'POST',
    );
    const changeStartedAt = Date.now();
    await page.getByRole('button', { name: 'Iniciar cambio', exact: true }).click();
    assert.equal((await change).status(), 201);
    const oldCode = await capturedCode(address, oldIds, 'Cambio de correo Marleva local');
    const newCode = await capturedCode(next, newIds, 'Cambio de correo Marleva local');
    await confirmation(page, address, oldCode === '000000' ? '111111' : '000000', 401);
    await page.getByLabel('Código del cambio', { exact: true }).waitFor();
    assert.equal(await page.getByText('Accede a tu cuenta', { exact: true }).count(), 0);
    await confirmation(page, address, oldCode, 201);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(
      await page.getByLabel('Buzón que estás verificando', { exact: true }).inputValue(),
      next,
    );
    await audit('cambio de correo parcialmente confirmado recuperado del servidor');
    const completed = await confirmation(page, next, newCode, 201);
    assert.equal(completed.estado, 'completo');
    await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
    await rejectedSession(other);
    await waitOtpCooldown(changeStartedAt);
    const lastLoginAt = Date.now();
    assert.equal(await liveOtp(page, next), accountId);
    await page.getByText('Tu cuenta', { exact: true }).waitFor();
    await page.getByText(next, { exact: true }).first().waitFor();
    await audit('cuenta conserva identidad tras cambiar ambos buzones');
    await waitOtpCooldown(lastLoginAt);
    assert.equal(await liveOtp(other, next), accountId);
    await other.getByText('Tu cuenta', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Cerrar todas las sesiones', exact: true }).click();
    await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
    await rejectedSession(other);
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    assert.deepEqual(errors, []);
    return {
      liveIntegration: true,
      twoIndependentSessions: true,
      incorrectCodeKeepsStep: true,
      serverProgressAfterReload: true,
      bothMailboxesConfirmed: true,
      identityPreserved: true,
      emailChangeRevokesPreviousSessions: true,
      logoutAllRevokesOtherSession: true,
    };
  } finally {
    await second.close();
  }
}
