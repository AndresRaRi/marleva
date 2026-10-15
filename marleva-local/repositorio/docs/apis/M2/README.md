# M2 y soporte M8: contrato del expediente y revisión

Estado de entrega vigente: [preparación de integración y sincronización Git autorizada](INTEGRACION_Y_ENTREGA_M2_M8.md). Las menciones anteriores a «sin commit/push» describen sus incrementos documentales previos; la entrega actual se verifica por SHA remoto, sin implicar subida a Fuentes o aceptación.


## Incremento D08/D09 vigente · 15-10-2026

[Conservación y revisores](CONSERVACION_REVISORES_D08_D09.md): política D08-0.1 revisable, D09-0.1 catálogo por envío, contrato0.3.1 con23 operaciones y40 esquemas. No activado ni implementado. Las cifras/resultados anteriores son históricos; las actas del nuevo incremento identifican su alcance. D08-R/D09-R siguen pendientes para operar.

15-10-2026, America/Merida. MAR-CHAT-007, continuación. Versión documental 0.3.1, objetivo propio sin implementación, pruebas de servicios o aceptación. Cubre expediente → documentos → envío → asignación → revisión. Incluye corrección y reconsideración por rechazo, conservando expediente e historial. No habilita datos reales ni cierra todo M2/M8.

## Revisar y regenerar

Abrir [Swagger](swagger.html) como archivo local. Incluye recursos propios locales; no requiere servidor, CDN o cuenta. Las 23 operaciones están deshabilitadas para ejecución; dominio `.invalid`, validación remota desactivada, política connect-src none e interceptor que rechaza solicitudes. No introducir credenciales. Swagger es documentación técnica, no una pantalla de Marleva aprobada.

| Archivo | Responsabilidad |
|---|---|
| [openapi.yaml](openapi.yaml) | Única fuente canónica M2 y soporte M8 para este recorrido y UC004; no extender el YAML M1 |
| [openapi.json](openapi.json) | Derivado del YAML, no editar |
| [swagger.html](swagger.html), [swagger-init.js](swagger-init.js) | Vista derivada; esquemas resueltos en memoria para evitar resolución fallida de referencias al abrir archivo local |
| [generar-openapi.mjs](generar-openapi.mjs) | Valida y genera únicamente los archivos de esta carpeta y vendor propio |
| [CORRECCION_RECONSIDERACION.md](CORRECCION_RECONSIDERACION.md) | Detalle funcional UC004, trazabilidad y pruebas previstas |
| [validar-documentacion.mjs](validar-documentacion.mjs) | Comprobación documental de ejemplos, referencias a pasos y tipos/claves de datos |
| [VALIDACION_OPENAPI.json](VALIDACION_OPENAPI.json) | Evidencia documental, hashes, herramientas y límites; no prueba de API |
| [swagger-revision.png](swagger-revision.png) | Captura local de la documentación, sin datos reales ni credenciales |

Generación con Node 24.21.0: `node docs/apis/M2/generar-openapi.mjs`. Si la copia aislada no tiene dependencias, `MARLEVA_DOCUMENTATION_PACKAGE` apunta al package.json de la instalación local existente; solo se leen sus herramientas. Pins exigidos: yaml 2.9.1 (ISC), Swagger Parser 13.1.0 (MIT) y swagger-ui-dist 5.33.2 (Apache-2.0). No se instalaron paquetes ni modificaron manifiestos/lockfiles. Vendor propio conserva [licencia Swagger](vendor/LICENSE). El generador no cambia rutas, tipos ni generadores compartidos.

El JSON conserva referencias locales. Solo la vista Swagger expande referencias usando Swagger Parser, sin crear una segunda fuente. La primera inspección mostró ejemplos como string por referencias sin resolver en file:; se corrigió la generación de la vista y se volvió a comprobar el ejemplo JSON. Pasar el parser no habría detectado por sí solo esa diferencia visual.

## Delimitación y fuentes

