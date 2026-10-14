import { execFileSync, spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
process.chdir(path.resolve(new URL('../../../..', import.meta.url).pathname));
if (process.env.MARLEVA_ANDROID_CHECK !== '1')
  throw new Error('Requiere emulador ficticio Marleva autorizado');
const serial = 'emulator-5554',
  captures = 'docs/revision/M1/capturas/android',
  started = Date.now();
const adb = (args, binary = false) =>
  execFileSync('adb', ['-s', serial, ...args], {
    encoding: binary ? undefined : 'utf8',
    timeout: 20000,
    maxBuffer: 10000000,
  });
assert.match(adb(['emu', 'avd', 'name']), /Marleva_API36_ARM64/);
const sizes = [...adb(['shell', 'wm', 'size']).matchAll(/(\d+)x(\d+)/g)];
const height = Number(sizes.at(-1)[2]);
mkdirSync(captures, { recursive: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let snapshot = 0;
function nodes() {
  for (let attempt = 0; attempt < 4; attempt++) {
    const file = '/data/local/tmp/marleva-ui-' + ++snapshot + '.xml';
    const dump = spawnSync('adb', ['-s', serial, 'shell', 'uiautomator', 'dump', file], {
      encoding: 'utf8',
      timeout: 20000,
      maxBuffer: 10000000,
    });
    // Some emulator runs terminate UIAutomator after it writes the hierarchy.
    // Accept only this attempt's confirmed file, never an earlier snapshot.
    if (!dump.stdout?.includes('dumped to: ' + file)) continue;
    let xml;
    try {
      xml = adb(['exec-out', 'cat', file]);
    } finally {
      adb(['shell', 'rm', file]);
    }
    if (!xml.includes('<hierarchy') || !xml.includes('</hierarchy>')) continue;
    const result = [...xml.matchAll(/<node\b([^>]+)>?/g)].map((m) =>
      Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]])),
    );
    if (result.length) return result;
  }
  throw new Error('La pantalla nativa sigue en transición; no reutilizar captura anterior');
}

function bounds(node) {
  const values = node.bounds.match(/-?\d+/g).map(Number);
  return { x: (values[0] + values[2]) / 2, y: (values[1] + values[3]) / 2 };
}
function swipe(up = true, current = nodes()) {
  const candidates = current
    .filter((n) => n.class === 'android.widget.TextView' && n.text && n.clickable === 'false')
    .map((n) => ({ node: n, point: bounds(n) }))
    .filter((item) => item.point.y >= 80 && item.point.y <= height - 150);
  candidates.sort((a, b) => (up ? b.point.y - a.point.y : a.point.y - b.point.y));
  if (!candidates.length) return false;
  const point = candidates[0].point;
  adb([
    'shell',
    'input',
    'swipe',
    String(Math.round(point.x)),
    String(Math.round(point.y)),
    String(Math.round(point.x)),
    up ? '100' : String(height - 160),
    '600',
  ]);
}

