-- GENERADO desde MAR-M1-DATA-001.dbml. Solo revisión; no aplicar completo sobre base existente.
CREATE SCHEMA "marleva";

CREATE TABLE "marleva"."Account" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "authId" uuid UNIQUE NOT NULL,
  "email" text UNIQUE NOT NULL,
  "state" text NOT NULL DEFAULT 'active',
  "operator" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "marleva"."Session" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "accountId" uuid NOT NULL,
  "tokenHash" text UNIQUE NOT NULL,
  "csrfHash" text NOT NULL,
  "providerTokens" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "lastSeen" timestamptz NOT NULL DEFAULT (now()),
  "authenticatedAt" timestamptz NOT NULL DEFAULT (now()),
  "revokedAt" timestamptz,
  "refreshLease" timestamptz
);

CREATE TABLE "marleva"."Challenge" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "email" text NOT NULL,
  "origin" text NOT NULL,
  "state" text NOT NULL DEFAULT 'sending',
  "attempts" integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "expiresAt" timestamptz NOT NULL,
  "blockedUntil" timestamptz
);

CREATE TABLE "marleva"."EmailChange" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "accountId" uuid NOT NULL,
  "oldEmail" text NOT NULL,
  "newEmail" text NOT NULL,
  "providerTokens" text NOT NULL,
  "oldConfirmed" boolean NOT NULL DEFAULT false,
  "newConfirmed" boolean NOT NULL DEFAULT false,
  "state" text NOT NULL DEFAULT 'sending',
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "expiresAt" timestamptz NOT NULL,
  "attempts" integer NOT NULL DEFAULT 0
);

CREATE TABLE "marleva"."Notice" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "accountId" uuid NOT NULL,
  "kind" text NOT NULL,
  "text" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "marleva"."Outbox" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "reference" text UNIQUE NOT NULL,
  "recipient" text NOT NULL,
  "subject" text NOT NULL,
  "text" text NOT NULL,
  "state" text NOT NULL DEFAULT 'pending',
  "attempts" integer NOT NULL DEFAULT 0,
  "dueAt" timestamptz NOT NULL DEFAULT (now()),
  "leaseUntil" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "marleva"."Audit" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "accountId" uuid,
  "action" text NOT NULL,
  "resourceId" uuid,
  "createdAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "marleva"."Development" (
  "id" integer PRIMARY KEY NOT NULL,
  "name" text UNIQUE NOT NULL
);

CREATE TABLE "marleva"."PrivateFixture" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "accountId" uuid NOT NULL,
  "objectKey" text UNIQUE NOT NULL,
  "sha256" text NOT NULL,
  "mimeType" text NOT NULL DEFAULT 'text/plain',
  "bytes" integer NOT NULL,
  "state" text NOT NULL DEFAULT 'available',
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "deletedAt" timestamptz,
  "deleteRequestedAt" timestamptz,
  "version" integer NOT NULL DEFAULT 1
);

CREATE TABLE "marleva"."FixtureAccess" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "fixtureId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "sessionId" uuid NOT NULL,
  "tokenHash" text UNIQUE NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "expiresAt" timestamptz NOT NULL,
  "revokedAt" timestamptz
);

CREATE TABLE "marleva"."FixtureDeletion" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "fixtureId" uuid UNIQUE NOT NULL,
  "accountId" uuid NOT NULL,
  "idempotencyKey" text NOT NULL,
  "requestHash" text NOT NULL,
  "expectedVersion" integer NOT NULL,
  "state" text NOT NULL DEFAULT 'pending',
  "attempts" integer NOT NULL DEFAULT 0,
  "dueAt" timestamptz NOT NULL DEFAULT (now()),
  "leaseUntil" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "completedAt" timestamptz
);

CREATE UNIQUE INDEX "Session_id_accountId_key" ON "marleva"."Session" ("id", "accountId");

CREATE INDEX "Challenge_email_createdAt_idx" ON "marleva"."Challenge" ("email", "createdAt");

CREATE INDEX "Challenge_origin_createdAt_idx" ON "marleva"."Challenge" ("origin", "createdAt");

CREATE INDEX "EmailChange_accountId_state_idx" ON "marleva"."EmailChange" ("accountId", "state");

CREATE INDEX "Notice_accountId_createdAt_id_idx" ON "marleva"."Notice" ("accountId", "createdAt", "id");

CREATE UNIQUE INDEX "PrivateFixture_id_accountId_key" ON "marleva"."PrivateFixture" ("id", "accountId");

CREATE INDEX "FixtureAccess_sessionId_createdAt_idx" ON "marleva"."FixtureAccess" ("sessionId", "createdAt");

CREATE UNIQUE INDEX "FixtureDeletion_accountId_idempotencyKey_key" ON "marleva"."FixtureDeletion" ("accountId", "idempotencyKey");

COMMENT ON COLUMN "marleva"."Account"."authId" IS 'Identidad del proveedor, validada mediante adaptador; no acceso directo cliente a Auth.';

COMMENT ON COLUMN "marleva"."Account"."operator" IS 'Implementación inicial simplificada; asignaciones formales de roles y recuperación MFA pendientes.';