Fuentes: [matriz M2](../../proceso/MATRIZ_CASOS_M2.md), [secuencias](../../diagramas/secuencia/M2/README.md), [DATA001 y reglas T01–T12](../../modelado-datos/M2/README.md), [DBML](../../modelado-datos/dbml/MAR-M2-DATA-001.dbml) y [DDL](../../modelado-datos/ddl/MAR-M2-DATA-001.sql). Se preservan C09/C11–C14 de 01. No se modifica M1, sus 24 operaciones, RoleKey, Account.operator, B09, Notice/Outbox o las cinco migraciones.

Las rutas bajo /v1/m2 y /v1/m8 son propuesta de nombres aislada. No están montadas en Nest ni incorporadas a packages/contracts. Identidad/sesión/CSRF/MFA siguen siendo responsabilidad M1 mediante interfaz pública por acordar. Las capacidades M8 son membership_assign, membership_review y la propuesta membership_conserve; su otorgamiento/bootstrap/revocación no se implementa ni abre como API en este corte.

## Operaciones y trazabilidad verificable

Prefijos API: MAR_M2_API_ y MAR_M8_API_. Los IDs/pasos existentes se conservan. Cada operación contiene x-use-case-id, x-sequence-id, x-sequence-steps y x-data-tables; las lecturas documentales compartidas añaden x-related-sequences para M8. El verificador cotejó la existencia de pasos y tablas, no su corrección de negocio completa.

| API | Método y ruta propia | UC / SEQ:pasos | Prueba futura necesaria |
|---|---|---|---|
| MAR_M2_API_001 | GET /v1/m2/membership-applications/own | MAR-M2-UC-001 / MAR-M2-SEQ-001: S010, S050 | MAR-M2-IT-BE-001, escenario API001 pendiente |
| MAR_M2_API_002 | POST /v1/m2/membership-applications | MAR-M2-UC-001 / MAR-M2-SEQ-001: S060, S070 | MAR-M2-IT-BE-001, escenario API002 pendiente |
| MAR_M2_API_003 | GET /v1/m2/membership-applications/{application_id} | MAR-M2-UC-001 / MAR-M2-SEQ-001: S050, S130, S140 | MAR-M2-IT-BE-001, escenario API003 pendiente |
| MAR_M2_API_004 | PUT /v1/m2/membership-applications/{application_id}/versions/{version_id} | MAR-M2-UC-001 / MAR-M2-SEQ-001: S080, S085, S090, S100, S130 | MAR-M2-IT-BE-001, escenario API004 pendiente |
| MAR_M2_API_005 | POST /v1/m2/membership-applications/{application_id}/uploads | MAR-M2-UC-002 / MAR-M2-SEQ-002: S010, S030, S050, S060 | MAR-M2-IT-BE-002, escenario API005 pendiente |
| MAR_M2_API_006 | PUT /v1/m2/membership-documents/{document_id}/content | MAR-M2-UC-002 / MAR-M2-SEQ-002: S070 | MAR-M2-IT-BE-002, escenario API006 pendiente |
| MAR_M2_API_011 | GET /v1/m2/membership-documents/{document_id}/content | MAR-M2-UC-002 / MAR-M2-SEQ-002: S150 | MAR-M2-IT-BE-002, escenario API011 pendiente |
| MAR_M2_API_007 | POST /v1/m2/membership-documents/{document_id}/finalizations | MAR-M2-UC-002 / MAR-M2-SEQ-002: S080, S085, S090, S100, S120, S140, S145, S150 | MAR-M2-IT-BE-002, escenario API007 pendiente |
| MAR_M2_API_008 | GET /v1/m2/membership-documents/{document_id} | MAR-M2-UC-002 / MAR-M2-SEQ-002: S100, S110, S130, S150 | MAR-M2-IT-BE-002, escenario API008 pendiente |
| MAR_M2_API_009 | POST /v1/m2/membership-applications/{application_id}/submissions | MAR-M2-UC-003 / MAR-M2-SEQ-003: S010, S040, S050, S060, S080, S090, S110 | MAR-M2-IT-BE-003, escenario API009 pendiente |
| MAR_M2_API_010 | POST /v1/m2/membership-documents/{document_id}/access-permits | MAR-M2-UC-002 / MAR-M2-SEQ-002: S150 | MAR-M2-IT-BE-002, escenario API010 pendiente |
| MAR_M2_API_012 | GET /v1/m2/membership-command-receipts/{receipt_id} | MAR-M2-UC-003 / MAR-M2-SEQ-003: S090, S120 | MAR-M2-IT-BE-003, escenario API012 pendiente |
| MAR_M2_API_013 | POST /v1/m2/membership-applications/{application_id}/versions | UC004 / SEQ004:S050–S090 | IT-BE-004-D/E/F previstas |
| MAR_M2_API_014 | GET /v1/m2/membership-applications/{application_id}/history | UC004 / SEQ004:S030/S040 | IT-BE-004-A/B/C previstas |
| MAR_M2_API_015 | GET /v1/m2/membership-applications/{application_id}/versions/{version_id} | UC004 / SEQ004:S035/S040 | IT-BE-004-B/C previstas |
| MAR_M2_API_016 | GET /v1/m2/membership-applications/{application_id}/decisions/{decision_id} | UC004 / SEQ004:S035/S040 | IT-BE-004-B/C previstas |
| MAR_M2_API_017 | POST /v1/m2/membership-applications/{application_id}/versions/{version_id}/document-links | UC004 / SEQ004:S092–S098 | IT-BE-004-G/H/I previstas |
| MAR_M8_API_001 | GET /v1/m8/membership-submissions | MAR-M8-UC-001 / MAR-M8-SEQ-001: S070, S080, S090, S100 | MAR-M8-IT-BE-001, escenario API001 pendiente |
| MAR_M8_API_002 | POST /v1/m8/membership-submissions/{submission_id}/assignments | MAR-M8-UC-001 / MAR-M8-SEQ-001: S010, S020, S030, S050, S060 | MAR-M8-IT-BE-001, escenario API002 pendiente |
| MAR_M8_API_003 | GET /v1/m8/membership-submissions/{submission_id} | MAR-M8-UC-002 / MAR-M8-SEQ-002: S010, S020, S030, S040 | MAR-M8-IT-BE-001, escenario API003 pendiente |
| MAR_M8_API_004 | POST /v1/m8/membership-submissions/{submission_id}/decisions | MAR-M8-UC-002 / MAR-M8-SEQ-002: S050, S060, S070, S075, S080, S100, S110, S120, S130, S145 | MAR-M8-IT-BE-001, escenario API004 pendiente |
| MAR_M2_API_018 | GET /v1/m2/membership-applications/{application_id}/retention | UC011 / SEQ011:S120/S130 | MAR-D08-PLAN-017 |
| MAR_M8_API_005 | GET /v1/m8/membership-reviewers | M8-UC001 / M8-SEQ001:S001–S005 | MAR-D09-PLAN-001–007 |

