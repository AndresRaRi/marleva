-- B09: derivado de DATA002; solo archivos ficticios privados. No modifica Auth ni roles.
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

CREATE UNIQUE INDEX "Session_id_accountId_key" ON marleva."Session" ("id","accountId");
CREATE UNIQUE INDEX "PrivateFixture_id_accountId_key" ON marleva."PrivateFixture" ("id","accountId");
CREATE INDEX "FixtureAccess_sessionId_createdAt_idx" ON marleva."FixtureAccess" ("sessionId","createdAt");
CREATE UNIQUE INDEX "FixtureDeletion_accountId_idempotencyKey_key" ON marleva."FixtureDeletion" ("accountId","idempotencyKey");
CREATE UNIQUE INDEX fixture_access_active ON marleva."FixtureAccess" ("fixtureId","sessionId") WHERE "revokedAt" IS NULL;

ALTER TABLE "marleva"."PrivateFixture" ADD CONSTRAINT "Fixture_account" FOREIGN KEY ("accountId") REFERENCES "marleva"."Account" ("id") NOT DEFERRABLE;
ALTER TABLE "marleva"."FixtureAccess" ADD CONSTRAINT "FixtureAccess_fixture_owner" FOREIGN KEY ("fixtureId", "accountId") REFERENCES "marleva"."PrivateFixture" ("id", "accountId") NOT DEFERRABLE;
ALTER TABLE "marleva"."FixtureAccess" ADD CONSTRAINT "FixtureAccess_session_owner" FOREIGN KEY ("sessionId", "accountId") REFERENCES "marleva"."Session" ("id", "accountId") NOT DEFERRABLE;
ALTER TABLE "marleva"."FixtureDeletion" ADD CONSTRAINT "FixtureDeletion_fixture_owner" FOREIGN KEY ("fixtureId", "accountId") REFERENCES "marleva"."PrivateFixture" ("id", "accountId") NOT DEFERRABLE;
ALTER TABLE marleva."PrivateFixture" ADD CONSTRAINT fixture_size CHECK (bytes BETWEEN 1 AND 1048576), ADD CONSTRAINT fixture_hash CHECK (sha256 ~ '^[0-9a-f]{64}$'), ADD CONSTRAINT fixture_mime CHECK ("mimeType"='text/plain'), ADD CONSTRAINT fixture_version CHECK (version>0), ADD CONSTRAINT fixture_deleted CHECK ((state='available' AND "deletedAt" IS NULL AND "deleteRequestedAt" IS NULL) OR (state='delete_pending' AND "deletedAt" IS NULL AND "deleteRequestedAt" IS NOT NULL AND "deleteRequestedAt">="createdAt") OR (state='deleted' AND "deletedAt" IS NOT NULL AND "deleteRequestedAt" IS NOT NULL AND "deletedAt">="deleteRequestedAt" AND "deleteRequestedAt">="createdAt"));
ALTER TABLE marleva."FixtureAccess" ADD CONSTRAINT fixture_access_hash CHECK ("tokenHash" ~ '^[0-9a-f]{64}$'), ADD CONSTRAINT fixture_access_dates CHECK ("expiresAt">"createdAt" AND "expiresAt"<="createdAt"+interval '300 seconds' AND ("revokedAt" IS NULL OR "revokedAt">="createdAt"));
ALTER TABLE marleva."FixtureDeletion" ADD CONSTRAINT fixture_deletion_hash CHECK ("requestHash" ~ '^[0-9a-f]{64}$'), ADD CONSTRAINT fixture_deletion_key CHECK (length("idempotencyKey") BETWEEN 16 AND 128), ADD CONSTRAINT fixture_deletion_version CHECK ("expectedVersion">0), ADD CONSTRAINT fixture_deletion_attempts CHECK (attempts>=0), ADD CONSTRAINT fixture_deletion_state CHECK (state IN ('pending','processing','completed')), ADD CONSTRAINT fixture_deletion_completed CHECK ((state='completed')=("completedAt" IS NOT NULL)), ADD CONSTRAINT fixture_deletion_dates CHECK ("completedAt" IS NULL OR "completedAt">="createdAt");
GRANT SELECT,INSERT,UPDATE,DELETE ON marleva."PrivateFixture",marleva."FixtureAccess",marleva."FixtureDeletion" TO marleva_api;
