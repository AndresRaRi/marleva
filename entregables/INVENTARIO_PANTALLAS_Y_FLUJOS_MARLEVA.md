# Marleva: inventario de pantallas y flujos

Fecha de revisión: 15 de octubre de 2026, America/Merida. Fotografía documental del árbol local; no es aprobación de diseño ni certificación de funcionamiento. Motivo: reunir lo existente por módulo y rol sin cambiar código, decisiones o fuentes compartidas.

## 1. Resultado y límites

Hay una ruta de producto implementada, `/`, en `apps/client/app/index.tsx`. Reúne cinco vistas/secciones identificadas previamente como MAR-M1-UI-001–005. Acceso y código son estados de UI-001; cuenta, cambio, operador y avisos comparten la misma página. No son cinco rutas independientes.

M1 tiene código y pruebas parciales. M2–M10 tienen diseño funcional en 02, pero no pantallas implementadas en el árbol inspeccionado. El soporte de avisos, archivos y operador de M1 no acredita M9, M2 o M8 completos. El simulador no acredita M6.

La recuperación administrativa de varios factores (MFA) ya tiene siete operaciones backend y evidencia HTTP. No tiene pantalla en el cliente actual. La API de avisos pagina; el cliente descarta `next_cursor` y muestra solo la primera página. Ninguna vista se considera visualmente aceptada por existir una captura.

### Ficha de esta continuación

| Campo | Comprobación |
|---|---|
| Identificación | CONTINUACIÓN de «Documentación de pantallas y flujos», referencia técnica `6ad104ec-c61c-83e8-a0b5-0a598fe9fb96`. Sin asignar un nuevo MAR-CHAT ni apropiarse del chat de implementación |
| Objetivo | Inventario con diseño, implementación, evidencia de pruebas, pendientes y discrepancias |
| Alcance | Lectura estática; único archivo nuevo: este inventario |
| Exclusiones | Código, correcciones compartidas, commits, pull/push, servicios, pruebas nuevas, contactos y publicación |
| Lectura | 00–03 editables completos; AGENTS raíz/código, protocolo y matriz completos; código de interfaz y 14 secuencias completos. Lectura general del proyecto parcial, detallada en anexo |
| Condición del encargo | Inventario entregado y contrastado con evidencia disponible; faltantes y diferencias expresos |
| Continuidad | Mantener MAR-CHAT-004 sin acción de cierre en esta revisión; discrepancia documental D01 sin resolver |

No se ejecutó `git pull`: puede cambiar el árbol que otro chat está usando. Tampoco se ejecutaron suites que detienen Auth, Storage o correo. La instrucción específica de solo lectura y no interferencia prevalece sobre los procedimientos generales de sincronización y actualización de 01. No se consultaron ni enviaron mensajes a otros chats; no se garantiza ausencia de trabajo concurrente fuera del árbol observado.

## 2. Acceso, procedencia y lectura

Raíz real: `/Users/andresramos/.codex/.chatgpt-projects/g-p-6ac952169b2081918f82b73968bd9d1a`. Código: `marleva-local/repositorio/`. Git está en la raíz, no dentro de esa carpeta.

Rama observada: `codex/feat-ci-pipeline`; HEAD `9cdde722bfbf7a28b6eb31622c65ecb098af8467`; seguimiento `origin/codex/feat-ci-pipeline`; origin `https://github.com/AndresRaRi/marleva.git`. Esto comprueba configuración local, no igualdad actual con GitHub. Estado previo: AGENTS raíz y sources/01, 02 y 03 ya aparecían modificados; son cambios preexistentes y no se incorporan a esta entrega.

| Ubicación | Fecha/versión declarada | Uso y lectura |
|---|---|---|
| [00 editable](fuentes_finales/00_GUIA_PRINCIPAL_MARLEVA.md) | 15-10-2026; sin versión manual | Reglas locales vigentes; completa |
| [01 editable](fuentes_finales/01_ESTADO_Y_DECISIONES_MARLEVA.md) | 15-10-2026 | Estado local más reciente; completa; discrepancia sobre 004 registrada |
| [02 editable](fuentes_finales/02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md) | 14-10-2026 | Alcance/diseño; completa |
| [03 editable](fuentes_finales/03_REFERENTES_Y_EVIDENCIA_MARLEVA.md) | 14-10-2026 | Evidencia y antecedentes; completa. No se volvieron a validar sus enlaces externos |
| sources/00–03 | 00 v1.0; 01 v1.23; 02 v1.18; 03 v1.17, según cabeceras | Espejos de solo lectura. 00/03 completas; 01/02 lectura parcial conservadora por salidas recortadas; no se consideran el estado técnico más reciente |
| AGENTS raíz / código | Instrucciones recibidas / reglas 15-10 | Completas; preservadas |
| [Protocolo](../marleva-local/repositorio/docs/proceso/PROCESO_DESARROLLO_MARLEVA.md) | Cabecera 13-10, con agregados posteriores | Completo; contiene antecedentes que no deben confundirse con estado actual |
| [Matriz M1](../marleva-local/repositorio/docs/proceso/MATRIZ_CASOS_M1.md) | v1.4, con planes/resultados hasta 14-10 | Completa; no todos los casos previstos tienen resultado |
| [Avance](../marleva-local/repositorio/docs/avance.md) | 15-10 | Completo; única fuente de porcentajes. Este inventario no recalcula avance |
| Resto del árbol | Identidad por ruta, fecha, tamaño y hash en anexo | Lectura general parcial; no se presenta como auditoría integral |

Fuentes operativas locales: las copias editables están señaladas por README y AGENTS del código y tienen contenido posterior a sources. Se contrastan ambos conjuntos, sin declarar sustitución o subida a Fuentes. Fecha del archivo y fecha de consulta histórica son conceptos distintos.

Faltantes o fuera de comprobación: originales de enfoque/arquitectura/informe, investigación comercial/geoespacial y ejemplos DBML/YAML mencionados en 01; historial íntegro del chat referido y demás chats; estado remoto actual; base viva; pruebas nuevas de Safari, iOS y equipos físicos; aceptación visual del usuario. La vista previa del chat referido sirve como antecedente acotado, no como historial completo. Nada de ello se reconstruyó.

## 3. Cómo interpretar estados y evidencias

- **Diseñado funcionalmente:** reglas y recorrido descritos. No significa maqueta, ruta, componentes ni revisión visual terminados.
- **Implementado:** existe código enlazado. Se separa cliente de servidor y se indica si es parcial.
- **Probado parcialmente:** un acta previa registra el caso concreto. Esta revisión no lo vuelve a ejecutar ni acredita todo el código actual con una corrida anterior.
- **Pendiente:** falta diseño detallado, implementación, prueba, plataforma o aceptación identificada.
- **No encontrado:** no apareció en el árbol propio inventariado; no prueba ausencia en equipos o ramas no consultados.

API significa interfaz del servidor; UC, caso de uso; SEQ, secuencia; UI, interfaz; UT/IT/PF, pruebas unitarias/de integración/de rendimiento. En la tabla técnica se abrevia el prefijo común MAR-M1: UC001 = MAR-M1-UC-001; API001 = MAR_M1_API_001; UI001 = MAR-M1-UI-001. Los IDs existentes se conservan. Los nombres de grupos futuros no crean IDs oficiales.

| Ref. | Evidencia local y límite |
|---|---|
| E1 | [Cliente completo](../marleva-local/repositorio/apps/client/app/index.tsx), [rutas](../marleva-local/repositorio/apps/client/app/_layout.tsx), [transporte](../marleva-local/repositorio/apps/client/src/api.ts), [mensajes](../marleva-local/repositorio/apps/client/src/status-messages.tsx). Lectura completa |
| E2 | [Secuencias y cinco IDs UI existentes](../marleva-local/repositorio/docs/diagramas/secuencia/M1/README.md). Los 14 .mmd se leyeron completos; el README conserva estados antiguos |
| E3 | [Instructivo M1](../marleva-local/repositorio/docs/revision/M1/INSTRUCTIVO_M1.md). Completo. Inspección visual directa de capturas web acceso/cuenta y Android cuenta; las demás imágenes solo inventariadas |
| E4 | [Resultado Chrome](../marleva-local/repositorio/tests/results/web-test.json), 15-10, Chrome 155.0.8059.40, 390×844; OTP/cuenta/cookie/almacenamiento/foco/salida. [Runner leído](../marleva-local/repositorio/tests/integration/frontend/M1/web-test.mjs) incluye código incorrecto y axe en tres estados; el JSON web-test no contiene el detalle axe |
| E5 | [Resultado Android](../marleva-local/repositorio/tests/results/android-test.json) y [alcance del ensayo](../marleva-local/repositorio/tests/results/otp-android-increment.md), 14-10. Emulador API36, APK debug, 1080×1920 efectivo; no físico/iOS/320×640 ni cambio/MFA completos |
| E6 | [Regresión API](../marleva-local/repositorio/tests/results/quality-api-regression.json), 12 casos pasados. Se leyeron títulos/resultados; el runner backend se leyó parcialmente. No prueba de todas las ramas actuales |
| E7 | [Avisos](../marleva-local/repositorio/tests/results/notices-increment.json), 13-10: cursor/cola/SMTP, migración, unitarias, integración y mediciones. Backend; no paginación cliente |
| E8 | [Archivos B09](../marleva-local/repositorio/tests/results/files-increment.json), 13-10: acceso privado/lectura/borrado y medición proporcional. Sin interfaz ni expediente M2 |
| E9 | [Recuperación HTTP](../marleva-local/repositorio/tests/results/recovery-api.json) y [esquema/roles](../marleva-local/repositorio/tests/results/recovery-schema.json), 14-10: siete operaciones backend, actores ficticios; sin interfaz/plataformas |
| E10 | [Cola restaurada](../marleva-local/repositorio/tests/results/recovery-outbox.json), 14-10: ensayo aislado parcial; no restauración integral Auth/Storage/MFA/cliente |
| E11 | [Unitarias previas](../marleva-local/repositorio/tests/results/quality-unit.json): 25 pasadas, incluidos transporte, mensajes y simulador. Resultados leídos; no es el total vigente ni aceptación de pantallas |
| E12 | [Contrato canónico](../marleva-local/repositorio/docs/apis/M1/openapi.yaml), [JSON derivado](../marleva-local/repositorio/packages/contracts/openapi.json), [README API](../marleva-local/repositorio/docs/apis/M1/README.md). 24 operaciones en JSON v0.5.0; extracción de rutas/IDs/metadatos, lectura YAML parcial; no auditoría completa de esquemas/respuestas |
| E13 | [Datos físicos](../marleva-local/repositorio/docs/modelado-datos/dbml/MAR-M1-DATA-001.dbml) y [explicación físico/objetivo](../marleva-local/repositorio/docs/modelado-datos/README.md), completos. 13 tablas de negocio; no comparación con DB viva en esta revisión |