Los nombres de tabla por operación están en el YAML para evitar duplicar otra matriz física. Las familias anteriores son pruebas futuras, no IDs ejecutados. UI y matriz de pruebas ya propuestas; ver pantallas.json y MATRIZ_PRUEBAS_M2_M8.json. Su trazabilidad documental no acredita pruebas del producto. No hay cliente generado o conectado a la app en este corte.

## Reglas del contrato y correspondencia de datos

| Recorrido | Regla propuesta / datos |
|---|---|
| Creación | POST sin datos de identidad; cuerpo vacío cerrado. Identidad derivada de sesión. Cuenta única, primera versión privada y recibo en commit; creación concurrente devuelve expediente existente sin sobrescribirlo |
| Borrador | PUT reemplaza campos completos; null permite incompleto, nunca enviar incompleto. expected_revision corresponde a M2MembershipApplication.revision; version_id exacta; M2MembershipVersion.number no es CAS. Solo borrador actual, con estado/origen compatibles según UC004 |
| Carga | Reserva por finalidad y versión; máximo dos finalidades reservadas/enlazadas. Archivo nuevo, PDF/JPEG/PNG, 1..5.000.000 bytes decimales. Permiso ≤300 s, cabecera y sesión; expiración original no se extiende en replay |
| Transferencia | PUT propio media bytes; el participante “Archivos privados objetivo M2” de SEQ002:S070 es esta frontera, no acceso cliente a tablas o credenciales del proveedor. Escritura inmutable/condicional, reintento solo mismos bytes. Adaptador futuro debe comprobar que lo garantiza |
| Finalización | Bytes/análisis fuera del bloqueo; reautorizar y después CAS/bloqueo de versión/documento/privacidad. Slot 1 o2, una finalidad por versión, dueño exacto. Enlazar y recibo terminal juntos; rejected queda sin enlace. 503 análisis pendiente conserva referencia idempotente, no éxito ni valid por silencio |
| Envío | Campos completos, residencia actual, comprobante vigente y constancia si corresponde. Tres meses calendario inclusivos America/Merida; no 90 días ni fecha inferida. Congelar versión/enlaces, pending, evento y recibo atómicos |
| Asignación | Concesiones vigentes, gestor y revisor distintos del titular. CAS de expediente/envío y anterior asignación; una activa. Reasignación cierra anterior y deniega nuevas lecturas al anterior |
| Decisión | Revisor/asignación/envío/versión exactos y revisiones actuales. approved/correction/rejected se mapean a estados del expediente; cierre de envío/asignación, decisión/privado/recibo/evento juntos. correction exige campos sin sus valores; motivo visible separado de internal_note |
| Resultado | GET titular excluye internal_note/revisor/Storage/hash. GET de revisión solo versión enviada asignada. Cola sin nombres, direcciones o documentos. No replicar nota interna en avisos/recibos |
| Lectura | Permiso corto y sesión exacta; si revisor, asignación/rol/MFA vigentes. Revalidar privacidad al responder. TTL ≤300 s, hash en M2MembershipDocumentAccess, secreto solo cabecera. Sin redirect ni token en URL; no-store/nosniff/attachment; bytes ya entregados no se recuperan |
| Conservación | finality_state provisional y finalized_at null tras resolver. No recibe fechas de borrado/finalidad del cliente. Aprobar o rechazar no inicia automáticamente los 30 días C14; D08-0.1 concreta propuesta y D08-R mantiene validación material/operativa pendiente |

