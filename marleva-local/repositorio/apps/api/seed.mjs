import pg from 'pg';
import { readFile } from 'node:fs/promises';
if (process.env.APP_MODE !== 'local') throw new Error('Local only');
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const users = JSON.parse(
  await readFile(
    process.env.MARLEVA_FIXTURE_IDENTITIES ??
      new URL('../../infra/local/secrets/fixture-identities.json', import.meta.url),
    'utf8',
  ),
);
for (const u of users)
  await db.query(
    'INSERT INTO marleva."Account" (id,"authId",email,operator,state,"createdAt") VALUES (gen_random_uuid(),$1,$2,$3,\'active\',now()) ON CONFLICT ("authId") DO NOTHING',
    [u.id, u.email, u.email.startsWith('operator')],
  );
const names = [
  'Gran Santa Fe I',
  'Gran Santa Fe II',
  'Gran Santa Fe Norte I',
  'Gran Santa Fe Norte II',
  'Gran Santa Fe Norte III',
  'Cerradas de Gran Santa Fe',
  'Paraíso Santa Fe',
];
for (const [i, name] of names.entries())
  await db.query(
    'INSERT INTO marleva."Development" (id,name) VALUES ($1,$2) ON CONFLICT(id) DO NOTHING',
    [i + 1, name],
  );
await db.end();
console.log('Semillas locales repetibles: cuatro cuentas y siete desarrollos.');
