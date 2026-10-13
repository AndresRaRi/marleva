-- Initial engine diff produced an empty migration. This corrective migration creates
-- the private M1 tables explicitly; 001 is retained as applied history.
CREATE TABLE marleva."Account" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "authId" uuid UNIQUE NOT NULL,
 email text UNIQUE NOT NULL, state text NOT NULL DEFAULT 'active',operator boolean NOT NULL DEFAULT false,
 "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE marleva."Session" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "accountId" uuid NOT NULL REFERENCES marleva."Account"(id),
 "tokenHash" text UNIQUE NOT NULL,"csrfHash" text NOT NULL,"providerTokens" text NOT NULL,
 "createdAt" timestamptz NOT NULL DEFAULT now(),"lastSeen" timestamptz NOT NULL DEFAULT now(),
 "authenticatedAt" timestamptz NOT NULL DEFAULT now(),"revokedAt" timestamptz,"refreshLease" timestamptz
);
CREATE TABLE marleva."Challenge" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),email text NOT NULL,origin text NOT NULL,
 state text NOT NULL DEFAULT 'sending',attempts integer NOT NULL DEFAULT 0,"createdAt" timestamptz NOT NULL DEFAULT now(),
 "expiresAt" timestamptz NOT NULL,"blockedUntil" timestamptz
);
CREATE INDEX "Challenge_email_createdAt_idx" ON marleva."Challenge"(email,"createdAt");
CREATE INDEX "Challenge_origin_createdAt_idx" ON marleva."Challenge"(origin,"createdAt");
CREATE TABLE marleva."EmailChange" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),"accountId" uuid NOT NULL,"oldEmail" text NOT NULL,"newEmail" text NOT NULL,
 "providerTokens" text NOT NULL,"oldConfirmed" boolean NOT NULL DEFAULT false,"newConfirmed" boolean NOT NULL DEFAULT false,
 state text NOT NULL DEFAULT 'sending',"createdAt" timestamptz NOT NULL DEFAULT now(),"expiresAt" timestamptz NOT NULL,attempts integer NOT NULL DEFAULT 0
);
CREATE INDEX "EmailChange_accountId_state_idx" ON marleva."EmailChange"("accountId",state);
CREATE TABLE marleva."Notice" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),"accountId" uuid NOT NULL REFERENCES marleva."Account"(id),
 kind text NOT NULL,text text NOT NULL,"createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE marleva."Outbox" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),reference text UNIQUE NOT NULL,recipient text NOT NULL,subject text NOT NULL,text text NOT NULL,
 state text NOT NULL DEFAULT 'pending',attempts integer NOT NULL DEFAULT 0,"dueAt" timestamptz NOT NULL DEFAULT now(),
 "leaseUntil" timestamptz,"createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE marleva."Audit" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),"accountId" uuid,action text NOT NULL,"resourceId" uuid,"createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE marleva."Development" (id integer PRIMARY KEY,name text UNIQUE NOT NULL);
GRANT USAGE ON SCHEMA marleva TO marleva_api;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA marleva TO marleva_api;
REVOKE ALL ON marleva._prisma_migrations FROM marleva_api;
