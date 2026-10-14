import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
process.loadEnvFile(new URL('../../../../.env', import.meta.url));
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const copy = JSON.parse(readFileSync('tests/results/recovery-copy.json', 'utf8'));
const fixture = JSON.parse(readFileSync('artifacts/recovery/fixtures.private.json', 'utf8'));
const ledger = JSON.parse(readFileSync('artifacts/recovery/deletions.private.json', 'utf8'))[0];
assert.equal(ledger.copyPrefix, copy.names.prefix);
const folder = 'artifacts/recovery/' + copy.names.prefix + '/provider';
const stack = JSON.parse(readFileSync(folder + '/stack.private.json', 'utf8'));
assert.equal(stack.copyPrefix, copy.names.prefix);
const { database } = await import('../../../../apps/api/dist/database.js');
const { identity, identityAdmin } = await import('../../../../apps/api/dist/identity.js');
const { unseal } = await import('../../../../apps/api/dist/security.js');
const report = {
  date: new Date().toISOString(),
  copyPrefix: copy.names.prefix,
  cases: {},
  limits: [
    'Operadores/MFA administrativo, cliente, cola, migración interrumpida y PF113 pendientes',
    'Worker limitado al borrado del fixture; dueAt adelantado tras caída/reinicio explícitamente',
  ],
};
const sourceDb = database(),
  sourceProvider = identity(),
  originTokens = [];
try {
  for (const actor of fixture.actors) {
    const response = await fetch('http://127.0.0.1:3000/v1/me', {
      headers: { authorization: 'Bearer ' + actor.credential },
    });
    assert.equal(response.status, 200, 'Control positivo en origen');
    const current = await sourceDb.session.findUniqueOrThrow({ where: { id: actor.sessionId } });
    const t = unseal(current.providerTokens, process.env.TOKEN_ENCRYPTION_KEY);
    const user = await sourceProvider.auth.getUser(t.access_token);
    assert.ok(!user.error && user.data.user.id === actor.authId);
    originTokens.push({ actor, t });
  }
  report.cases.originCredentialsStillValid = true;
} finally {
  await sourceDb.$disconnect();
}
Object.assign(process.env, stack.environment);
const db = database(),
  targetProvider = identity(),
  admin = identityAdmin();
const { PrismaFileRepository } =
  await import('../../../../apps/api/dist/modules/m1/infrastructure/repositories/prisma-file-repository.js');
const { LocalPrivateStorage } =
  await import('../../../../apps/api/dist/modules/m1/infrastructure/adapters/local-private-storage.js');
const { IssueFileAccess } =
  await import('../../../../apps/api/dist/modules/m1/application/use-cases/issue-file-access.js');
const { ReadPrivateFile } =
  await import('../../../../apps/api/dist/modules/m1/application/use-cases/read-private-file.js');
const { DeletePrivateFile } =
  await import('../../../../apps/api/dist/modules/m1/application/use-cases/delete-private-file.js');
const { ProcessFileDeletions } =
  await import('../../../../apps/api/dist/modules/m1/application/use-cases/process-file-deletions.js');
const repo = new PrismaFileRepository(db),
  storage = new LocalPrivateStorage(),
  issuer = new IssueFileAccess(repo),
  reader = new ReadPrivateFile(repo, storage);
const actorA = fixture.actors.find((a) => a.name === 'A'),
  actor = { accountId: actorA.accountId, sessionId: actorA.sessionId };
const keepA = fixture.files.find((f) => f.owner === 'A' && f.purpose === 'keep'),
  doomed = fixture.files.find((f) => f.id === ledger.fixtureId);
let app,
  storageStopped = false;
