# B12: ensayo de recuperación de base/M1

Fecha: 14-10-2026 America/Merida. Historial por Git, MAR-CHAT-005. Procedimiento objetivo con primera fase parcial ejecutada; B12 no completa. Lectura obligatoria para UC013 junto a [matriz M1](MATRIZ_CASOS_M1.md), [protocolo](PROCESO_DESARROLLO_MARLEVA.md), 02 §16.4, SEQ013 y contratos B09/recuperación MFA.

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

Plan previo al código: reutilizar solo el destino identificado en recovery-copy.json y su volumen de trabajo, con el PG anterior detenido. Nueva red internal y aliases solo internos; imágenes del origen comprobadas, pull=never, montajes Storage propios y templates del proyecto en solo lectura. PG/Auth/Storage/gateway/capturador con nombres y recursos separados. Puertos de prueba54421/54422/54424/54425 y API3001 exclusivamente127.0.0.1; no frontend conectado antes de controles. Backups no se modifican. Configuración, claves y logs privados/ignorados.

Antes de servir API: reaplicar ledger del objeto posterior mediante los casos B09 y Storage real del destino; impedir lectura mientras pendiente y confirmar ausencia. Revocar sesiones/capacidades Marleva restauradas y sesiones/refresh del proveedor en destino; generar claves JWT/API distintas para el proveedor/gateway. Probar rechazo de credenciales antiguas con control positivo en origen, sin invalidar origen. Mantener IDs/cuentas/factores y objetos conservados; registrar las diferencias esperadas. Identidades normales A/B con sesión nueva de proveedor para probar permisos reales de API/Storage. No adoptar estrategia Google ni reconstruir Auth.

La fase no acredita recuperación administrativa MFA, interfaz/Safari/nativos, repetibilidad completa, interrupción de migración, cola de correo ni performance113. No reutilizar SMTP del origen para afirmar recuperación de la cola en destino: el config actual de Marleva fija54325; esa dependencia requiere ajuste documentado/pruebas antes de113-F. Puertas de acceso y tareas restantes continúan explícitas.
