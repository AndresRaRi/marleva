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
async function activeSession(page, accountId) {
  const cookie = (await page.context().cookies()).find((item) => item.name === 'marleva_session');
  assert.ok(cookie?.value, 'Cookie real no vacía antes de revocarla');
  const pending = page.waitForResponse((response) => new URL(response.url()).pathname === '/v1/me');
  await page.reload({ waitUntil: 'networkidle' });
  const response = await pending;
  assert.equal(response.status(), 200, 'Control positivo de sesión antes de revocación');
  assert.equal((await response.json()).id, accountId);
  await page.getByText('Tu cuenta', { exact: true }).waitFor();
  return cookie.value;
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
    const primaryCredential = await activeSession(page, accountId);
    const secondaryCredential = await activeSession(other, accountId);
    assert.notEqual(primaryCredential, secondaryCredential, 'Dos sesiones independientes');
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
    assert.notEqual(
      await activeSession(page, accountId),
      await activeSession(other, accountId),
      'Ambas sesiones vigentes antes de cerrar todas',
    );
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