## 4. Pantallas actuales de M1 por rol

Todas están en E1, ruta `/`. La ubicación es una condición o sección del mismo componente. Diseño visual y aceptación siguen pendientes según 00 §8 y 01 MAR-TODO-UI-001.

| ID existente / rol | Vista, acciones y navegación real | Diseñado | Implementado | Probado | Pendiente |
|---|---|---|---|---|---|
| UI001 / persona sin sesión | Acceso: correo → recibir código → campo de seis cifras → verificar → cuenta. Reenvío con espera; ayuda de buzón en texto | Funcional, 02 §4/12 y SEQ001/002/009 | Sí; `!account`, con `challenge` como subestado | E4; E5; API E6; parcial | Recorridos restantes, conservar destino real, revisión visual, Safari/iOS/físicos |
| UI001 / misma persona | Código incorrecto/vencido y espera: corregir/reintentar en el mismo estado | Funcional; cinco fallos/pausa en servidor | Error/carga/éxito y cuenta atrás; reintento manual | Error E4/runner y E5; límites API E6 | Esperas comunicadas por servidor frente a temporizador local; restauración de estado tras recarga no acreditada |
| UI002 / titular autenticado | Correo y restricción de comprar/ofrecer; actualizar cuenta; cerrar sesión actual o todas → acceso | Funcional, SEQ003/004 | Sí; rama `account` | E4/E5 salida actual; API E6 actual/total/CSRF/caducidad | Salida total en dos dispositivos, todas las ramas/plataformas y revisión |
| UI003 / titular autenticado | Nuevo correo → iniciar cambio → identificar buzón/código → confirmar el otro → acceso con correo nuevo | Funcional, SEQ005/006 | Sí; estado `change`, misma ruta | API ambos buzones/ID/revocación E6; captura solo muestra sección | Recorrido completo UI, nativo, caducidad/reanudación y pérdida de respuesta |
| UI004 / operador ficticio | Preparar factor → URI del autenticador → factor/código → verificar → comprobar permiso | Funcional, SEQ007 | Sí; solo `account.operador` | API rol/AAL/revocación E6; no E2E visual completo | Revisión visual, capturas seguras, limpieza de secretos y casos/plataformas completos |
| UI005 / titular autenticado | Avisos de cuenta; vacío o textos. Se carga al entrar y al actualizar cuenta | Funcional, SEQ008 | Parcial cliente; backend con cursor | Backend E7; cuenta básica E4/E5 no prueba lista paginada | Siguiente página, error propio/recarga, uso/accesibilidad completos |
| Sin ID UI asignado / operador titular y otro administrador | Recuperación MFA: solicitar/consultar/revisar/reenrolar | Proceso detallado, SEQ014 y contrato | Backend sí; cliente no | E9 backend | Diseñar/revisar interfaz, asignar ID en trabajo autorizado y probar plataformas |
| Sin pantalla / soporte técnico | Salud, archivo ficticio, simulador, restauración | Casos SEQ010–013 | Backend/herramientas, parcial según caso | E6/E8/E10/E11; límites por caso | No inventar pantallas de negocio para cubrir herramientas técnicas |

Un titular puede ser comprador y oferente en la misma cuenta; M1 todavía no implementa esas funciones. El bloque operador comprueba acceso básico y no es la cola de M8.

## 5. Inventario funcional de M2–M10 por rol

Para **cada fila**: diseñado funcionalmente en las secciones indicadas de 02; diseño visual, rutas, componentes y estados detallados de pantalla pendientes; implementación de pantalla no encontrada; pruebas de esa pantalla no encontradas. No se proponen nuevas capacidades ni una cantidad final de pantallas: varios grupos pueden compartir vista cuando se diseñen. M2–M10 no se implementan en este encargo.

| Módulo / rol | Grupo de pantalla documentado y flujo | Estados/errores ya exigidos | Fuente 02 |
|---|---|---|---|
| M2 / titular | Expediente privado: borrador → enviar → consultar decisión → corregir/reconsiderar mismo expediente | Pendiente, corrección, rechazo, suspensión, archivo por inactividad; evidencia ilegible/antigua/vínculo insuficiente | §3/5/12 |
| M2 / vecino que ofrece | Perfil comercial y datos contractuales privados; cobertura/modalidades → envío → habilitación | Alta incompleta, corrección, rechazo, pausa/suspensión; alta financiera separada | §5/12 |
| M2/M8 / revisor | Expediente/versiones/evidencia → aprobar/pedir corrección/rechazar | Conflicto por versión, autorrevisión prohibida, MFA vencido | §3/5/12 |
| M3 / público | Explorar: búsqueda/filtros → lista → oferta → perfil público | Carga, vacío, sin resultados, retirada/pausada; solo proyección pública | §6/12 |
| M3 / oferente habilitado | Mis ofertas: crear/editar versión/fotos/disponibilidad → revisión → pausar | Borrador, pendiente, corrección, rechazada, publicada, suspendida | §6/12 |
| M3/M8 / revisor de contenido | Revisar versión/reportes → decidir publicación o medida | Giro dudoso, riesgo, versión antigua, conflicto propio | §3/6/12 |
| M4 / comprador aprobado | Selección de productos → resumen privado/entrega/total → enviar → lista/detalle de pedido | Precio cambiado, stock insuficiente, fuera de cobertura, envío incierto, vencimiento | §7/8/11/12 |
| M4 / oferente | Pedido pendiente → aceptar íntegro o rechazar con motivo → atención | Disponibilidad/capacidad, respuesta tardía; sin sustitución ni aceptación parcial | §7/8/12 |
| M5 / comprador | Solicitud de servicio → aclaraciones → cotización → aceptar/rechazar/retirar | Datos faltantes, vencida, sustituida, aceptación concurrente | §7/12 |
| M5 / oferente | Solicitud recibida → aclarar → cotización versionada con trabajo/total/ventana | Una vigente, reemplazo, retiro, plazos; pedido único al aceptar | §7/12 |
| M6 / comprador | Pedido aceptado → pago online → consultar resultado; efectivo declarado → confirmar/disputar | Verificando/incierto/fallido, retorno interrumpido, cobro tardío; no cobrar de nuevo por duda | §9/12 |
| M6 / oferente | Estado financiero/alta con proveedor; declarar efectivo; consultar corte/partidas → pago o disputa | Alta incompleta, exigible/disputado, deuda vencida/pausa solo nuevos pedidos efectivo | §5/9/12 |
| M6 / finanzas | Conciliación → verificar referencias/devoluciones/corte → decisión registrada | Duplicado, saldo insuficiente, devolución pendiente/fallida, reverso por conceptos | §3/9/12 |
| M7 / oferente | Detalle/timeline: preparar o programar → listo/en camino/en atención → declarar realizado | Pago habilitante, ventana, cancelación, ausencia; listo no completa | §8/12 |
| M7 / comprador | Seguimiento → código privado de producto o confirmación de servicio; confirmar efectivo por separado | Código inválido/usado, sin conexión, discrepancia, falta de respuesta → revisión | §8/12 |
| M8 / participante | Ayuda/incidencia ligada a pedido → motivo/pretensión/evidencia → resolución/reconsideración | Información requerida, devolución pendiente/fallida; suspensión conserva obligaciones | §8/12 |
| M8 / cuenta que reporta | Reporte de oferta → estado y respuesta mínima | Contenido/evidencia pertinentes; privacidad de terceros | §6/11 |
| M8 / operador | Cola → caso/versiones → resolver sin conflicto y con motivo/importes | Conflicto/MFA/reautenticación; nunca cierre por silencio ni editar historial | §3/8/12 |
| M8 / administrador | Permisos/restricciones/bloqueos según rol | No autoasignación, no resolución propia; auditado | §3/11/12 |
| M9 / titular | Avisos operativos → consultar estado del recurso de origen | Vacío/error, correo caído, reintento sin repetir negocio | §12; soporte limitado existente en M1 |
| M9 / operador | Estado de fallos de entrega para atención operativa | Agotado tras 24h, referencia/lease/reintentos | §12; detalle de pantalla/contrato operativo pendiente |
| M10 / operación autorizada | Resumen por periodo → exportación; registro de costos | Sin datos, error, filtros/CSV seguro; venta, comisión, cobrado y contribución separados | §9/11/12 |

Dependencias documentadas, no nuevas rutas implementadas: explorar → oferta → autenticar si corresponde → pertenencia vigente → resumen/pedido o solicitud/cotización → aceptación → pago → atención → confirmación o incidencia → restitución/cierre. Ofrecer: acceso → pertenencia → perfil comercial → oferta/revisión → publicación. Comisiones y métricas derivan de operaciones registradas, no de clics.

## 6. Trazabilidad M1: UC → SEQ:paso → API → datos → UI → prueba

Las relaciones con datos son contraste estático del modelo y controllers, no consulta a DB viva. Las actas acreditan solo sus casos y fechas. Los IDs de pruebas se leen con prefijo MAR-M1-. Una extensión de prueba diseñada en la matriz no se acredita por compartir el número de un resultado antiguo.

