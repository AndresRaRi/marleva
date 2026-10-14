import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { exporter } from '@dbml/core';
import SwaggerParser from '@apidevtools/swagger-parser';
import { recoveryConstraints } from './recovery-constraints.mjs';
import { privateFixtureConstraints } from './private-fixture-constraints.mjs';
const root = path.resolve(new URL('..', import.meta.url).pathname);
process.chdir(root);
const require = createRequire(import.meta.url);
const dbml = await readFile('docs/modelado-datos/dbml/MAR-M1-DATA-001.dbml', 'utf8');
// DBML exporter defaults differ from the applied PostgreSQL baseline.
// Preserve non-deferrable constraints; no changes to applied migrations.
const ddl = exporter
  .export(dbml, 'postgres')
  .replaceAll(' DEFERRABLE INITIALLY IMMEDIATE', ' NOT DEFERRABLE');
if (!ddl.includes('CREATE TABLE')) throw new Error('DDL vacío');
await writeFile(
  'docs/modelado-datos/ddl/MAR-M1-DATA-001.sql',
  '-- GENERADO desde MAR-M1-DATA-001.dbml. Solo revisión; no aplicar completo sobre base existente.\n' +
    ddl +
    privateFixtureConstraints +
    recoveryConstraints +
    '',
);
const yamlPath = 'docs/apis/M1/openapi.yaml';
let spec;
spec = await SwaggerParser.bundle(yamlPath);
await SwaggerParser.validate(spec);
await writeFile('packages/contracts/openapi.json', JSON.stringify(spec, null, 2) + '\n');
const assets = path.dirname(require.resolve('swagger-ui-dist/package.json'));
await mkdir('docs/apis/M1/vendor', { recursive: true });
for (const name of [
  'swagger-ui.css',
  'swagger-ui-bundle.js',
  'swagger-ui-standalone-preset.js',
  'LICENSE',
])
  await copyFile(path.join(assets, name), path.join('docs/apis/M1/vendor', name));
await writeFile(
  'docs/apis/M1/swagger.html',
  '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Marleva M1 - revisión de API</title><link rel="stylesheet" href="vendor/swagger-ui.css"></head><body><p>MAR-CHAT-005 · API M1 en revisión · Solo documentación local · Sin ejecución de solicitudes</p><div id="swagger-ui"></div><script src="vendor/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({spec:' +
    JSON.stringify(spec).replace(/</g, '\\u003c') +
    ',dom_id:"#swagger-ui",supportedSubmitMethods:[],persistAuthorization:false,deepLinking:true});</script></body></html>',
);
console.log(
  'DBML parseado; DDL exportado. OpenAPI YAML/JSON válido; Swagger local preparado (sin solicitudes).',
);
