# B12: ensayo de recuperación de base/M1

Fecha: 14-10-2026 America/Merida. Historial por Git, MAR-CHAT-005. Procedimiento objetivo con primera fase parcial ejecutada; B12 no completa. Lectura obligatoria para UC013 junto a [matriz M1](MATRIZ_CASOS_M1.md), [protocolo](PROCESO_DESARROLLO_MARLEVA.md), 02 §16.4, SEQ013 y contratos B09/recuperación MFA.

## Prioridad aprobada para el piloto: opción A

Decisión B12-PILOTO-A, 14-10-2026, MAR-CHAT-005. El usuario respondió «Aprueno A» a la separación de pruebas propuesta. Cambia la prioridad de entrega, no convierte casos pendientes en resultados.

| Momento | Comprobaciones exigidas | Trazabilidad |
|---|---|---|
| Antes del piloto | Restauración consistente de datos, identidad y archivos; integridad; destino bloqueado ante copia incompleta; permisos propios/ajenos/públicos; borrados no reaparecen; sesiones y capacidades antiguas rechazadas | IT-BE-113-A–E/G, SEQ013:S001–S070 |
| Antes del piloto | Reinicio seguro, avisos pendientes recuperados sin repetir negocio y nueva autenticación del cliente conservando una acción interna autorizada | IT-BE-113-F, IT-FE-113-A, SEQ013:S072; plataformas aplicables por separado |
| Antes del piloto | Recuperación del acceso de operadores con segundo factor, otro autorizado y sin autorrevisión | UC014 y pruebas de recuperación MFA de la matriz; no cubierto por OTP de usuario normal |
| Antes del piloto | Prueba básica de interrupción/corrección de actualización y recuperación; medir duración y pérdida observada del ensayo, repetir el procedimiento esencial | IT-BE-113-H básico y PF-BE-113-A básico; la prueba SQL aislada existente no acredita runner Prisma ni recuperación integral |
| Después del piloto | Ensayos prolongados de capacidad y escenarios avanzados de caída/migración | Mantener pendientes en B12; definir cada variante antes de ejecutarla |

El piloto solo puede superar esta puerta cuando existan resultados verificables de todas las comprobaciones esenciales. No se difieren controles de pérdida de datos, permisos, revocación, borrados ni recuperación MFA. Esta decisión no autoriza despliegue, datos reales o activación comercial. M1/B12 permanecen incompletos y sus porcentajes no aumentan por aprobar una prioridad.

## Condiciones para ejecutar

Origen y destino deben estar identificados por proyecto, contenedores, volúmenes y puertos distintos. El destino empieza sin acceso de clientes. Usar solo fixtures y versiones/digests del origen comprobados. No ejecutar reset, restauración o migración contra una dirección desconocida. No basta cambiar el nombre de una carpeta: también separar estado de Supabase, claves, volúmenes y endpoints.

Antes del ensayo, revisar el procedimiento compatible con la CLI/bundle realmente instalado para copiar roles y esquemas gestionados de Auth/Storage. No restaurar únicamente `marleva` y declarar recuperada la identidad. No importar roles globales indiscriminadamente ni sobrescribir esquemas gestionados sin comprobar compatibilidad. Los comandos concretos se fijarán tras inspeccionar el entorno actual; este documento no autoriza comandos inventados.

El destino permanece bloqueado si falla la copia, la integridad, la reaplicación de borrados o la revocación de accesos. Conservar origen y evidencia para corregir; no borrar volúmenes como forma de resolver un fallo.

## Secuencia y evidencia por paso