| UC / secuencia y pasos | API y datos | UI / implementación observada | Evidencia y brecha |
|---|---|---|---|
| UC001 / SEQ001:S010–S100 | API001 POST `/v1/auth/challenges`; Challenge, Auth | UI001; correo/solicitud/espera | E4/E5/E6 IT-BE-003/004; UT101-H y cuota en E5. UI fija 60s; no consume Retry-After |
| UC002 / SEQ002:S020–S110 | API002 POST `/v1/auth/verifications`; Challenge, Account, Session, Audit | UI001 → UI002 | E4/E5; IT-BE-002 concurrente E6; UT-FE-003 E11. S110 retorno a acción original no completo |
| UC003 / SEQ003:S010–S090 | API003 GET `/v1/me`, API004 GET `/v1/auth/csrf`; Session, Account, Auth | UI002; inicio y actualizar; transporte cookie/SecureStore | IT-BE-006 E6; UT-FE-001/002/006 E11; E4/E5. Renovación completa no acreditada por actualizar |
| UC004 / SEQ004:S010–S070 | API005/006 DELETE sesión actual/todas; Session, Audit | UI002 → UI001 | IT-BE-005/006 E6; salida E4/E5. Dos dispositivos/plataformas pendientes |
| UC005 / SEQ005:S010–S090 | API007 POST cambio; EmailChange, Account, Auth | UI003 iniciar | E6 cambio en prueba IT-BE-010; captura no recorrido. Negativos/recorridos restantes |
| UC006 / SEQ006:S010–S100 | API008 POST confirmaciones; EmailChange, Account, Session, Notice, Outbox, Audit | UI003 → UI001 tras ambos buzones | IT-BE-010 E6. Pérdida de respuesta/reanudación de UI no acreditada |
| UC007 / SEQ007:S010–S100 | API010/011 POST factor, API012 GET operador; Auth, Session, Audit, RoleAssignment | UI004 condicional | IT-BE-007/011 E6. S100 aún dice recuperación pendiente, mientras UC014 ya tiene backend |
| UC008 / SEQ008:S010–S100 | API009 GET avisos + worker; Notice, Outbox | UI005 solo `.items`; no siguiente cursor | E7/IT108-A E6; API con cursor, cadena hasta UI/prueba paginada incompleta |
| UC009 / SEQ009:S010–S050 | Reutiliza API001/002/003; Account, Session, borrador de acción todavía sin integración | Texto UI001 y `pending='cuenta'` | Sin prueba de retorno completo. Política C15 presente; no transferencia por domicilio |
| UC010 / SEQ010:S010–S070, S012/014/016 | API013/014 GET `/health/live`, `/health/ready`; PG/Auth/Storage/correo | Sin pantalla salud dedicada; E1 mensajes de red/servidor | IT-BE-001 E6; UT-FE-004/005 E11. Lectores/plataformas/caídas completas pendientes |
| UC011 / SEQ011:S010–S140 | API022 POST `/v1/local/file-fixtures/{id}/access`, API023 GET `.../content`, API024 DELETE `.../{id}`; PrivateFixture, FixtureAccess, FixtureDeletion, Session | Sin UI; controller/casos backend | E8; UT111-A/B E11. Vínculo UC/SEQ reconstruido desde contrato explicado/SEQ, ausente como metadato x en operaciones B09 del JSON |
| UC012 / SEQ012:S010–S070 | Sin endpoint de negocio; PaymentSimulator, estado en memoria de fixture | Sin UI; harness de pruebas | UT-BE-001 E11; IT-BE-009 E6. No pedido/pasarela/ventas M6 |
| UC013 / SEQ013:S001–S080 | Herramientas B12; PG/Auth/Storage/roles/sesiones/cola/ledger de borrado | Sin UI de producto; restauración técnica | E10 y matriz registran ensayos separados. No acta integral de toda cadena/plataformas |
| UC014 / SEQ014:S010–S140 | API015–021 recuperación; MfaRecovery, RoleAssignment, Session, Audit, Auth | Controller MFA recovery y casos backend; sin UI | E9 HTTP114–121 y migración. Cabecera SEQ/índice aún desactualizados; falta UI/pruebas frontend |

Ubicación de código servidor comprobada: [controller de cuenta/salud](../marleva-local/repositorio/apps/api/src/controller.ts), [avisos](../marleva-local/repositorio/apps/api/src/modules/m1/presentation/controllers/notifications.controller.ts), [B09](../marleva-local/repositorio/apps/api/src/modules/m1/presentation/controllers/private-files.controller.ts), [recuperación](../marleva-local/repositorio/apps/api/src/modules/m1/presentation/controllers/mfa-recovery.controller.ts), leídos completos. AccountService solo búsqueda de métodos; no se declara auditoría completa de su implementación.

Para M2–M10 la cadena disponible es **regla/rol/recorrido de 02 → nombres de API documentales de §11 → entidades conceptuales de §10 → grupos UI de §12 → aceptación futura de §14**. No se encontraron matrices UC/SEQ por módulo, contratos ejecutables específicos, pantallas o pruebas implementadas de esos módulos. En `docs/diagramas/secuencia/` y `docs/apis/` solo existe M1. Las reservas del protocolo no equivalen a archivos presentes. No se asignan IDs UC/SEQ/API/UI nuevos para llenar vacíos.

## 7. Discrepancias y pendientes, sin corrección unilateral

| Ref. | Evidencia contrastada | Consecuencia / tratamiento de esta entrega |
|---|---|---|
| D01 Continuidad | Usuario pide mantener 004 abierto; sources/01 conserva 004 abierto; editable 01 §5 y protocolo registran 004 cerrado en 538c351 y 005 abierto | No cerrar, reabrir ni renumerar chats; registrar diferencia. No modificar 01 ni contradecir el registro diciendo que nunca se cerró |
| D02 Copias de fuentes | sources está en 12–13-10; editables incluyen avance de 14–15-10 | La descripción anterior de 13 secuencias/14 operaciones es histórica: árbol actual tiene 14/24. Subida/sustitución compartida no comprobada |
| D03 Índice de secuencias | README M1 declara UC011/014 como no implementados; SEQ014 dice integración en curso/no ejecución. Controller y E8/E9 acreditan backend posterior | No usar esas etiquetas como único estado. Señalar desfase; no corregir archivos ajenos |
| D04 Matriz acumulativa | Conserva «IDs ≥100 diseñados no ejecutados» y tablas de ocho tablas/roles no aplicados; agregados posteriores y modelo físico registran pruebas/aplicación | Leer cada resultado fechado; no todos los IDs ≥100 siguen pendientes, ni todos están aprobados |
| D05 Avisos | SEQ008/API009 ofrecen cursor; `index.tsx` guarda solo `.items` en entrada/refresh | UI005 parcial. Falta recorrido de siguiente página y errores específicos; ya reconocido en avance/instructivo |
| D06 Retorno de acción | SEQ002:S110/SEQ009:S030 y B05 exigen retomar acción; cliente conserva solo marcador `cuenta` y mensaje | No hay destino/borrador completo comprobado. UC009 permanece incompleto según avance |
| D07 Esperas | API documenta 429/Retry-After real; cliente fija `setWait(60)` tras éxito y transporte no devuelve Retry-After | No se acredita cuenta atrás coherente para todas las cuotas/pausas. No cambiar comportamiento aquí |
| D08 Estado tras recarga | `challenge`, `change`, códigos y `pending` viven en estado React; montaje consulta solo `/me` | Reanudación de desafío/cambio después de recarga/cierre de proceso no demostrada. No confundir conservar paso en error con persistir borrador |
| D09 Diseño visual | 00 §8/01 exigen propuesta y revisión; hay estilos/capturas previos | Diseño actual existe, aceptación pendiente. No crear paleta, botones o pantallas para resolver inventario |
| D10 Datos físicos/objetivo | README datos: 13 tablas ambos, restricciones diferentes; DATA001 aún contiene nota antigua «roles y recuperación pendientes» junto a tablas nuevas | Igual cantidad no prueba equivalencia. EmailChange/Audit y notas requieren revisión técnica futura, sin migrar ni reescribir SQL |
| D11 Traza B09 | API022–024 del JSON derivado carecen de x-use-case-id/x-sequence-id; las otras operaciones principales sí los contienen | Relación UC011 sustentada manualmente en SEQ/contrato explicado; cadena automática incompleta |
| D12 Versiones de estado | 02 §16 inicial menciona cuatro migraciones; §16.7/01/modelo registran cinco. README API conserva párrafo de 17 operaciones/recuperación objetivo junto a cabecera de 24 | Diferencias históricas dentro de documentos. No interpretar fragmentos antiguos como estado actual |
| D13 Alcance de pruebas | Chrome y emulador cubren acceso/cuenta/salida; cambio/MFA/recuperación no tienen E2E cliente completo; Safari/iOS/físicos pendientes | «Backend probado» no se convierte en «pantalla probada». E4 es corrida anterior a esta revisión, sin verificación de su HEAD exacto |
| D14 Privacidad de factor | UI004 muestra URI sensible y la limpia al verificar; no hay estado de recuperación visual revisado ni capturas seguras del recorrido completo | Verificar ciclo de vida/limpieza en futura revisión; no afirmar filtración demostrada ni aceptación por mostrar texto |

## 8. Entrega y continuidad

Única creación: este inventario en `entregables/`, fuera de las fuentes y del código. Relectura final y comprobación de enlaces locales al entregar. No cambios propios a 00–03, README, protocolo, matriz, configuración, rama o código. No commit, push, subida a Fuentes ni publicación. No hay archivos de 00–03 ni configuración para reemplazar como resultado de este encargo.

El inventario cubre los grupos documentados de los diez módulos y la interfaz actual, con trazabilidad M1. La lectura general del árbol sigue parcial. La revisión visual integral, el diseño detallado futuro, las discrepancias y la aceptación de módulos quedan pendientes; no se resolvieron como parte de esta entrega.

Siguiente paso propuesto: revisar D01–D14 con quien mantiene la documentación y el trabajo de implementación; después preparar la propuesta visual de M1 desde las secuencias vigentes. No implementar ni ampliar módulos por esa propuesta. MAR-CHAT-004 no se cierra desde esta revisión; tampoco se solicita crear otro chat.

Prompt de continuidad revisado para copiar:

```text
Proyecto Marleva. Continuar la revisión de pantallas y flujos desde entregables/INVENTARIO_PANTALLAS_Y_FLUJOS_MARLEVA.md. Comprobar acceso real y cambios desde su fotografía local; leer instrucciones, README, AGENTS y 00–03 vigentes, protocolo y matriz M1. Conservar C01–C26, autorizaciones y límites. Revisar D01–D14 sin confundir versiones históricas con estado actual. El usuario pidió mantener MAR-CHAT-004 abierto, pero el registro editable declara cierre de 004 y continuidad en 005: no renumerar ni cambiar ese registro sin resolver expresamente la discrepancia. Esta continuación solo autoriza lectura y actualización del inventario, sin código, documentos compartidos, sincronización Git, servicios, pruebas mutantes, mensajes a otros chats, gasto o publicación. Mantener diseñado/implementado/probado/aceptado separado; documentar UC→SEQ:paso→API→datos→UI→prueba y faltantes. Releer la entrega final y declarar ubicación y subida real. Cualquier propuesta visual posterior necesita un encargo específico y revisión antes de implementarse.
```

## Anexo. Inventario desde la raíz y lectura por archivo

El listado siguiente registra los 401 archivos encontrados por el recorrido de archivos no ignorados, incluidos ocultos, antes de crear este entregable. Se identificaron además `.git`, `.DS_Store`, dependencias, `.env`, herramientas, builds, artefactos y cachés ignorados: excluidos de lectura/contenido y de este listado detallado. No se recorrieron secretos ni datos privados. No se afirma lectura de todos los archivos por calcular su hash.