COMMENT ON COLUMN "marleva"."Session"."providerTokens" IS 'Credenciales cifradas en servidor; nunca valores de ejemplo reales.';

COMMENT ON COLUMN "marleva"."EmailChange"."accountId" IS 'Brecha MAR-M1-BUG-002: relación lógica con Account sin FK en migración aplicada; revisar y migrar antes de cierre.';

COMMENT ON COLUMN "marleva"."Audit"."accountId" IS 'Actor mínimo registrado; FK/conservación por finalidad por revisar antes de cierre.';

COMMENT ON COLUMN "marleva"."Development"."name" IS 'Catálogo de siete desarrollos; sin polígonos inferidos.';

COMMENT ON TABLE "marleva"."PrivateFixture" IS 'Solo prueba B09, no expediente M2. Acceso temporal tras autorización, sin URL almacenada ni bucket público.';

COMMENT ON TABLE "marleva"."FixtureAccess" IS 'B09 aplicado en005. Máximo300s; API revalida vigencia actual de sesión/titular y disponibilidad. Reemisión revoca anterior; límite10/min/sesión incluye revocados.';

COMMENT ON COLUMN "marleva"."FixtureAccess"."tokenHash" IS 'Solo hash SHA256 de secreto aleatorio estándar; nunca URL ni secreto en logs.';

COMMENT ON TABLE "marleva"."FixtureDeletion" IS 'Intención durable de borrado. Pending bloquea lecturas desde commit. Conservar para reaplicar borrado tras restauración ficticia; calendario real pendiente.';

ALTER TABLE "marleva"."Session" ADD CONSTRAINT "Session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."Notice" ADD CONSTRAINT "Notice_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."PrivateFixture" ADD CONSTRAINT "Fixture_account" FOREIGN KEY ("accountId") REFERENCES "marleva"."Account" ("id") NOT DEFERRABLE;

ALTER TABLE "marleva"."FixtureAccess" ADD CONSTRAINT "FixtureAccess_fixture_owner" FOREIGN KEY ("fixtureId", "accountId") REFERENCES "marleva"."PrivateFixture" ("id", "accountId") NOT DEFERRABLE;

ALTER TABLE "marleva"."FixtureAccess" ADD CONSTRAINT "FixtureAccess_session_owner" FOREIGN KEY ("sessionId", "accountId") REFERENCES "marleva"."Session" ("id", "accountId") NOT DEFERRABLE;

ALTER TABLE "marleva"."FixtureDeletion" ADD CONSTRAINT "FixtureDeletion_fixture_owner" FOREIGN KEY ("fixtureId", "accountId") REFERENCES "marleva"."PrivateFixture" ("id", "accountId") NOT DEFERRABLE;

ALTER TABLE marleva."PrivateFixture" ADD CONSTRAINT fixture_size CHECK (bytes BETWEEN 1 AND 1048576), ADD CONSTRAINT fixture_hash CHECK (sha256 ~ '^[0-9a-f]{64}$'), ADD CONSTRAINT fixture_mime CHECK ("mimeType"='text/plain'), ADD CONSTRAINT fixture_version CHECK (version>0), ADD CONSTRAINT fixture_deleted CHECK ((state='available' AND "deletedAt" IS NULL AND "deleteRequestedAt" IS NULL) OR (state='delete_pending' AND "deletedAt" IS NULL AND "deleteRequestedAt" IS NOT NULL AND "deleteRequestedAt">="createdAt") OR (state='deleted' AND "deletedAt" IS NOT NULL AND "deleteRequestedAt" IS NOT NULL AND "deletedAt">="deleteRequestedAt" AND "deleteRequestedAt">="createdAt"));
CREATE UNIQUE INDEX fixture_access_active ON marleva."FixtureAccess" ("fixtureId","sessionId") WHERE "revokedAt" IS NULL;
ALTER TABLE marleva."FixtureAccess" ADD CONSTRAINT fixture_access_hash CHECK ("tokenHash" ~ '^[0-9a-f]{64}$'), ADD CONSTRAINT fixture_access_dates CHECK ("expiresAt">"createdAt" AND "expiresAt"<="createdAt"+interval '300 seconds' AND ("revokedAt" IS NULL OR "revokedAt">="createdAt"));
ALTER TABLE marleva."FixtureDeletion" ADD CONSTRAINT fixture_deletion_hash CHECK ("requestHash" ~ '^[0-9a-f]{64}$'), ADD CONSTRAINT fixture_deletion_key CHECK (length("idempotencyKey") BETWEEN 16 AND 128), ADD CONSTRAINT fixture_deletion_version CHECK ("expectedVersion">0), ADD CONSTRAINT fixture_deletion_attempts CHECK (attempts>=0), ADD CONSTRAINT fixture_deletion_state CHECK (state IN ('pending','processing','completed')), ADD CONSTRAINT fixture_deletion_completed CHECK ((state='completed')=("completedAt" IS NOT NULL)), ADD CONSTRAINT fixture_deletion_dates CHECK ("completedAt" IS NULL OR "completedAt">="createdAt");

