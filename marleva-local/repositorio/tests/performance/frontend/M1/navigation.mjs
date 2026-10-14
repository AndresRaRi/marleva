import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
if (process.env.MARLEVA_PERFORMANCE_LOCAL !== '1')
  throw new Error('Solo ejecutar después de revisar plan: MARLEVA_PERFORMANCE_LOCAL=1');
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('https://localhost:8443', { waitUntil: 'networkidle' });
  const metrics = await page.evaluate(() => ({
    navigation: performance.getEntriesByType('navigation').map((e) => e.toJSON()),
    resources: performance.getEntriesByType('resource').map((e) => ({
      name: new URL(e.name).pathname,
      duration: e.duration,
      transferSize: e.transferSize,
    })),
    paint: performance
      .getEntriesByType('paint')
      .map((e) => ({ name: e.name, startTime: e.startTime })),
  }));
  await writeFile(
    'tests/results/performance-frontend.json',
    JSON.stringify(
      {
        id: 'MAR-M1-PF-FE-001',
        sequence: 'MAR-M1-SEQ-001:S010',
        date: new Date().toISOString(),
        browser: await browser.version(),
        scope:
          'Navegación inicial Chrome; no Safari, móvil físico, INP de campo o rendimiento del MVP',
        thresholds: 'Pendientes de revisión',
        metrics,
      },
      null,
      2,
    ),
  );
  console.log('Medición frontend guardada.');
} finally {
  await browser.close();
}
