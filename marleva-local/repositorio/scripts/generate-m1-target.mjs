import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { exporter } from '@dbml/core';
import YAML from 'yaml';
import Parser from '@apidevtools/swagger-parser';
import { recoveryConstraints } from './recovery-constraints.mjs';
import { privateFixtureConstraints } from './private-fixture-constraints.mjs';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const source = await readFile('docs/modelado-datos/dbml/MAR-M1-DATA-002.dbml', 'utf8');
const base = exporter
  .export(source, 'postgres')
  .replaceAll(' DEFERRABLE INITIALLY IMMEDIATE', ' NOT DEFERRABLE');
const constraints = `
-- Restricciones PostgreSQL que DBML/exportador no representa; diseño objetivo, no migración aplicada.
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
    recoveryConstraints +
    privateFixtureConstraints,
);
const spec = YAML.parse(await readFile('docs/apis/M1/openapi-objetivo-recuperacion.yaml', 'utf8'));
await Parser.validate(structuredClone(spec));
await writeFile(
  'docs/apis/M1/swagger-objetivo-recuperacion.html',
  '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>M1 recuperación - contrato local</title><link rel="stylesheet" href="vendor/swagger-ui.css"></head><body><p>Contrato local de recuperación; pruebas y límites en tests/results. Sin solicitudes ni credenciales.</p><div id="swagger-ui"></div><script src="vendor/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({spec:' +
    JSON.stringify(spec).replaceAll('<', '\\u003c') +
    ',dom_id:"#swagger-ui",supportedSubmitMethods:[],persistAuthorization:false});</script></body></html>',
);
console.log(
  'Modelo objetivo y contrato de siete operaciones válidos; generación no acredita aplicación ni pruebas.',
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
