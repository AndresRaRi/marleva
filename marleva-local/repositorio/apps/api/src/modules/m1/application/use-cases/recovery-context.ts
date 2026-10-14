import { randomUUID } from 'node:crypto';
import { fail } from '../../../../security.js';
import type { RecoveryRepository, RecoveryTransaction } from '../ports/recovery-repository.js';
import type { RecoveryProvider, RecoverySecrets } from '../ports/recovery-provider.js';
import type { RecoveryActor, RecoveryRecord } from '../../domain/entities/mfa-recovery.js';
export class RecoveryContext {
  constructor(
    readonly repository: RecoveryRepository,
    readonly provider: RecoveryProvider,
    readonly secrets: RecoverySecrets,
    readonly clock = () => new Date(),
  ) {}
  async actor(tx: RecoveryTransaction, actor: RecoveryActor) {
    if (!(await tx.sessionActive(actor.accountId, actor.sessionId)))
      fail(401, 'SESION', 'Inicia sesión de nuevo');
    const role =
      (await tx.hasRole(actor.accountId, 'm1_operator')) ||
      (await tx.hasRole(actor.accountId, 'm1_access_admin'));
    if (!role) fail(403, 'PERMISO', 'No tienes permiso de operador');
  }
  recent(actor: RecoveryActor) {
    const elapsed = +this.clock() - +actor.authenticatedAt;
    if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed >= 300000)
      fail(403, 'REAUTENTICACION', 'Inicia sesión de nuevo para continuar');
  }
  async review(tx: RecoveryTransaction, actor: RecoveryActor, row: RecoveryRecord, level: string) {
    await this.actor(tx, actor);
    this.recent(actor);
    if (
      !(await tx.hasRole(row.accountId, 'm1_operator')) &&
      !(await tx.hasRole(row.accountId, 'm1_access_admin'))
    )
      fail(403, 'PERMISO', 'El titular ya no tiene permiso de operador');
    if (row.accountId === actor.accountId)
      fail(403, 'RECUPERACION_PROPIA', 'Otro administrador debe revisar');
    if (
      (await tx.requiresRecovery(actor.accountId)) ||
      !(await tx.hasRole(actor.accountId, 'm1_access_admin')) ||
      level !== 'aal2'
    )
      fail(403, 'PERMISO', 'Verifica tu segundo factor y permiso de revisión');
  }
  async owner(tx: RecoveryTransaction, actor: RecoveryActor, row: RecoveryRecord) {
    await this.actor(tx, actor);
    this.recent(actor);
    if (row.accountId !== actor.accountId) fail(404, 'RECUPERACION', 'Recuperación no disponible');
  }
  required(row: RecoveryRecord | null): RecoveryRecord {
    if (!row) fail(404, 'RECUPERACION', 'Recuperación no disponible');
    return row;
  }
  state(row: RecoveryRecord, allowed: string[], version: number) {
    if (row.expiresAt <= this.clock()) fail(409, 'VENCIDA', 'Solicita otra recuperación');
    if (row.version !== version || !allowed.includes(row.state))
      fail(409, 'VERSION', 'Consulta el estado antes de repetir');
  }
  key(actor: RecoveryActor, action: string, key: string) {
    return this.secrets.fingerprint([actor.accountId, action, key]);
  }
  replay(row: RecoveryRecord, operation: string, body: unknown): unknown | undefined {
    const stored = row.operations[operation];
    if (!stored) return undefined;
    if (stored.hash !== this.secrets.fingerprint(body))
      fail(409, 'IDEMPOTENCIA', 'Usa otra clave para una solicitud distinta');
    if (!stored.response) return undefined;
    if (stored.expiresAt && +new Date(stored.expiresAt) <= +this.clock())
      fail(409, 'VENCIDA', 'La respuesta privada ya venció');
    return this.secrets.unseal(stored.response);
  }
  response(row: RecoveryRecord, key: string, body: unknown, result: unknown, expires?: Date) {
    if (Object.keys(row.operations).length >= 32 && !row.operations[key])
      fail(409, 'LIMITE', 'Consulta el proceso antes de repetir');
    row.operations[key] = {
      hash: this.secrets.fingerprint(body),
      response: this.secrets.seal(result),
      status: 'done',
      ...(expires ? { expiresAt: expires.toISOString() } : {}),
    };
  }
  reserve(row: RecoveryRecord, key: string, body: unknown) {
    this.replay(row, key, body);
    if (Object.keys(row.operations).length >= 32 && !row.operations[key])
      fail(409, 'LIMITE', 'Consulta el proceso antes de repetir');
    if (row.leaseUntil && row.leaseUntil > this.clock())
      fail(409, 'OCUPADA', 'La recuperación se está procesando');
    row.operations[key] = { hash: this.secrets.fingerprint(body), status: 'pending' };
    row.leaseToken = randomUUID();
    row.leaseUntil = new Date(+this.clock() + 180000);
  }
  capability(row: RecoveryRecord, actor: RecoveryActor, value: string) {
    if (
      row.capabilitySessionId !== actor.sessionId ||
      !row.capabilityHash ||
      !this.secrets.equals(value, row.capabilityHash) ||
      !row.capabilityExpiresAt ||
      row.capabilityExpiresAt <= this.clock() ||
      row.capabilityConsumedAt ||
      row.capabilityAttempts >= 5
    )
      fail(403, 'CAPACIDAD', 'Solicita una nueva autorización de recuperación');
  }
  clearPrivate(row: RecoveryRecord) {
    for (const op of Object.values(row.operations)) if (op.expiresAt) delete op.response;
    row.providerState = {};
  }
  newRecord(
    actor: RecoveryActor,
    key: string,
    reason: string,
    factorIds: string[],
  ): RecoveryRecord {
    const now = this.clock();
    return {
      id: randomUUID(),
      accountId: actor.accountId,
      requestedBy: actor.accountId,
      approvedBy: null,
      approvedAt: null,
      state: 'requested',
      reason,
      providerReference: null,
      requestKey: key,
      requestHash: this.secrets.fingerprint({ reason }),
      operations: {},
      providerState: {
        authId: actor.authId,
        factorIds,
        tokensEnvelope: this.secrets.seal(actor.tokens),
      },
      leaseToken: null,
      leaseUntil: null,
      capabilitySessionId: null,
      capabilityExpiresAt: null,
      capabilityAttempts: 0,
      capabilityConsumedAt: null,
      factorId: null,
      capabilityHash: null,
      createdAt: now,
      expiresAt: new Date(+now + 86400000),
      completedAt: null,
      version: 1,
    };
  }
}