| Paso SEQ013 | Acción | Salida exigida |
|---|---|---|
| S001 | Identificar origen/destino y excluir datos reales | Manifiesto sin secretos: versiones, imágenes, nombres, puertos, dataset y espacio disponible |
| S005 | Preparar A/B, operadores, roles, sesión revocada, aviso pendiente y objetos privados con contenido/hash conocido | IDs y estados esperados; B/público no acceden a A antes de copiar |
| S008 | Establecer punto consistente de copia; impedir escrituras durante la captura de DB y objetos en este ensayo local | Hora de inicio/fin y mecanismo real de pausa; no afirmar atomicidad entre PG y Storage sin control |
| S010/S020 | Copiar PostgreSQL/Auth/metadata Storage y contenido de objetos según bundle comprobado | Copia privada íntegra, manifiesto de objetos, tamaños y SHA256; sin secretos en acta |
| S030 | Reanudar origen; borrar un fixture después de la copia y guardar registro mínimo fuera de esa copia | ID/clave interna/fecha/estado confirmado o pendiente y ubicación privada del registro; nunca contenido borrado |
| S040/S050 | Restaurar DB y objetos en destino aislado sin servir clientes | Resultado de cada herramienta; discrepancias explícitas; origen intacto |
| S055 | Reaplicar el registro posterior: fixture delete_pending bloquea lectura, tarea reintenta hasta confirmar ausencia | Objeto borrado no reaparece; hash/manifiesto ajustados; caída Storage conserva intención durable |
| S060/S065 | Revocar sesiones/capacidades restauradas y accesos del proveedor con mecanismo comprobado | Credenciales previas de usuario/operador rechazadas por API y proveedor donde corresponda; OTP nuevo obligatorio |
| S070 | Cotejar identidad, IDs, relaciones, roles, estados, avisos, metadata y hashes | Diferencias cero para datos que deben conservarse; diferencias esperadas de revocación/borrado documentadas |
| S072 | Comprobar permisos y recuperación con A/B; reanudar trabajador controladamente | B/público denegados, A accede solo a fixture conservado; aviso no duplica negocio; OTP y MFA siguen exigidos |
| S075 | Ensayar interrupción de migración nueva en otro destino desechable, separado del ensayo principal | Estado antes/después, rollback o corrección compatible comprobados; migraciones aplicadas inmutables |
| S080 | Medir duración/recursos/pérdida observada, registrar fallos y cerrar únicamente el ensayo | Acta por caso y limpieza del destino identificado; sin RPO/RTO productivos ni M1 completa inferidos |

## Casos de prueba necesarios

| ID | Resultado esperado | Tipo y dependencia |
|---|---|---|
| MAR-M1-IT-BE-113-A | Restauración conserva IDs y vínculos entre negocio e identidad | PG/Auth/Storage reales locales; bundle compatible |
| MAR-M1-IT-BE-113-B | B/público no leen objeto A; hash del objeto conservado coincide | B09 implementado y autorización real |
| MAR-M1-IT-BE-113-C | Borrado posterior se reaplica antes de abrir acceso | Registro externo a copia + reconciliación B09 |
| MAR-M1-IT-BE-113-D | Caída durante borrado deja bloqueada lectura y reintento durable | Worker y Storage real; sin marcar deleted por intención |
| MAR-M1-IT-BE-113-E | Sesión revocada y credenciales anteriores no reviven | API/Auth, capacidades de archivo y MFA; verificar ambos límites |
| MAR-M1-IT-BE-113-F | Aviso pendiente se recupera sin repetir cambio de cuenta | SMTP/worker/outbox; fallo después de enviar registrado |
| MAR-M1-IT-BE-113-G | Copia incompleta/hash distinto impiden servir el destino | Inyectar falta de objeto y verificar rechazo, sin tocar origen |
| MAR-M1-IT-BE-113-H | Interrupción de migración no altera origen ni se oculta como rollback de app | Nueva migración revisada en destino desechable |
| MAR-M1-IT-FE-113-A | Cliente con sesión vieja recibe expiración, conserva acción interna segura y exige OTP nuevo | Chrome/Safari/builds Android/iOS por separado |
| MAR-M1-PF-BE-113-A | Duración, bytes, CPU/RAM y pérdida observada tienen dataset y ambiente identificados | Medición del ensayo; no promesa de capacidad productiva |

No unitarias nuevas por este cambio exclusivamente documental. Antes de implementar utilidades/worker, diseñar unitarias de validación de destino, manifest/hash, estados y reintentos; las integraciones anteriores no se sustituyen por mocks. Performance se mide al ejecutar el ensayo; no asignar resultados a carpetas o tablas de pruebas previstas.

## Acta y criterio de salida

Plan113-H antes de implementar: PG17 desechable sin red/puertos/montajes del origen, cuatro migraciones existentes solo leídas/aplicadas ahí. Nueva candidata ficticia de prueba fuera del historial aplicado, BEGIN/DDL/DML/pausa/COMMIT explícitos. Cancelar exclusivamente backend identificado por application_name durante pg_sleep después de DDL/DML, comprobar rollback real de tabla/fila, integridad del fixture previo y reconexión. Reaplicar candidata y verificar una tabla/fila y fixture previo intacto. No implica que Prisma envuelva automáticamente migraciones ni que migraciones no transaccionales tengan rollback; runner Prisma/crash de servicio siguen sin acreditar por este caso. Eliminar solo contenedor/volumen desechable etiquetado; hashes de cuatro migraciones y salud del origen antes/después.