Todos los objetos de entrada tienen additionalProperties false. Lista cerrada de correction_fields y reason_code en YAML; valores privados no se almacenan dentro de correction_fields. revision positiva, catálogo Development 1..7 cotejado con seed existente; no se ejecutó ese seed. Nombre 200 caracteres, domicilio1000, motivo1000 y nota2000; JSON máximo16384 bytes. Fechas UTC en transporte y America/Merida para regla documental. El schema valida estructura, no veracidad de domicilio, análisis, fechas contra reloj o estado actual.

## Reintentos, concurrencia y recuperación

Mutaciones de negocio usan Idempotency-Key por actor/operación, huella protegida del método/ruta/IDs/cuerpo normalizado y recibo mínimo. Misma clave y cuerpo conserva resultado original por al menos72h; distinto cuerpo tras recibo ->409. Reautorizar antes de buscarlo, pero buscarlo antes de rechazar por pending/asignación cerrada debido a la primera decisión. No replicar respuesta privada pasada. Tras repetir, consultar estado actual con permiso vigente.

result_revision es la revisión de expediente resultante. Cada cambio persistido de reserva/finalización terminal/envío/asignación/decisión incrementa esa revisión en el commit. Estado de análisis intermedio y revisiones del documento son distintos; una respuesta perdida no autoriza inventar revisión siguiente. La caducidad del recibo no elimina unicidad de expediente/envío/decisión ni autoriza reenvío automático con clave nueva.

DATA001 persiste recibos terminales, incluidos create_version y link_document, no trabajos genéricos de comandos en vuelo. COMMAND_IN_PROGRESS exige exclusión temporal; el análisis usa referencia idempotente por documento. Deben concretarse orden de bloqueos, cercado, recuperación tras caída y protección de huellas antes de implementación. No se afirma reserva durable de una clave antes de su commit. CAS y unicidad por sí solos no prueban exactamente una llamada al proveedor.

Reserva con permiso vencido: replay conserva recibo y devuelve upload null. Nueva carga requiere autorización/CAS y clave nueva. Nunca entregar secreto vencido desde recibo. Permiso de lectura se emite nuevo por cada solicitud autorizada, sin idempotencia de negocio; todos siguen venciendo y exigiendo autorización actual.

