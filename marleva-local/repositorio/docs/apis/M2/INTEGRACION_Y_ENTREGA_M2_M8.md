# Integración y entrega documental M2/M8

15-10-2026 · America/Merida · MAR-CHAT-007, CONTINUACIÓN. Preparación documental propia, sin implementación, migraciones o modificación M1/contratos compartidos. Complementa [contrato propio](openapi.yaml), [política D08/D09](CONSERVACION_REVISORES_D08_D09.md) y [matriz](../../proceso/MATRIZ_PRUEBAS_M2_M8.md). [Especificación de puertos consumidores](integration-ports.json) es propuesta M2/M8, no interfaz compartida aprobada ni endpoints existentes.

## 1. Identidad y autorización

Evidencia leída del contrato M1 del commit base6fed44f: Account expone id, correo, estado, pertenencia, operador y acciones_permitidas. No expone session_id, fecha de autenticación ni prueba MFA suficiente para autorizar M8. No deducir esos datos del booleano operador ni de GET /me. El estado vigente de M1 se mantiene en01 del trabajo concurrente; no incorporar su implementación a esta rama por rutina.

Puerto consumidor `IdentityContext`: credencial por transporte existente → account_id estable, session_id, checked_at, authenticated_at, mfa_level y mfa_checked_at, sesión/cuenta vigentes. Son requisitos propuestos de integración en servidor; no se añaden al JSON público de Account ni se leen tablas Auth/Session directamente desde M2. Para titular: sesión vigente y recurso propio. Para M8: además capacidad propia actual, MFA y autenticación reciente≤300s según política acordada. Fechas las aporta la autoridad de identidad, nunca cuerpo del cliente. Si faltan/caducan: denegar; si autoridad no responde:503, sin usar caché como permiso vigente.

Validar identidad fuera de locks de base; comprobar concesión/asignación y revisión dentro de transacción propia. Revalidar identidad antes de entregar bytes o confirmar acción sensible. Una revocación externa simultánea no se presenta como operación atómica global: el adaptador deberá definir un punto de comprobación vigente y probar ese intervalo. D07-I permanece como acuerdo/implementación del proveedor, no como campo supuesto ya existente. Web mantiene cookie/Origin/CSRF y móvil credencial opaca; M2 no sustituye recuperación o MFA de M1.

## 2. Avisos durables

Puerto consumidor `MembershipEventSink`: event_id, event_type, recipient_account_id, application_id, submission_id y decision_id nullable. Solo membership_submitted/membership_decided; sin domicilio, archivos, motivos libres, notas, tokens o correo. El ID de cuenta es dato privado vinculado, no anonimizado. Evento y transición M2 se confirman juntos; el consumidor recibe después del commit y deduplica por event_id.

Acuse significa recepción durable y referencia del consumidor, nunca lectura del titular ni entrega del correo. Registrar deliveredAt solo tras ese acuse. Timeout conserva pendiente y reintenta el mismo event_id; no reejecuta la decisión. Propuesta de reintento1/5/30min y escalamiento24h; una caída no elimina el evento. La lectura de avisos de M1 no es una API de publicación: no escribir Notice/Outbox actuales ni convertir GET /notifications en emisor. El adaptador y el consumidor M1/M9 se acordarán antes de conectar; sus pruebas son D07-E.

## 3. Archivos y conservación

Puerto consumidor `PrivateEvidenceStore`: reservar referencia opaca, escritura condicional e inmutable, inspección de bytes/tipo/hash y análisis, lectura mediada, borrado y confirmación de ausencia de todas las copias. No devuelve service_role ni URLs públicas. Su error distingue unavailable, rejected, conflict y absent confirmado; un timeout nunca equivale a absent.

C14 y D08-0.1 fijan las condiciones de disposición. B09 de M1 demuestra otro recorrido de archivos ficticios y no acredita este adaptador de5.000.000 bytes, análisis PDF/JPEG/PNG, reutilización ni copias depurables. No instalar otro proveedor ni modificar B09 para aparentar integración. D07-S exige ensayos propios de inmutabilidad, tamaño real, análisis, exclusión enlace/hold/borrado y restauración con ledger externo; no se ejecutan por esta entrega.

## 4. Huellas y rotación de claves

Elección documental propia: HMAC-SHA256 estándar, con separación de dominios para clave de comando y cuerpo. JSON validado primero; rechazar propiedades duplicadas/desconocidas, Unicode inválido y números fuera del esquema. Canonicalizar mediante JCS RFC8785: ordenar propiedades, preservar arrays y texto Unicode, sin trim/normalización silenciosa. No implementar un canonicalizador improvisado; seleccionar una biblioteca mantenida y verificar sus vectores al implementar. No se instala paquete ni genera llave en este encargo.

Sobre canónico de petición: actor_id, operation_id, método, ruta canónica y body. UUID de ruta con representación canónica; expected_revision y nulls forman parte del body. Dominios `marleva:m2:key:v1` y `marleva:m2:body:v1`, codificados dentro del sobre canónico, evitan concatenación ambigua. keyHash protege actor/operación/Idempotency-Key; requestHash protege el sobre completo. Comparación con función estándar en tiempo constante y longitudes previamente verificadas. No persistir cuerpo privado, clave enviada, secretos ni token.

