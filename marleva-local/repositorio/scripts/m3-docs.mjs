import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { exporter } from '@dbml/core';
import YAML from 'yaml';
import SwaggerParser from '@apidevtools/swagger-parser';
import { execFileSync } from 'node:child_process';

const model = await readFile('docs/modelado-datos/dbml/MAR-M3-DATA-001.dbml', 'utf8');
const checks = await readFile('docs/modelado-datos/dbml/MAR-M3-constraints.sql', 'utf8');
const statistics = await readFile('docs/modelado-datos/dbml/MAR-M3-search-statistics.sql', 'utf8');
const photos = await readFile('docs/modelado-datos/dbml/MAR-M3-photo-integrity.sql', 'utf8');
const ddl =
  '-- Generado desde MAR-M3-DATA-001.dbml + restricciones complementarias. Solo M3 aislado.\n' +
  exporter
    .export(model, 'postgres')
    .replace('CREATE SCHEMA "m3";', 'CREATE SCHEMA IF NOT EXISTS "m3";')
    .replaceAll(' DEFERRABLE INITIALLY IMMEDIATE', ' NOT DEFERRABLE') +
  checks +
  statistics +
  photos;
await mkdir('docs/modelado-datos/ddl', { recursive: true });
await writeFile('docs/modelado-datos/ddl/MAR-M3-DATA-001.sql', ddl);
const spec = YAML.parse(await readFile('docs/apis/M3/openapi.yaml', 'utf8'));
await SwaggerParser.validate(structuredClone(spec));
await writeFile('docs/apis/M3/openapi.json', JSON.stringify(spec, null, 2) + '\n');
await mkdir('apps/client/src/modules/m3/generated', { recursive: true });
execFileSync(
  process.execPath,
  [
    'packages/contracts/node_modules/openapi-typescript/bin/cli.js',
    'docs/apis/M3/openapi.yaml',
    '-o',
    'apps/client/src/modules/m3/generated/api.ts',
  ],
  { stdio: 'inherit' },
);
await writeFile(
  'docs/apis/M3/swagger.html',
  `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>M3 — contrato local</title><link rel="stylesheet" href="../M1/vendor/swagger-ui.css"><body><p>M3 aislado. Rutas privadas objetivo sin montar; sin envío de solicitudes.</p><div id="swagger-ui"></div><script src="../M1/vendor/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({spec:${JSON.stringify(spec).replaceAll('<', '\\u003c')},dom_id:'#swagger-ui',supportedSubmitMethods:[],persistAuthorization:false})</script></body></html>`,
);
const target = await SwaggerParser.bundle('docs/apis/M3/openapi-target.yaml');
await SwaggerParser.validate(structuredClone(target));
await writeFile(
  'docs/apis/M3/swagger-target.html',
  `<!doctype html><html lang="es"><meta charset="utf-8"><title>M3 — objetivo privado</title><link rel="stylesheet" href="../M1/vendor/swagger-ui.css"><p>OBJETIVO. Rutas no montadas. Sin solicitudes ni credenciales.</p><div id="swagger-ui"></div><script src="../M1/vendor/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({spec:${JSON.stringify(target).replaceAll('<', '\\u003c')},dom_id:'#swagger-ui',supportedSubmitMethods:[],persistAuthorization:false})</script></html>`,
);
console.log('DBML/DDL y OpenAPI/Swagger M3 válidos; no se aplica SQL.');
