import assert from 'node:assert/strict';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function messages(address) {
  const response = await fetch(process.env.MAILPIT_URL + '/api/v1/messages');
  assert.equal(response.status, 200);
  const body = await response.json();
  return body.messages.filter((message) => message.To.some((to) => to.Address === address));
}
export async function liveOtp(page, address) {
  const oldIds = new Set((await messages(address)).map((message) => message.ID));
  await page.getByLabel('Correo', { exact: true }).fill(address);
  await page.getByRole('button', { name: 'Recibir código', exact: true }).click();
  await page.getByLabel('Código de seis cifras', { exact: true }).waitFor();
  let code;
  for (let attempt = 0; attempt < 100; attempt++) {
    const message = (await messages(address)).find((item) => !oldIds.has(item.ID));
    if (message) {
      const body = await (
        await fetch(process.env.MAILPIT_URL + '/api/v1/message/' + message.ID)
      ).json();
      code = (body.Text + ' ' + body.HTML).match(/\b\d{6}\b/)?.[0];
      if (code) break;
    }
    await delay(100);
  }
  assert.ok(code, 'Nuevo OTP local no recibido');
  await page.getByLabel('Código de seis cifras', { exact: true }).fill(code);
  const verified = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/v1/auth/verifications' &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Verificar código', exact: true }).click();
  const response = await verified;
  assert.equal(response.status(), 200);
  return (await response.json()).cuenta.id;
}
export async function waitOtpCooldown(startedAt) {
  const milliseconds = Math.max(0, 61_000 - (Date.now() - startedAt));
  await delay(milliseconds);
  return milliseconds;
}
