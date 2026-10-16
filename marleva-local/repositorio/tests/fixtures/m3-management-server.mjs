import { writeFile, mkdir, chmod } from 'node:fs/promises';
import { connectM3 } from '../../apps/api/dist-m3/modules/m3/infrastructure/prisma-sql.js';
import { createM3Management } from '../../apps/api/dist-m3/m3-management.js';
import { FixtureIdentity } from './m3-identity.mjs';
import { actor, reviewActor, seed } from './m3-fixtures.mjs';
if (process.env.MARLEVA_M3_CHECK !== '1')
  throw Error('Composición exclusiva de pruebas M3; no iniciar sin guardia.');
const { client, sql } = connectM3(true),
  identity = new FixtureIdentity();
const owner = identity.issue(actor),
  reviewer = identity.issue(reviewActor);
await seed(sql, 0);
const app = await createM3Management(sql, identity);
await app.listen(3104, '127.0.0.1');
await mkdir('artifacts/m3', { recursive: true });
const file = 'artifacts/m3/private-session.json';
await writeFile(
  file,
  JSON.stringify({
    owner,
    reviewer,
    expires: new Date(Date.now() + 3600000).toISOString(),
    scope: 'FICTITIOUS IDENTITY PROVIDER; NOT M1/MFA',
    pid: process.pid,
  }),
  { mode: 0o600 },
);
await chmod(file, 0o600);
console.log('Composición privada ficticia M3 lista en 127.0.0.1:3104; no es identidad M1.');
const stop = async () => {
  await app.close();
  await client.$disconnect();
};
process.once('SIGTERM', () => void stop());
process.once('SIGINT', () => void stop());
