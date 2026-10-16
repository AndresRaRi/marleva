import { performance } from 'node:perf_hooks';
import { writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { connectM3 } from '../../../../apps/api/dist-m3/modules/m3/infrastructure/prisma-sql.js';
import { PrismaCatalogRepository } from '../../../../apps/api/dist-m3/modules/m3/infrastructure/repositories/prisma-catalog-repository.js';
import { ReadCatalog } from '../../../../apps/api/dist-m3/modules/m3/application/use-cases/read-catalog.js';
import { sellerId } from '../../../fixtures/m3-fixtures.mjs';
if (process.env.MARLEVA_M3_CHECK !== '1') throw Error('Rendimiento solo en base propia55432.');
const admin = connectM3(true),
  reader = connectM3();
const service = new ReadCatalog(new PrismaCatalogRepository(reader.sql));
const report = {
  date: new Date().toISOString(),
  node: process.version,
  destination: '127.0.0.1:55432/marleva_m3_008',
  measurement: 'Repositorio Prisma/PG real. No HTTP/Auth ni capacidad productiva.',
  objective: 'Propuesto: p95<=500ms; cero errores de respuesta.',
  samples: [],
};
const quantile = (values, fraction) =>
  values[Math.min(values.length - 1, Math.floor(values.length * fraction))];
async function measure(size, concurrency, prefix) {
  const times = [];
  let errors = 0;
  const cpu = process.cpuUsage(),
    rss = process.memoryUsage().rss;
  const start = performance.now();
  const lane = async () => {
    while (performance.now() - start < 6000) {
      const at = performance.now();
      try {
        const page = await service.list({ limit: 24, category: 'everyday', q: prefix });
        if (page.items.length !== Math.min(size, 24)) errors++;
        if (page.items.some((item) => item.category !== 'everyday')) errors++;
      } catch {
        errors++;
      }
      if (at - start >= 1000) times.push(performance.now() - at);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, lane));
  times.sort((a, b) => a - b);
  return {
    size,
    concurrency,
    seconds: 5,
    warmup_seconds: 1,
    requests: times.length,
    errors,
    p50: quantile(times, 0.5),
    p95: quantile(times, 0.95),
    p99: quantile(times, 0.99),
    requests_per_second: times.length / 5,
    rss_start: rss,
    rss_end: process.memoryUsage().rss,
    cpu: process.cpuUsage(cpu),
  };
}
try {
  const prefix = 'PF-M3-' + randomUUID();
  report.dataset_prefix = prefix;
  for (const size of [10, 1000, 10000]) {
    const add = size - (size === 10 ? 0 : size === 1000 ? 10 : 1000);
    await admin.sql.transaction(async (tx) => {
      await tx.execute(
        `INSERT INTO m3."Offer"(id,seller_id,paused) SELECT gen_random_uuid(),$1::uuid,false FROM generate_series(1,$2::integer)`,
        sellerId,
        add,
      );
      await tx.execute(
        `INSERT INTO m3."OfferVersion"(id,offer_id,number,state,title,description,kind,category,price_cents,unit,stock,made_to_order,developments,modalities,response_minutes,preparation_minutes)
    SELECT gen_random_uuid(),o.id,1,'approved',$1,'Oferta ficticia exclusiva de rendimiento M3','product','everyday',100,'pieza',1,false,ARRAY[1,2],ARRAY['delivery'],60,0 FROM m3."Offer" o WHERE NOT EXISTS(SELECT 1 FROM m3."OfferVersion" v WHERE v.offer_id=o.id)`,
        prefix,
      );
      await tx.execute(
        `UPDATE m3."Offer" o SET public_version_id=v.id FROM m3."OfferVersion" v WHERE v.offer_id=o.id AND o.public_version_id IS NULL AND v.title=$1`,
        prefix,
      );
    });
    await admin.sql.execute('ANALYZE m3."OfferVersion"');
    await admin.sql.execute('ANALYZE m3."Offer"');
    await admin.sql.execute('ANALYZE m3."SellerEligibility"');
    for (const concurrency of [1, 5, 10])
      report.samples.push(await measure(size, concurrency, prefix));
  }
  const rows = await admin.sql.query('SELECT version() AS version');
  report.postgres = rows[0].version;
  report.passed = report.samples.every((row) => row.errors === 0 && row.p95 <= 500);
} finally {
  if (report.dataset_prefix)
    await admin.sql.execute(
      'UPDATE m3."Offer" o SET paused=true FROM m3."OfferVersion" v WHERE v.offer_id=o.id AND v.title=$1',
      report.dataset_prefix,
    );
  await admin.client.$disconnect();
  await reader.client.$disconnect();
  await writeFile('tests/results/m3-performance.json', JSON.stringify(report, null, 2) + '\n');
}
if (!report.passed) process.exitCode = 1;
