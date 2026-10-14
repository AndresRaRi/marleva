# B12: ensayo de recuperación de base/M1

Versión 0.1. Fecha: 13-10-2026 America/Merida. MAR-CHAT-004. Procedimiento objetivo; ensayo no ejecutado. Lectura obligatoria para UC013 junto a [matriz M1](MATRIZ_CASOS_M1.md), [protocolo](PROCESO_DESARROLLO_MARLEVA.md), 02 §16.4, SEQ013 y contratos B09/recuperación MFA.

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
