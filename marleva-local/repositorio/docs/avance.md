# Avance de Marleva por criterios funcionales

Fecha: 16 de octubre de 2026, America/Merida. Fuente única de porcentajes. Línea base: 14 criterios de la matriz M1 y sus secuencias 001–014, incluido el soporte de base necesario para M1. No contar pruebas, archivos o commits.

## Método

Implementación: criterio cuya salida funcional descrita abajo tiene código disponible, enlazado al contrato/caso. No implica aceptación. Una salida ausente o incompleta suma 0. Aceptación: criterio integrado cumple todas sus pruebas/negativos/permisos, plataformas/accesibilidad, recuperación/calidad/manual y revisión aplicables. Una rama pendiente suma 0. Cada criterio pesa 1, sin puntuar fracciones. Estado diseñado/implementado/probado/aceptado separado. Cambios de la lista requieren motivo y concordancia con 02/matriz.

## M1: acceso/cuenta y base necesaria

| Criterio estable | Salida funcional | Implementado | Aceptado | Evidencia / falta para aceptar |
|---|---|---|---|---|
| UC001 | Pedir código por correo con espera/cuota/respuesta genérica | Sí | No | AccountService.challenge; actas otp-quota; faltan todas las ramas/plataformas aplicables |
| UC002 | Verificar código válido/único; error conserva paso | Sí | No | AccountService.verify, API/Chrome/Android; faltan combinaciones y plataformas |
| UC003 | Cuenta propia, sesión vigente y renovación del proveedor | Sí | No | AccountService.principal; pruebas API/unitarias; concurrencia/caídas y plataformas restantes |
| UC004 | Salir de sesión actual/todas con revocación | Sí | No | AccountService.logout; API/Chrome/Android básico; dos dispositivos y plataformas pendientes |
| UC005 | Iniciar cambio de correo propio con conflictos controlados | Sí | No | AccountService.emailChange; API/unitarias; recorrido completo UI/nativo pendiente |
| UC006 | Confirmar ambos buzones, conservar ID, revocar y avisar | Sí | No | confirmEmail/finishEmailChange/reconcile; API/unitarias; caídas/recorridos completos restantes |
| UC007 | Segundo factor básico del operador y nivel de garantía AAL2 | Sí | No | enroll/verifyFactor/operator; API/unitarias; plataforma/rol/revisión completos pendientes; recuperación en UC014 |
| UC008 | Avisos durables y navegación paginada propia en cliente | Sí | No | Cursor/outbox y NoticePages/AccountNotices conectados a API009. CI38923822365 comprueba paginación PG/Auth/Chrome real, recarga y retorno a Avisos tras OTP; plataformas y demás ramas pendientes |
| UC009 | Recuperar acceso y retomar acción interna segura | Sí | No | M1App/SafeReturn/AccountWorkspace enlazan intención en memoria, nueva autenticación y consultas propias API025–027; unitarias de misma/otra identidad y cancelación en CI902308e. Retorno a Avisos con misma/otra identidad comprobado en CI38923822365; demás acciones/plataformas pendientes |
| UC010 | Salud/configuración/dependencias locales y fallo recuperable | Sí | No | HealthController/config/adaptador; completar caídas/rendimiento/regresión de plataformas |
| UC011 | Permiso/lectura/borrado de archivo ficticio privado con integridad | Sí | No | B09 código y actas files/recovery; sin pantalla M2 exigida; aceptación/recuperación completa pendiente |
| UC012 | Simulador aislado: idempotencia, eventos, fallos y reembolso | Sí | No | PaymentSimulator y pruebas; no acredita M6; completar contrato/medición/aceptación aplicables |
| UC013 | Restauración/repetibilidad sin revivir accesos o borrados | Sí | No | Herramientas integrales, ensayo1792118849918 y repetición1792167720153 enlazan copia/Auth/Storage/ledger/permisos/revocación/cola/cliente; Prisma real separado por diseño. Plataformas, mediciones restantes y aceptación pendientes |
| UC014 | Recuperación administrativa MFA con otro autorizado | Sí | No | Siete operaciones backend integradas y roles persistidos; recovery-api.json y recovery-schema.json. Recuperación integral UI Chrome con otro revisor, OTP/TOTP/capacidad y retorno comprobada en1792167720153; plataformas y aceptación pendientes |

