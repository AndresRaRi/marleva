import assert from 'node:assert/strict';
import { generate } from 'otplib';
import AxeBuilder from '@axe-core/playwright';
import { liveOtp, waitOtpCooldown } from './live-otp.mjs';
async function action(page, label, pathname, status) {
  const pending = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === pathname && response.request().method() !== 'OPTIONS',
  );
  const [response] = await Promise.all([
    pending,
    page.getByRole('button', { name: label, exact: true }).click(),
  ]);
  if (Array.isArray(status)) assert.ok(status.includes(response.status()), label);
  else assert.equal(response.status(), status, label);
  return response.json();
}
async function factor(page, secret) {
  await page
    .getByLabel('Código del segundo factor', { exact: true })
    .fill(await generate({ secret }));
  await action(page, 'Verificar segundo factor', '/v1/auth/mfa/verifications', 201);
  await action(page, 'Comprobar permiso de operador', '/v1/operator/access', 200);
}
async function audit(page) {
  assert.deepEqual(
    (await new AxeBuilder({ page }).analyze()).violations.map((item) => item.id),
    [],
  );
}
export async function recoveryOperatorBrowser(browser, origin, fixture) {
  const owner = fixture.operators.find((item) => item.name === 'owner');
  const reviewer = fixture.operators.find((item) => item.name === 'reviewer');
  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  const pages = await Promise.all(contexts.map((context) => context.newPage()));
  const [page, other] = pages;
  const errors = [];
  for (const current of pages) current.on('pageerror', (error) => errors.push(error.message));
  let startedAt = Date.now();
  try {
    await page.goto(origin, { waitUntil: 'networkidle' });
    assert.equal(await liveOtp(page, fixture.prefix + '-owner@example.test'), owner.accountId);
    await page.getByText('Tu cuenta', { exact: true }).waitFor();
    await action(page, 'Comprobar permiso de operador', '/v1/operator/access', 403);
    await factor(page, owner.factorSecret);
    await audit(page);
    await other.goto(origin, { waitUntil: 'networkidle' });
    assert.equal(
      await liveOtp(other, fixture.prefix + '-reviewer@example.test'),
      reviewer.accountId,
    );
    await other.getByText('Tu cuenta', { exact: true }).waitFor();
    await factor(other, reviewer.factorSecret);
    await page.getByRole('tab', { name: 'Ayuda', exact: true }).click();
    await page
      .getByLabel('Motivo de recuperación', { exact: true })
      .fill('Perdí únicamente el factor ficticio designado de B12');
    const record = await action(page, 'Solicitar recuperación', '/v1/auth/mfa-recoveries', 202);
    assert.match(record.id, /^[a-f0-9-]{36}$/);
    assert.equal(record.state, 'requested');
    await page.getByLabel('Referencia de solicitud a revisar', { exact: true }).fill(record.id);
    await action(
      page,
      'Consultar solicitud a revisar',
      `/v1/auth/mfa-recoveries/${record.id}`,
      200,
    );
    await action(
      page,
      'Aprobar recuperación ajena',
      `/v1/auth/mfa-recoveries/${record.id}/approvals`,
      403,
    );
    await other.getByRole('tab', { name: 'Ayuda', exact: true }).click();
    await other.getByLabel('Referencia de solicitud a revisar', { exact: true }).fill(record.id);
    await action(
      other,
      'Consultar solicitud a revisar',
      `/v1/auth/mfa-recoveries/${record.id}`,
      200,
    );
    await action(
      other,
      'Aprobar recuperación ajena',
      `/v1/auth/mfa-recoveries/${record.id}/approvals`,
      202,
    );
    // Poll only a read through the UI; the real durable worker performs the transition.
    let expired = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      const result = await action(
        page,
        'Consultar estado de recuperación',
        '/v1/auth/mfa-recoveries/current',
        [200, 401],
      );
      if (['SESION', 'SESION_VENCIDA'].includes(result.codigo)) {
        expired = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    assert.ok(expired, 'Worker revoca sesión del operador');
    await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
    await waitOtpCooldown(startedAt);
    startedAt = Date.now();
    assert.equal(await liveOtp(page, fixture.prefix + '-owner@example.test'), owner.accountId);
    await page.getByText('Ayuda con tu acceso', { exact: true }).waitFor();
    await page.getByText('Puedes configurar tu nuevo factor', { exact: true }).waitFor();
    await action(
      page,
      'Solicitar autorización temporal',
      `/v1/auth/mfa-recoveries/${record.id}/capabilities`,
      201,
    );
    const enrolled = await action(
      page,
      'Preparar nuevo factor',
      `/v1/auth/mfa-recoveries/${record.id}/enrollments`,
      201,
    );
    const secret = new URL(enrolled.uri).searchParams.get('secret');
    assert.ok(secret);
    await page
      .getByLabel('Código del nuevo factor', { exact: true })
      .fill(await generate({ secret }));
    await action(
      page,
      'Completar recuperación',
      `/v1/auth/mfa-recoveries/${record.id}/verifications`,
      201,
    );
    await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
    await waitOtpCooldown(startedAt);
    assert.equal(await liveOtp(page, fixture.prefix + '-owner@example.test'), owner.accountId);
    await page.getByText('Tu cuenta', { exact: true }).waitFor();
    await action(page, 'Comprobar permiso de operador', '/v1/operator/access', 403);
    await factor(page, secret);
    await audit(page);
    for (const current of pages) assert.equal(await current.evaluate(() => localStorage.length), 0);
    assert.deepEqual(errors, []);
    return {
      realOtpTwoOperators: true,
      restoredFactorVerifiedInUi: true,
      aal1Denied: true,
      selfApprovalDenied: true,
      otherReviewerApproved: true,
      oldSessionRevoked: true,
      safeHelpReturn: true,
      limitedCapabilityAndNewTotp: true,
      newLoginAndTotpRequired: true,
      axeViolations: 0,
      pageErrors: 0,
    };
  } finally {
    for (const context of contexts) await context.close();
  }
}
