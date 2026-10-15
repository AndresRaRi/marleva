// Herramienta documental M2: no conecta con PostgreSQL ni con servicios.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = path.dirname(fileURLToPath(import.meta.url));
const dbmlPath = path.resolve(folder, '../dbml/MAR-M2-DATA-001.dbml');
const ddlPath = path.resolve(folder, '../ddl/MAR-M2-DATA-001.sql');
const extraPath = path.join(folder, 'MAR-M2-DATA-001-complemento.sql');
const dependency = process.env.MARLEVA_DBML_MODULE;
const require = createRequire(import.meta.url);
const modulePath = dependency || require.resolve('@dbml/core');
const { exporter, importer, Parser } = require(modulePath);
const packageRoot = dependency
  ? path.dirname(require.resolve(path.join(dependency, 'package.json')))
  : path.dirname(require.resolve('@dbml/core/package.json'));
const metadata = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
if (metadata.version !== '10.3.1') throw new Error('Se requiere @dbml/core 10.3.1');

const source = await readFile(dbmlPath, 'utf8');
const extra = await readFile(extraPath, 'utf8');
Parser.parse(source, 'dbmlv2');
const external = ['Account', 'Session', 'Development'];
let sql = exporter.export(source, 'postgres');
const excluded = [];
const parserContext = [];
for (const table of external) {
  const create = new RegExp(`CREATE TABLE "marleva"\\."${table}" \\([\\s\\S]*?\\n\\);\\n?`, 'g');
  const matches = sql.match(create) || [];
  if (matches.length !== 1) throw new Error(`Referencia externa inesperada: ${table}`);
  parserContext.push(matches[0]);
  sql = sql.replace(create, '');
  const comments = new RegExp(`COMMENT ON TABLE "marleva"\\."${table}" IS '(?:[^']|'')*';\\n?`, 'g');
  sql = sql.replace(comments, '');
  excluded.push(table);
}
parserContext.push(...(sql.match(/^CREATE UNIQUE INDEX "m2_external_session_owner"[^\n]*\n?/gm) || []));
sql = sql.replace(/^CREATE UNIQUE INDEX "m2_external_session_owner"[^\n]*\n?/gm, '');
sql = sql.replace(/^CREATE SCHEMA(?: IF NOT EXISTS)? "marleva";\n?/gm, '');
sql = sql.replaceAll(' DEFERRABLE INITIALLY IMMEDIATE', ' NOT DEFERRABLE');
sql = sql.replace(/\n{3,}/g, '\n\n').trim();

if (/CREATE SCHEMA/.test(sql)) throw new Error('Bootstrap de esquema no permitido');
if (/CREATE (?:TABLE|SCHEMA)[^;]*"(?:Account|Session|Development)"/s.test(sql)) {
  throw new Error('Se intentó exportar definición externa');
}
if (/ALTER TABLE "marleva"\."(?:Account|Session|Development)"/.test(sql)) {
  throw new Error('Se intentó alterar tabla M1');
}
if (/\b(?:INSERT|UPDATE|DELETE|TRUNCATE|DROP|GRANT|REVOKE)\b/.test(extra.replace(/^--.*$/gm, ''))) {
  throw new Error('Complemento fuera del alcance declarativo');
}
const newTables = [...sql.matchAll(/CREATE TABLE "marleva"\."([^"]+)"/g)].map((m) => m[1]);
if (newTables.length !== 19 || newTables.some((name) => !/^(M2|M8)Membership/.test(name))) {
  throw new Error('Lista de tablas nuevas inesperada');
}
const header = `-- MAR-M2-DATA-001: OBJETIVO DOCUMENTAL NO APLICADO.\n` +
  `-- Derivado de DBML y complemento propios con @dbml/core 10.3.1.\n` +
  `-- No es migración; no ejecutar sobre ninguna base. Sin CREATE/ALTER de M1, bootstrap, roles o privilegios.\n` +
  `-- Referencias externas a Account/Session/Development requieren coordinación futura.\n`;
const result = `${header}\n${sql}\n\n${extra}`;
// Round-trip por parser documental; no equivale a parser/ejecución PostgreSQL.
const roundtrip = importer.import(parserContext.join('\n') + result, 'postgres');
Parser.parse(roundtrip, 'dbmlv2');
await writeFile(ddlPath, result);
const sha256 = (content) => createHash('sha256').update(content).digest('hex');
console.log(JSON.stringify({
  dbmlPackage: metadata.version,
  externalDefinitionsExcluded: excluded,
  newTables,
  foreignKeys: (result.match(/ADD CONSTRAINT .* FOREIGN KEY/g) || []).length,
  checks: (result.match(/CONSTRAINT "[^"]+" CHECK/g) || []).length,
  partialIndexes: (extra.match(/^CREATE UNIQUE INDEX/gm) || []).length,
  sourceSha256: sha256(source),
  complementSha256: sha256(extra),
  ddlSha256: sha256(result),
  dbmlParse: 'passed', sqlDocumentaryRoundtrip: 'passed',
  postgresParse: 'not_run', sqlApplied: false,
  roundtripContext: 'referencias externas minimas solo en memoria',
}));
