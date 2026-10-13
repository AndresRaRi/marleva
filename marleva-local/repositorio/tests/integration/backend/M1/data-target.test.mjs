import { beforeAll, afterAll, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const tool = root + 'scripts/tool';
const name = 'marleva-target-check-' + Date.now();
let created = false;
function docker(args, input) {
  const r = spawnSync(tool, ['docker', ...args], {
    cwd: root,
    encoding: 'utf8',
    input,
    timeout: 30000,
  });
  if (r.status !== 0) throw new Error('Prueba Docker falló: ' + args.slice(0, 2).join(' '));
  return r.stdout.trim();
}
function sql(input) {
  const r = spawnSync(
    tool,
    [
      'docker',
      'exec',
      '-i',
      name,
      'psql',
      '-h',
      '127.0.0.1',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-At',
    ],
    { cwd: root, encoding: 'utf8', input, timeout: 10000 },
  );
  return { ok: r.status === 0, output: r.stdout.trim(), error: r.stderr };
}
const a = '11111111-1111-4111-8111-111111111111',
  b = '22222222-2222-4222-8222-222222222222';
beforeAll(async () => {
  if (process.env.MARLEVA_SCHEMA_CHECK !== '1')
    throw new Error('Requiere MARLEVA_SCHEMA_CHECK=1: solo SQL objetivo en contenedor desechable');
  docker([
    'run',
    '--pull=never',
    '--rm',
    '-d',
    '--name',
    name,
    '--network',
    'none',
    '--memory',
    '768m',
    '-e',
    'POSTGRES_PASSWORD=fixture-only',
    '--entrypoint',
    'docker-entrypoint.sh',
    'public.ecr.aws/supabase/postgres@sha256:06ddc7962e11ab0f4f0334fd05671e97c30ea202f6e6a7113800bd3d6e416108',
    'postgres',
  ]);
  created = true;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      docker(['exec', name, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']);
      ready = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  if (!ready) throw new Error('PG aislado no disponible');
  const ddl = readFileSync(root + 'docs/modelado-datos/ddl/MAR-M1-DATA-002.sql', 'utf8');
  const result = sql(ddl);
  if (!result.ok) throw new Error('SQL objetivo inválido: ' + result.error);
  expect(
    sql(
      `INSERT INTO marleva."Account"(id,"authId",email) VALUES ('${a}','${a}','a@example.test'),('${b}','${b}','b@example.test');`,
    ).ok,
  ).toBe(true);
}, 60000);
afterAll(() => {
  if (created) docker(['rm', '-f', name]);
});
const reject = (query) => {
  const r = sql('BEGIN; ' + query + ' ROLLBACK;');
  expect(r.ok).toBe(false);
  expect(r.error).toMatch(/violates|invalid input/);
};
it('MAR-M1-IT-BE-114 | DATA002 | SQL aplica solo en PostgreSQL17 aislado', () => {
  expect(sql('SHOW server_version;').output).toMatch(/^17\./);
  expect(
    sql("SELECT count(*) FROM information_schema.tables WHERE table_schema='marleva';").output,
  ).toBe('13');
});
it('MAR-M1-IT-BE-115 | SEQ014:S040 | no autoaprobación ni solicitante ajeno', () => {
  reject(
    `INSERT INTO marleva."MfaRecovery"("accountId","requestedBy","approvedBy",state,reason,"expiresAt") VALUES ('${a}','${a}','${a}','approved','ficticio',now()+interval '1 day');`,
  );
  reject(
    `INSERT INTO marleva."MfaRecovery"("accountId","requestedBy",reason,"expiresAt") VALUES ('${a}','${b}','ficticio',now()+interval '1 day');`,
  );
});
it('MAR-M1-IT-BE-116 | SEQ014:S020 | una recuperación activa por cuenta', () => {
  reject(
    `INSERT INTO marleva."MfaRecovery"("accountId","requestedBy",reason,"expiresAt") VALUES ('${a}','${a}','ficticio',now()+interval '1 day'),('${a}','${a}','otra',now()+interval '1 day');`,
  );
});
it('MAR-M1-IT-BE-117 | DATA002 | rol activo único y autoasignación denegada', () => {
  reject(
    `INSERT INTO marleva."RoleAssignment"("accountId",role,reason) VALUES ('${a}','m1_operator','bootstrap ficticio'),('${a}','m1_operator','duplicado');`,
  );
  reject(
    `INSERT INTO marleva."RoleAssignment"("accountId",role,"grantedBy",reason) VALUES ('${a}','m1_access_admin','${a}','propio');`,
  );
});
it('MAR-M1-IT-BE-118 | SEQ014:S090 | capacidad incompleta y caducidad imposibles rechazadas', () => {
  reject(
    `INSERT INTO marleva."MfaRecovery"("accountId","requestedBy",reason,"expiresAt","capabilityHash") VALUES ('${a}','${a}','ficticio',now()+interval '1 day','fixture');`,
  );
  reject(
    `INSERT INTO marleva."MfaRecovery"("accountId","requestedBy",reason,"expiresAt") VALUES ('${a}','${a}','ficticio',now()-interval '1 second');`,
  );
});
it('MAR-M1-IT-BE-119 | SEQ011:S020 | archivo inválido no se acepta', () => {
  reject(
    `INSERT INTO marleva."PrivateFixture"("accountId","objectKey",sha256,bytes) VALUES ('${a}','fixture','${'a'.repeat(64)}',0);`,
  );
  reject(
    `INSERT INTO marleva."PrivateFixture"("accountId","objectKey",sha256,bytes,state) VALUES ('${a}','fixture','${'a'.repeat(64)}',1,'deleted');`,
  );
});
it('MAR-M1-IT-BE-120 | SEQ005:S030 | FK de cambio de correo no admite cuenta inexistente', () => {
  reject(
    `INSERT INTO marleva."EmailChange"("accountId","oldEmail","newEmail","providerTokens","expiresAt") VALUES ('33333333-3333-4333-8333-333333333333','a@example.test','c@example.test','fixture',now()+interval '10 minutes');`,
  );
});
it('MAR-M1-IT-BE-121 | DATA002 | fixture válido y aprobación ajena conservan integridad', () => {
  expect(
    sql(
      `BEGIN; INSERT INTO marleva."MfaRecovery"("accountId","requestedBy","approvedBy",state,reason,"expiresAt") VALUES ('${a}','${a}','${b}','approved','ficticio',now()+interval '1 day'); INSERT INTO marleva."PrivateFixture"("accountId","objectKey",sha256,bytes) VALUES ('${a}','fixture','${'a'.repeat(64)}',1); ROLLBACK;`,
    ).ok,
  ).toBe(true);
});

it('MAR-M1-IT-BE-122 | SEQ011:S040 | capacidad no puede ligar titular ajeno y máximo300s', () => {
  const seed = `INSERT INTO marleva."Session"(id,"accountId","tokenHash","csrfHash","providerTokens") VALUES ('${a}','${a}','fixture-token','fixture-csrf','fixture-cipher'); INSERT INTO marleva."PrivateFixture"(id,"accountId","objectKey",sha256,bytes) VALUES ('${a}','${a}','access-fixture','${'a'.repeat(64)}',1);`;
  reject(
    seed +
      `INSERT INTO marleva."FixtureAccess"("fixtureId","accountId","sessionId","tokenHash","expiresAt") VALUES ('${a}','${b}','${a}','${'b'.repeat(64)}',now()+interval '5 minutes');`,
  );
  reject(
    seed +
      `INSERT INTO marleva."FixtureAccess"("fixtureId","accountId","sessionId","tokenHash","expiresAt") VALUES ('${a}','${a}','${a}','${'b'.repeat(64)}',now()+interval '301 seconds');`,
  );
  expect(
    sql(
      'BEGIN; ' +
        seed +
        `INSERT INTO marleva."FixtureAccess"("fixtureId","accountId","sessionId","tokenHash","expiresAt") VALUES ('${a}','${a}','${a}','${'b'.repeat(64)}',now()+interval '300 seconds'); ROLLBACK;`,
    ).ok,
  ).toBe(true);
});
it('MAR-M1-IT-BE-123 | SEQ011:S110 | borrado durable válido y estado incompleto denegado', () => {
  reject(
    `INSERT INTO marleva."PrivateFixture"("accountId","objectKey",sha256,bytes,state) VALUES ('${a}','pending-fixture','${'a'.repeat(64)}',1,'delete_pending');`,
  );
  expect(
    sql(
      `BEGIN; INSERT INTO marleva."PrivateFixture"(id,"accountId","objectKey",sha256,bytes,state,"deleteRequestedAt") VALUES ('${a}','${a}','deleted-fixture','${'a'.repeat(64)}',1,'delete_pending',now()); INSERT INTO marleva."FixtureDeletion"("fixtureId","accountId","idempotencyKey","requestHash","expectedVersion") VALUES ('${a}','${a}','fixture-delete-key-001','${'a'.repeat(64)}',1); ROLLBACK;`,
    ).ok,
  ).toBe(true);
});
