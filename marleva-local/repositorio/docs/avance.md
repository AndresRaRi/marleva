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
| M3 Catálogo | 0% | 0% | Diseño; sin implementación |
| M4 Compra directa | 0% | 0% | Diseño; sin implementación |
| M5 Cotización | 0% | 0% | Diseño; sin implementación |
| M6 Dinero | 0% | 0% | Diseño; simulador no suma como módulo |
| M7 Atención | 0% | 0% | Diseño; sin implementación |
| M8 Operación | 0% | 0% | Diseño; operador básico M1 no es M8 |
| M9 Avisos transversales | 0% | 0% | Infraestructura M1 no acredita módulo completo |
| M10 Medición | 0% | 0% | Diseño; sin implementación |

Proyecto: Por calcular. No promediar módulos con denominadores diferentes ni inventar criterios de M2–M10. Primero fijar sus matrices funcionales antes de calcular el total; todos permanecen 0% de implementación, fuera del alcance de construcción de esta etapa. General: no es un módulo funcional, Por calcular.

## Verificación técnica independiente del porcentaje

Tipado/lint/formato global y regresión API/Chrome pasaron; build API/web pasó. Cobertura de lógica medida con fuente TS y AccountService incluido superó 80% global; resumen en tests/results/coverage-summary.json. Cobertura no implica funcionalidad completa ni Sonar/CI aprobados. Manual único en docs/revision/M1/INSTRUCTIVO_M1.md; usuario revisará. Google pendiente, diseño visual nuevo pendiente de alta prioridad en 01. Datos ficticios; no despliegue.

## Pipeline de integración continua

15-10-2026. General no tiene porcentaje funcional. Rama codex/feat-ci-pipeline parte de 1d75de3; el usuario fusionó PR #1 y main quedó incorporado mediante dfeb9a3. Pipeline sin fusión.

| Fase | Preparación local | Resultado en GitHub |
|---|---|---|
| 1. Setup, calidad, capas/contratos, unitarias y build | Reglas nuevas corrigieron 21 errores; 122 pruebas, cobertura ampliada y trinquete pasan; API/web compilan. Docker mínimo, arranque/salud y Trivy pasan sin altas/críticas | Verde 38679348007; negativa 38679688035 rechazada por capas/ciclo; reversión ee171cf verde en 38679887976. Fase 1 verificada |
| 2. Seguridad, integración y web accesible | 139 unitarias y 38 integraciones; migraciones cero/previa, axe sin infracciones en tres estados y Lighthouse accesibilidad 1.00 en tres corridas. Correcciones HTTP verificadas; contrato 24/24 y 1480 casos pasó, con aviso de falta de sesión en fuzz; suite de siete operaciones UC014 pasó. Seguridad bloqueada por cuatro paquetes sin parche publicado | Run 38763129847 sobre 412d56d: calidad, arquitectura/contratos, unitarias, CodeQL, web y contrato pasaron. Integración falló al crear contenedor SQL; corrección local pasó 17 casos y preparación repetida. OSV bloquea; revisión de dependencias requiere habilitar su gráfico. Build omitido por dependencias fallidas. Fase no aprobada |
| 3. Sonar, rendimiento, nightly, CD desactivado y dependabot | Comparación temporal Sonar aprobada, sin SonarCloud/gasto | No ejecutada |

Avisos de longitud de funciones permanecen visibles como pidió el usuario; complejidad y anidación son errores. Una ejecución local no acredita CI verde. Fases 2–3 no se activan hasta cerrar fase previa. El [ADR002](adr/002-pipeline-ci.md) conserva versiones, fuentes, licencias y límites.

Verificación posterior sobre 69672a5, run [38764322440](https://github.com/AndresRaRi/marleva/actions/runs/38764322440): calidad, arquitectura/contratos, unitarias, CodeQL, integración, contrato y web pasaron. La preparación Linux quedó corregida. Seguridad falla por OSV y revisión de dependencias por el gráfico deshabilitado; build permanece omitido por esas dependencias. Evidencia: tests/results/ci-phase2-verified.json. Fase 2 bloqueada, sin negativa deliberada/reversión posteriores ni fase 3; no se pide repetir controles verdes sin cambios relevantes. Borrador PR #2 abierto, sin fusión ni despliegue.

Remediación del 15-10-2026: Dependency graph habilitado con autorización del usuario; dependency-review pasó en el reensayo de 38767566053. Lighthouse/YAML actualizados retiran extract-zip/sprintf-js. braces/node-forge conservan sus versiones originales con parches locales y evidencia CycloneDX; 14 pruebas dirigidas pasaron, incluidas negativas de integridad/clasificación. OSV original aún identifica dos versiones; la comprobación adicional valida hashes del parche/lockfile/archivos instalados y ejecuta regresiones en la misma corrida antes de reconocer su corrección. Sin avisos pendientes sin corrección comprobada en el ensayo local. Falta comprobar el incremento completo en GitHub; no acreditar fase 2 ni cambiar avance funcional por este resultado.