const docker = (args) =>
  execFileSync('docker', args, {
    encoding: 'utf8',
    timeout: 30000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
async function waitStorage() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(stack.environment.SUPABASE_URL + '/storage/v1/status', {
        headers: { apikey: stack.environment.SUPABASE_ANON_KEY },
        signal: AbortSignal.timeout(1000),
      });
      if (r.ok) return;
    } catch {
      /* Bounded startup retry. */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Storage no regresó');
}
try {
  const liveAccess = await issuer.execute(actor, keepA.id),
    deleteAccess = await issuer.execute(actor, doomed.id);
  const before = await reader.execute(actor, doomed.id, deleteAccess.capability);
  assert.equal(createHash('sha256').update(before).digest('hex'), doomed.sha256);
  report.cases.deletedObjectWasPresentInCopy = true;
  const deletion = new DeletePrivateFile(repo);
  const intent = await deletion.execute(actor, doomed.id, ledger.idempotencyKey, 1);
  assert.equal(intent.estado, 'delete_pending');
  const task = await db.fixtureDeletion.findUniqueOrThrow({ where: { fixtureId: doomed.id } });
  const workerRepo = {
    ready: async (now) => (await repo.ready(now)).filter((job) => job.id === task.id),
    claim: (...args) => repo.claim(...args),
    complete: (...args) => repo.complete(...args),
    retry: (...args) => repo.retry(...args),
  };
  const processor = new ProcessFileDeletions(workerRepo, storage);
  docker(['stop', '--time', '10', stack.names.storage]);
  storageStopped = true;
  await processor.execute();
  assert.equal(
    (await db.privateFixture.findUniqueOrThrow({ where: { id: doomed.id } })).state,
    'delete_pending',
  );
  await assert.rejects(
    reader.execute(actor, doomed.id, deleteAccess.capability),
    (e) => e.kind === 'missing',
  );
  assert.equal(
    (await db.fixtureDeletion.findUniqueOrThrow({ where: { fixtureId: doomed.id } })).state,
    'pending',
  );
  report.cases.storageDownKeepsIntentAndBlocksRead = true;
  docker(['start', stack.names.storage]);
  storageStopped = false;
  await waitStorage();
  await db.fixtureDeletion.update({
    where: { id: task.id },
    data: { dueAt: new Date(Date.now() - 1) },
  });
  await processor.execute();
  assert.equal(
    (await db.privateFixture.findUniqueOrThrow({ where: { id: doomed.id } })).state,
    'deleted',
  );
  assert.ok(await storage.absent(doomed.key));
  report.cases.postCopyDeletionReapplied = true;
  await db.$transaction(async (tx) => {
    await tx.session.updateMany({ where: { revokedAt: null }, data: { revokedAt: new Date() } });
    await tx.fixtureAccess.updateMany({
      where: { revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });
  docker([
    'exec',
    '-i',
    stack.names.db,
    'psql',
    '-U',
    'supabase_admin',
    '-d',
    'postgres',
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    'BEGIN; DELETE FROM auth.refresh_tokens; DELETE FROM auth.sessions; DELETE FROM auth.one_time_tokens; COMMIT;',
  ]);
  for (const entry of originTokens) {
    const old = await targetProvider.auth.getUser(entry.t.access_token);
    assert.ok(old.error && !old.data.user, 'Credencial del origen no debe valer en destino');
  }
  const refresh = await targetProvider.auth.refreshSession({
    refresh_token: actorA.provider.refresh_token,
  });
  assert.ok(refresh.error && !refresh.data.session);
  report.cases.providerOldAccessAndRefreshRejected = true;
  const jwks = await (
    await fetch(stack.environment.SUPABASE_URL + '/auth/v1/.well-known/jwks.json')
  ).json();
  assert.ok(jwks.keys.length > 0 && jwks.keys.every((k) => !k.d && !k.k));
  report.cases.publicJwksHasNoPrivateMaterial = true;
  const { makeApp } = await import('../../../../apps/api/dist/main.js');
  app = await makeApp();
  await app.listen(3001, '127.0.0.1');
  for (const oldActor of fixture.actors) {
    const r = await fetch('http://127.0.0.1:3001/v1/me', {
      headers: { authorization: 'Bearer ' + oldActor.credential },
    });
    assert.equal(r.status, 401);
  }
  report.cases.oldMarlevaSessionsRejected = true;
  const fresh = [];
  for (const oldActor of fixture.actors) {
    const user = await admin.auth.admin.getUserById(oldActor.authId);
    assert.ok(!user.error && user.data.user.id === oldActor.authId);
    const mail = user.data.user.email,
      since = Date.now();
    const challenge = await fetch('http://127.0.0.1:3001/v1/auth/challenges', {
      method: 'POST',
      headers: { 'x-marleva-client': 'native', 'content-type': 'application/json' },
      body: JSON.stringify({ correo: mail }),
    });
    assert.equal(challenge.status, 201, 'OTP nuevo del destino');
    const body = await challenge.json();
    let otp;
    for (let i = 0; i < 100; i++) {
      const messages = await (await fetch('http://127.0.0.1:54424/api/v1/messages')).json();
      const message = messages.messages.find(
        (m) => m.To.some((t) => t.Address === mail) && +new Date(m.Created) >= since,
      );
      if (message) {
        const content = await (
          await fetch('http://127.0.0.1:54424/api/v1/message/' + message.ID)
        ).json();
        otp = (content.Text + ' ' + content.HTML).match(/\b\d{6}\b/)?.[0];
        if (otp) break;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    assert.ok(otp, 'Código local del destino no llegó');
    const verified = await fetch('http://127.0.0.1:3001/v1/auth/verifications', {
      method: 'POST',
      headers: { 'x-marleva-client': 'native', 'content-type': 'application/json' },
      body: JSON.stringify({ challenge_id: body.challenge_id, codigo: otp }),
    });
    assert.equal(verified.status, 201);
    const login = await verified.json();
    assert.equal(login.cuenta.id, oldActor.accountId);
    assert.equal(typeof login.session_token, 'string');
    fresh.push({ ...oldActor, credential: login.session_token });
  }
  report.cases.newOtpPreservesAccountIds = true;
  let restoredFiles = 0;
  for (const file of fixture.files.filter((f) => f.purpose === 'keep')) {
    const own = fresh.find((a) => a.name === file.owner),
      other = fresh.find((a) => a.name !== file.owner),
      base = 'http://127.0.0.1:3001/v1/local/file-fixtures/' + file.id;
    const issued = await fetch(base + '/access', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + own.credential, 'x-marleva-client': 'native' },
    });
    assert.equal(issued.status, 201);
    const access = await issued.json();
    const read = await fetch(base + '/content', {
      headers: {
        authorization: 'Bearer ' + own.credential,
        'x-fixture-capability': access.capability,
      },
    });
    assert.equal(read.status, 200);
    const data = Buffer.from(await read.arrayBuffer());
    assert.equal(data.length, file.bytes);
    assert.equal(createHash('sha256').update(data).digest('hex'), file.sha256);
    const denied = await fetch(base + '/content', {
      headers: {
        authorization: 'Bearer ' + other.credential,
        'x-fixture-capability': access.capability,
      },
    });
    assert.equal(denied.status, 404);
    assert.equal((await fetch(base + '/content')).status, 401);
    restoredFiles++;
  }
  report.cases.restoredOwnFilesAndOtherPublicDenial = restoredFiles;
  assert.ok(
    +new Date(liveAccess.expires_at) > Date.now(),
    'Permiso de control debe seguir dentro de TTL',
  );
  const oldCap = await fetch(
    'http://127.0.0.1:3001/v1/local/file-fixtures/' + keepA.id + '/content',
    {
      headers: {
        authorization: 'Bearer ' + fresh.find((a) => a.name === 'A').credential,
        'x-fixture-capability': liveAccess.capability,
      },
    },
  );
  assert.equal(oldCap.status, 403);
  report.cases.unexpiredOldCapabilityRejected = true;
  const deletedRead = await fetch(
    'http://127.0.0.1:3001/v1/local/file-fixtures/' + doomed.id + '/content',
    {
      headers: {
        authorization: 'Bearer ' + fresh.find((a) => a.name === 'A').credential,
        'x-fixture-capability': deleteAccess.capability,
      },
    },
  );
  assert.equal(deletedRead.status, 404);
  writeFileSync(folder + '/new-sessions.private.json', JSON.stringify(fresh, null, 2), {
    mode: 0o600,
  });
  report.cases.deletedObjectCannotReappear = true;
  console.log(
    'B12: borrado reaplicado, caída recuperable, credenciales antiguas denegadas y OTP nuevo con IDs/permisos conservados',
  );
} catch (error) {
  report.error = error.message;
  writeFileSync(
    'tests/results/recovery-provider-failure.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  throw error;
} finally {
  if (storageStopped) docker(['start', stack.names.storage]);
  if (app) {
    const { AccountService } = await import('../../../../apps/api/dist/account.service.js');
    await app.close();
    await app.get(AccountService).db.$disconnect();
  }
  await db.$disconnect();
  if (!report.error)
    writeFileSync('tests/results/recovery-provider.json', JSON.stringify(report, null, 2) + '\n');
}
