# Marleva

Productos y servicios entre vecinos de los siete desarrollos de Gran Santa Fe, Mérida. Cualquiera podrá explorar; solo residentes actuales podrán comprar y ofrecer. Domicilio y documentos particulares son privados. Este proyecto todavía usa datos ficticios y pagos simulados; M1 está incompleta.

## Dónde está cada cosa

| Material | Ubicación |
|---|---|
| Reglas, acuerdos, diseño y evidencia | entregables/fuentes_finales/00–03 |
| Aplicación y servicios | marleva-local/repositorio/apps/client y apps/api |
| Datos, API, procesos y pruebas | marleva-local/repositorio/docs y tests |
| Herramientas/configuración locales | marleva-local/repositorio/infra/local; secretos y herramientas ignorados |
| Historial Git | Esta raíz; origin configurado al repositorio indicado por usuario; sincronización de la rama al entregar |

## Leer antes de trabajar

1. Instrucciones del usuario y [AGENTS](AGENTS.md), sincronizado de solo lectura.
2. [00: guía](entregables/fuentes_finales/00_GUIA_PRINCIPAL_MARLEVA.md), calidad en §9 y Git en §13.
3. [01: estado y continuidad](entregables/fuentes_finales/01_ESTADO_Y_DECISIONES_MARLEVA.md).
4. [02: alcance y diseño](entregables/fuentes_finales/02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md).
5. [03: evidencia](entregables/fuentes_finales/03_REFERENTES_Y_EVIDENCIA_MARLEVA.md).
6. [Protocolo](marleva-local/repositorio/docs/proceso/PROCESO_DESARROLLO_MARLEVA.md), [matriz M1](marleva-local/repositorio/docs/proceso/MATRIZ_CASOS_M1.md) y archivos del caso: UC/SEQ/pasos/datos/API/pruebas.
7. Inventariar desde esta raíz; leer nuevos/modificados y registrar límites. Metadatos o resúmenes no acreditan lectura completa.

## Revisar localmente

[Instructivo M1 con capturas reales](marleva-local/repositorio/docs/revision/M1/INSTRUCTIVO_M1.md). Aplicación: https://localhost:8443; capturador ficticio: http://127.0.0.1:54324. Ambos son locales. Pasos técnicos de arranque/parada en [README del código](marleva-local/repositorio/README.md). Abrir archivos y contratos en IDE también sirve para revisar backend; no sustituye probar el recorrido.

M1 tiene implementadas las14salidas de su matriz. Chrome/API comprueban acceso, cuenta, correo por ambos buzones, avisos/retorno, salida entre sesiones y recuperación MFA. B12 esencial Chrome está probado y repetido desde un mismo backup. [Panorama único](marleva-local/repositorio/docs/avance.md) y [actas B12](marleva-local/repositorio/docs/proceso/RECUPERACION_B12_M1.md); no equivalen a aceptación humana ni a operación productiva.

