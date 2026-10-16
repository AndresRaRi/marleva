import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { writeFile } from 'node:fs/promises';
import { capturedCode } from './live-otp.mjs';
async function keyboardTo(page, label) {
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab');
    if (
      await page.getByLabel(label, { exact: true }).evaluate((el) => el === document.activeElement)
    )
      return;
  }
  throw new Error('Teclado no llega a ' + label);
}
async function keyboardButton(page, label, role = 'button') {
  const button = page.getByRole(role, { name: label, exact: true });
  for (let i = 0; i < 35; i++) {
    await page.keyboard.press('Tab');
    if (await button.evaluate((el) => el === document.activeElement)) {
      const focus = await button.evaluate((el) => ({
        visible: el.matches(':focus-visible'),
        outline: getComputedStyle(el).outlineStyle,
      }));
      assert.ok(focus.visible, 'Foco por teclado no visible');
      assert.notEqual(focus.outline, 'none', 'Indicador de foco ausente');
      await page.keyboard.press('Enter');
      return;
    }
  }
  throw new Error('Teclado no llega al botón ' + label);
}
export async function verifyChromeReadiness(browser, origin, captures) {
  const samples = [];
  let context;
  try {
    for (let i = 0; i < 30; i++) {
      context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const p = await context.newPage(),
        started = performance.now();
      await p.goto(origin, { waitUntil: 'domcontentloaded' });
      await p.getByLabel('Correo', { exact: true }).waitFor();
      samples.push(performance.now() - started);
      if (i < 29) await context.close();
    }
    const page = context.pages()[0];
    const snapshot = await page.locator('body').ariaSnapshot();
    assert.match(snapshot, /textbox "Correo"/);
    assert.match(snapshot, /button "Recibir código"/);
    await keyboardTo(page, 'Correo');
    const address = 'keyboard-' + Date.now() + '@example.test';
    await page.keyboard.type(address);
    await keyboardButton(page, 'Recibir código');
    await page.getByLabel('Código de seis cifras', { exact: true }).waitFor();
    await keyboardTo(page, 'Código de seis cifras');
    await page.keyboard.type(await capturedCode(address, new Set()));
    await keyboardButton(page, 'Verificar código');
    await page.getByText('Tu cuenta', { exact: true }).waitFor();
    for (const [tab, heading] of [
      ['Avisos', 'Avisos de cuenta'],
      ['Ayuda', 'Ayuda con tu acceso'],
      ['Cuenta', 'Tu cuenta'],
    ]) {
      await keyboardButton(page, tab, 'tab');
      assert.equal(
        await page.getByRole('tab', { name: tab, exact: true }).getAttribute('aria-selected'),
        'true',
      );
      await page.getByRole('heading', { name: heading, exact: true }).waitFor();
    }
    // CSS zoom changes layout sizing, unlike deviceScaleFactor (pixel density).
    await page.evaluate(() => {
      document.documentElement.style.zoom = '2';
    });
    const layout = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    assert.ok(layout.scroll <= layout.width + 1, 'Zoom200% desborda horizontalmente');
    await page.screenshot({ path: captures + '/07-teclado-zoom.png', fullPage: true });
    await page.evaluate(() => {
      document.documentElement.style.zoom = '1';
    });
    await keyboardButton(page, 'Cerrar esta sesión');
    await page.getByText('Accede a tu cuenta', { exact: true }).waitFor();
    samples.sort((a, b) => a - b);
    const report = {
      id: 'MAR-M1-IT-FE-ACCESSIBLE-009/PF-FE-101',
      date: new Date().toISOString(),
      browser: await browser.version(),
      viewport: { width: 390, height: 844 },
      runs: 30,
      cache: 'Contexto aislado nuevo por navegación; sin borrar cachés del usuario',
      p50: samples[15],
      p95: samples[28],
      p99: samples[29],
      engineeringTargetMs: 3000,
      engineeringTargetMet: samples[28] <= 3000,
      cases: {
        keyboardOtp: true,
        keyboardNavigation: true,
        focusVisible: true,
        accessibleNames: true,
        zoom200NoHorizontalOverflow: true,
        keyboardLogout: true,
      },
      limits: [
        'Árbol accesible y teclado no acreditan lector humano, Android/iOS ni WCAG completa',
        'Umbral de ingeniería propuesto; no SLO de producción',
      ],
    };
    await writeFile('tests/results/chrome-readiness.json', JSON.stringify(report, null, 2) + '\n');
    return report;
  } finally {
    await context?.close();
  }
}
