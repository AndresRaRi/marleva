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

CREATE INDEX "Challenge_email_createdAt_idx" ON "marleva"."Challenge" ("email", "createdAt");

CREATE INDEX "Challenge_origin_createdAt_idx" ON "marleva"."Challenge" ("origin", "createdAt");

CREATE INDEX "EmailChange_accountId_state_idx" ON "marleva"."EmailChange" ("accountId", "state");

COMMENT ON COLUMN "marleva"."Account"."authId" IS 'Identidad del proveedor, validada mediante adaptador; no acceso directo cliente a Auth.';

COMMENT ON COLUMN "marleva"."Account"."operator" IS 'Implementación inicial simplificada; asignaciones formales de roles y recuperación MFA pendientes.';

COMMENT ON COLUMN "marleva"."Session"."providerTokens" IS 'Credenciales cifradas en servidor; nunca valores de ejemplo reales.';

COMMENT ON COLUMN "marleva"."EmailChange"."accountId" IS 'Brecha MAR-M1-BUG-002: relación lógica con Account sin FK en migración aplicada; revisar y migrar antes de cierre.';

COMMENT ON COLUMN "marleva"."Audit"."accountId" IS 'Actor mínimo registrado; FK/conservación por finalidad por revisar antes de cierre.';

COMMENT ON COLUMN "marleva"."Development"."name" IS 'Catálogo de siete desarrollos; sin polígonos inferidos.';

ALTER TABLE "marleva"."Session" ADD CONSTRAINT "Session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."Notice" ADD CONSTRAINT "Notice_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