Maine0aefd7 integra PR8–14 yPR19–22; PR22 tuvo [CI38998652859 completo aprobado](https://github.com/AndresRaRi/marleva/actions/runs/38998652859). Su [CI propio38999374796](https://github.com/AndresRaRi/marleva/actions/runs/38999374796) se consulta por eseSHA, sin heredar el verde de la PR. C06 separa cuenta/sesiones/correo/MFA detrás de puertos reales y pasó regresión local; integración/CI propios pendientes del nuevo incremento. Los catorce casos siguen separados de aceptación; pendientes exactos C01–C06 en la matriz M1. Chrome tiene manual y verificaciones integradas. El usuario reanudó iOS: acceso, sesión tras relanzar y salida están comprobados localmente en Release; [acta](marleva-local/repositorio/tests/results/ios-test.json). Android sigue apagado; iOS completo y aceptación permanecen separados. No borrar recursos ni crear trabajo paralelo. No hay módulo M2–M10 completo; M3 conserva su avance aislado y el simulador no acredita M6.

## Cada proceso y chat

Comprobar Git, fuentes y README antes de cambiar. Concordar reglas/estados/secuencia/datos/API/pruebas; revisar diseño antes de pantallas. Implementar un caso integrado y probar sus fallos, permisos, concurrencia, recuperación, rendimiento y regresión. Registrar resultados y corregirlos; no aprobar solo por tener carpetas.

Al terminar: releer finales, comprobar enlaces/diff/ignorados, actualizar README si ya no coincide y guardar commit claro tipo(módulo/caso): resultado. Al cerrar el chat, commit final y SHA, instructivo/revisión local, funcionalidades cubiertas/faltantes y porcentajes con criterios/evidencia de docs/avance.md. FIN solo al cerrar el tema, no por terminar una subtarea.

Remoto: https://github.com/AndresRaRi/marleva.git. El 14-10 se subió codex/fix-quality-and-rules, se configuró su seguimiento y pull --ff-only confirmó actualización; comprobar estado/divergencias antes de sincronizar, sin descartar cambios locales. Guardar, hacer commit, subir a Fuentes y publicar son acciones distintas. sources/ y AGENTS raíz son referencias de solo lectura. Historial por Git, sin copias vN/fecha/ZIP de rutina.

Plan técnico aprobado: [decisiones únicas](marleva-local/repositorio/docs/adr/001-consolidacion-tecnica.md), [avance funcional](marleva-local/repositorio/docs/avance.md) y la guía 00. La fase 1 del CI pasó en GitHub. En fase 2 pasaron integración, contrato, web, calidad y CodeQL en GitHub; el gráfico de dependencias está habilitado y su control pasó. Las correcciones de seguridad pasaron en GitHub sobre 9cdde72: dos paquetes retirados y dos con parches locales verificables; OSV conserva sus avisos originales. El primer pipeline completo pasó en 38773873030 y la negativa de seguridad fue rechazada; la correspondencia quedó restaurada. PR #2 ya integrado; CI propio de main b12bfca pasó en 38778339532. PR #3 y #4 integrados por el usuario; main 40c6583 tiene CI propio correcto en 38789774598. SonarQube Cloud Free privado comprobado en [38821867592](https://github.com/AndresRaRi/marleva/actions/runs/38821867592): base/cambio OK, defecto S1764 rechazado por gate nativo y comparador, corrección OK. Sin tarjeta ni gasto; acta tests/results/sonar-cloud.json. Community conserva su guardia histórica; restantes componentes de fase 3 y aceptación M1 pendientes. Aceptación completa de M1 pendiente. Hooks locales: git config core.hooksPath .githooks; requieren herramientas preparadas y no corrigen archivos automáticamente.

Recuperación de operadores: siete operaciones backend integradas, roles persistidos y quinta migración aplicada localmente. Revisión y límites en el instructivo M1 y tests/results/recovery-api.json. Cliente parcial implementado; recorrido integral de UI/plataformas y aceptación pendientes.

El PR #1 de recuperación fue incorporado a main. El pipeline continúa en codex/feat-ci-pipeline, actualizado mediante merge; [estado por etapas](marleva-local/repositorio/docs/avance.md). No se fusiona ni despliega automáticamente.

Cierre MAR-CHAT-005 solicitado el 15-10-2026: PR #2 integrado a main en b12bfca. [Auditoría, contradicciones, limpieza propuesta, chats y siguiente paso](marleva-local/repositorio/docs/proceso/CIERRE_MAR_CHAT_005.md). La consolidación por procedencia quedó integrada en PR #4; se conservan cambios preexistentes readonly fuera de commits propios. MAR-CHAT-006 continúa M1; Sonar Cloud corresponde a MAR-CHAT-007, con estado y límites en 01/ADR002.

Consolidación vigente: MAR-CHAT-009, [estado y cola única](entregables/fuentes_finales/01_ESTADO_Y_DECISIONES_MARLEVA.md#8-consolidación-única-mar-chat-009). MAR-CHAT-006/008 cerrados para reunir pendientes. PR8 yPR9 integradas en main422ec72: M1/M3 y diseño M2/M8; ramas y copias conservadas. Estado de CI y pendientes en01; no heredar resultados de otrosSHA. Sin borrados. Copias y límites de lectura en inventario; no se acredita M1/M3 completos o aceptados.

## M3 aislado — MAR-CHAT-008

Trabajo aislado de008 incorporado a la consolidación009. [Revisión y arranque M3](marleva-local/repositorio/docs/revision/M3/INSTRUCTIVO_M3.md). Catálogo, filtros, cursor, detalle y perfil públicos con datos ficticios; API3103, web8103 y PostgreSQL55432 exclusivos. No conecta identidad/base de M1 ni publica. Catálogo y gestión privada inyectable con fotos probados en aislamiento; identidad/elegibilidad/revisión reales, plataformas y aceptación pendientes. Estado y pruebas en la matriz M3; no declarar módulo completo ni reutilizar resultados de M1.

Entrega Chrome009: [CI38946169443](https://github.com/AndresRaRi/marleva/actions/runs/38946169443) aprobó14trabajos para0d3b7ba. Teclado/zoom y carga100cuentas a1/5/10 sin errores comprobados; guía y actas actualizadas. La integración final se verifica en PR14 yCI del main resultante, sin atribuir resultados futuros.