Guardar resultados en `tests/results/`, sin dumps, contenido privado, tokens, claves o DSN. Campos: ID, requisito, fecha, versiones/digests, plataforma/dataset, pasos y comandos efectivamente usados, esperado/obtenido, evidencia, duración/recursos, fallo/corrección y pendientes. Dumps y objetos quedan en almacenamiento privado ignorado, con acceso limitado y eliminación del dataset desechable identificada.

B12 continúa pendiente hasta ejecutar todos los casos pertinentes, repetir instalación/arranque con lockfile e imágenes fijados y comprobar las plataformas requeridas. Este documento cierra el detalle del plan de ensayo; no acredita restauración, builds o aceptación M1.

Consulta de herramienta local13-10-2026: la ayuda de `supabase db dump` admite `--local`, `--schema`, `--dry-run`, `--data-only` y `--role-only`; `--workdir` es opción global. Esto solo comprueba opciones; revisar el script de dump antes de decidir cobertura Auth/Storage y copia de objetos. Consultas terminaron exit0 después de resolver permiso de escritura de estado de la CLI; ningún servicio o dump iniciado.

Continuación 14-10-2026, preparación comprobada: origen PG supabase_db_marleva-m1 usa imagen17.11.0.004 y volumen del mismo nombre en /var/lib/postgresql/data; Storage v1.79.36 usa volumen supabase_storage_marleva-m1 montado en /mnt. Dry-run CLI con schema marleva,auth,storage exit0: genera esquema solamente por defecto; una copia de datos requiere opción explícita. Script de inspección privado en artifacts/recovery/dump-dry-run.sh, ignorado, no acta de backup. Ensayo/restauración todavía no ejecutados; no copiar roles globales ni mezclar destino con estos volúmenes.

## Primera fase ejecutable: copia física local aislada

Plan14-10-2026, antes de escribir el harness. Alcance parcial de113-A/G: comprobar la restauración física completa de PG17 y del contenido Storage, con la misma imagen por ID/digest, sin importar roles lógicos a otra instalación. No acredita Auth/Storage API, revocación, borrados posteriores, MFA, migración interrumpida ni cliente; esos casos continúan después de esta base.

1. Validar nombres exactos del origen, montajes únicos, imagen local y red; destino con prefijo marleva-b12, nombres/volúmenes distintos y etiqueta del ensayo. Rechazar destinos existentes, origen/destino iguales o montajes desconocidos. Unitarias de estas guardias antes de ejecutar.
2. Detener API/trabajador y los servicios Supabase del origen conservando contenedores/volúmenes. Parar PG de forma normal, comprobar salida0 y ausencia de proceso antes de copiar. No usar snapshot en vivo ni copiar solo tablas.
3. Copiar ambos volúmenes completos desde montajes de solo lectura a volúmenes nuevos de backup, y desde estos backups de solo lectura a otros volúmenes de trabajo del destino. Helper de imagen PG ya local, pull=never, sin red ni puertos; recursos limitados. Manifiestos de rutas/tamaños/SHA256 privados e ignorados; solo conteos/digests agregados en acta. Verificar igualdad antes de arrancar. Sin tablaspaces externos/symlinks desconocidos; rechazarlos si aparecen.
4. Reanudar el origen en finally incluso si falla la copia. No borrar volúmenes del origen. Iniciar únicamente PG del destino en red internal distinta, sin puertos publicados y con volumen de trabajo propio, misma imagen y configuración original compatible. Mantener Auth/Storage/clientes del destino apagados.
5. Comparar conteos/digests de filas de todos los esquemas marleva/auth/storage contra el punto previo a copia, sin mostrar filas/tokens. Comprobar identidad→cuenta, sesión→cuenta, fixture→titular/sesión y metadata. Comprobar manifest Storage y rechazo de copia incompleta antes de servir. La primera fase no abre el destino a clientes.
6. Acta con imágenes, volumen/red identificados, pausa/duración/bytes y errores; recursos del helper identificados, sin promesa RPO/RTO. Conservar backups privados; detener destino y preservar volúmenes para las siguientes fases. No limpieza automática por nombres amplios.

