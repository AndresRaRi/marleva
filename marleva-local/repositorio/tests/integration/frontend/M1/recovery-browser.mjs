import { recoveryOperatorBrowser } from './recovery-operator-browser.mjs';
import assert from 'node:assert/strict';
import path from 'node:path';
import net from 'node:net';
import { readFileSync, mkdirSync, openSync, closeSync, writeFileSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { recoveryContext } from '../../../fixtures/recovery-context.mjs';
import { liveOtp } from './live-otp.mjs';
const context = recoveryContext();
assert.ok(context.isolated);
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const fixture = JSON.parse(readFileSync(context.fixture, 'utf8'));
assert.match(fixture.prefix, /^b12-\d{13}$/);
const actor = fixture.actors.find((item) => item.name === 'A');
assert.match(actor.accountId, /^[a-f0-9-]{36}$/);
assert.match(actor.sessionId, /^[a-f0-9-]{36}$/);
const attempt = Date.now();
const folder = context.folder + '/browser-' + attempt;
mkdirSync(folder, { recursive: true });
const origin = 'https://localhost:8445';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const docker = (args) =>
  execFileSync('docker', args, {
    encoding: 'utf8',
    timeout: 30000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
const inspect = (name) => JSON.parse(docker(['inspect', name]))[0];
const services = ['db', 'auth', 'storage', 'rest', 'kong', 'inbucket'].map((service) => {
  const name = `supabase_${service}_${context.project}`;
  const container = inspect(name);
  assert.equal(container.Config.Labels['com.supabase.cli.project'], context.project);
  assert.equal(
    container.Config.Labels['com.supabase.cli.workdir'],
    path.resolve('artifacts/recovery/source-006'),
  );
  return { name, wasRunning: container.State.Running };
});
async function free(port) {
  const socket = net.createServer();
  await new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.listen(port, '127.0.0.1', resolve);
  });
  await new Promise((resolve, reject) =>
    socket.close((error) => (error ? reject(error) : resolve())),
  );
}
const children = new Set();
function start(script, extra, name) {
  const fd = openSync(`${folder}/${name}.log`, 'a', 0o600);
  const child = spawn(process.execPath, [script], {
    env: { ...process.env, ...extra },
    stdio: ['ignore', fd, fd],
  });
  closeSync(fd);
  children.add(child);
  return child;
}
async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const done = once(child, 'exit');
  child.kill('SIGTERM');
  await Promise.race([
    done,
    delay(10000).then(() => {
      throw new Error('Proceso propio no cerró');
    }),
  ]);
  children.delete(child);
}
async function ready(url, child) {
  for (let i = 0; i < 90; i++) {
    assert.equal(child.exitCode, null, 'Proceso de ensayo terminó antes de estar listo');
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(1000) })).ok) return;
    } catch {
      /* Espera acotada de arranque. */
    }
    await delay(500);
  }
  throw new Error('Servicio B12 no disponible');
}
const report = {
  date: new Date().toISOString(),
  copyPrefix: context.names.prefix,
  attempt,
  cases: {},
  limits: ['Chrome; cookie inicial de fixture, nuevo OTP real; sin acreditar Safari/nativo ni RTO'],
};
let browser;
const startedAt = Date.now();
try {
  for (const port of [8445, 3106, 3001]) await free(port);
  for (const service of services.filter((item) => !item.wasRunning))
    docker(['start', service.name]);
  const source = start(
    'tests/fixtures/recovery-source-api.mjs',
    { APP_ORIGIN: origin },
    'source-api',
  );
  await ready('http://127.0.0.1:3106/health/ready', source);
  const cert = path.resolve('../../../../marleva-local/repositorio/infra/local/secrets');
  const proxy = start(
    'scripts/proxy.mjs',
    { MARLEVA_PROXY_CONTEXT: 'b12-source', MARLEVA_CERT_DIR: cert },
    'source-proxy',
  );
  await ready(origin, proxy);
  browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  const session = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await session.addCookies([
    {
      name: 'marleva_session',
      value: actor.credential,
      url: origin,
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    },
  ]);
  const page = await session.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const me = page.waitForResponse((response) => new URL(response.url()).pathname === '/v1/me');
  await page.goto(origin, { waitUntil: 'networkidle' });
  const positive = await me;
  assert.equal(positive.status(), 200);
  assert.equal((await positive.json()).id, actor.accountId);
  await page.getByRole('tab', { name: 'Avisos', exact: true }).click();
  await page.getByText('Avisos de cuenta', { exact: true }).waitFor();
  await page.waitForLoadState('networkidle');
  const sourceNotices = await page.request.get(origin + '/v1/notifications');
  assert.equal(sourceNotices.status(), 200);
  const before = await sourceNotices.json();
  assert.equal(before.items.length, 24, 'Primera página real de las 55 fixtures');
  assert.ok(before.next_cursor, 'Dataset requiere más de una página');
  for (const item of before.items) {
    assert.equal(item.accountId, actor.accountId);
    assert.ok(item.text.startsWith(fixture.prefix + '-aviso-'));
    await page.getByText(item.text, { exact: true }).waitFor();
  }
  const state = docker([
    'exec',
    context.names.prefix + '-db-provider',
    'psql',
    '-U',
    'supabase_admin',
    '-d',
    'postgres',
    '-Atc',
    `SELECT count(*) FROM marleva."Session" WHERE id='${actor.sessionId}' AND "accountId"='${actor.accountId}' AND "revokedAt" IS NOT NULL`,
  ]);
  assert.equal(state.trim(), '1', 'Misma sesión restaurada y revocada');
  await stop(proxy);
  await stop(source);
  for (const service of [...services].reverse().filter((item) => !item.wasRunning))
    docker(['stop', '-t', '20', service.name]);
  const target = start('tests/fixtures/recovery-target-api.mjs', {}, 'target-api');
  await ready('http://127.0.0.1:3001/health/ready', target);
  const targetProxy = start(
    'scripts/proxy.mjs',
    { MARLEVA_PROXY_CONTEXT: 'b12-target', MARLEVA_CERT_DIR: cert },
    'target-proxy',
  );
  await ready(origin, targetProxy);
  const rejected = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/v1/me',
  );
  await page.getByRole('button', { name: 'Actualizar cuenta', exact: true }).click();
  assert.equal((await rejected).status(), 401);
  await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
  assert.equal(await page.getByText('Avisos de cuenta', { exact: true }).count(), 0);
  process.env.MAILPIT_URL = 'http://127.0.0.1:54424';
  const stack = JSON.parse(readFileSync(context.folder + '/provider/stack.private.json', 'utf8'));
  Object.assign(process.env, stack.environment);
  const { database } = await import('../../../../apps/api/dist/database.js');
  const db = database();
  let address;
  try {
    address = (await db.account.findUniqueOrThrow({ where: { id: actor.accountId } })).email;
    assert.ok(address.startsWith(fixture.prefix + '-') && address.endsWith('@example.test'));
    const challenge = await db.challenge.findFirst({
      where: { email: address },
      orderBy: { createdAt: 'desc' },
    });
    if (challenge) await delay(Math.max(0, 61000 - (Date.now() - challenge.createdAt.getTime())));
  } finally {
    await db.$disconnect();
  }
  assert.equal(await liveOtp(page, address), actor.accountId);
  await page.getByText('Avisos de cuenta', { exact: true }).waitFor();
  await page.waitForLoadState('networkidle');
  const current = await page.request.get(origin + '/v1/notifications');
  assert.equal(current.status(), 200);
  assert.deepEqual(
    (await current.json()).items.map((item) => item.id),
    before.items.map((item) => item.id),
  );
  for (const item of before.items) await page.getByText(item.text, { exact: true }).waitFor();
  const credential = (await session.cookies()).find(
    (item) => item.name === 'marleva_session',
  )?.value;
  assert.ok(credential);
  assert.notEqual(credential, actor.credential);
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  const axe = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    axe.violations.map((item) => item.id),
    [],
  );
  assert.deepEqual(errors, []);
  await page.screenshot({ path: folder + '/returned-notices.png', fullPage: true });
  report.cases = {
    sourceSessionValid: true,
    sameRestoredSessionRevoked: true,
    oldSessionRejected: true,
    realOtpSameAccount: true,
    noticesDestinationPreserved: true,
    noticeIdsPreserved: true,
    freshCookie: true,
    axeViolations: 0,
    pageErrors: 0,
  };
  if (process.env.MARLEVA_RECOVERY_OPERATOR_UI === '1')
    report.cases.operatorUi = await recoveryOperatorBrowser(browser, origin, fixture);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.error = error.message;
  throw error;
} finally {
  if (browser) await browser.close();
  for (const child of [...children].reverse()) await stop(child);
  for (const service of [...services].reverse().filter((item) => !item.wasRunning))
    if (inspect(service.name).State.Running) docker(['stop', '-t', '20', service.name]);
  report.duration_ms = Date.now() - startedAt;
  writeFileSync(`${folder}/report.json`, JSON.stringify(report, null, 2) + '\n');
  writeFileSync(context.report('browser-' + attempt), JSON.stringify(report, null, 2) + '\n');
}
