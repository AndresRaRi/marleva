import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { exporter } from '@dbml/core';
import YAML from 'yaml';
import Parser from '@apidevtools/swagger-parser';
import { privateFixtureConstraints } from './private-fixture-constraints.mjs';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const source = await readFile('docs/modelado-datos/dbml/MAR-M1-DATA-002.dbml', 'utf8');
const base = exporter
  .export(source, 'postgres')
  .replaceAll(' DEFERRABLE INITIALLY IMMEDIATE', ' NOT DEFERRABLE');
const constraints = `
-- Restricciones PostgreSQL que DBML/exportador no representa; diseño objetivo, no migración aplicada.
CREATE UNIQUE INDEX role_assignment_active ON marleva."RoleAssignment" ("accountId", role) WHERE "revokedAt" IS NULL;
CREATE UNIQUE INDEX recovery_active ON marleva."MfaRecovery" ("accountId") WHERE state IN ('requested','approved','executing','provider_pending','reenrollment');
CREATE UNIQUE INDEX recovery_capability_hash ON marleva."MfaRecovery" ("capabilityHash") WHERE "capabilityHash" IS NOT NULL;
ALTER TABLE marleva."RoleAssignment" ADD CONSTRAINT role_version CHECK (version>0), ADD CONSTRAINT role_revocation CHECK (("revokedAt" IS NULL AND "revokedBy" IS NULL) OR ("revokedAt" IS NOT NULL AND "revokedAt">="grantedAt" AND "revokedBy" IS NOT NULL)), ADD CONSTRAINT role_no_self_grant CHECK ("grantedBy" IS NULL OR "grantedBy"<>"accountId");
ALTER TABLE marleva."MfaRecovery" ADD CONSTRAINT recovery_version CHECK (version>0), ADD CONSTRAINT recovery_owner CHECK ("requestedBy"="accountId"), ADD CONSTRAINT recovery_reviewer CHECK ("approvedBy" IS NULL OR "approvedBy"<>"accountId"), ADD CONSTRAINT recovery_expiry CHECK ("expiresAt">"createdAt"), ADD CONSTRAINT recovery_approval CHECK (state NOT IN ('approved','executing','provider_pending','reenrollment','completed') OR "approvedBy" IS NOT NULL), ADD CONSTRAINT recovery_completed CHECK ((state='completed')=("completedAt" IS NOT NULL)), ADD CONSTRAINT capability_attempts CHECK ("capabilityAttempts" BETWEEN 0 AND 5), ADD CONSTRAINT capability_binding CHECK (("capabilityHash" IS NULL AND "capabilitySessionId" IS NULL AND "capabilityExpiresAt" IS NULL) OR ("capabilityHash" IS NOT NULL AND "capabilitySessionId" IS NOT NULL AND "capabilityExpiresAt" IS NOT NULL AND "capabilityExpiresAt">"createdAt" AND "capabilityExpiresAt"<="expiresAt")), ADD CONSTRAINT capability_consumed CHECK ("capabilityConsumedAt" IS NULL OR ("capabilityHash" IS NOT NULL AND "capabilityConsumedAt"<="capabilityExpiresAt"));
ALTER TABLE marleva."Session" ADD CONSTRAINT session_dates CHECK ("lastSeen">="createdAt" AND "authenticatedAt">="createdAt" AND ("revokedAt" IS NULL OR "revokedAt">="createdAt"));
ALTER TABLE marleva."Challenge" ADD CONSTRAINT challenge_attempts CHECK (attempts BETWEEN 0 AND 5), ADD CONSTRAINT challenge_expiry CHECK ("expiresAt">"createdAt"), ADD CONSTRAINT challenge_state CHECK (state IN ('sending','open','verifying','consumed','superseded','blocked','failed','expired'));
ALTER TABLE marleva."EmailChange" ADD CONSTRAINT email_change_attempts CHECK (attempts BETWEEN 0 AND 5), ADD CONSTRAINT email_change_expiry CHECK ("expiresAt">"createdAt"), ADD CONSTRAINT email_change_distinct CHECK ("oldEmail"<>"newEmail"), ADD CONSTRAINT email_change_state CHECK (state IN ('sending','open','verifying','complete','reconcile','failed','expired'));
CREATE UNIQUE INDEX email_change_active ON marleva."EmailChange" ("accountId") WHERE state IN ('sending','open','verifying','reconcile');
ALTER TABLE marleva."Outbox" ADD CONSTRAINT outbox_attempts CHECK (attempts>=0), ADD CONSTRAINT outbox_state CHECK (state IN ('pending','sending','sent','failed'));
ALTER TABLE marleva."Account" ADD CONSTRAINT account_state CHECK (state IN ('active','restricted','closed'));
`;
await writeFile(
  'docs/modelado-datos/ddl/MAR-M1-DATA-002.sql',
  '-- OBJETIVO DOCUMENTAL; aplicar solo en prueba aislada, no negocio ni migraciones existentes.\n' +
    base +
    constraints +
    privateFixtureConstraints,
);
const spec = YAML.parse(await readFile('docs/apis/M1/openapi-objetivo-recuperacion.yaml', 'utf8'));
await Parser.validate(structuredClone(spec));
await writeFile(
  'docs/apis/M1/swagger-objetivo-recuperacion.html',
  '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>M1 recuperación - objetivo NO implementado</title><link rel="stylesheet" href="vendor/swagger-ui.css"></head><body><p>Objetivo documental, NO implementado. Sin solicitudes ni credenciales.</p><div id="swagger-ui"></div><script src="vendor/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({spec:' +
    JSON.stringify(spec).replaceAll('<', '\\u003c') +
    ',dom_id:"#swagger-ui",supportedSubmitMethods:[],persistAuthorization:false});</script></body></html>',
);
console.log(
  'Objetivo DBML/DDL complementado y siete operaciones YAML/Swagger válidas; no aplicado.',
);

const storageSpec = YAML.parse(
  await readFile('docs/apis/M1/openapi-objetivo-archivos.yaml', 'utf8'),
);
await Parser.validate(structuredClone(storageSpec));
await writeFile(
  'docs/apis/M1/swagger-objetivo-archivos.html',
  '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>M1 B09 - revisión local</title><link rel="stylesheet" href="vendor/swagger-ui.css"></head><body><p>B09 implementado parcialmente en005; actas/límites en tests/results. Sin solicitudes ni credenciales.</p><div id="swagger-ui"></div><script src="vendor/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({spec:' +
    JSON.stringify(storageSpec).replaceAll('<', '\\u003c') +
    ',dom_id:"#swagger-ui",supportedSubmitMethods:[],persistAuthorization:false});</script></body></html>',
);
console.log('B09: tres operaciones contractuales válidas; este generador no prueba runtime.');