Base técnica consultada14-10: [PostgreSQL17, copia de archivos](https://www.postgresql.org/docs/17/backup-file.html) exige servidor detenido y cluster completo; [Docker, backup/restauración de volúmenes](https://docs.docker.com/engine/storage/volumes/) describe montajes y copia separada. [Supabase, restauración](https://supabase.com/docs/guides/self-hosting/restore-from-platform) separa objetos Storage y configuración/claves de identidad. Aplicación a este ensayo local con bundle idéntico, no receta para migración de proveedor/versiones ni certificación productiva.

Primera ejecución21s: PG restaurado, conteos/digests de marleva/auth/storage idénticos; relaciones cuenta→identidad y sesión→cuenta válidas. Origen reanudado, destino detenido sin puertos. Storage tenía0 archivos después de limpieza B09; no acredita recuperación de contenido. Se conserva como baseline vacío y se prepara otro ensayo con tres textos ficticios1KiB/1MiB conocidos, dos cuentas/sesiones y metadatos reales. Fixture privilegiado local genera identidad/sesión de proveedor solo para preparar el ensayo, no acredita acceso OTP/cliente ni cambia C15. Tokens quedan privados/ignorados; lectura propia/ajena se probará en API antes de copiar. Objetos se mantendrán para fase de borrado posterior y finalmente se limpiarán por sus claves exactas.

Resultado de segunda copia14-10:18.916s totales,6.525s entre parada PG y copia terminada; no es toda la indisponibilidad ni un RTO.1977 archivos PG y3 de Storage;1,050,624 bytes de los textos previstos. Tablas/filas y hashes coinciden;12 tablas marleva incluyen11 de negocio más historial Prisma. Reportes recovery-copy.json y recovery-source.json; baseline vacío separado. Tres unitarias de guardias pasaron; lint de helpers pasó. DELETE posterior por API completó el objeto designado en origen; ledger privado fuera de la copia y recovery-after-copy.json. Reaplicación y resto B12 todavía pendientes; no acreditar113-A/B/C/G completos por estas fases.

## Siguiente fase: proveedor y API del destino

Incidencia comprobada14-10: primera lectura del destino falla integridad. Bytes/SHA256 y metadata SQL coinciden, pero MIME servido es application/octet-stream. El cp BusyBox de la imagen PG no preservó atributos extendidos user.supabase.content-type/cache-control; Storage1.79.36 los usa al leer. Los manifiestos de contenido solos son insuficientes. No rebajar B09 ni afirmar copia fiel completa. El procedimiento siguiente copiará y cotejará atributos binarios con fs-xattr de la misma imagen Storage. Para continuar este ensayo antiguo, reparación excepcional solo de los tres fixtures conocidos: MIME/cache desde metadata SQL del destino y parámetros de preparación contrastados, hashes antes/después; no reupload, cambio de IDs/versiones ni modificación de backups/origen. Esa reconstrucción no acredita preservación original de atributos. Acta separada y ensayo nuevo de copia necesario antes de cerrar113-A/G.

Repetición prevista: MARLEVA_RECOVERY_ATTRIBUTES=1 conserva el acta/baseline anterior y escribe recovery-copy-with-attributes.json. Copia del estado actual del origen: los dos objetos vivos previstos deben estar y conservar atributos binarios; el tercer fixture ya borrado no se exige físicamente. No recrear dataset ni sustituir ledger/baseline de la prueba de borrado posterior. Nueva red/volúmenes/PG identificados, mismo protocolo de parada/reanudación; no se acredita API del nuevo destino con los resultados del anterior.

Plan previo al código: reutilizar solo el destino identificado en recovery-copy.json y su volumen de trabajo, con el PG anterior detenido. Nueva red internal y aliases solo internos; imágenes del origen comprobadas, pull=never, montajes Storage propios y templates del proyecto en solo lectura. PG/Auth/Storage/gateway/capturador con nombres y recursos separados. Puertos de prueba54421/54422/54424/54425 y API3001 exclusivamente127.0.0.1; no frontend conectado antes de controles. Backups no se modifican. Configuración, claves y logs privados/ignorados.

Antes de servir API: reaplicar ledger del objeto posterior mediante los casos B09 y Storage real del destino; impedir lectura mientras pendiente y confirmar ausencia. Revocar sesiones/capacidades Marleva restauradas y sesiones/refresh del proveedor en destino; generar claves JWT/API distintas para el proveedor/gateway. Probar rechazo de credenciales antiguas con control positivo en origen, sin invalidar origen. Mantener IDs/cuentas/factores y objetos conservados; registrar las diferencias esperadas. Identidades normales A/B con sesión nueva de proveedor para probar permisos reales de API/Storage. No adoptar estrategia Google ni reconstruir Auth.

La fase no acredita recuperación administrativa MFA, interfaz/Safari/nativos, repetibilidad completa, interrupción de migración, cola de correo ni performance113. En esa fase histórica SMTP seguía fijado a 54325 y la cola no se ensayó. El incremento 113-F posterior permite 54425 y comprueba el capturador del destino; no atribuirlo al ensayo anterior. Puertas de acceso y tareas restantes continúan explícitas.

Rotación del destino: CLI Supabase2.120.0 genera nueva clave ES256; JWTSecret/clave simétrica y claves API también distintos, JWK privado solo en Auth y JWKS compatible en Storage. Se conserva cualquier configuración de cifrado de datos del proveedor; no confundirla con firma JWT. [Guía oficial de claves self-hosted](https://supabase.com/docs/guides/self-hosting/self-hosted-auth-keys) distingue API keys, claves de sesión ES256 y compatibilidad HS256: rotar solo API keys no revoca las sesiones. Reemplazar las claves antiguas del gateway y de verificación del destino, sin modificar origen. Supabase sigue emitiendo tokens de usuario; helper solo prepara claves de configuración del proveedor local desechable.

Corrección del arranque comprobada: gateway guarda YAML activo fuera de Cmd; copiarlo con claves reemplazadas, certificado nuevo y dueño kong UID100/GID65533, sin atributos macOS al transportar. Roles reservados se rotan solo con supabase_admin del destino; postgres no es superusuario en este bundle. Auth/gateway responden200 dentro de la red internal, pero localhost54421 rechaza conexión. Para el enlace del harness se añade una segunda red exclusiva del destino con publicación por defecto127.0.0.1 y masquerade desactivado; únicamente PG/gateway/capturador se conectan a ella. Auth/Storage permanecen solo en internal; no se conecta ninguna red del origen ni se abre la API antes de controles. [Docker, redes](https://docs.docker.com/engine/network/) describe separación de servicios internos y acceso mediante otra red; la configuración efectiva se comprobará, sin afirmar aislamiento solo por nombres.

Resultado fase proveedor14-10: recovery-provider.json pasó once controles/ramas con dos titulares: borrado posterior reaplicado, intención conservada con Storage caído, ausencia confirmada tras reinicio, JWT/refresh del origen y sesiones/capacidades Marleva restauradas rechazados, JWKS sin material privado, OTP nuevo por API/capturador del destino manteniendo IDs y archivos propios, B/público denegados. Origen permaneció válido en control positivo. dueAt adelantado únicamente para el trabajo ficticio identificado. Reparación excepcional documentada en recovery-metadata-repair.json; copia nueva no acreditada. Helper de atributos probado en volumen desechable con contenido y dos atributos conservados, eliminado al terminar; recovery-xattrs.json.23 unitarias pasaron, lint del incremento pasó. MFA/cola/migración/cliente/repetibilidad/PF113 todavía pendientes. API de ensayo se cerró al finalizar; proveedor del destino y origen continúan activos localmente.

Repetición14-10 completada: recovery-copy-with-attributes.json,18.399s total y6.971s tramo PG/copia, no RTO. Nuevo destino1792005044662:1978 archivos PG,2 objetos vivos/2048bytes, filas/digests/relaciones idénticos y atributos binarios iguales origen→backup→trabajo. Origen reanudado y PG del nuevo destino detenido, sin puertos. Baseline/proveedor anterior1791995970112 conservados por separado; la fase API del anterior no acredita API del nuevo. No B12 completa ni PF113.

113-H parcial14-10 pasó: migración SQL ficticia con BEGIN/COMMIT explícitos interrumpida después de DDL/DML mediante pg_terminate_backend de su sesión identificada. Tabla/fila nuevas revertidas, aviso previo intacto; misma candidata reaplicada y validada. PG desechable sin red/puertos eliminado con su volumen; cuatro migraciones originales conservan SHA256 y origen ready200 antes/después. recovery-migration.json. No acredita runner Prisma, migraciones no transaccionales ni crash del servidor; sin nueva lógica de aplicación y sin PF113.

## Plan 113-F: cola restaurada y correo aislado del destino

14-10-2026, antes del código. UC013/SEQ013:S070–S072 y UC008/SEQ008:S030–S060. Configuración permite únicamente SMTP 127.0.0.1 en puertos 54325 (origen) o 54425 (capturador del destino); no acepta proveedor externo. Unitarias prueban ambos destinos y rechazo de host/puerto ajenos.

Ensayo separado con PG17 por imagen fijada y dos bases ficticias propias: sembrar cuenta/cambio completado/aviso/outbox, obtener pg_dump consistente y restaurarlo en la segunda base vacía. Probar cola pending, sending con lease vencida y mensaje caducado; caída/reinicio del capturador del destino y nuevos procesos de entrega. Cotejar que cuenta/cambio/aviso conservan IDs/valores y no repiten negocio. Captura real en destino; ningún mensaje en capturador del origen. Prueba de envío aceptado antes del ACK documenta posible repetición de correo, sin promesa exactly-once. Detener el capturador solo durante este ensayo y restaurarlo en finally; conservar dump privado ignorado. Acta por rama y duración/dataset, sin sustituir restauración integral Auth/Storage, UI o MFA por este caso. No cambia pantallas, consultas del negocio ni contratos públicos; rendimiento proporcional es la duración de esta cola mínima, no capacidad productiva.

## Plan UC014: prueba del proveedor para recuperación de operador

14-10-2026, antes del ensayo. SEQ014:S040/S060/S070/S115/S118/S130. En el proveedor del destino ya aislado, preparar únicamente dos operadores ficticios nuevos y variantes del revisor sin permiso. Comprobar rechazo de revisión propia, actor sin permiso, AAL1 y autenticación vieja antes de borrar factores. La prueba del SDK necesita separar un permiso administrativo actual de la bandera operator: el adaptador de permisos será un puerto y la prueba no acreditará la tabla/gestión de roles runtime.

Después de revisión distinta/AAL2/reciente, revocar sesiones Marleva del titular y refresh del proveedor, borrar el factor perdido por su ID estable y cotejar ausencia. Nuevo OTP real del capturador del destino conserva cuenta; AAL1 no opera; nuevo TOTP verificado permite operar. Revocar permiso vuelve a denegar aunque JWT siga vivo. Secretos y credenciales solo privados o en memoria; acta pública sin ellos. Este ensayo cierra una dependencia del proveedor, no las siete operaciones HTTP, idempotencia, cola durable, capacidad limitada, interfaz ni recuperación administrativa completa. Antes de esos endpoints resolver persistencia/repetición de respuestas privadas e incertidumbre de enrolamiento en contrato/modelo; no generar migración apresurada ni acreditar UC014 por el SDK.

## Resultado del incremento 14-10: cola y proveedor del operador

MAR-M1-IT-BE-113-F pasó: pg_dump/restauración conservó exactamente tres trabajos, cuenta, cambio completado y aviso. Reinicio PG y procesos nuevos de entrega conservaron la cola; SMTP caído dejó dos trabajos pendientes, el caducado falló sin envío. Reintento respetó los backoffs de 1 y 5 minutos mediante reloj explícito; dos mensajes llegaron únicamente al destino, segunda ejecución no repitió entrega ni transición del negocio. Duración 5484 ms del ensayo mínimo, no RTO ni capacidad productiva. Acta recovery-outbox.json.

Fallos del harness corregidos: espera debía comprobar servidor TCP definitivo, reinicio reasignó el puerto aleatorio de Docker y el trabajo sending ya intentado requería backoff de 5 minutos. Último fallo público en recovery-outbox-failure.json; logs de cada intento en carpetas privadas distintas. Regresión outbox: cinco casos pasaron, incluido envío aceptado antes de ACK persistido, con posible repetición de correo expresamente conservada.

MAR-M1-IT-BE-114-PROVIDER pasó en el proveedor del destino histórico: rechazo de autorrevisión/permiso ausente/AAL1/autenticación vieja, revocación Marleva y refresh del proveedor, ausencia comprobada del factor perdido, OTP real conserva cuenta, TOTP nuevo habilita operación y revocar permiso vuelve a denegar con JWT vivo. Puerto de permiso administrativo usa fixture explícito; no acredita RoleAssignment runtime. Acta recovery-operator-provider.json. No abrió endpoints de recuperación ni modificó el origen. Los dos operadores ficticios del ensayo quedaron suspendidos sin factores/permiso y con sesiones revocadas.

Siguiente dependencia de UC014: persistencia de roles/proceso y siete operaciones, conciliación durable, capacidad de 10 minutos, idempotencia de respuestas privadas y enrolamiento con resultado incierto. El modelo actual tiene hash de capacidad, pero no almacén de respuestas idempotentes; antes de implementar debe especificar cómo repetir la respuesta sin guardar secretos en claro. No usar el puerto de permisos ficticio en runtime. Las pantallas requieren propuesta/revisión visual previa. B12/M1 no completos; Google permanece pendiente.
