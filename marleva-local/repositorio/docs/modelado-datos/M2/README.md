# M2: modelo documental del expediente y su revisión

Estado de entrega vigente: [preparación de integración y sincronización Git autorizada](../../apis/M2/INTEGRACION_Y_ENTREGA_M2_M8.md). Las menciones anteriores a «sin commit/push» describen sus incrementos documentales previos; la entrega actual se verifica por SHA remoto, sin implicar subida a Fuentes o aceptación.

15-10-2026, America/Merida. MAR-CHAT-007, continuación. MAR-M2-DATA-001 es objetivo documental. No es una migración, no se aplicó SQL y no hay implementación M2/M8. El alcance de este corte es expediente → documentos → envío → asignación → decisión. Incluye corrección y reconsideración por rechazo (UC004), conservando el mismo expediente. Perfil comercial, restricciones/reconsideración de suspensión y conservación operativa siguen pendientes.

## Archivos y fuentes únicas

| Archivo | Función |
|---|---|
| [DBML](../dbml/MAR-M2-DATA-001.dbml) | Fuente importable en dbdiagram.io; 19 tablas nuevas propuestas y tres referencias externas mínimas M1 |
| [Complemento SQL](MAR-M2-DATA-001-complemento.sql) | Cuatro índices parciales que DBML/exportador no representa; fuentes U01–U04 trazadas a pasos |
| [DDL derivado](../ddl/MAR-M2-DATA-001.sql) | Exportación de DBML + complemento; no editar a mano ni ejecutar sobre una base |
| [Generador](generar-m2.mjs) | Generación local documental; no conecta con bases ni servicios y no modifica generadores compartidos |
| [Validación](VALIDACION_M2.json) | Resultados documentales, hashes y límites; no pruebas runtime |
| [Casos](../../proceso/MATRIZ_CASOS_M2.md) | Reglas, estados, actores y cola de pendientes |
| [Secuencias](../../diagramas/secuencia/M2/README.md) | IDs/pasos estables y revisión de diagramas |

Los modelos de M1 permanecen intactos. Account, Session y Development se muestran con sus claves mínimas para importar el diagrama; no son otras fuentes canónicas. El generador elimina sus CREATE/índices/comentarios y cualquier CREATE SCHEMA. Las FKs nuevas sí apuntan a sus claves existentes: la compatibilidad y permisos de esa futura integración requieren coordinación antes de cualquier migración. Auth/Storage siguen siendo propiedad del proveedor y no aparecen como nuevas tablas.

## Qué cambió al revisar las secuencias

Se corrigieron separadores de mensajes que Mermaid interpretaba como instrucciones. Se retiraron participantes sin interacción para mejorar lectura, sin renumerar pasos. Las 16 secuencias pasaron parse/render local con Mermaid 11.12.0 y red bloqueada durante render. En el corte inicial se inspeccionaron cinco. UC004 amplía la galería a seis; el acta vigente detalla los diagramas revisados en este incremento, los demás solo tienen parse/render, sin nueva revisión funcional exhaustiva.

Precisiones del recorrido: creación atómica del expediente/primera versión/recibo; nueva autorización al finalizar la carga; comparación de versión y privacidad antes de enlazar archivo; envío que vuelve a validar bajo bloqueo; revisión ligada a concesión, asignación y envío exactos. Se incorporaron pasos S085 de M2-SEQ-001/002, S145 de M2-SEQ-002 y S035/S075/S145 de M8-SEQ-002. Los pasos ya existentes conservan identidad.

## Entidades y finalidad

| Tabla propuesta | Responsabilidad |
|---|---|
| M2MembershipApplication | Expediente único por cuenta, estado/revisión de concurrencia y versión actual |
| M2MembershipVersion | Número y ciclo borrador/enviado; desarrollo y relación documental |
| M2MembershipVersionPrivate | Nombre/domicilio/declaración vecinal privados, separados para futura supresión controlada |
| M2MembershipDocument | Objeto privado por carga, finalidad, tamaño/tipo/hash/validación y campos de conservación y caso de calendario efectivo |
| M2MembershipVersionDocument | Enlace al documento de la misma cuenta/expediente; dos posiciones y una referencia por finalidad |
| M2MembershipSubmission | Recibo de envío por versión, estado pendiente/resuelto y fecha |
| M8MembershipReviewGrant | Concesión específica revisar/asignar; no altera permisos o autenticación de M1 |
| M8MembershipAssignment | Revisor/gestor y concesiones concretas; una asignación vigente por envío |
| M2MembershipDecision | Resultado mínimo, envío/asignación/revisor y finalidad explícita aún pendiente de política |
| M2MembershipDecisionPrivate | Motivo visible, campos corregibles y nota interna; proyecciones y supresión diferenciadas |
| M2MembershipDocumentAccess | Permiso corto ligado a documento/versión/actor/sesión y, si revisor, asignación |
| M2MembershipEvent | Evento mínimo durable de envío/decisión; sin documento/domicilio/correo ni texto privado |
| M2MembershipCommandReceipt | Idempotencia por actor/operación/clave y referencias tipadas, sin copiar datos privados |