Raíz contiene `.github/`, `.githooks/`, `entregables/`, `marleva-local/`, `sources/` y archivos de configuración. El código comprende apps, packages, docs, tests, scripts, infra y patches. No aparecieron carpetas M2–M10 en secuencias/APIs. El anexo usa rutas relativas a la raíz real de §2.

Lectura C: completa; P: parcial/extracción; V: imagen inspeccionada visualmente; N: solo inventariado, no leído. Vigencia L: fuente/regla local; S: espejo de referencia; T: técnico actual a contrastar; E: acta/captura histórica, alcance y fecha propios; A: auxiliar/tercero, sin validación de vigencia. Hash corto identifica esta fotografía, no una versión aprobada; fecha de modificación es metadato, no prueba de consulta/ejecución. El inventario mismo se identifica por su ruta y fecha; no se lista recursivamente.

| Ruta | Modificación UTC | Bytes | SHA256 inicial (12) | Papel/lectura |
|---|---|---:|---|---|
| .editorconfig | 2026-10-14 | 188 | a6b98ea7cb6d | A/N |
| .githooks/commit-msg | 2026-10-14 | 290 | 1e214ecfc41a | A/N |
| .githooks/pre-commit | 2026-10-14 | 195 | aa73ad0c73f6 | A/N |
| .github/actions/setup/action.yml | 2026-10-15 | 1017 | 8eef44c6bd1b | A/N |
| .github/workflows/ci.yml | 2026-10-15 | 8660 | 4598327fffc5 | A/N |
| .gitignore | 2026-10-15 | 651 | f0e7e11473ee | A/N |
| AGENTS.md | 2026-10-15 | 6203 | 25478cd78f9d | L/C |
| README.md | 2026-10-15 | 5451 | 39e607610e6d | T/C |
| entregables/INSTRUCCIONES_FINALES_PARA_PEGAR.txt | 2026-10-15 | 2740 | 74c25cf1d658 | T/N |
| entregables/fuentes_finales/00_GUIA_PRINCIPAL_MARLEVA.md | 2026-10-15 | 22003 | 082e95687d80 | L/C |
| entregables/fuentes_finales/01_ESTADO_Y_DECISIONES_MARLEVA.md | 2026-10-15 | 21519 | 8576ed532800 | L/C |
| entregables/fuentes_finales/02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md | 2026-10-14 | 80722 | b923dbe4c5fd | L/C |
| entregables/fuentes_finales/03_REFERENTES_Y_EVIDENCIA_MARLEVA.md | 2026-10-14 | 82429 | c2cc04229613 | L/C |
| marleva-local/repositorio/.dependency-cruiser.cjs | 2026-10-14 | 918 | f32b4ceb74cb | T/N |
| marleva-local/repositorio/.dockerignore | 2026-10-15 | 189 | 9e430053120e | T/N |
| marleva-local/repositorio/.env.example | 2026-10-13 | 433 | d1b319115c68 | T/N |
| marleva-local/repositorio/.jscpd.json | 2026-10-14 | 273 | 859d04b9bb39 | T/N |
| marleva-local/repositorio/.node-version | 2026-10-13 | 8 | 73fb1b615e20 | T/N |
| marleva-local/repositorio/.prettierignore | 2026-10-13 | 420 | ada1e0a8721c | T/N |
| marleva-local/repositorio/.prettierrc.json | 2026-10-13 | 127 | 532549ce3102 | T/N |
| marleva-local/repositorio/AGENTS.md | 2026-10-15 | 1619 | eabbf71b6113 | T/C |
| marleva-local/repositorio/README.md | 2026-10-15 | 8447 | e84543032e03 | T/C |
| marleva-local/repositorio/apps/api/bootstrap.mjs | 2026-10-15 | 3684 | 9e8cb458c158 | T/N |
| marleva-local/repositorio/apps/api/package.json | 2026-10-14 | 907 | ca3e38398202 | T/N |
| marleva-local/repositorio/apps/api/prisma.config.ts | 2026-10-14 | 218 | 2d27a526aff8 | T/N |
| marleva-local/repositorio/apps/api/prisma/migrations/202610120001_m1/migration.sql | 2026-10-13 | 0 | e3b0c44298fc | T/N |
| marleva-local/repositorio/apps/api/prisma/migrations/202610120002_m1_tables/migration.sql | 2026-10-13 | 2946 | 407e1e18ae0b | T/N |
| marleva-local/repositorio/apps/api/prisma/migrations/202610130001_notice_cursor/migration.sql | 2026-10-13 | 259 | 837a690a15c9 | T/N |
| marleva-local/repositorio/apps/api/prisma/migrations/202610130002_private_fixtures/migration.sql | 2026-10-13 | 4428 | 66d29d603602 | T/N |
| marleva-local/repositorio/apps/api/prisma/migrations/202610140001_mfa_recovery/migration.sql | 2026-10-14 | 6516 | dc97cffec26b | T/N |
| marleva-local/repositorio/apps/api/prisma/migrations/migration_lock.toml | 2026-10-13 | 24 | 1db17a8d051a | A/N |
| marleva-local/repositorio/apps/api/prisma/schema.prisma | 2026-10-14 | 6500 | fc352b8ffb5b | T/N |
| marleva-local/repositorio/apps/api/seed.mjs | 2026-10-15 | 1167 | ec22bebf41d7 | T/N |
| marleva-local/repositorio/apps/api/src/account.service.ts | 2026-10-14 | 20967 | 2fa65821d9d7 | T/P |
| marleva-local/repositorio/apps/api/src/config.ts | 2026-10-15 | 1779 | 6c0ec564a67c | T/N |
| marleva-local/repositorio/apps/api/src/controller.ts | 2026-10-15 | 4700 | b619a24f08e4 | T/C |
| marleva-local/repositorio/apps/api/src/database.ts | 2026-10-14 | 350 | c46b10a6c26a | T/N |
| marleva-local/repositorio/apps/api/src/http-error-body.ts | 2026-10-15 | 729 | 12e0ea0b978d | T/N |
| marleva-local/repositorio/apps/api/src/http-error.ts | 2026-10-15 | 585 | e717eee460a6 | T/N |
| marleva-local/repositorio/apps/api/src/http-errors.filter.ts | 2026-10-15 | 824 | 50a7099f3d16 | T/N |
| marleva-local/repositorio/apps/api/src/http-policy.ts | 2026-10-15 | 1986 | 1985e30a8574 | T/N |
| marleva-local/repositorio/apps/api/src/identity.ts | 2026-10-14 | 1299 | 35e6f1306d17 | T/N |
| marleva-local/repositorio/apps/api/src/main.ts | 2026-10-15 | 5034 | 5fd817634b75 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/ports/file-repository.ts | 2026-10-14 | 1048 | 526c9b9e0624 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/ports/file-storage.ts | 2026-10-13 | 178 | 2de8bf919e56 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/ports/notice-repository.ts | 2026-10-13 | 314 | acebd585dfe3 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/ports/outbox-repository.ts | 2026-10-13 | 550 | 68b013ec0709 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/ports/recovery-provider.ts | 2026-10-14 | 873 | 7e30f39940b4 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/ports/recovery-repository.ts | 2026-10-14 | 1082 | b0ea8ea2fb08 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/ports/recovery-review.ts | 2026-10-14 | 260 | e93806e355f1 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/authorize-recovery-review.ts | 2026-10-14 | 978 | 278edf38051b | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/delete-private-file.ts | 2026-10-13 | 495 | b73da17d48c8 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/deliver-outbox.ts | 2026-10-13 | 1088 | 0dd7101c96c4 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/enroll-recovery-factor.ts | 2026-10-14 | 2504 | 2b9faeff7ff2 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/issue-file-access.ts | 2026-10-13 | 562 | 9dee92160a23 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/issue-recovery-capability.ts | 2026-10-14 | 1851 | 479249c4002c | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/list-notices.ts | 2026-10-13 | 678 | ffc77bcc2238 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/process-file-deletions.ts | 2026-10-14 | 1076 | afa1e1af616e | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/process-mfa-recoveries.ts | 2026-10-14 | 2905 | 4d99a073c2b5 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/read-mfa-recovery.ts | 2026-10-14 | 1129 | 0063c15628cf | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/read-private-file.ts | 2026-10-13 | 913 | 8c1189af9979 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/recovery-context.ts | 2026-10-14 | 5894 | db7eeaaef587 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/request-mfa-recovery.ts | 2026-10-14 | 3155 | 0c4c46417823 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/review-mfa-recovery.ts | 2026-10-14 | 1865 | 3b93c72ae964 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/application/use-cases/verify-recovery-factor.ts | 2026-10-14 | 3471 | cd43ab010e66 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/domain/entities/mfa-recovery.ts | 2026-10-15 | 1852 | 662c65a456e4 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/domain/file-fault.ts | 2026-10-13 | 311 | a54fc2f87dda | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/domain/file-policy.ts | 2026-10-13 | 760 | f5bd48b3156e | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/domain/notice-cursor.ts | 2026-10-14 | 1788 | 50ab4ccb8c15 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/domain/otp-origin-limit.ts | 2026-10-13 | 349 | 90dff4b782de | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/domain/outbox-policy.ts | 2026-10-13 | 249 | 7ad7a4619d50 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/infrastructure/adapters/local-private-storage.ts | 2026-10-14 | 3432 | 26d928d5fed5 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/infrastructure/adapters/recovery-secrets.ts | 2026-10-14 | 880 | 4a583031e792 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/infrastructure/adapters/smtp-outbox-mailer.ts | 2026-10-13 | 915 | 122be0190157 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/infrastructure/adapters/supabase-recovery-provider.ts | 2026-10-14 | 4466 | 25135f43bef5 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/infrastructure/repositories/prisma-file-repository.ts | 2026-10-13 | 7644 | fb250c0cd58a | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/infrastructure/repositories/prisma-notice-repository.ts | 2026-10-13 | 1113 | 3f11baf9babe | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/infrastructure/repositories/prisma-outbox-repository.ts | 2026-10-13 | 1639 | 6e1d03972ed4 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/infrastructure/repositories/prisma-recovery-repository.ts | 2026-10-14 | 4898 | 2ecae292979c | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/presentation/controllers/mfa-recovery.controller.ts | 2026-10-14 | 4037 | e10cab5e634c | T/C |
| marleva-local/repositorio/apps/api/src/modules/m1/presentation/controllers/notifications.controller.ts | 2026-10-13 | 768 | 42d57101409d | T/C |
| marleva-local/repositorio/apps/api/src/modules/m1/presentation/controllers/private-files.controller.ts | 2026-10-13 | 3672 | 40a950bf4b26 | T/C |
| marleva-local/repositorio/apps/api/src/modules/m1/presentation/dtos/account-request.ts | 2026-10-15 | 490 | 297a48fcba92 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/presentation/dtos/file-request.ts | 2026-10-14 | 883 | a4442ad26acc | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/presentation/dtos/notice-query.ts | 2026-10-14 | 1387 | 7cb1c7359487 | T/N |
| marleva-local/repositorio/apps/api/src/modules/m1/presentation/dtos/recovery-request.ts | 2026-10-14 | 2140 | e07d8f1fdf43 | T/N |
| marleva-local/repositorio/apps/api/src/payment-simulator.ts | 2026-10-14 | 1787 | b3ed4c864959 | T/N |
| marleva-local/repositorio/apps/api/src/rate-limit.exception.ts | 2026-10-13 | 386 | 712ffe0572b1 | T/N |
| marleva-local/repositorio/apps/api/src/security.ts | 2026-10-14 | 2071 | e5e581144f44 | T/N |
| marleva-local/repositorio/apps/api/src/worker.ts | 2026-10-14 | 1771 | 8a40062ae0e9 | T/N |
| marleva-local/repositorio/apps/api/tsconfig.json | 2026-10-14 | 369 | c75ec264e9da | T/N |
| marleva-local/repositorio/apps/client/android/.gitignore | 2026-10-13 | 183 | ed2e83b6a71e | A/N |
| marleva-local/repositorio/apps/client/android/app/build.gradle | 2026-10-13 | 8194 | 8c5d0ae6fe26 | A/N |
| marleva-local/repositorio/apps/client/android/app/proguard-rules.pro | 2026-10-13 | 562 | 8bd4d7b69a1d | A/N |
| marleva-local/repositorio/apps/client/android/app/src/debug/AndroidManifest.xml | 2026-10-13 | 156 | c5ae0c386fa4 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/debug/res/raw/marleva_local_ca.crt | 2026-10-13 | 1375 | 03c0132054c6 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/debug/res/xml/network_security_config.xml | 2026-10-13 | 329 | 0b845ebae544 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/debugOptimized/AndroidManifest.xml | 2026-10-13 | 374 | fb1795032c76 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/AndroidManifest.xml | 2026-10-13 | 2489 | 47d05511cb41 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/java/mx/marleva/local/MainActivity.kt | 2026-10-13 | 2186 | 3238f6dcd551 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/java/mx/marleva/local/MainApplication.kt | 2026-10-13 | 1488 | f9075bc7d25d | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/drawable-hdpi/splashscreen_logo.png | 2026-10-13 | 20754 | 721c895579cb | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/drawable-mdpi/splashscreen_logo.png | 2026-10-13 | 12863 | f84b9b17a4a1 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/drawable-xhdpi/splashscreen_logo.png | 2026-10-13 | 29081 | e1c5250e339a | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/drawable-xxhdpi/splashscreen_logo.png | 2026-10-13 | 47123 | 23d97ccb41a8 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/drawable-xxxhdpi/splashscreen_logo.png | 2026-10-13 | 66529 | be9fac5c4cda | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/drawable/ic_launcher_background.xml | 2026-10-13 | 245 | 51fca95679d0 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/drawable/rn_edit_text_material.xml | 2026-10-13 | 1917 | 738e3aaad531 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/mipmap-hdpi/ic_launcher.webp | 2026-10-13 | 3056 | ded7aabf6a56 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.webp | 2026-10-13 | 5024 | 21304a0c9b00 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/mipmap-mdpi/ic_launcher.webp | 2026-10-13 | 2096 | eef20f25fb14 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.webp | 2026-10-13 | 2858 | 520d05f978a1 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/mipmap-xhdpi/ic_launcher.webp | 2026-10-13 | 4569 | e77c5045bfdb | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.webp | 2026-10-13 | 7098 | 2846e1a703e5 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.webp | 2026-10-13 | 6464 | eb3a34b13632 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.webp | 2026-10-13 | 10676 | 363a569beb72 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp | 2026-10-13 | 9250 | 9ff27328b691 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.webp | 2026-10-13 | 15523 | 5bacd97a1b41 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/values/colors.xml | 2026-10-13 | 125 | 37277cd2b0ea | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/values/strings.xml | 2026-10-13 | 73 | 646241240eb9 | A/N |
| marleva-local/repositorio/apps/client/android/app/src/main/res/values/styles.xml | 2026-10-13 | 592 | e40414258372 | A/N |
| marleva-local/repositorio/apps/client/android/build.gradle | 2026-10-13 | 556 | bdb916d3fe70 | A/N |
| marleva-local/repositorio/apps/client/android/gradle.properties | 2026-10-13 | 2567 | d02b52da10bf | A/N |
| marleva-local/repositorio/apps/client/android/gradle/wrapper/gradle-wrapper.jar | 2026-10-13 | 46175 | b3a875ddc1f0 | A/N |
| marleva-local/repositorio/apps/client/android/gradle/wrapper/gradle-wrapper.properties | 2026-10-13 | 340 | 4683eb5ccb01 | A/N |
| marleva-local/repositorio/apps/client/android/gradlew | 2026-10-13 | 8618 | fb68debc1b1a | A/N |
| marleva-local/repositorio/apps/client/android/gradlew.bat | 2026-10-13 | 3093 | 982f1b2979dd | A/N |
| marleva-local/repositorio/apps/client/android/settings.gradle | 2026-10-13 | 1266 | 5378cb8b405a | A/N |
| marleva-local/repositorio/apps/client/app.json | 2026-10-14 | 518 | a6032235ed3a | T/N |
| marleva-local/repositorio/apps/client/app/_layout.tsx | 2026-10-14 | 133 | 3e1a4cc6fefa | T/C |
| marleva-local/repositorio/apps/client/app/index.tsx | 2026-10-15 | 12710 | cdcc4ccf9641 | T/C |
| marleva-local/repositorio/apps/client/package.json | 2026-10-14 | 863 | 8128b0a1133c | T/N |
| marleva-local/repositorio/apps/client/plugins/local-debug-tls.cjs | 2026-10-14 | 2261 | ca5ce2727768 | T/N |
| marleva-local/repositorio/apps/client/src/api-response.ts | 2026-10-14 | 337 | aea45a497935 | T/C |
| marleva-local/repositorio/apps/client/src/api.ts | 2026-10-14 | 3240 | 8a32f4bca4e5 | T/C |
| marleva-local/repositorio/apps/client/src/status-messages.tsx | 2026-10-14 | 722 | 5fccb1617553 | T/C |
| marleva-local/repositorio/apps/client/tsconfig.json | 2026-10-14 | 180 | 14532e30c86a | T/N |
| marleva-local/repositorio/docs/adr/001-consolidacion-tecnica.md | 2026-10-14 | 2444 | 3f92b988bd4f | T/N |
| marleva-local/repositorio/docs/adr/002-pipeline-ci.md | 2026-10-15 | 22246 | 73527d5dd6a5 | T/N |
| marleva-local/repositorio/docs/apis/M1/CONTRATO_B09_ARCHIVOS_PRIVADOS.md | 2026-10-13 | 5502 | 8ec955c98723 | T/N |
| marleva-local/repositorio/docs/apis/M1/CONTRATO_RECUPERACION_MFA.md | 2026-10-14 | 6621 | f596877987c9 | T/N |
| marleva-local/repositorio/docs/apis/M1/README.md | 2026-10-15 | 2552 | ed4bbc87a60c | T/C |
| marleva-local/repositorio/docs/apis/M1/openapi-objetivo-archivos.yaml | 2026-10-15 | 18131 | 17718b5a1f0f | T/P |
| marleva-local/repositorio/docs/apis/M1/openapi-objetivo-recuperacion.yaml | 2026-10-15 | 53953 | 8dcdca1cf18f | T/P |
| marleva-local/repositorio/docs/apis/M1/openapi.yaml | 2026-10-15 | 95446 | 69cd0ee3df80 | T/P |
| marleva-local/repositorio/docs/apis/M1/swagger-objetivo-archivos.html | 2026-10-15 | 13166 | 9debcdc17dc2 | T/N |
| marleva-local/repositorio/docs/apis/M1/swagger-objetivo-recuperacion.html | 2026-10-15 | 37737 | 63a13a0124fe | T/N |
| marleva-local/repositorio/docs/apis/M1/swagger.html | 2026-10-15 | 155659 | d410a8800527 | T/N |
| marleva-local/repositorio/docs/apis/M1/vendor/LICENSE | 2026-10-15 | 11358 | cfc7749b96f6 | A/N |
| marleva-local/repositorio/docs/apis/M1/vendor/swagger-ui-bundle.js | 2026-10-15 | 1587262 | 6b3bfcaff3fc | A/N |
| marleva-local/repositorio/docs/apis/M1/vendor/swagger-ui-standalone-preset.js | 2026-10-15 | 267767 | 5243d492e145 | A/N |
| marleva-local/repositorio/docs/apis/M1/vendor/swagger-ui.css | 2026-10-15 | 186154 | 1ac324f7dcd2 | A/N |
| marleva-local/repositorio/docs/avance.md | 2026-10-15 | 8608 | 97170b83a094 | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-001.mmd | 2026-10-15 | 1052 | d1faf559f1db | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-002.mmd | 2026-10-13 | 1120 | 1ecb9ed328f5 | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-003.mmd | 2026-10-13 | 1017 | 70c9074490c6 | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-004.mmd | 2026-10-13 | 837 | 08d978a10e11 | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-005.mmd | 2026-10-13 | 924 | ee425e88b017 | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-006.mmd | 2026-10-13 | 1126 | f5561276c55d | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-007.mmd | 2026-10-13 | 968 | af999d25a8cc | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-008.mmd | 2026-10-13 | 1991 | e65e169a019e | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-009.mmd | 2026-10-13 | 784 | 8c1cac2ea913 | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-010.mmd | 2026-10-15 | 1255 | 1d76c4ddf89e | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-011.mmd | 2026-10-13 | 1772 | 2a09cd57e86b | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-012.mmd | 2026-10-13 | 921 | 25db79d8d5cf | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-013.mmd | 2026-10-14 | 1425 | bf5e909834e4 | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/MAR-M1-SEQ-014.mmd | 2026-10-14 | 1736 | 56221f885ebe | T/C |
| marleva-local/repositorio/docs/diagramas/secuencia/M1/README.md | 2026-10-13 | 3059 | 44c7dd128262 | T/C |
| marleva-local/repositorio/docs/evidence/expo-bundle.json | 2026-10-13 | 4269 | 3282270040e0 | T/N |
| marleva-local/repositorio/docs/evidence/expo-commit.json | 2026-10-13 | 29720 | 4267225d9e4c | T/N |
| marleva-local/repositorio/docs/evidence/gradle-9.3.1.sha256 | 2026-10-13 | 64 | 8f1011df390d | T/N |
| marleva-local/repositorio/docs/evidence/package-metadata.json | 2026-10-13 | 41348 | c79609828aaf | T/N |
| marleva-local/repositorio/docs/modelado-datos/README.md | 2026-10-14 | 2515 | af7ba994b2f8 | T/C |
| marleva-local/repositorio/docs/modelado-datos/dbml/MAR-M1-DATA-001.dbml | 2026-10-14 | 9203 | 9f85f9969d39 | T/C |
| marleva-local/repositorio/docs/modelado-datos/dbml/MAR-M1-DATA-002.dbml | 2026-10-15 | 9203 | 5aebc3b463d6 | T/N |
| marleva-local/repositorio/docs/modelado-datos/ddl/MAR-M1-DATA-001.sql | 2026-10-15 | 16544 | 09d7e5e654b0 | T/N |
| marleva-local/repositorio/docs/modelado-datos/ddl/MAR-M1-DATA-002.sql | 2026-10-15 | 18040 | 3e7093b84c2b | T/N |
| marleva-local/repositorio/docs/proceso/MATRIZ_CASOS_M1.md | 2026-10-14 | 21082 | b556e845310e | T/C |
| marleva-local/repositorio/docs/proceso/PROCESO_DESARROLLO_MARLEVA.md | 2026-10-14 | 41276 | 4abe56dcf7a2 | T/C |
| marleva-local/repositorio/docs/proceso/RECUPERACION_B12_M1.md | 2026-10-14 | 26366 | 7f6966f1cfb8 | T/N |
| marleva-local/repositorio/docs/proceso/inventario-auditoria.json | 2026-10-14 | 118497 | 88916c81d12b | T/N |
| marleva-local/repositorio/docs/revision/M1/INSTRUCTIVO_M1.md | 2026-10-14 | 10135 | 89ebe2ac9b18 | T/C |
| marleva-local/repositorio/docs/revision/M1/capturas/01-acceso.png | 2026-10-15 | 50503 | 4bcb32eef1ec | E/V |
| marleva-local/repositorio/docs/revision/M1/capturas/02-codigo-pendiente.png | 2026-10-15 | 57737 | a1b3d8c07eb0 | E/N |
| marleva-local/repositorio/docs/revision/M1/capturas/03-codigo-invalido.png | 2026-10-15 | 57967 | 38eb6f660f30 | E/N |
| marleva-local/repositorio/docs/revision/M1/capturas/04-cuenta.png | 2026-10-15 | 61111 | 1f7c4535bc0a | E/V |
| marleva-local/repositorio/docs/revision/M1/capturas/05-cambio-correo.png | 2026-10-15 | 58160 | 29cf78dc6742 | E/N |
| marleva-local/repositorio/docs/revision/M1/capturas/06-sesion-cerrada.png | 2026-10-15 | 60881 | f12a00481f47 | E/N |
| marleva-local/repositorio/docs/revision/M1/capturas/android/01-acceso.png | 2026-10-14 | 157569 | 3cd770270d78 | E/N |
| marleva-local/repositorio/docs/revision/M1/capturas/android/02-codigo-pendiente.png | 2026-10-14 | 165251 | 4bd049c4d3c7 | E/N |
| marleva-local/repositorio/docs/revision/M1/capturas/android/03-codigo-invalido.png | 2026-10-14 | 268821 | 952919660f04 | E/N |
| marleva-local/repositorio/docs/revision/M1/capturas/android/04-cuenta.png | 2026-10-14 | 150725 | 4af8d1ed03ad | E/V |
| marleva-local/repositorio/docs/revision/M1/capturas/android/05-sesion-cerrada.png | 2026-10-14 | 150495 | 146dae4a8c30 | E/N |
| marleva-local/repositorio/eslint.config.mjs | 2026-10-14 | 2017 | 95d2d7ef1769 | T/N |
| marleva-local/repositorio/infra/ci/.python-version | 2026-10-15 | 8 | f50159fad3f4 | T/N |
| marleva-local/repositorio/infra/ci/Dockerfile | 2026-10-15 | 1706 | 1c7a5962ef27 | T/N |
| marleva-local/repositorio/infra/ci/gitleaks.toml | 2026-10-15 | 492 | d0ffc104b3ff | T/N |
| marleva-local/repositorio/infra/ci/images.json | 2026-10-15 | 463 | b159e8c6ac94 | T/N |
| marleva-local/repositorio/infra/ci/lighthouserc.cjs | 2026-10-15 | 368 | fd954d474b48 | T/N |
| marleva-local/repositorio/infra/ci/requirements.lock | 2026-10-15 | 47246 | 42abe4cb3d1e | A/N |
| marleva-local/repositorio/infra/ci/schemathesis_hooks.py | 2026-10-15 | 259 | cefdb02a6850 | T/N |
| marleva-local/repositorio/infra/ci/security-backports.json | 2026-10-15 | 1230 | c4de608c7b32 | T/N |
| marleva-local/repositorio/infra/ci/supabase/config.toml | 2026-10-15 | 1517 | d97fed955d70 | T/N |
| marleva-local/repositorio/infra/ci/tools.json | 2026-10-15 | 2055 | e9d5c428cf65 | T/N |
| marleva-local/repositorio/infra/local/manifest.json | 2026-10-13 | 11867 | 91991ff3e73f | T/N |
| marleva-local/repositorio/infra/local/supabase/config.toml | 2026-10-13 | 15985 | 7ebbb341fe48 | T/N |
| marleva-local/repositorio/infra/local/supabase/templates/otp.html | 2026-10-13 | 101 | 9ab19407e259 | T/N |
| marleva-local/repositorio/infra/local/toolchain.json | 2026-10-13 | 3629 | 5032577049c7 | T/N |
| marleva-local/repositorio/knip.json | 2026-10-15 | 909 | b554838eaa13 | T/N |
| marleva-local/repositorio/package.json | 2026-10-15 | 3905 | 4ff6b1d8f884 | T/N |
| marleva-local/repositorio/packages/config/http-routes.json | 2026-10-15 | 2115 | e5be9dfcfc0c | T/N |
| marleva-local/repositorio/packages/config/limits.json | 2026-10-13 | 247 | 25fa26ab903b | T/N |
| marleva-local/repositorio/packages/config/package.json | 2026-10-13 | 73 | b50ef91e9a08 | T/N |
| marleva-local/repositorio/packages/contracts/generated.ts | 2026-10-15 | 191157 | 2197c49b945c | T/N |
| marleva-local/repositorio/packages/contracts/openapi.json | 2026-10-15 | 350522 | 08cd8ac362fc | T/P |
| marleva-local/repositorio/packages/contracts/package.json | 2026-10-13 | 252 | e8d7f36d1862 | T/N |
| marleva-local/repositorio/patches/@lhci__utils@0.15.1.patch | 2026-10-15 | 524 | d543de2cd2da | A/N |
| marleva-local/repositorio/patches/braces@3.0.3.patch | 2026-10-15 | 3453 | 388b9865e373 | A/N |
| marleva-local/repositorio/patches/node-forge@1.4.0.patch | 2026-10-15 | 707 | b6876574a5de | A/N |
| marleva-local/repositorio/patches/query-string@7.1.3.patch | 2026-10-15 | 465 | fe47b885269a | A/N |
| marleva-local/repositorio/pnpm-lock.yaml | 2026-10-15 | 484102 | 2e61aca722db | A/N |
| marleva-local/repositorio/pnpm-workspace.yaml | 2026-10-15 | 1375 | 93b04eefb102 | T/N |
| marleva-local/repositorio/redocly.yaml | 2026-10-14 | 188 | 9ee2f74a760d | T/N |
| marleva-local/repositorio/scripts/audit-environment.mjs | 2026-10-14 | 4540 | 88ed9fc0a1f9 | T/N |
| marleva-local/repositorio/scripts/check-lockfile.mjs | 2026-10-14 | 764 | 73df36c64f5f | A/N |
| marleva-local/repositorio/scripts/check-unused.mjs | 2026-10-14 | 446 | cf90d2979078 | T/N |
| marleva-local/repositorio/scripts/ci-cert-trust.mjs | 2026-10-15 | 1453 | deeb0230ba37 | T/N |
| marleva-local/repositorio/scripts/ci-contract.mjs | 2026-10-15 | 1344 | afc124743413 | T/N |
| marleva-local/repositorio/scripts/ci-e2e.mjs | 2026-10-15 | 856 | 910edd1bfafa | T/N |
| marleva-local/repositorio/scripts/ci-integration.mjs | 2026-10-15 | 3876 | ab47580b3f7e | T/N |
| marleva-local/repositorio/scripts/ci-migrations.mjs | 2026-10-15 | 5903 | c49dd2ea9e71 | T/N |
| marleva-local/repositorio/scripts/ci-prepare.mjs | 2026-10-15 | 377 | 7c77218f7b4a | T/N |
| marleva-local/repositorio/scripts/ci-stack.mjs | 2026-10-15 | 4609 | 3348b68b0fae | T/N |
| marleva-local/repositorio/scripts/ci-stage.mjs | 2026-10-15 | 943 | f9902ca7b2e6 | T/N |
| marleva-local/repositorio/scripts/ci-summary.mjs | 2026-10-15 | 802 | fc8d46bf2f8c | T/N |
| marleva-local/repositorio/scripts/ci-tool.mjs | 2026-10-15 | 2508 | dde1dc4ede99 | T/N |
| marleva-local/repositorio/scripts/container-build.mjs | 2026-10-15 | 2248 | e54160f9dbcb | T/N |
| marleva-local/repositorio/scripts/coverage-ratchet.mjs | 2026-10-15 | 2991 | e0df9d47d927 | T/N |
| marleva-local/repositorio/scripts/create-certificates.sh | 2026-10-15 | 838 | 5a84bcf060aa | T/N |
| marleva-local/repositorio/scripts/generate-documentation.mjs | 2026-10-15 | 2973 | de891d6bc25f | T/N |
| marleva-local/repositorio/scripts/generate-m1-target.mjs | 2026-10-14 | 4061 | d17c453d6e5b | T/N |
| marleva-local/repositorio/scripts/local.mjs | 2026-10-14 | 2472 | 4b9e63cc72dd | T/N |
| marleva-local/repositorio/scripts/private-fixture-constraints.mjs | 2026-10-13 | 1831 | bf16d16df06c | T/N |
| marleva-local/repositorio/scripts/proxy.mjs | 2026-10-15 | 2500 | a1a18e722ce9 | T/N |
| marleva-local/repositorio/scripts/recovery-constraints.mjs | 2026-10-14 | 3225 | ac3c1d8718f4 | T/N |
| marleva-local/repositorio/scripts/security-backport-evidence.mjs | 2026-10-15 | 1653 | ab3be51e95f7 | T/N |
| marleva-local/repositorio/scripts/security-braces-regression.mjs | 2026-10-15 | 1267 | fc74826cc344 | T/N |
| marleva-local/repositorio/scripts/security-classify-findings.mjs | 2026-10-15 | 1530 | fa235f2f9a20 | T/N |
| marleva-local/repositorio/scripts/security-compat.mjs | 2026-10-15 | 3059 | 969fa33f81d7 | T/N |
| marleva-local/repositorio/scripts/security-forge-regression.mjs | 2026-10-15 | 2262 | 52a748037c04 | T/N |
| marleva-local/repositorio/scripts/security-lockfile.mjs | 2026-10-15 | 543 | 93aea33f5a19 | A/N |
| marleva-local/repositorio/scripts/security-patch-packages.mjs | 2026-10-15 | 934 | aafd8bc1d3ce | T/N |
| marleva-local/repositorio/scripts/security-sbom-pedigree.mjs | 2026-10-15 | 1802 | 89efa47df55b | T/N |
| marleva-local/repositorio/scripts/security-scan.mjs | 2026-10-15 | 5799 | ea985f4a5c67 | T/N |
| marleva-local/repositorio/scripts/tool | 2026-10-15 | 1149 | 9ede72ed6fd8 | T/N |
| marleva-local/repositorio/tests/README.md | 2026-10-14 | 6260 | b45142563c19 | T/N |
| marleva-local/repositorio/tests/coverage-baseline.json | 2026-10-15 | 306 | 139ed6e75229 | T/N |
| marleva-local/repositorio/tests/fixtures/private-file-cleanup.mjs | 2026-10-13 | 1696 | 62d213f528e7 | T/N |
| marleva-local/repositorio/tests/fixtures/recovery-fixtures.mjs | 2026-10-14 | 3689 | 42abfe2a33eb | T/N |
| marleva-local/repositorio/tests/fixtures/recovery-guard.mjs | 2026-10-14 | 2086 | bc84761ddd42 | T/N |
| marleva-local/repositorio/tests/fixtures/recovery-keys.mjs | 2026-10-14 | 2384 | 0052937857fe | T/N |
| marleva-local/repositorio/tests/fixtures/recovery-repair-metadata.mjs | 2026-10-14 | 3105 | 1f565e489885 | T/N |
| marleva-local/repositorio/tests/fixtures/recovery-stack.mjs | 2026-10-14 | 13354 | dc65e6067d2f | T/N |
| marleva-local/repositorio/tests/fixtures/recovery-xattrs.mjs | 2026-10-14 | 1554 | 13d4242fc8d6 | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/data-target.test.mjs | 2026-10-15 | 10444 | 585b0f9c59bf | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/files.test.mjs | 2026-10-15 | 13276 | 148379712d3a | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/m1.test.mjs | 2026-10-15 | 16544 | dccb763477db | T/P |
| marleva-local/repositorio/tests/integration/backend/M1/otp-quota.test.mjs | 2026-10-15 | 2681 | 27f258c68c7d | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/outbox.test.mjs | 2026-10-15 | 10024 | ef6d1815b3cc | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/recovery-after-copy.mjs | 2026-10-14 | 2640 | 6ffb39bd4e5f | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/recovery-api.mjs | 2026-10-15 | 18789 | 53125d34178f | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/recovery-copy.mjs | 2026-10-14 | 12501 | 7613d010c645 | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/recovery-migration-schema.mjs | 2026-10-14 | 4406 | c941603677e7 | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/recovery-migration.mjs | 2026-10-14 | 5293 | 83a8f9e07d64 | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/recovery-operator.mjs | 2026-10-14 | 8626 | 923a6be99717 | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/recovery-outbox.mjs | 2026-10-14 | 9445 | c59c2439fe7b | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/recovery-provider.mjs | 2026-10-14 | 12687 | c70dc7f10706 | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/recovery-source.mjs | 2026-10-14 | 2043 | 108724f25093 | T/N |
| marleva-local/repositorio/tests/integration/backend/M1/recovery-xattrs.mjs | 2026-10-14 | 2979 | e874fd917c5c | T/N |
| marleva-local/repositorio/tests/integration/frontend/M1/android-test.mjs | 2026-10-14 | 8748 | 0e79595a0fae | T/N |
| marleva-local/repositorio/tests/integration/frontend/M1/web-test.mjs | 2026-10-15 | 5454 | 849511d3f32b | T/C |
| marleva-local/repositorio/tests/performance/backend/M1/files.mjs | 2026-10-13 | 5129 | cb39e9dbb6b3 | T/N |
| marleva-local/repositorio/tests/performance/backend/M1/health.mjs | 2026-10-14 | 2399 | b071009ffa4c | T/N |
| marleva-local/repositorio/tests/performance/backend/M1/notices.mjs | 2026-10-13 | 6874 | 4da3bd6b1698 | T/N |
| marleva-local/repositorio/tests/performance/backend/M1/otp-quota.mjs | 2026-10-14 | 3594 | c4b1e0357268 | T/N |
| marleva-local/repositorio/tests/performance/frontend/M1/navigation.mjs | 2026-10-14 | 1534 | 3bfac38d4d15 | T/N |
| marleva-local/repositorio/tests/results/android-build.json | 2026-10-13 | 997 | 83fd92daacdc | E/N |
| marleva-local/repositorio/tests/results/android-test-failure.json | 2026-10-14 | 250 | 6dda02f08123 | E/N |
| marleva-local/repositorio/tests/results/android-test.json | 2026-10-14 | 776 | 42d00317e66a | E/C |
| marleva-local/repositorio/tests/results/before-reorganization/android-build.log | 2026-10-13 | 115653 | 07503c70422a | E/N |
| marleva-local/repositorio/tests/results/before-reorganization/m1-tests.json | 2026-10-13 | 5574 | 12f8b1cf6c7e | E/N |
| marleva-local/repositorio/tests/results/before-reorganization/web-access.png | 2026-10-13 | 50503 | 4bcb32eef1ec | E/N |
| marleva-local/repositorio/tests/results/before-reorganization/web-account.png | 2026-10-13 | 57959 | ca81b4c57faa | E/N |
| marleva-local/repositorio/tests/results/before-reorganization/web-test.json | 2026-10-13 | 316 | 94a14ad130b1 | E/N |
| marleva-local/repositorio/tests/results/ci-image-first-failure.json | 2026-10-15 | 16949 | b4278c112a8e | E/N |
| marleva-local/repositorio/tests/results/ci-integration-backend.json | 2026-10-15 | 623 | bfd2f190a291 | E/P |
| marleva-local/repositorio/tests/results/ci-integration-contract.json | 2026-10-15 | 350 | 6778635e1335 | E/N |
| marleva-local/repositorio/tests/results/ci-integration-web.json | 2026-10-15 | 410 | 8ece339dd21c | E/P |
| marleva-local/repositorio/tests/results/ci-integration.json | 2026-10-15 | 623 | 26ac8f7c99a4 | E/N |
| marleva-local/repositorio/tests/results/ci-migrations.json | 2026-10-15 | 1070 | 4fb8a113327b | E/N |
| marleva-local/repositorio/tests/results/ci-operators-failure.json | 2026-10-15 | 823 | 219388612777 | E/N |
| marleva-local/repositorio/tests/results/ci-operators.json | 2026-10-15 | 964 | a8c89dc7885f | E/N |
| marleva-local/repositorio/tests/results/ci-phase1-first-run.json | 2026-10-15 | 567 | 3aed92f7f977 | E/N |
| marleva-local/repositorio/tests/results/ci-phase1-local.json | 2026-10-15 | 1438 | 54fbdf726dff | E/N |
| marleva-local/repositorio/tests/results/ci-phase1-positive.json | 2026-10-15 | 1537 | 9725a7600a0d | E/N |
| marleva-local/repositorio/tests/results/ci-phase1-reverted.json | 2026-10-15 | 718 | 73849415c4d0 | E/N |
| marleva-local/repositorio/tests/results/ci-phase2-first.json | 2026-10-15 | 1745 | 1e106eddfbc4 | E/N |
| marleva-local/repositorio/tests/results/ci-phase2-verified.json | 2026-10-15 | 1745 | ad16655115ce | E/N |
| marleva-local/repositorio/tests/results/cleanup-git.json | 2026-10-13 | 1052 | ad636bfcdffd | E/N |
| marleva-local/repositorio/tests/results/coverage-summary.json | 2026-10-15 | 1060 | fcb3b8daf9c4 | E/N |
| marleva-local/repositorio/tests/results/coverage-unit.json | 2026-10-14 | 129858 | f1f3a9a46efe | E/N |
| marleva-local/repositorio/tests/results/data-target-20261013-first-failure.json | 2026-10-13 | 14968 | da3579dacad1 | E/N |
| marleva-local/repositorio/tests/results/data-target-20261013.json | 2026-10-13 | 3165 | 9ca6d6cbaa36 | E/N |
| marleva-local/repositorio/tests/results/data-target-b09-20261013.json | 2026-10-13 | 3807 | 71af8f9a3a9c | E/N |
| marleva-local/repositorio/tests/results/dependency-graph-enabled.png | 2026-10-15 | 57901 | 167270e838af | E/N |
| marleva-local/repositorio/tests/results/dependency-graph-verified.json | 2026-10-15 | 146 | 48d2c620343c | E/N |
| marleva-local/repositorio/tests/results/documentation-20261013.json | 2026-10-13 | 739 | c74aafd4d2d4 | E/N |
| marleva-local/repositorio/tests/results/files-api-regression.json | 2026-10-13 | 6011 | 228f30a8421c | E/N |
| marleva-local/repositorio/tests/results/files-fixture-cleanup.json | 2026-10-13 | 222 | f0a9ed372f29 | E/N |
| marleva-local/repositorio/tests/results/files-increment.json | 2026-10-13 | 5550 | 17fb86f848a7 | E/C |
| marleva-local/repositorio/tests/results/files-integration-first-failure.json | 2026-10-13 | 4553 | ec5dd286d45b | E/N |
| marleva-local/repositorio/tests/results/files-integration-second-failure.json | 2026-10-13 | 3476 | 6622145cd4a4 | E/N |
| marleva-local/repositorio/tests/results/files-integration.json | 2026-10-13 | 2771 | 69bd13f1f7b6 | E/N |
| marleva-local/repositorio/tests/results/files-migration.json | 2026-10-13 | 4506 | 3ec86d251515 | E/N |
| marleva-local/repositorio/tests/results/files-outbox-regression.json | 2026-10-13 | 2431 | 36d2c2f85145 | E/N |
| marleva-local/repositorio/tests/results/files-performance-first-failure.json | 2026-10-13 | 258 | 6dbde2e34fca | E/N |
| marleva-local/repositorio/tests/results/files-performance.json | 2026-10-13 | 2607 | 29511709a0ce | E/N |
| marleva-local/repositorio/tests/results/files-unit.json | 2026-10-13 | 7802 | ad2b4b8d1fd1 | E/N |
| marleva-local/repositorio/tests/results/notices-increment.json | 2026-10-13 | 6530 | 3b9dcf8c1c1c | E/C |
| marleva-local/repositorio/tests/results/notices-integration-first-failure.json | 2026-10-13 | 6622 | dcf24bde1ad7 | E/N |
| marleva-local/repositorio/tests/results/notices-integration.json | 2026-10-13 | 6002 | 07fbb589e77d | E/N |
| marleva-local/repositorio/tests/results/notices-lint.json | 2026-10-13 | 48713 | 112f6c27507d | E/N |
| marleva-local/repositorio/tests/results/notices-migration-local.json | 2026-10-13 | 470 | 4450ff33dd08 | E/N |
| marleva-local/repositorio/tests/results/notices-migration.json | 2026-10-13 | 4162 | 240e744048dc | E/N |
| marleva-local/repositorio/tests/results/notices-outbox.json | 2026-10-13 | 2421 | 228f6eba3476 | E/N |
| marleva-local/repositorio/tests/results/notices-performance-first-failure.json | 2026-10-13 | 824 | 863fedfcb34c | E/N |
| marleva-local/repositorio/tests/results/notices-performance.json | 2026-10-13 | 4409 | 4d28ebe3ad0b | E/N |
| marleva-local/repositorio/tests/results/notices-unit.json | 2026-10-13 | 6883 | b165c45bbd0d | E/N |
| marleva-local/repositorio/tests/results/notices-worker-performance.json | 2026-10-15 | 729 | b5606661f6f8 | E/N |
| marleva-local/repositorio/tests/results/otp-android-increment.md | 2026-10-14 | 2743 | 87dbfd2466d9 | E/C |
| marleva-local/repositorio/tests/results/otp-api-regression.json | 2026-10-14 | 6003 | 6b9e64070da8 | E/P |
| marleva-local/repositorio/tests/results/otp-quota-integration.json | 2026-10-14 | 1394 | 8bec35e46427 | E/N |
| marleva-local/repositorio/tests/results/otp-quota-performance.json | 2026-10-14 | 1603 | 18d2bd89d72d | E/N |
| marleva-local/repositorio/tests/results/otp-quota-unit.json | 2026-10-14 | 8399 | c2bd5746eac5 | E/N |
| marleva-local/repositorio/tests/results/quality-api-regression.json | 2026-10-14 | 5999 | 6ce757d07493 | E/P |
| marleva-local/repositorio/tests/results/quality-baseline-20261013.json | 2026-10-13 | 6336 | b3f7fd503973 | E/N |
| marleva-local/repositorio/tests/results/quality-first-config-20261013.json | 2026-10-13 | 4657 | 681fd1525213 | E/N |
| marleva-local/repositorio/tests/results/quality-increment.json | 2026-10-14 | 728 | 4b9d7db37616 | E/N |
| marleva-local/repositorio/tests/results/quality-unit.json | 2026-10-14 | 10565 | 2845bc027597 | E/P |
| marleva-local/repositorio/tests/results/recovery-after-copy.json | 2026-10-14 | 335 | 76a1b49ce247 | E/N |
| marleva-local/repositorio/tests/results/recovery-api-failure.json | 2026-10-14 | 831 | dcefccf5d33d | E/N |
| marleva-local/repositorio/tests/results/recovery-api.json | 2026-10-14 | 972 | fc473ad0070e | E/C |
| marleva-local/repositorio/tests/results/recovery-copy-empty-baseline.json | 2026-10-14 | 2688 | 467a2eaece27 | E/N |
| marleva-local/repositorio/tests/results/recovery-copy-with-attributes.json | 2026-10-14 | 2772 | 95984b2e47e8 | E/N |
| marleva-local/repositorio/tests/results/recovery-copy.json | 2026-10-14 | 2715 | 447bb43541f6 | E/N |
| marleva-local/repositorio/tests/results/recovery-fixture-failure.json | 2026-10-14 | 494 | 455b6f4c15f6 | E/N |
| marleva-local/repositorio/tests/results/recovery-guard-unit.json | 2026-10-14 | 1660 | 46ad2f9fe982 | E/N |
| marleva-local/repositorio/tests/results/recovery-increment.json | 2026-10-14 | 1573 | f17cfed672b9 | E/N |
| marleva-local/repositorio/tests/results/recovery-metadata-repair.json | 2026-10-14 | 353 | f0e0803b9e30 | E/N |
| marleva-local/repositorio/tests/results/recovery-migration.json | 2026-10-14 | 1265 | 4baf3f920fcd | E/N |
| marleva-local/repositorio/tests/results/recovery-operator-provider.json | 2026-10-14 | 1015 | b0c7fd98c0ed | E/N |
| marleva-local/repositorio/tests/results/recovery-outbox-failure.json | 2026-10-14 | 765 | a20051b12ebd | E/N |
| marleva-local/repositorio/tests/results/recovery-outbox.json | 2026-10-14 | 830 | 311c795344f9 | E/P |
| marleva-local/repositorio/tests/results/recovery-provider-failure.json | 2026-10-14 | 383 | b6c9a91d48e2 | E/N |
| marleva-local/repositorio/tests/results/recovery-provider.json | 2026-10-14 | 794 | a424ee524ec0 | E/N |
| marleva-local/repositorio/tests/results/recovery-schema.json | 2026-10-14 | 803 | 526a71148da2 | E/P |
| marleva-local/repositorio/tests/results/recovery-source.json | 2026-10-14 | 130 | fd63a93764b3 | E/N |
| marleva-local/repositorio/tests/results/recovery-stack-failure.json | 2026-10-14 | 411 | 5b7ca4cee065 | E/N |
| marleva-local/repositorio/tests/results/recovery-stack.json | 2026-10-14 | 691 | 84a75ed62219 | E/N |
| marleva-local/repositorio/tests/results/recovery-unit.json | 2026-10-14 | 9888 | 26b7dacad9df | E/N |
| marleva-local/repositorio/tests/results/recovery-xattrs.json | 2026-10-14 | 322 | 72bcc830fa9a | E/N |
| marleva-local/repositorio/tests/results/security-findings.json | 2026-10-15 | 621 | a6aae7dd2dbb | E/N |
| marleva-local/repositorio/tests/results/security-scan.json | 2026-10-15 | 845 | 2e72f68e99a9 | E/N |
| marleva-local/repositorio/tests/results/unit-20261012.json | 2026-10-13 | 4193 | b54b338e4258 | E/N |
| marleva-local/repositorio/tests/results/web-access.png | 2026-10-15 | 50503 | 4bcb32eef1ec | E/N |
| marleva-local/repositorio/tests/results/web-account.png | 2026-10-15 | 57942 | 894a3957ffb0 | E/N |
| marleva-local/repositorio/tests/results/web-test.json | 2026-10-15 | 316 | 53d9a0d539bb | E/C |
| marleva-local/repositorio/tests/unit/backend/M1/account.test.mjs | 2026-10-14 | 19673 | 60cc2362ced6 | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/config.test.mjs | 2026-10-15 | 1312 | 03cf9f409751 | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/file-cases.test.mjs | 2026-10-14 | 4673 | 21e94820af61 | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/files.test.mjs | 2026-10-14 | 2180 | 10817736baf7 | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/http-transport.test.mjs | 2026-10-15 | 4826 | 78c47e343cda | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/mfa-recovery.test.mjs | 2026-10-14 | 18338 | 08d9ee64a766 | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/notices.test.mjs | 2026-10-14 | 2618 | b66e41dc084b | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/otp-origin-limit.test.mjs | 2026-10-14 | 667 | e1b2d8815ea6 | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/outbox.test.mjs | 2026-10-14 | 1835 | b4636afbd40d | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/recovery-guard.test.mjs | 2026-10-14 | 2506 | 8977942c1cbb | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/recovery-provider-adapter.test.mjs | 2026-10-15 | 6073 | 4c565fefcb2b | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/recovery-review.test.mjs | 2026-10-14 | 1570 | 4741ab23b264 | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/security.test.mjs | 2026-10-14 | 1386 | 1e53ed97c9ba | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/simulator.test.mjs | 2026-10-14 | 1046 | 2374f5a8b1a0 | T/N |
| marleva-local/repositorio/tests/unit/backend/M1/storage-adapter.test.mjs | 2026-10-15 | 2585 | fa21c06efc10 | T/N |
| marleva-local/repositorio/tests/unit/backend/base/dependency-patches.test.mjs | 2026-10-15 | 477 | 9f25889bc7c1 | T/N |
| marleva-local/repositorio/tests/unit/backend/base/security-findings.test.mjs | 2026-10-15 | 3294 | bc5cddc952b7 | T/N |
| marleva-local/repositorio/tests/unit/frontend/M1/api.test.ts | 2026-10-14 | 3821 | 73754f24f17e | T/C |
| marleva-local/repositorio/tests/unit/frontend/M1/status-messages.test.ts | 2026-10-15 | 1187 | d24a52ad7693 | T/C |
| marleva-local/repositorio/vitest.coverage.config.mjs | 2026-10-15 | 931 | c31e76b37868 | T/N |
| sources/00_GUIA_PRINCIPAL_MARLEVA.md | 2026-10-15 | 17450 | 2dd00513f18c | S/C |
| sources/01_ESTADO_Y_DECISIONES_MARLEVA.md | 2026-10-15 | 50160 | 1cafdfbcbe0f | S/P |
| sources/02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md | 2026-10-15 | 80614 | c8aadd2a8295 | S/P |
| sources/03_REFERENTES_Y_EVIDENCIA_MARLEVA.md | 2026-10-15 | 79470 | d655c9abfdcd | S/C |