Errores application/problem+json propios (RFC9457) incluyen codigo/mensaje/request_id/accion_recuperacion. No cambia el error M1 ni exige que su cliente lo entienda. 400 formato;401 sesión;403 permiso/MFA/origen/CSRF;404 inexistente/ajeno;409 revisión/estado/asignación/idempotencia;413tamaño;415tipo;422campos/query/evidencia;429límite real;503dependencia/análisis. Retry-After para429/503; sesión inválida se evalúa antes de cursor para no revelar datos. Límites de abuso deben cerrarse con política M1/M8 antes de implementar; no se inventó capacidad medida.

## Validación realizada y límites

Consultar el acta para hashes y resultados reales: parser OpenAPI y referencias internas; comprobación de pasos/tablas; ejemplos de schemas y entradas inválidas comprobados, con cantidades actuales en el acta, con Ajv2020 8.20.0/ajv-formats3.0.1 (MIT); ejemplos de respuestas comprobados adicionalmente. Segunda generación determinista. Swagger inspeccionado en Chrome temporal, sin API/red externa; no se probó Safari/móvil ni accesibilidad completa. No se ejecutó PostgreSQL, servicios, solicitudes de negocio, unitarias de backend/frontend, rendimiento o integración M1.

Validación estructural no comprueba autorización real, estado de sesión, contenidos, plazos contra reloj, concurrencia, entrega de avisos, cifrado, borrado o restauración. T01–T12 siguen como requisitos de transacción/seguridad; este contrato concreta entradas/salidas, no los acredita implementados. Se necesitan negativos A/B/público, revocación/reasignación durante lectura/decisión, respuesta perdida tras commit, proveedor caído y recuperación en una futura implementación autorizada.

Fuentes primarias consultadas15-10-2026: [OpenAPI3.1.1](https://spec.openapis.org/oas/v3.1.1.html), secciones de schema/referencias/seguridad; [configuración Swagger UI](https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/), métodos de ejecución y validador remoto. Se conserva la versión del proyecto, sin salto por latest ni nueva tecnología.

## Pendientes y continuidad

D04 del recorrido UC001–004 tiene propuesta revisable YAML/JSON/Swagger de23 operaciones; detalle UC004 en [corrección y reconsideración](CORRECCION_RECONSIDERACION.md). D04 global M2/M8 no está cerrado. Continúan: política y ciclo completo de concesiones M8; interfaz M1 y revocación concurrente; adaptador de carga inmutable/análisis; consumidor de eventos; protección HMAC; D08-R validación material, copias depurables y ensayo de borrado/restauración. Los códigos técnicos finos de rechazo no tienen campo persistido específico en DATA001; se devuelve rejected genérico, sin fingir un dato que no existe.

Corrección/reconsideración por rechazo ya está modelada documentalmente. Pantallas y matriz ya propuestas. Siguiente: puerta documental, observaciones y dependencias D08-R/D09-R; ninguna pantalla o servicio se implementa por esta entrega. Cambios materiales se consultan. No ampliar a perfil comercial o M8 completo por costumbre.

Rama codex/docs-m2-m8-007 desde6fed44f, sin upstream. Copia aislada; fuentes 00–03/01 compartida y configuraciones permanecen intactas. La lectura actual de 00–03 editables y protocolo/matriz M1 fue completa; inventario raíz por rutas/hashes no equivale a lectura íntegra de código/dependencias. Originales ausentes y bloqueos M1 siguen registrados en01. Guardado local no significa commit/push, carga a Fuentes ni aceptación. No hay archivos de Fuentes/configuración para reemplazar en este corte; posterior conciliación007 pendiente.

## Preparación de integración y entrega · 15-10-2026

[Puertos consumidores y entrega](INTEGRACION_Y_ENTREGA_M2_M8.md). Especificación propia de identidad, avisos, archivos y HMAC/rotación; procedimiento D09-P listo documentalmente. No son interfaces compartidas implementadas. Modelo objetivo19 tablas/47 FK/83 CHECK;191 casos diseñados, cero pruebas del producto M2/M8 ejecutadas. Commit/push autorizados; resultados finales se informan por SHA remoto, sin fusionar ni subir Fuentes por inferencia.