La redundancia de accountId/applicationId en claves compuestas tiene un propósito: impedir enlazar una evidencia o decisión ajena aunque se conozca su UUID. No se replica identidad/correo ni se considera el correo clave de pertenencia. revision es control de concurrencia; number identifica versión documental; no son intercambiables.

## Trazabilidad de integridad del recorrido

Los prefijos de SEQ M2/M8 se conservan. Las rutas/IDs del recorrido se concretan en el [OpenAPI propio](../../apis/M2/README.md), sin contratos compartidos.

| Caso y paso | Datos / restricción declarativa | Comprobación futura, no ejecutada |
|---|---|---|
| M2-UC-001 / SEQ001:S060/S090 | accountId único; FK de versión actual al mismo expediente/titular; revision positiva; U01 un borrador | MAR-M2-IT-BE-001-A: dos creaciones concurrentes devuelven mismo expediente; B: versión ajena falla |
| M2-UC-002 / SEQ002:S030/S050 | Documento con finalidad/carga distinta; tamaño 1–5.000.000 bytes; formatos permitidos; referencia opaca única | MAR-M2-IT-BE-002-A: cupo/archivo de B no sirve para A; B: 5.000.001 bytes falla |
| M2-UC-002 / SEQ002:S090/S140 | Tipo/tamaño reales y SHA256 presentes para valid; cotejo con declaración; FK enlace con dueño/finalidad | MAR-M2-IT-BE-002-C: MIME/bytes falsos no válidos; D: finalidad ajena rechazada |
| M2-UC-002 / SEQ002:S140/S145 | PK versión/slot, slot 1–2 y finalidad única; revalidación de borrador por transacción | MAR-M2-IT-BE-002-E: tercer enlace falla; F: finalizar mientras se envía no altera versión congelada |
| M2-UC-003 / SEQ003:S040/S060 | Una versión enviada por recibo; U02 un pending por expediente; comprobación de campos/evidencia debe hacerse en transacción | MAR-M2-IT-BE-003-A: enviar una vez; B: constancia ausente o evidencia caduca no envía |
| M8-UC-001 / SEQ001:S030/S050 | Concesiones por capacidad, sin otorgamiento a sí mismo; gestor/revisor distintos del titular; U03/U04 exclusividad vigente | MAR-M8-IT-BE-001-A: autoasignación del titular falla; B: reasignación conserva anterior cerrada |
| M8-UC-002 / SEQ002:S035 | FK documento/versión, sesión/actor y asignación/revisor/envío; TTL ≤300 s; solo hash de permiso | MAR-M8-IT-BE-001-C: sesión de B o permiso para otra versión falla; D: TTL 301 s falla |
| M8-UC-002 / SEQ002:S070/S100 | FK de decisión a asignación/envío/revisor exactos y un resultado por envío; cierre coherente por transacción | MAR-M8-IT-BE-001-E: otro revisor no decide esa asignación; F: dos decisiones, una ganadora |
| M2/M8 / commit de envío/decisión | Eventos y recibos mínimos, referencias tipadas y claves únicas; transacción corta | MAR-M2-IT-BE-003-C: caída tras commit conserva recibo/evento; D: mismo key/cuerpo no repite transición |
| M8-SEQ002:S145 | finalityState provisional por defecto; fechas C14 nulas hasta finalización administrativa válida | MAR-M2-IT-BE-006-A: aprobar no activa automáticamente borrado; no es calendario validado |

El MIME/tamaño observado puede registrar por qué un archivo fue rechazado; solo analysisState valid exige el tipo permitido y coincidencia con tamaño declarado. No se almacena un tipo falso permitido para encubrir el rechazo.

Solo el tipo JSON de correctionFields se comprueba aquí. Su lista de valores permitidos está cerrada en el OpenAPI propio; nunca contiene valores privados. Los recibos no reproducen el cuerpo privado de respuesta: conservan IDs/revisión y requieren consultar el estado actual con autorización. Las huellas del cuerpo deben protegerse mediante HMAC estándar y política de claves, sin considerar un hash anonimización.

## Reglas que las tablas no garantizan por sí solas

