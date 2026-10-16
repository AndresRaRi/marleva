# Modelo integral propio M2 y soporte M8

MAR-M2-DATA-001 ·15-10-2026 ·MAR-CHAT-007 · objetivo documental0.4.0. M2 UC001–011/M8 UC001–005. **No migración, SQL no aplicado, sin cambios en M1.**

| Fuente/derivado | Función |
|---|---|
| [DBML](../dbml/MAR-M2-DATA-001.dbml) |41 tablas propias propuestas y3 referencias externas mínimas Account/Session/Development. Importable en dbdiagram.io, sin publicación. |
| [Complemento](MAR-M2-DATA-001-complemento.sql) |10 índices únicos parciales que el exportador no representa; conserva exclusividad de borrador/pending/grants/asignaciones/política/una apelación abierta. |
| [DDL](../ddl/MAR-M2-DATA-001.sql) |Derivado DBML+complemento; sin CREATE/ALTER de tablasM1, bootstrap, roles o grants. No ejecutar sobre base. |
| [Generador](generar-m2.mjs) |@dbml/core10.3.1, parserdbmlv2/export/importdocumental, hash y referencias externas solo en memoria para roundtrip. |
| [Acta integral](../../apis/M2/VALIDACION_INTEGRAL.json) |Resultados/hashes actuales y límites; no validación de servidorPG ni autorización/runtime. |

## Agregados y propiedad

Expediente/versión/privado/documento/enlace/envío/decisión/privado/recibo/evento mantienen el mismo titular mediante claves compuestas. approvedVersionId es antecedente, currentVersionId es versión actual; eligibilityRevision es revisión del agregado de permisos, revision es CAS y number es número de versión: no intercambiables. Residence_change/reopen conservan previousVersionId y origen/fuente cuando existe; nunca inventan decisión inicial.

Perfil comercial: Profile,Version,VersionPrivate,Coverage,Modality,TermsPolicy,TermsAcceptance,Submission,Decision,DecisionPrivate. Unperfil/cuenta, una versiónactual; current/approved pointers al mismoperfil/titular. Privado contractual separado; TermsPolicy conserva contenido/hash inmutables y aceptación por versión enlaza ID+hash. Estado base y isPaused separados; restricción no reescribe decisión ni hace vigente una versión material sin revisar.

Restricciones: Restriction,RestrictionPrivate,Appeal,AppealPrivate,Decision,DecisionPrivate,EvidenceLink. Objetivo membership/seller conscope válido, una apelaciónabierta por causa; evidencia explícita del mismo titular/versión enviada. Assignment restrict independiente y acceso documental tipado por asignación/apelación/enlace. No copiar objetos o documentos a otras finalidades.

M8: ReviewerProfile operativo enabled y ReviewGrant específico, asignaciones vecinal/comercial/restrict separadas, FKs de decisiones a envío/asignación/revisor exactos. Ningún rol nuevo enAccount/M1; vigencia y conflicto siguen reglas transaccionales.

Conservación: RetentionCase/Hold/DeletionTask/Event/Replica, ocho tipos de objetivo privado únicos y máximo una ancla del ámbito. Permisos no dan lectura por conservar. ArchiveNotice conserva versión/revisión/actividad observadas y fecha real de disponibilidad del aviso; gracia7d y cancelación ante nueva actividad. CommunityEvent/Receipt mínimos sin textos privados y con referencias tipadas.

## Invariantes que requieren casos/transacciones futuros

T01–T12 del recorrido quedan concretados en [matriz integral](../../proceso/MATRIZ_CASOS_M2.md): CAS/orden común de bloqueos; campos/evidencia completos y fecha3meses al enviar; inmutabilidad de enviado; transición/recibo/evento atómicos; identidadM1 vigente sin falsa atomicidad externa; grants/asignación vigentes; lectura por finalidad reautorizada; consumidor durable; conservación y cercado externo; privilegios mínimos; replay con reautorización; preparación desde última fuente compatible. No quedan implementados por unCHECK.

T13 comercial: listas/campos/condiciones activas completas al enviar, ninguna habilitación financiera; material_change bloquea difusión. T14 restricciones: grant según target, evidencia de una versión enviada, una apelación abierta y lift de una sola causa. T15 archivo: reloj/aviso disponible/CAS y reapertura con origen efectivo. T16 elegibilidad: bloqueo de agregado hasta commit de nueva operación consumidora. T17 conservación: ámbitos/calendarios/holds/ledger/copias, no confundir mínimo estructural con necesidad de conservar bytes.

## Reproducción y límites

MARLEVA_DBML_MODULE puede apuntar al paquete homologado ya instalado; el generador exige10.3.1. Generar dos veces y comparar hashes del acta. Parser/reimportación SQLdocumental no ejecutan PostgreSQL ni acreditan constraints, permisos o concurrencia de negocio. Las FKs aAccount/Session/Development requieren compatibilidad real en integración; las3 definiciones mínimas solo ilustran IDs y son excluidas del DDL. No cambiar migraciones aplicadas ni Prisma/compartidos.

Las actas previas corresponden a13/19 tablas de cortes anteriores, preservadas como historia. El alcance actual es41; los conteos efectivos FK/CHECK/hashes están en VALIDACION_INTEGRAL.json. D07-A8,D08-R,D09-R y aceptación visual siguen condiciones de activación, no modelo pendiente de completar. Fuentes01 se concilia después conservando el trabajo concurrenteM1, sin sobrescribirlo.
