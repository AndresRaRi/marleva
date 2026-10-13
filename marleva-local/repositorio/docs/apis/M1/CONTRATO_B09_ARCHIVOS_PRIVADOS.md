# B09: archivos ficticios privados

Versión 0.2; 13-10-2026 America/Merida; MAR-CHAT-004. Diseño objetivo con DBML/DDL y OpenAPI generados; implementación, migración y pruebas runtime pendientes. Lectura obligatoria para B09 junto a 02 §16.4, matriz y SEQ011.

El harness prepara objetos text/plain ficticios de A/B en bucket privado. No añade carga de documentos ni expediente M2. La API valida titular, cuenta, sesión y estado en cada lectura; no entrega service_role ni rutas internas de Storage al cliente.

Propuesta: capacidad opaca, solo hash persistido, ligada a objeto/cuenta/sesión, máximo cinco minutos y nunca más que la sesión. Viaja en encabezado, no URL. API transmite contenido por HTTPS y revalida permiso: una URL firmada independiente no garantiza revocación inmediata.

| Operación objetivo | Resultado y condiciones | Errores |
|---|---|---|
| POST /v1/local/file-fixtures/{id}/access | Sesión activa, titular, objeto disponible; capacidad/expires_at; no-store; Origin/CSRF web | 401 sesión; 404 inexistente/ajeno/borrado indistinguibles; 429 límite; 503 dependencia |
| GET /v1/local/file-fixtures/{id}/content | Sesión/capacidad vigentes ligadas; text/plain, nosniff, no-store; comprobar tamaño/hash | 401 sesión; 403 capacidad inválida/vencida; 404 recurso; 503 Storage/integridad, sin contenido parcial aceptado |
| DELETE /v1/local/file-fixtures/{id} | Titular, versión e idempotencia; bloquear lecturas/revocar capacidades antes de borrar Storage | 401/404; 409 versión; 202 borrado externo pendiente; 503 intención no persistida |

Respuestas con request_id sin secretos. Límite técnico local elegido:10 emisiones/minuto por sesión, con Retry-After real; reemisión revoca anterior del mismo objeto/sesión. No es capacidad productiva medida. Emisión de credencial limitada no requiere Idempotency-Key; DELETE sí conserva clave/huella/versión y resultado durable, incluso en reintento del mismo titular tras borrar.

DATA002 objetivo ahora13tablas: PrivateFixture con version/deleteRequestedAt y estados available/delete_pending/deleted; FixtureAccess liga cuenta/objeto/sesión mediante FKs compuestas, hash y TTL≤300s; FixtureDeletion guarda intención, idempotencia, lease/reintento/confirmación. La API todavía debe comprobar sesión actual, revocación, estado y límite; constraintsSQL no equivalen a autorización runtime. Leer [YAML objetivo](openapi-objetivo-archivos.yaml) y [Swagger objetivo](swagger-objetivo-archivos.html). Ningún DDL aplicado al negocio.

Leer y verificar contenido≤1MiB antes de responder para no transmitir bytes inválidos; no streaming previo a validación. Propuesta de proxy HTTPS conserva validaciónTLS. En borrado concurrente, operaciones se ordenan al autorizar y al commit de intención: después del commit no se admite nueva lectura. Una respuesta ya autorizada/enviada no puede retirarse del dispositivo; no prometer esa garantía.

Borrado: commit de intención bloquea futuras lecturas aunque Storage falle; trabajador reconcilia sin reactivar objeto. Restauración reaplica borrados posteriores a copia antes de permitir accesos. No establece retención legal ni implementa C14 completo.

| Caso diseñado | Pasos SEQ011 | Prueba requerida |
|---|---|---|
| MAR-M1-UT-BE-111-A | S020/S060 | Titular/estado/sesión/reloj; vence máximo cinco minutos |
| MAR-M1-IT-BE-111-A | S010–S090 | A lee contenido/hash; B y público denegados contra Storage local real |
| MAR-M1-IT-BE-111-B | S060 | Capacidad no funciona con otro objeto/cuenta/sesión ni tras logout |
| MAR-M1-IT-BE-111-C | S100–S140 | Borrado concurrente, caída/reinicio, reintento idempotente y lectura bloqueada |
| MAR-M1-IT-BE-111-D | S070/S080 | MIME/tamaño/hash inválidos, truncamiento y caída; error sin secretos |
| MAR-M1-IT-BE-113-B | S140 | Restauración aislada conserva borrado posterior y revocaciones |
| MAR-M1-PF-BE-111-A | S050–S090 | 1 KiB/1 MiB, concurrencia 1/5/10; latencia, bytes/s, RAM, errores y permisos |

Todos diseñados, no ejecutados. UT/IT frontend se añaden cuando exista consumidor autorizado: espera, vencimiento, reintento y limpieza al salir. No crear pantalla solo para contabilizar pruebas. Este cambio documental no acredita performance runtime.

## Incremento005: decisiones técnicas para implementación

Sin cambio de método Auth: principal actual valida identidad; B09 revalida cuenta/sesión/revocación bajo transacción antes de emitir permiso y antes de entregar bytes. Consulta de Storage fuera de transacción, con timeout y lectura acotada1MiB; verificar MIME/tamaño/hash antes de respuesta. Cuenta y sesión del permiso no vienen del cliente. Emisión y borrado se serializan por titular; DELETE guarda intención/revoca capacidades y bloquea nuevas lecturas en el mismo commit.

Nuevo esquema solo B09: tres tablas de fixtures/capacidades/intenciones y clave compuesta Session(id,accountId). No incorpora roles ni Recovery; DATA002 completo no se aplica. Migración nueva derivada del DDL objetivo, ensayada antes de negocio. Metadata sin contenido, sin retención legal inventada.

Trabajador de borrado: lease15s, escrituras cercadas por misma lease, reintentos1/5/30min sin caducidad que borre la obligación. Confirmar ausencia en Storage antes de deleted. Repetición DELETE con misma clave/cuerpo devuelve estado durable; clave distinta/cuerpo distinto o versión vieja409. Borrado no recupera permisos. Revisión del usuario/flujo nativo siguen pendientes.
