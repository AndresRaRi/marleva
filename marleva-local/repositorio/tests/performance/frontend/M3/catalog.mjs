import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
if (process.env.MARLEVA_M3_CHECK !== '1') throw Error('Requiere entorno M3 propio.');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = {
  id: 'MAR-M3-PF-FE-001',
  date: new Date().toISOString(),
  browser: browser.version(),
  trace: 'UC001/002 → SEQ001:S080/SEQ002:S080 → API001/002 → Offer/OfferVersion → UI001/002',
  environment: {
    viewport: { width: 390, height: 844 },
    origin: 'http://127.0.0.1:8103',
    api: 'http://127.0.0.1:3103',
    warmup: 1,
    samples: 10,
    concurrency: 1,
  },
  thresholds: { initial_p95_ms: 3000, search_p95_ms: 1000, detail_p95_ms: 1000 },
  limits:
    'Objetivos locales previos al ensayo, sin throttling. Contexto limpio por muestra. No INP de campo, Safari, Android/iOS, capacidad comercial o presupuesto productivo. Memoria JS no equivale a memoria total del navegador.',
  samples: [],
};
try {
  for (let index = -1; index < 10; index++) {
    const context = await browser.newContext({ viewport: report.environment.viewport });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(String(error)));
      let start = performance.now();
      await page.goto(report.environment.origin, { waitUntil: 'domcontentloaded' });
      const offers = page.getByRole('button', { name: 'Ver oferta', exact: true });
      await offers.first().waitFor();
      const initial_ms = performance.now() - start;
      await page.getByRole('textbox', { name: 'Buscar productos o servicios' }).fill('Pan');
      const response = page.waitForResponse(
        (item) => item.url().includes('/v1/catalog/offers?q=Pan') && item.status() === 200,
      );
      start = performance.now();
      await page.getByRole('button', { name: 'Buscar', exact: true }).click();
      await response;
      await offers.first().waitFor();
      const search_ms = performance.now() - start;
      start = performance.now();
      await offers.first().click();
      await page.getByRole('button', { name: /Ver oferente:/ }).waitFor();
      const detail_ms = performance.now() - start;
      const resources = await page.evaluate(() => ({
        scripts: performance
          .getEntriesByType('resource')
          .filter((entry) => entry.initiatorType === 'script')
          .map((entry) => ({
            path: new URL(entry.name).pathname,
            transfer_bytes: entry.transferSize,
            decoded_bytes: entry.decodedBodySize,
            duration_ms: entry.duration,
          })),
        paint: performance
          .getEntriesByType('paint')
          .map((entry) => ({ name: entry.name, start_ms: entry.startTime })),
        js_heap_bytes: performance.memory?.usedJSHeapSize ?? null,
      }));
      assert.deepEqual(errors, [], 'Errores JavaScript en recorrido');
      if (index >= 0) report.samples.push({ initial_ms, search_ms, detail_ms, ...resources });
    } finally {
      await context.close();
    }
  }
  report.summary = {};
  for (const field of ['initial_ms', 'search_ms', 'detail_ms']) {
    const values = report.samples.map((sample) => sample[field]).sort((a, b) => a - b);
    report.summary[field] = { p50: values[4], p95: values[9], max: values[9] };
  }
  for (const [field, threshold] of [
    ['initial_ms', 3000],
    ['search_ms', 1000],
    ['detail_ms', 1000],
  ])
    assert.ok(report.summary[field].p95 <= threshold, `${field} supera ${threshold}ms`);
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = String(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(
    'tests/results/m3-performance-frontend.json',
    JSON.stringify(report, null, 2) + '\n',
  );
}
console.log(
  JSON.stringify({ passed: report.passed, summary: report.summary, failure: report.failure }),
);
