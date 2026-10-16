import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { platform, arch } from 'node:os';
import { SharpPhotoProcessor } from '../../../../apps/api/dist-m3/modules/m3/infrastructure/adapters/sharp-photo-processor.js';
import { LocalPhotoStore } from '../../../../apps/api/dist-m3/modules/m3/infrastructure/adapters/local-photo-store.js';
if (process.env.MARLEVA_M3_CHECK !== '1') throw Error('Solo ensayo local M3.');
const store = new LocalPhotoStore();
const processor = new SharpPhotoProcessor();
const input = await sharp({
  create: { width: 1600, height: 1200, channels: 3, background: '#145544' },
})
  .png()
  .toBuffer();
const path = await store.quarantine(randomUUID(), input);
const report = {
  id: 'MAR-M3-PF-BE-009',
  date: new Date().toISOString(),
  node: process.version,
  platform: platform() + '-' + arch(),
  versions: sharp.versions,
  environment: {
    input_bytes: input.length,
    width: 1600,
    height: 1200,
    warmup: 1,
    samples: 10,
    concurrency: 1,
  },
  threshold: { p95_ms: 2000, errors: 0 },
  samples: [],
  limits:
    'Procesador hijo y dos derivados; no HTTP, fotos reales, móviles, antivirus o capacidad productiva. resourceUsage mide solo el orquestador; CPU y RAM del hijo no medidas.',
};
try {
  for (let i = -1; i < 10; i++) {
    const started = performance.now();
    const output = await processor.process(path);
    if (i >= 0)
      report.samples.push({
        ms: performance.now() - started,
        card_bytes: output.card.bytes,
        detail_bytes: output.detail.bytes,
      });
  }
  const ordered = report.samples.map((x) => x.ms).sort((a, b) => a - b);
  report.summary = { p50_ms: ordered[4], p95_ms: ordered[9], max_ms: ordered[9] };
  report.parent_resource_usage = process.resourceUsage();
  report.passed = report.summary.p95_ms <= 2000;
  if (!report.passed) process.exitCode = 1;
} catch (error) {
  report.passed = false;
  report.failure = String(error);
  process.exitCode = 1;
}
await writeFile('tests/results/m3-photo-performance.json', JSON.stringify(report, null, 2) + '\n');
console.log(
  JSON.stringify({ passed: report.passed, summary: report.summary, failure: report.failure }),
);