| ID | Regla pendiente de contrato/transacción, no acreditada por este DDL |
|---|---|
| T01 | Bloquear expediente, versión y enlaces antes de guardar/finalizar/enviar; comprobar revision esperada y estado actual. Reservar/revalidar cupo evita carrera entre cargas; limpieza de cargas huérfanas necesita calendario |
| T02 | Al enviar: nombre/domicilio completos y declaración vigente; comprobar comprobante y fecha real/declarada, constancia si aplica, formato/análisis, objeto cerrado para escritura y privacidad activa. FK/slot no demuestra contenido ni residencia |
| T03 | No editar lifecycle/datos/enlaces de versión enviada salvo procedimiento autorizado de supresión. El DDL no contiene triggers ni políticas de escritura: la inmutabilidad todavía exige diseño de permisos/casos y pruebas |
| T04 | Guardar envío, cambio a pending, congelación de versión, recibo y evento juntos. Igual para decisión, estado del expediente, cierre de envío/asignación, textos privados, recibo y evento |
| T05 | Validar sesión/cuenta/MFA de M1 mediante interfaz pública acordada; no consultar ni modificar tablas ajenas para saltarse reglas. Validar proveedor fuera de bloqueos de base. El acoplamiento temporal con revocación concurrente M1 requiere coordinación; no se promete atomicidad con proveedor externo |
| T06 | Bloquear concesiones/asignación M8 para decidir; revalidar que no estén revocadas/cerradas y que el envío sea el actual. Revocación/reasignación deberán usar el mismo orden de bloqueo |
| T07 | Autorizar lectura por finalidad y actor, revalidar antes de responder, sin caché pública. FK a sesión existente no demuestra sesión vigente; no es autorización por sí misma |
| T08 | Emitir aviso mediante consumidor idempotente del evento. El puente a avisos M1/M9 y su recuperación todavía no están acordados; no modificar Notice/Outbox actuales |
| T09 | D08-0.1 modela casos/bloqueos/tareas/eventos/copias y referencias legítimas. D08-R exige aprobar política/fundamento y probar cercado, borrado externo y restauración. El modelo no acredita ese comportamiento |
| T10 | Revisar privilegios/default privileges, roles migrador/API, consultas por recurso y ausencia de exposición pública. Este DDL no concede permisos, no configura RLS y no acredita privacidad operativa |
| T11 | Al consultar/repetir idempotencia, reautorizar actor/recurso, comparar huella y retener al menos 72 h; no reaplicar mutación cuando existe resultado. Caducidad de recibos no permite crear otro expediente/envío/decisión |
| T12 | UC004 concreta origin/sourceDecisionId/sourceSubmissionId y motivo privado, con preparación y reenvío distintos. Bloquear y verificar última resolución compatible, número siguiente, motivo según origen, copia privada autorizada y declaración reiniciada. Conservar expediente/decisión anteriores; no copiar aprobación o enlaces automáticamente. Ver [diseño](../../apis/M2/CORRECCION_RECONSIDERACION.md). Reconsideración de suspensión/restricciones fuera del corte |

Un CHECK no puede demostrar propiedades de varias filas ni autorización actual. No se añade un trigger o procedimiento de negocio para aparentar que esas reglas ya quedaron implementadas. El contrato propio distingue estructura, transacción de negocio y dependencia externa, sin acreditarlas implementadas.

## Generación reproducible y límites

Herramienta existente: @dbml/core 10.3.1, sin instalar ni cambiar lockfiles. El generador exige esa versión. Usar Node 24.21.0 homologado; si esta copia no tiene dependencias propias, MARLEVA_DBML_MODULE puede apuntar al directorio de esa dependencia ya instalada. Ese uso solo lee la herramienta y no acredita una instalación reproducible completa de la aplicación.

```text
MARLEVA_DBML_MODULE=<directorio existente de @dbml/core 10.3.1> node docs/modelado-datos/M2/generar-m2.mjs
```

Orden: validar DBML con parser dbmlv2 → exportar PostgreSQL → retirar únicamente definiciones externas y CREATE SCHEMA → declarar FKs NOT DEFERRABLE → añadir los cuatro índices de la fuente complementaria → reimportar SQL documental con referencias externas mínimas solo en memoria → validar DBML resultante → guardar DDL. La reimportación usa el parser de la herramienta documental; no es validación del servidor PostgreSQL, equivalencia semántica completa ni comparación con base viva.

La primera validación usó por error el parser legado, que no admite checks; se corrigió a dbmlv2. La primera reimportación no tenía contexto de referencias externas; se añadió solo en memoria. La revisión del resultado también detectó CREATE SCHEMA emitido por el exportador; se eliminó y se añadió una guarda explícita. Ninguno de estos intentos se aplicó a una base. Solo el resultado final satisface las comprobaciones registradas.

