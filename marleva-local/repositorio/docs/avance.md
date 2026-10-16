# Avance de Marleva por criterios funcionales

Fecha: 15 de octubre de 2026, America/Merida. Fuente única de porcentajes. Línea base: 14 criterios de la matriz M1 y sus secuencias 001–014, incluido el soporte de base necesario para M1. No contar pruebas, archivos o commits.

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
| UC008 | Avisos durables y navegación paginada propia en cliente | No | No | Backend cursor/outbox probado; cliente todavía sin siguiente página/operación completa |
| UC009 | Recuperar acceso y retomar acción interna segura | No | No | Mensaje de límite de buzón presente; retorno de acción completa pendiente |
| UC010 | Salud/configuración/dependencias locales y fallo recuperable | Sí | No | HealthController/config/adaptador; completar caídas/rendimiento/regresión de plataformas |
| UC011 | Permiso/lectura/borrado de archivo ficticio privado con integridad | Sí | No | B09 código y actas files/recovery; sin pantalla M2 exigida; aceptación/recuperación completa pendiente |
| UC012 | Simulador aislado: idempotencia, eventos, fallos y reembolso | Sí | No | PaymentSimulator y pruebas; no acredita M6; completar contrato/medición/aceptación aplicables |
| UC013 | Restauración/repetibilidad sin revivir accesos o borrados | No | No | Fases B12 y cola restaurada probadas en ensayos separados; plataformas/ensayo integral restantes |
| UC014 | Recuperación administrativa MFA con otro autorizado | Sí | No | Siete operaciones backend integradas y roles persistidos; recovery-api.json y recovery-schema.json. UI, plataformas y aceptación pendientes |

Implementación M1 = 11/14 = 78,57%. Barra: ████████░░. Aceptación M1 = 0/14 = 0%. El numerador de aceptación cero refleja criterios completos aún no entregados/aceptados; no ausencia de código o pruebas. El encabezado muestra 78,57%, nunca la cobertura como avance funcional.

| Módulo | Implementación | Aceptación | Estado |
|---|---|---|---|
| M1 Acceso/cuenta | 11/14: 78,57% | 0/14: 0% | Criterios arriba; pendientes reales |
| M2 Comunidad/oferentes | 0% | 0% | Diseño; sin implementación del módulo |
| M3 Catálogo | 3/9: 33,33% | 0/9: 0% | Catálogo público aislado; criterios abajo |
| M4 Compra directa | 0% | 0% | Diseño; sin implementación |
| M5 Cotización | 0% | 0% | Diseño; sin implementación |
| M6 Dinero | 0% | 0% | Diseño; simulador no suma como módulo |
| M7 Atención | 0% | 0% | Diseño; sin implementación |
| M8 Operación | 0% | 0% | Diseño; operador básico M1 no es M8 |
| M9 Avisos transversales | 0% | 0% | Infraestructura M1 no acredita módulo completo |
| M10 Medición | 0% | 0% | Diseño; sin implementación |

Proyecto: Por calcular. No promediar módulos con denominadores diferentes ni inventar criterios de M2–M10. Primero fijar sus matrices funcionales antes de calcular el total; M3 tiene autorización paralela y cálculo propio abajo; M2 yM4–M10 permanecen0% de implementación. General: no es un módulo funcional, Por calcular.

## Verificación técnica independiente del porcentaje

Tipado/lint/formato global y regresión API/Chrome pasaron; build API/web pasó. Cobertura de lógica medida con fuente TS y AccountService incluido superó 80% global; resumen en tests/results/coverage-summary.json. Cobertura no implica funcionalidad completa ni Sonar/CI aprobados. Manual único en docs/revision/M1/INSTRUCTIVO_M1.md; usuario revisará. Google pendiente, diseño visual nuevo pendiente de alta prioridad en 01. Datos ficticios; no despliegue.

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

Implementación M3=3/9=33,33%. Barra: ███░░░░░░░. Aceptación=0/9=0%. M1 conserva su cálculo anterior; Proyecto sigue Por calcular. Las pruebas/archivos/commits no suman criterios. No integración a main ni operación real.

15-10-2026, incremento gestión: UC004/005/006/007/009 tienen recorridos completos en composición aislada con identidad ficticia (87 pruebas M3 y nueve comprobaciones de navegador). Se conserva el numerador3/9 por criterio de recorrido autenticado integrado con proveedor real; el avance aislado se describe en evidencia, sin presentarlo como aceptación. Usuario autoriza ahora integración a main tras revisión/CI, sustituyendo límite anterior; no despliegue.