Antes de buscar o crear un recibo, serializar por actor_id+operation_id con exclusión transaccional propia; bajo esa exclusión consultar todos los identificadores de llave aún verificables, y después aplicar CAS/guardar. La exclusión no se deriva del hash rotatorio: dos solicitudes durante la rotación no pueden crear recibos distintos para la misma clave lógica. Publicar el anillo de llaves como revisión atómica; no retirar una revisión que tenga comandos activos o recibos verificables. Esta regla se coordina con la exclusión de comandos, no con una transacción externa de M1.

Guardar hashKeyId no secreto junto al recibo; commandKeyId junto al HMAC de comando de conservación. Rotar mediante anillo servidor: escribir con llave activa, buscar recibos con las llaves aún vigentes para sus72h mínimas; no retirar una llave mientras haya recibos/comandos verificables que dependan de ella. Acceso a llaves fuera de Git/base de negocio/logs, identidad de servicio mínima. Llave ausente o inaccesible→503/conciliación, nunca nueva transición para eludir un recibo. Conservar hashes no vuelve anónimos los datos. Política y pruebas de llaves son D07-K; se añadió metadata al modelo propio para hacer viable la rotación.

Fuentes consultadas15-10-2026: [RFC8785](https://www.rfc-editor.org/rfc/rfc8785), documento informativo de JCS; [Node24 Crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html), HMAC y comparación temporal. No se adopta otra versión de Node por consultar documentación del mismo major.

## 5. Aprovisionamiento de revisores

Procedimiento documental D09-P: designación de al menos dos personas; identidad estable y factor comprobados mediante M1; registro protegido de etiqueta REV y persona designada fuera del repositorio público; autorización del otorgante inicial con doble intervención; creación por operador habilitado de perfiles/concesiones M8; prueba negativa de autoasignación/revocación y acta mínima sin datos privados. Preparar la designación no concede capacidad. Ningún UUID ficticio se transforma en revisor real.

Matriz de separación: otorgante habilita a otra persona; gestor asigna envío ajeno; revisor decide versión asignada ajena; conservador registra finalidad/bloqueo sin decidir pertenencia. Las capacidades pueden coexistir en una persona conforme02, manteniendo separación de acciones y conflicto. Sin persona alternativa, el envío queda pendiente y se escala. Revisor no se habilita por tener perfil, por selección UI o Account.operator. El procedimiento está preparado; nombres/designación, credenciales y ejecución siguen D09-R.

## 6. Condiciones de salida y responsabilidades

| ID | Preparado documentalmente | Evidencia todavía necesaria |
|---|---|---|
| D07-I | Contexto servidor, errores, fechas y límite de revocación | Acuerdo con dueño M1 y prueba del adaptador; no cambiar JSON Account aquí |
| D07-E | Evento mínimo, deduplicación y semántica del acuse | Consumidor durable y caída/reinicio/duplicado probados |
| D07-S | Operaciones privadas y diferencias respecto B09 | Storage/análisis/copias/ausencia/restauración propios probados |
| D07-K | Canonicalización, anillo y metadata de llave | Biblioteca/llaves/rotación/fallo/replay probados |
| D08-R | Calendario y procedimiento D08-0.1 concretos | Validación material del fundamento/aviso/prescripciones y capacidad real de depurar copias/mínimos |
| D09-R | Catálogo y procedimiento D09-P preparados | Personas designadas, habilitación y prueba real |
| UI-R | Propuesta navegable con acciones por estado | Aceptación visual humana; ninguna aprobación inferida de la navegación |

El asistente prepara y comprueba documentación; el dueño de cada módulo acuerda su interfaz; el responsable designado valida política y personas. No se inventan nombres o aceptación. Las pruebas nuevas de estas fronteras están en la matriz, diseñadas y no ejecutadas.

## 7. Entrega Git y conciliación de Fuentes

Rama propia codex/docs-m2-m8-007, base6fed44f. Commit/push autorizados expresamente por el usuario en este turno. Revisar únicamente archivos propios M2/M8, licencias y ausencia de secretos; conservar base versionada, cinco migraciones y contratos compartidos. Ejecutar hooks sin desactivarlos; preparar herramientas/dependencias/derivados ignorados aislados solo para esa verificación. No inicia servicios, implementa M2 ni aplica SQL. El remoto se comprueba por SHA después del push, sin force ni merge.

La fuente01 compartida sigue con trabajo concurrente006; no sobrescribirla con la fotografía de esta rama. Texto preparado para conciliación: «MAR-CHAT-007 abierto: diseño documental aislado M2/M8 revisado, contrato0.3.1, modelo objetivo19 tablas,183 casos más pruebas de integración de fronteras; pendientes reales D07-I/E/S/K, D08-R, D09-R y aceptación visual. Sin implementación ni datos reales. Evidencia/entrega en docs/apis/M2». Conciliar enlaces al commit definitivo conservando el estado más reciente de006. No reemplazar00/02/03 ni configuración por costumbre.

Fuentes ChatGPT no se actualiza al guardar o hacer push. No hay vía de carga de archivos de ese proyecto comprobada en este encargo; no atribuir subida ni convertir una edición de Pages en sustitución de Fuentes. El commit remoto proporciona acceso verificable al diseño; carga compartida permanece separada. El chat007 sigue abierto.