Implementación M1 = 14/14 = 100%. Aceptación M1 = 0/14 = 0%. El numerador de aceptación cero refleja criterios completos aún no entregados/aceptados; no ausencia de código o pruebas. El 100% de salidas implementadas no acredita M1 terminado ni su aceptación.

| Módulo | Implementación | Aceptación | Estado |
|---|---|---|---|
| M1 Acceso/cuenta | 14/14: 100% | 0/14: 0% | Criterios arriba; pendientes reales |
| M2 Comunidad/oferentes | 0% | 0% | Diseño; sin implementación del módulo |
| M3 Catálogo | 3/9: 33,33% | 0/9: 0% | Catálogo público aislado; criterios abajo |
| M4 Compra directa | 0% | 0% | Diseño; sin implementación |
| M5 Cotización | 0% | 0% | Diseño; sin implementación |
| M6 Dinero | 0% | 0% | Diseño; simulador no suma como módulo |
| M7 Atención | 0% | 0% | Diseño; sin implementación |
| M8 Operación | 0% | 0% | Diseño; operador básico M1 no es M8 |
| M9 Avisos transversales | 0% | 0% | Infraestructura M1 no acredita módulo completo |
| M10 Medición | 0% | 0% | Diseño; sin implementación |

Proyecto: Por calcular. No promediar módulos con denominadores diferentes ni inventar criterios de M2–M10. Primero fijar sus matrices funcionales antes de calcular el total; M3 conserva su autorización específica y cálculo propio abajo, reunido en consolidación009; M2 yM4–M10 permanecen0% de implementación. General: no es un módulo funcional, Por calcular.

## Verificación técnica independiente del porcentaje

Tipado/lint/formato global y regresión API/Chrome pasaron; build API/web pasó. Cobertura de lógica medida con fuente TS y AccountService incluido superó 80% global; resumen en tests/results/coverage-summary.json. Cobertura no implica funcionalidad completa ni Sonar/CI aprobados. Manual único en docs/revision/M1/INSTRUCTIVO_M1.md; usuario revisará. Google pendiente; dirección visual M1 aprobada, aceptación integral pendiente en01. Datos ficticios; no despliegue.

## Pipeline de integración continua

15-10-2026. General no tiene porcentaje funcional. Rama codex/feat-ci-pipeline parte de 1d75de3; el usuario fusionó PR #1 y main quedó incorporado mediante dfeb9a3. Pipeline sin fusión.