Resultado final esperado de este corte: 19 tablas propuestas nuevas, 47 FKs y 83 CHECKs en el DDL; cuatro índices parciales del complemento. Son cantidades de estructura documental, no porcentaje funcional ni pruebas de integridad ejecutadas. La segunda generación debe conservar SHA256 del DDL. Ver acta para hashes/resultados reales.

Fuentes primarias consultadas el 15-10-2026: [sintaxis DBML y checks](https://dbml.dbdiagram.io/docs/), [uso/render de Mermaid](https://mermaid.js.org/config/usage.html). Mermaid 11.12.0 MIT se descargó del [registro oficial](https://registry.npmjs.org/mermaid/11.12.0) a temporal, con integridad SHA512 cotejada; no se añadió al proyecto. La configuración de render usa securityLevel strict y no tiene red. Los SVG son derivados locales, no publicación en Mermaid Live o dbdiagram.io.

## Pendientes y continuidad

El [OpenAPI propio del recorrido](../../apis/M2/README.md) ya propone carga/finalización, recibos, decisión sobre versión exacta, errores, permisos y proyecciones privadas. UC004 añade origen y referencias compuestas a decisión/envío del mismo expediente/titular, motivo privado nullable al suprimir y comandos create_version/link_document. Solo initial puede tener number1; secuencia creciente y motivo según origen son transaccionales. Pantallas y pruebas ya propuestas; siguiente: D08-R/D09-R y revisión del conjunto, sin ampliar rutas por costumbre. No modificar contratos/tipos/rutas compartidos. Los demás recorridos mantienen sus pendientes, sin implementación.

D08-0.1 ahora concreta finalización administrativa y calendarios en la propuesta enlazada; D08-R mantiene la validación material/operativa pendiente. La fecha nula representa una definición pendiente, no autorización para conservar indefinidamente. No hace falta resolver Google, tarifas o demografía para continuar el contrato ficticio/documental.

No se modifica 01 concurrente ni Fuentes compartidas. La conciliación posterior debe incorporar el registro 007 y este enlace sin sobrescribir la continuidad de 006. Las cinco migraciones y todos los archivos versionados de la base de la copia aislada se cotejan por hash; cualquier discrepancia es un fallo de alcance. Guardado local no equivale a commit/push ni a reemplazar Fuentes. M2/M8 siguen sin implementar, sin pruebas runtime y sin aceptación.

## Incremento D08/D09

[Política propia](../../apis/M2/CONSERVACION_REVISORES_D08_D09.md). Se agregan RetentionCase/Hold/DeletionTask/RetentionEvent/Replica y ReviewerProfile:19 tablas nuevas,47 FK,83 CHECK y4 índices parciales. El case contiene calendario efectivo; Document.retention* conserva ancla C14. Finality challenged puede conservar primera finalizedAt. Eventos registran nuevas finalizaciones, comandos con HMAC e idempotencia; no se reescribe decisión original. Invariantes entre filas, privilegios y exclusión externa permanecen transaccionales no implementadas. T09 tiene diseño objetivo revisable; activación D08-R pendiente. D09 deriva candidatos de perfil habilitado+grant vigente, sin editar M1. Las secciones anteriores de validación describen incrementos históricos, no resultados de este corte.

| Tabla agregada | Función |
|---|---|
| M2MembershipRetentionCase | Finalidad, recurso tipado, ancla de decisión, fecha efectiva y revisión |
| M2MembershipRetentionHold | Base/referencia opacas y revisión, sin uso ordinario |
| M2MembershipDeletionTask | Intención, lease/fence y confirmación externa |
| M2MembershipRetentionEvent | Historia mínima e idempotencia de comandos internos |
| M2MembershipReplica | Inventario y ausencia de todas las copias privadas |
| M8MembershipReviewerProfile | Etiqueta operativa y habilitación, sin conceder permiso |

## Revisión integral del recorrido

19 tablas/47 FK/83 CHECK/4 índices parciales en objetivo no aplicado. Se corrigen purga privada, metadata de documento borrado, calendario requerido y estados de tarea. Las reglas entre filas/proveedores siguen siendo transaccionales y deben probarse al implementar; no se presenta parser como prueba SQL. Caso de revisión en matriz M2 A01–A10.

## Preparación de integración y entrega · 15-10-2026

[Puertos consumidores y entrega](../../apis/M2/INTEGRACION_Y_ENTREGA_M2_M8.md). Especificación propia de identidad, avisos, archivos y HMAC/rotación; procedimiento D09-P listo documentalmente. No son interfaces compartidas implementadas. Modelo objetivo19 tablas/47 FK/83 CHECK;191 casos diseñados, cero pruebas del producto M2/M8 ejecutadas. Commit/push autorizados; resultados finales se informan por SHA remoto, sin fusionar ni subir Fuentes por inferencia.
