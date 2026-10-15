// Verificación de documentación: no conecta servicios ni ejecuta SQL.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const folder=path.dirname(fileURLToPath(import.meta.url));
const docs=path.resolve(folder,'../..');
const require=createRequire(process.env.MARLEVA_DOCUMENTATION_PACKAGE||import.meta.url);
const YAML=require('yaml');
const parserRequire=createRequire(require.resolve('@apidevtools/swagger-parser/package.json'));
const Ajv=parserRequire('ajv/dist/2020.js');
const packageFolder=process.env.MARLEVA_DOCUMENTATION_PACKAGE?path.dirname(process.env.MARLEVA_DOCUMENTATION_PACKAGE):path.resolve(folder,'../../..');
const formatsPath=process.env.MARLEVA_AJV_FORMATS_MODULE||path.join(packageFolder,'node_modules/.pnpm/ajv-formats@3.0.1/node_modules/ajv-formats');
const addFormats=require(formatsPath);
if(parserRequire('ajv/package.json').version!=='8.20.0'||require(path.join(formatsPath,'package.json')).version!=='3.0.1')throw new Error('Pins de validación inesperados');
const spec=YAML.parse(await fs.readFile(path.join(folder,'openapi.yaml'),'utf8'));
const ajv=new Ajv({strict:false,allErrors:true});addFormats(ajv);
ajv.addSchema({$id:'urn:marleva:m2:schemas',components:spec.components});
const validators=Object.fromEntries(Object.keys(spec.components.schemas).map(n=>[n,ajv.compile({$ref:'urn:marleva:m2:schemas#/components/schemas/'+n})]));
const accepted=[];
for(const [name,schema] of Object.entries(spec.components.schemas))for(const example of schema.examples||[]){
 if(!validators[name](example))throw new Error(name+':'+JSON.stringify(validators[name].errors));accepted.push(name);
}
let responseExamples=0;
for(const r of Object.values(spec.components.responses))for(const media of Object.values(r.content||{}))if(media.example){if(!validators.Problem(media.example))throw new Error('Ejemplo de error inválido');responseExamples++;}
for(const item of Object.values(spec.paths))for(const o of Object.values(item))for(const r of Object.values(o.responses))for(const media of Object.values(r.content||{}))if(media.example){const n=media.schema.$ref.split('/').at(-1);if(!validators[n](media.example))throw new Error('Respuesta inválida '+o.operationId);responseExamples++;}
const sample=n=>structuredClone(spec.components.schemas[n].examples[0]);
const invalid=[];
function reject(name,label,mutate){const value=sample(name);mutate(value);if(validators[name](value))throw new Error('Aceptado inválido: '+label);invalid.push(label);}
reject('UploadRequest','archivo mayor a5.000.000bytes',x=>x.expected_bytes=5000001);
reject('UploadRequest','archivo vacío',x=>x.expected_bytes=0);
reject('UploadRequest','tipo no permitido',x=>x.claimed_mime='text/html');
reject('VersionInput','estado inyectado',x=>x.state='approved');
reject('VersionInput','actor inyectado',x=>x.account_id='00000000-0000-4000-8000-000000000001');
reject('VersionInput','desarrollo octavo',x=>x.development_id=8);
reject('VersionInput','revision cero',x=>x.expected_revision=0);
reject('FinalizeRequest','tercer slot',x=>x.slot=3);
reject('AccessRequest','asignación sin envío',x=>x.assignment_id='00000000-0000-4000-8000-000000000001');
reject('AssignmentRequest','reasignación sin revisión',x=>x.previous_assignment_id='00000000-0000-4000-8000-000000000001');
reject('DecisionRequest','corrección sin campos',x=>x.correction_fields=[]);
reject('DecisionRequest','campo correctivo arbitrario',x=>x.correction_fields=['account_email']);
reject('DecisionRequest','campos repetidos',x=>x.correction_fields=['review_name','review_name']);
reject('DecisionRequest','aprobación sin criterio válido',x=>{x.outcome='approved';x.correction_fields=[];});
reject('DecisionRequest','rechazo con campos de corrección',x=>x.outcome='rejected');
reject('DecisionRequest','nota mayor a2000',x=>x.internal_note='a'.repeat(2001));
reject('OwnApplication','nota interna filtrada',x=>x.internal_note='privado');
reject('Receipt','dato privado en recibo',x=>x.private_address='privado');
reject('Queue','página mayor a50',x=>x.items=Array(51).fill(sample('QueueItem')));
reject('PrepareVersionRequest','reconsideración sin motivo',x=>x.reconsideration_reason=null);
reject('PrepareVersionRequest','reconsideración motivo vacío',x=>x.reconsideration_reason='');
reject('PrepareVersionRequest','reconsideración motivo espacios',x=>x.reconsideration_reason='   ');
reject('PrepareVersionRequest','motivo mayor a2000',x=>x.reconsideration_reason='a'.repeat(2001));
reject('PrepareVersionRequest','corrección con motivo de reconsideración',x=>x.origin='correction');
reject('PrepareVersionRequest','origen inicial en preparación',x=>x.origin='initial');
reject('PrepareVersionRequest','decisión fuente ausente',x=>x.source_decision_id=null);
reject('PrepareVersionRequest','envío fuente ausente',x=>x.source_submission_id=null);
reject('PrepareVersionRequest','número suministrado por cliente',x=>x.number=2);
reject('VersionInput','antecedente alterado por PUT',x=>x.source_decision_id='00000000-0000-4000-8000-000000000001');
reject('LinkDocumentRequest','fecha rejuvenecida por cliente',x=>x.declared_document_date='2026-10-15');
reject('LinkDocumentRequest','tercer enlace reutilizado',x=>x.slot=3);
reject('History','historial con nota interna',x=>x.items[0].internal_note='privado');
reject('History','historial con domicilio',x=>x.items[0].private_address='privado');
reject('History','historial mayor a50',x=>x.items=Array(51).fill(sample('VersionSummary')));
reject('Receipt','enlace documental sin referencia',x=>{x.operation='link_document';x.submission_id=null;x.document_id=null;});
reject('Version','origen inicial con número dos',x=>x.number=2);
reject('Version','versión no inicial sin fuente',x=>{x.number=2;x.origin='reconsideration';});
reject('ReviewerCandidate','correo en candidato',x=>x.email='a@example.test');
reject('ReviewerCandidate','etiqueta con nombre',x=>x.operational_label='Persona privada');
reject('ReviewerCandidates','más50 candidatos',x=>x.items=Array(51).fill(sample('ReviewerCandidate')));
reject('RetentionItem','causa legal filtrada',x=>x.legal_basis='privado');
reject('RetentionItem','borrado sin confirmación',x=>{x.state='deleted';x.schedule_status='complete';x.completed_at=null;});
reject('RetentionItem','calendario no calculado con fecha',x=>{x.state='uncalculated';x.schedule_status='not_calculated';});
reject('RetentionCommand','bloqueo sin revisión',x=>x.review_at=null);
reject('RetentionCommand','liberación sin hold',x=>{x.action='release';x.review_at=null;});
reject('RetentionCommand','base vacía',x=>x.basis_code='   ');
reject('RetentionCommand','finalizar sin decisión',x=>{x.action='finalize';x.review_at=null;});
reject('Version','privados no disponibles con domicilio',x=>x.private_data_available=false);
reject('Version','motivo en origen inicial',x=>x.reconsideration_reason='privado');
reject('Version','borrador con fecha enviada',x=>x.lifecycle='draft');
reject('VisibleDecision','privados suprimidos con motivo visible',x=>x.private_data_available=false);
reject('VisibleDecision','final sin fecha',x=>x.finality_state='final');
reject('VisibleDecision','provisional con fecha final',x=>x.finalized_at='2026-10-15T22:00:00Z');
reject('VisibleDecision','aprobación con criterio de rechazo',x=>x.outcome='approved');
reject('RetentionItem','borrado pendiente como completo',x=>{x.state='delete_pending';x.schedule_status='complete';});
const core=require('@dbml/core');
const dbml=await fs.readFile(path.join(docs,'modelado-datos/dbml/MAR-M2-DATA-001.dbml'),'utf8');
const model=core.Parser.parse(dbml,'dbmlv2');
const tables=model.schemas.flatMap(s=>s.tables);const references=model.schemas.flatMap(s=>s.refs);
const targetErrors=[];
for(const r of references){const source=r.endpoints.find(e=>e.relation==='*');const target=r.endpoints.find(e=>e.relation==='1');if(!source||!target)throw new Error('Relación no prevista');
 const t=tables.find(t=>t.name===target.tableName);const tuples=[...t.fields.filter(f=>f.pk||f.unique).map(f=>[f.name]),...t.indexes.filter(i=>i.unique||i.pk).map(i=>i.columns.map(c=>c.value))];
 if(!tuples.some(tuple=>JSON.stringify(tuple)===JSON.stringify(target.fieldNames)))targetErrors.push(r.name+':destino sin clave única');
 for(let i=0;i<source.fields.length;i++)if(source.fields[i].type.type_name!==target.fields[i].type.type_name)targetErrors.push(r.name+':tipo distinto');
}
if(targetErrors.length)throw new Error(targetErrors.join('\n'));
let operations=0;
for(const [route,item]of Object.entries(spec.paths))for(const [method,o]of Object.entries(item)){
 if(!/^\/v1\/m[28]\//.test(route)||!['get','post','put'].includes(method))throw new Error('Ruta ajena');
 const seqs=[{id:o['x-sequence-id'],steps:o['x-sequence-steps']},...(o['x-related-sequences']||[])];
 for(const seq of seqs){const mod=seq.id.split('-')[1];const text=await fs.readFile(path.join(docs,`diagramas/secuencia/${mod}/${seq.id}.mmd`),'utf8');for(const step of seq.steps)if(!text.includes(step))throw new Error('Paso ausente '+seq.id+step);}
 for(const table of o['x-data-tables'])if(!tables.some(t=>t.name===table))throw new Error('Tabla ausente '+table);operations++;
}
if(operations!==23)throw new Error('Conteo de API inesperado');
console.log(JSON.stringify({date:'2026-10-15',chat:'MAR-CHAT-007',contractVersion:spec.info.version,operations,schemas:Object.keys(spec.components.schemas).length,schemaExamplesAccepted:accepted,responseExamplesAccepted:responseExamples,invalidExamplesRejected:invalid,sequenceStepsAndTables:'passed',foreignKeyTargetAndTypeReview:{references:references.length,errors:targetErrors},runtimeTests:'not_run',sqlApplied:false,requestsExecuted:false,limits:['Esquemas y referencias, no transacciones/autorización real/concurrencia/conservación','D08-0.1/D09-0.1 propuestos; D08-R/D09-R y transacciones/integración pendientes']},null,2));