| Fase | Preparación local | Resultado en GitHub |
|---|---|---|
| 1. Setup, calidad, capas/contratos, unitarias y build | Reglas nuevas corrigieron 21 errores; 122 pruebas, cobertura ampliada y trinquete pasan; API/web compilan. Docker mínimo, arranque/salud y Trivy pasan sin altas/críticas | Verde 38679348007; negativa 38679688035 rechazada por capas/ciclo; reversión ee171cf verde en 38679887976. Fase 1 verificada |
| 2. Seguridad, integración y web accesible | 153 unitarias, integración/operadores, migraciones cero/previa, contrato, axe/Lighthouse y contenedor. Dos paquetes retirados y dos parches locales comprobados, conservando OSV original | Primer verde completo 38773873030 sobre 9cdde72; negativa 4c54ea9 rechazada por seguridad en 38775164158. Restauración 737762e verde; ajuste de disparo único a93375b, diez jobs verdes en 38777078891. PR #2 integrado a main b12bfca; fase 2 verificada |
| 3. Sonar, rendimiento, nightly, CD desactivado y dependabot | SonarQube Cloud Free privado comprobado en [38821867592](https://github.com/AndresRaRi/marleva/actions/runs/38821867592): base/cambio OK, defecto S1764 rechazado por gate nativo y comparador, corrección OK. Sin tarjeta ni gasto; acta tests/results/sonar-cloud.json. Community conserva su guardia histórica; restantes componentes de fase 3 y aceptación M1 pendientes. | [Acta](../tests/results/sonar-cloud.json). Rendimiento, nightly, borrador CD y dependabot siguen pendientes; no se incrementa aceptación funcional |

Avisos de longitud de funciones permanecen visibles como pidió el usuario; complejidad y anidación son errores. Una ejecución local no acredita CI verde. Fases 2–3 no se activan hasta cerrar fase previa. El [ADR002](adr/002-pipeline-ci.md) conserva versiones, fuentes, licencias y límites.

Cierre técnico de este incremento: primer verde completo y negativa de seguridad observados; correspondencia exacta restaurada. La comprobación final vigente se consulta en [PR #2](https://github.com/AndresRaRi/marleva/pull/2), sin atribuir a un HEAD nuevo los resultados de otro. Evidencia en tests/results/ci-phase2-verified.json. Revisión independiente estática sin defectos accionables; límites en ADR002. La fase 3 queda pendiente para un incremento separado desde main después de la integración.

Dependency graph habilitado por solicitud del usuario. Lighthouse/YAML retiran extract-zip/sprintf-js. braces/node-forge conservan versiones originales con parches locales: OSV sigue identificándolas, pero solo se reconocen como corregidas tras comprobar hashes y regresiones en la misma corrida. Avisos desconocidos o evidencia alterada bloquean. Estos controles no modifican el avance funcional ni acreditan M1 completa.

Cierre MAR-CHAT-005: [acta y continuidad](proceso/CIERRE_MAR_CHAT_005.md). Integración del pipeline no cambia el avance funcional. Consolidación UC001 integrada por el usuario mediante PR #4 en main 40c65837f5498b4b91d342269ddf10490c90ab62. CI propio de main pasó en 38789774598; el avance funcional no cambia por consolidar pruebas.

## M3: catálogo aislado — MAR-CHAT-008

Autorización explícita15-10-2026, independiente de base/M1. Nueve criterios de [matriz M3](proceso/MATRIZ_CASOS_M3.md), todos peso1. Implementado exige salida integradaAPI/cliente local; lógica interna sin recorrido autenticado completo no suma. Aceptación exige además proveedores reales autorizados, plataformas/accesibilidad, calidad/manual y revisión. Fixtures no acreditan M1/M2/M8 ni personas aprobadas.

| Criterio | Salida | Implementado | Aceptado | Evidencia y límite |
|---|---|---|---|---|
| UC001 | Búsqueda/filtros/cursor y paginación con carga/vacío/error | Sí | No | Código M3 separado; PG/Nest ycliente universal/web; actas m3-*. Plataformas/aceptación pendientes |
| UC002 | Detalle público elegible o retirada404 | Sí | No | API/cliente integrados; fotos procesadas en backend; visualización web probada; caso009 completo separado |
| UC003 | Perfil público y ofertas por oferente | Sí | No | Campos públicos explícitos; elegibilidad ficticia, integraciónM2 pendiente |
| UC004 | Crear/editar ofertas propias autenticadas | No | No | Ruta privada/UI de gestión probadas con identidad ficticia; proveedor M1 real pendiente |
| UC005 | Enviar versión propia revisable | No | No | Envío integrado API/cliente probado con fixture; identidad real pendiente |
| UC006 | Revisión autorizada conMFA sin conflicto | No | No | Revisión API/cliente con otro actor ficticio probada; M1/M8 reales no integrados |
| UC007 | Pausar/disponibilidad por titular | No | No | Pausa API/cliente probada con sesión ficticia; proveedor real pendiente |
| UC008 | Elegibilidad vigente integrada conM2 | No | No | Proyección ficticia con ocultación comprobada; noM2 real |
| UC009 | Fotos seguras: carga/análisis/derivados | No | No | Carga privada con identidad inyectada/derivados públicos y web probados; proveedor real/selector nativo pendientes |

Implementación M3=3/9=33,33%. Barra: ███░░░░░░░. Aceptación=0/9=0%. M1 conserva su cálculo anterior; Proyecto sigue Por calcular. Las pruebas/archivos/commits no suman criterios. Integración en Git main mediante PR8/9; sin operación real.

15-10-2026, incremento gestión: UC004/005/006/007/009 tienen recorridos completos en composición aislada con identidad ficticia (87 pruebas M3 y nueve comprobaciones de navegador). Se conserva el numerador3/9 por criterio de recorrido autenticado integrado con proveedor real; el avance aislado se describe en evidencia, sin presentarlo como aceptación. Autorización de008 histórica: consolidación009 conserva el trabajo; el usuario autorizó posteriormente merge del conjunto a main, ejecutado mediante PR8/9 tras CI y revisión final, sin borrados ni despliegue.

Conciliación documental009,15-10-2026: la tabla anterior aún descontabaUC008/009 por pruebas pendientes. Cotejo de API009/025–027, M1App, SafeReturn, AccountWorkspace y NoticePages muestra sus salidas funcionales implementadas. Se aplica el mismo método de esta página, sin cambiar criterios/pesos: implementación13/14; aceptación permanece0/14 yUC013 sigue abierto. No es funcionalidad nueva ni acredita las pruebas faltantes, B12 o aceptación. Evidencia de código y CI902308e/38847365871; matriz M1 concilia los límites de cada prueba.

## Panorama funcional Chrome — fotografía anterior del 16 de octubre de 2026

Alcance de entrega para revisión: Chrome. Usuario aplaza y apaga Android/iOS, y descarta Safari para este cierre. PR14 completa comprobaciones de sesiones, accesibilidad por teclado/zoom y rendimiento remoto; consultar su CI real antes de integrar. No aumenta aceptación por suponer resultados de plataformas ni por preparar un manual.

Este panorama responde a la solicitud de distinguir código, funcionamiento comprobado y cierre real. El100% corresponde exclusivamente a salidas implementadas de M1; no representa el avance total de Marleva ni una aplicación lista para vecinos. La aceptación integral de M1 permanece pendiente.

| Entrega | Qué funciona con evidencia | Qué impide darla por terminada |
|---|---|---|
| Consolidación del trabajo anterior | Historiales integrados en mainef8b104; PR8/9/10/11 fusionados y CI propio38857102789 aprobado | No hay pendiente de volver a integrar esos mismos historiales. Los cambios nuevos de continuación usan PR12 y requieren sus propias pruebas/revisión |
| M1: acceso y cuenta | Pedir/verificar OTP, consultar cuenta propia y cerrar sesión: API y Chrome reales; recorrido básico Android en emulador. Sesiones/roles/cuotas tienen pruebas adicionales | Combinaciones restantes, renovación/revocación entre dispositivos y plataformas aplicables; no aceptación integral |
| M1: avisos y retorno | Código de paginación y retorno seguro integrado; backend real y pruebas controladas del cliente aprobados anteriormente | Recorrido PG/Auth/Chrome aprobado en CI38923822365; guardia adicional revisada en3e99253. Retorno de las demás acciones y plataformas pendientes |
| M1: cambio de correo | API de ambos buzones, conservación de identidad, revocación y avisos con pruebas; cliente implementado | Chrome real CI38930795913 comprueba ambos buzones, error, recarga, identidad y revocación entre sesiones; plataformas restantes pendientes |
| M1: operador/MFA/recuperación | Segundo factor y siete operaciones de recuperación reales en backend; pantallas parciales existentes | Recorrido completo Chrome con otro revisor, retorno y nuevo factor pasó en1792167720153; plataformas y aceptación pendientes |
| B09/archivos privados | Lectura propia, denegación a otra cuenta/público, integridad y borrado con trabajador probados | Recuperación integrada con B12; no es un módulo de documentos vecinales M2 terminado |
| B12/restauración | Ensayos parciales de PG/Auth/Storage, atributos, permisos, revocación y cola existen | Contexto1792118849918: copia/integridad, ledger posterior, permisos/revocación/OTP, cola restaurada y recuperación HTTP del operador pasaron; fallos y reanudaciones conservados. Prisma interrumpido/resuelto/reaplicado pasó en42.334s con cinco migraciones originales intactas. Cliente Chrome pasó en el primario; repetición1792167720153 conserva el mismo backup y pasa copia/proveedor/cola/cliente/MFA UI. Plataformas/mediciones restantes y aceptación pendientes |
| M3/catálogo público aislado | Búsqueda/filtros/páginas, detalle y perfil de oferente con API/PG/web; elegibilidad ficticia | Identidad real M1, elegibilidad M2 y revisión M8. Gestión/fotos probadas con identidad inyectada no se presentan como integración real |
| M2/M8 | Diseño documental, contratos/modelos y validaciones documentales | Implementación funcional, aceptación visual y condiciones D07/A8, D08-R y D09-R |
| M4/M5/M6/M7/M9/M10 | Diseño y componentes de soporte descritos en sus fuentes; simulador de dinero aislado | Módulos funcionales no implementados. El simulador no prueba compras, cobros ni reembolsos reales |

Orden de cierre activo: PR13 ya integrada en main91b0d19 conCI38935513484 aprobado. PR14 reúne las verificaciones finales Chrome y entrega de prueba; exigeCI/revisión y posteriorCI propio de main. Correo/revocación y core B12 repetido/MFA UI Chrome comprobados. Android/iOS apagados y aplazados; Safari fuera del cierre actual. Manual/README/B12 conciliados; aceptación humana pendiente. Resolver fallos concretos sin rehacer controles aprobados. No abrir módulos nuevos ni trabajo paralelo. Si hay dependencia del usuario o equipo físico, identificarla y continuar únicamente lo independiente. Las demás necesidades de producto siguen visibles; no se ocultan bajo el avance de M1.

Usuario confirmó16-10-2026 haber reemplazado Fuentes00/01/02 y configuración. Es confirmación del usuario, sin verificación directa de la carga compartida. Autorizó excepción limitada para retirar el archivo `delete-after-copy` y el factor MFA ficticio del ensayo B12; demás archivos, ramas, datos y copias se conservan.

Actualización16-10-2026 por evidencia: UC013 ahora tiene la salida funcional implementada, por eso14/14 de implementación; no cambia el método/pesos ni acredita aceptación. Correo y revocación entre sesiones reales pasaron en CI38930795913/8b9463e;55avisos/3páginas/3solicitudes y retorno misma/otra cuenta,2785ms excluyendo esperaOTP en ese ensayo. B12 primario+repetición y MFA UI según procedimiento/actas. Nueva corrección funcional de carrera MFA y claves de paneles tiene regresión28/28; CI final propio pendiente al guardar este registro. Maincbc58d2 tiene CI38927150430 aprobado; PR12 integrada. PR13 contiene el siguiente incremento y requiere sus controles finales antes del merge autorizado. No comenzar otro módulo; prioridad restante: integración final y plataformas/manual de M1.

Cierre Chrome009 en PR14,16-10-2026:401unitarias/cobertura y28guardias/CD locales pasaron; integración de renovación concurrente/reserva/revocación y contrato pasaron enCI38943848070. Se conservaron dos fallos reales: navegación no exponía selección accesible (correcciónaria-selected con regresión), y carga a10concurrentes registró245errores frente cero a1/5; a5 p95/me172.9ms yavisos178.8ms. No aceptar rendimiento por esos dos grupos ni ocultar el tercero. Diagnóstico por HTTP/código/transporte/proveedor en el mismo runner, sin bajar controles. Nightly configurado, no atribuirle un disparo futuro. Dependabot Actions/Docker; npm conservaOSV ylockfile sin afirmar soporte pnpm12 del bot. CD bloqueado con pruebas negativas; sin despliegue. Estado final dePR14/CI se consulta porSHA antes del merge autorizado.


Verificación Chrome009,16-10-2026: [CI38946169443](https://github.com/AndresRaRi/marleva/actions/runs/38946169443) de0d3b7ba aprobó14trabajos, incluida compilación, integración, contrato, seguridad ySonar. Chrome156 comprobó OTP/cuenta, ambos buzones/recarga/identidad/revocación entre sesiones,55avisos/3páginas/retorno misma yotra cuenta; teclado/foco/selección/zoom200%/salida pasan.30cargas iniciales: p95 249.35ms. HTTP100cuentas a1/5/10concurrentes: cero errores y cero respuestas incorrectas; a5 p95/me157.94ms yavisos156.72ms; a10 305.88/311.69ms. Actas actuales en tests/results/chrome-readiness.json, web-test.json yaccount-performance.json. El fallo de carga anterior se conserva; no se reprodujo y su causa no quedó determinada, por lo que no se atribuye una corrección de backend inexistente. El mismo control se repetirá en main y en el workflow periódico. Revisión estática previa sin bloqueos. La entrega documental posterior exige su propioCI y el merge autorizado exige comprobar despuésCI propio de main; no se registra un resultado futuro. Android/iOS apagados, aceptación humana y lector de pantalla pendientes.


Incremento iOS009,16-10-2026: UC001/002/003/004 tienen prueba nativa acotada en iPhone18Pro/iOS27.0 Release ARM64. OTP real local, misma cuenta tras terminar/reabrir proceso, salida confirmada y acceso sin sesión tras segundo relanzamiento pasan; acta ios-test.json y capturas08–10. Correcciones canónicas de UIScene oficial, firma local y origen por plataforma; sin actualizar SDK ni migraciones. No cambia14/14implementado ni0/14aceptado: demás ramas/plataformas/accesibilidad/físico y aceptación integral pendientes. Android apagado.


## Conciliación vigente iOS —16 de octubre de 2026

Main2156078/PR19 tiene CI propio38972892582 aprobado. La [matriz vigente](proceso/MATRIZ_CASOS_M1.md#estado-vigente-conciliado--16-de-octubre-de-2026) enumera pruebas y faltantes concretos; sustituye pendientes genéricos de las fotografías anteriores sin borrar su evidencia. iOS Release comprobó ambos buzones/error/progreso tras relanzar/ID/revocación, aviso y retorno a Cuenta, MFA básico y recuperación híbrida. Esta última usa solicitud y revisor por API real, con continuación del titular y acceso final OTP/TOTP desde iOS. Acta ios-test.json y manual único. No cuenta como prueba nativa íntegra de solicitud/revisión ni B12 restaurado nuevamente. Implementación14/14 y aceptación0/14 se conservan: faltan combinaciones/plataformas/accesibilidad y aceptación integral. Android actual pausado, físico pendiente; no se afirma causa resuelta del fallo intermitente Auth. Incremento documental aún requiere sus propios CI/revisión/merge; no hereda el verde de main.


Corrección de causa Auth16-10: main934ccd8 integraPR20 pero su CI38980945133 falló en carga. CI38981993121 precisó agotamiento de puertos por conexiones nuevas del proveedor sin pool inactivo. Configuración oficial máxima20/inactiva20, guardias de destino y verificación de límites; acta auth-pool.json confirma reutilización en prueba local. Carga remota íntegra y CI propio del main posterior aún pendientes. No cambia implementación/aceptación ni se convierte una mediciónHTTP en capacidad productiva.