async function find(label, field = false) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const all = nodes();
    assert.ok(
      all.some((n) => n.package === 'mx.marleva.local'),
      'La app perdió el foco; detener automatización',
    );
    const matching = all.filter(
      (n) =>
        (n.text === label || n['content-desc'] === label) &&
        (!field || n.class === 'android.widget.EditText'),
    );
    const node = matching.find((n) => n['content-desc'] === label) ?? matching[0];
    if (node) {
      const edge = node.bounds.match(/-?\d+/g).map(Number);
      if (edge[1] >= 30 && edge[3] <= height - 100 && bounds(node).y < height - 140) return node;
    }
    swipe(attempt < 6, all);
    await sleep(100);
  }
  throw new Error('Control no encontrado: ' + label);
}
async function tap(label, field = false) {
  const p = bounds(await find(label, field));
  adb(['shell', 'input', 'tap', String(Math.round(p.x)), String(Math.round(p.y))]);
}
async function fill(label, value) {
  await tap(label, true);
  adb(['shell', 'input', 'keyevent', 'KEYCODE_MOVE_END']);
  for (let i = 0; i < 8; i++) adb(['shell', 'input', 'keyevent', 'KEYCODE_DEL']);
  if (value) adb(['shell', 'input', 'text', value]);
  // This AVD uses the host keyboard; Back would navigate away from the form.
  await sleep(100);
}
function top() {
  for (let i = 0; i < 4; i++) if (swipe(false) === false) break;
}
function capture(name) {
  writeFileSync(captures + '/' + name + '.png', adb(['exec-out', 'screencap', '-p'], true));
}
async function visible(label) {
  for (let i = 0; i < 10; i++) {
    if (nodes().some((n) => n.text === label || n['content-desc'] === label)) return;
    await sleep(300);
  }
  throw new Error('Estado no visible: ' + label);
}
function restart() {
  adb(['shell', 'am', 'force-stop', 'mx.marleva.local']);
  adb([
    'shell',
    'am',
    'start',
    '-W',
    '-n',
    'mx.marleva.local/.MainActivity',
    '-a',
    'android.intent.action.VIEW',
    '-d',
    'marleva://expo-development-client/?url=http%3A%2F%2F10.0.2.2%3A8081',
    '-p',
    'mx.marleva.local',
  ]);
}
const cases = {};
let address;
try {
  adb(['shell', 'cmd', 'statusbar', 'collapse']);
  restart();
  await sleep(2500);
  top();
  await sleep(2500);
  const initial = nodes();
  if (initial.some((n) => n.text === 'Tu cuenta' || n['content-desc'] === 'Tu cuenta')) {
    await tap('Cerrar esta sesión');
    await sleep(500);
    top();
  }
  await visible('Accede a tu cuenta');
  capture('01-acceso');
  cases.launch = true;
  console.log('Android: acceso visible');
  address = 'android-' + Date.now() + '@example.test';
  await fill('Correo', address);
  const mailTime = Date.now();
  await tap('Recibir código');
  await sleep(500);
  await find('Código de seis cifras', true);
  capture('02-codigo-pendiente');
  let otp = '';
  for (let i = 0; i < 100; i++) {
    const list = await (await fetch('http://127.0.0.1:54324/api/v1/messages')).json();
    const message = list.messages.find(
      (m) => m.To.some((t) => t.Address === address) && +new Date(m.Created) >= mailTime,
    );
    if (message) {
      const body = await (
        await fetch('http://127.0.0.1:54324/api/v1/message/' + message.ID)
      ).json();
      otp = (body.Text + ' ' + body.HTML).match(/\b\d{6}\b/)?.[0] ?? '';
      if (otp) break;
    }
    await sleep(100);
  }
  assert.ok(otp, 'OTP ficticio no llegó');
  await fill('Código de seis cifras', otp === '000000' ? '111111' : '000000');
  await tap('Verificar código');
  await sleep(500);
  top();
  await visible('El código no es válido o venció');
  cases.invalidOtp = true;
  console.log('Android: código inválido conserva paso');
  await fill('Código de seis cifras', '');
  top();
  capture('03-codigo-invalido');
  await fill('Código de seis cifras', otp);
  await tap('Verificar código');
  await sleep(700);
  top();
  await visible('Tu cuenta');
  cases.otpAccount = true;
  console.log('Android: OTP y cuenta comprobados');
  capture('04-cuenta');
  restart();
  await sleep(2500);
  top();
  await visible('Tu cuenta');
  cases.secureStoreRestart = true;
  console.log('Android: sesión conservada tras reinicio');
  await tap('Actualizar cuenta');
  await sleep(400);
  top();
  await visible('Tu cuenta');
  cases.refresh = true;
  await tap('Cerrar esta sesión');
  await sleep(500);
  top();
  await visible('Accede a tu cuenta');
  cases.logout = true;
  capture('05-sesion-cerrada');
  restart();
  await sleep(2500);
  top();
  await visible('Accede a tu cuenta');
  assert.ok(!nodes().some((n) => n.text === 'Tu cuenta'));
  cases.revokedRestart = true;
  writeFileSync(
    'tests/results/android-test.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        cases,
        ids: ['MAR-M1-IT-FE-102-ANDROID-A', 'MAR-M1-IT-FE-104-ANDROID-A'],
        avd: 'Marleva_API36_ARM64',
        apiLevel: adb(['shell', 'getprop', 'ro.build.version.sdk']).trim(),
        display: adb(['shell', 'wm', 'size']).trim(),
        duration_ms: Date.now() - started,
        build: 'APK debug ARM64; Metro localhost; API HTTPS CA local',
        limits: [
          'Emulador, no dispositivo físico/iOS',
          'No cambio correo/MFA completo ni accesibilidad acreditados',
          'Sin Expo Go; no build productivo',
          'Actualizar cuenta conserva UI; no acredita renovación del proveedor por sí solo',
        ],
      },
      null,
      2,
    ) + '\n',
  );
  console.log('Android emulado: acceso/error/OTP/cuenta/reinicio/salida/revocación PASS');
} catch (error) {
  writeFileSync(
    'tests/results/android-test-failure.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        cases,
        message: error.message,
        limits: 'Recorrido parcial; no acreditar paso pendiente',
      },
      null,
      2,
    ) + '\n',
  );
  throw error;
}
