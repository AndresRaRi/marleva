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

Disponible y comprobado parcialmente: acceso/cuenta/salida/cambio por ambos buzones/MFA básico, cursor de avisos, correo durable y backend B09 de archivos ficticios privados. Android emulado comprobó acceso OTP, error, cuenta, persistencia tras reinicio y salida sin recuperar sesión revocada. Pendientes: recuperación/restauración, revisión visual, Safari/iOS/físicos y demás flujos nativos/casos restantes. Google/Supabase queda pendiente y no detiene lo independiente. No hay módulo M2–M10 completo; el simulador no acredita M6.

B12 comprobó filas y contenido de una copia aislada, reaplicó un borrado, recuperó una caída de Storage, rechazó accesos antiguos y permitió OTP nuevo conservando cuentas/permisos. La copia perdió atributos de Storage: el destino se reparó solo para los tres fixtures; la copia completa se repitió conservando atributos; la cola restaurada pasó en ensayo separado; recuperación backend de operadores integrada; faltan ensayo integral y plataformas. [Procedimiento y resultados](marleva-local/repositorio/docs/proceso/RECUPERACION_B12_M1.md).

## Cada proceso y chat

Comprobar Git, fuentes y README antes de cambiar. Concordar reglas/estados/secuencia/datos/API/pruebas; revisar diseño antes de pantallas. Implementar un caso integrado y probar sus fallos, permisos, concurrencia, recuperación, rendimiento y regresión. Registrar resultados y corregirlos; no aprobar solo por tener carpetas.

Al terminar: releer finales, comprobar enlaces/diff/ignorados, actualizar README si ya no coincide y guardar commit claro tipo(módulo/caso): resultado. Al cerrar el chat, commit final y SHA, instructivo/revisión local, funcionalidades cubiertas/faltantes y porcentajes con criterios/evidencia de docs/avance.md. FIN solo al cerrar el tema, no por terminar una subtarea.

Remoto: https://github.com/AndresRaRi/marleva.git. El 14-10 se subió codex/fix-quality-and-rules, se configuró su seguimiento y pull --ff-only confirmó actualización; comprobar estado/divergencias antes de sincronizar, sin descartar cambios locales. Guardar, hacer commit, subir a Fuentes y publicar son acciones distintas. sources/ y AGENTS raíz son referencias de solo lectura. Historial por Git, sin copias vN/fecha/ZIP de rutina.

Plan técnico aprobado: [decisiones únicas](marleva-local/repositorio/docs/adr/001-consolidacion-tecnica.md), [avance funcional](marleva-local/repositorio/docs/avance.md) y la guía 00. La fase 1 del CI pasó en GitHub. En fase 2 pasaron integración, contrato, web, calidad y CodeQL en GitHub; el gráfico de dependencias está habilitado y su control pasó. Las correcciones de seguridad pasaron en GitHub sobre 9cdde72: dos paquetes retirados y dos con parches locales verificables; OSV conserva sus avisos originales. El primer pipeline completo pasó en 38773873030 y la negativa de seguridad fue rechazada; la correspondencia quedó restaurada. PR #2 ya integrado; CI propio de main b12bfca pasó en 38778339532. PR #3 y #4 integrados por el usuario; main 40c6583 tiene CI propio correcto en 38789774598. SonarQube Cloud Free privado comprobado en [38821867592](https://github.com/AndresRaRi/marleva/actions/runs/38821867592): base/cambio OK, defecto S1764 rechazado por gate nativo y comparador, corrección OK. Sin tarjeta ni gasto; acta tests/results/sonar-cloud.json. Community conserva su guardia histórica; restantes componentes de fase 3 y aceptación M1 pendientes. Aceptación completa de M1 pendiente. Hooks locales: git config core.hooksPath .githooks; requieren herramientas preparadas y no corrigen archivos automáticamente.

Recuperación de operadores: siete operaciones backend integradas, roles persistidos y quinta migración aplicada localmente. Revisión y límites en el instructivo M1 y tests/results/recovery-api.json. Cliente parcial implementado; recorrido integral de UI/plataformas y aceptación pendientes.

El PR #1 de recuperación fue incorporado a main. El pipeline continúa en codex/feat-ci-pipeline, actualizado mediante merge; [estado por etapas](marleva-local/repositorio/docs/avance.md). No se fusiona ni despliega automáticamente.

Cierre MAR-CHAT-005 solicitado el 15-10-2026: PR #2 integrado a main en b12bfca. [Auditoría, contradicciones, limpieza propuesta, chats y siguiente paso](marleva-local/repositorio/docs/proceso/CIERRE_MAR_CHAT_005.md). La consolidación por procedencia quedó integrada en PR #4; se conservan cambios preexistentes readonly fuera de commits propios. MAR-CHAT-006 continúa M1; Sonar Cloud corresponde a MAR-CHAT-007, con estado y límites en 01/ADR002.

Consolidación vigente: MAR-CHAT-009, [estado y cola única](entregables/fuentes_finales/01_ESTADO_Y_DECISIONES_MARLEVA.md#8-consolidación-única-mar-chat-009). MAR-CHAT-006/008 cerrados para reunir pendientes. PR8 reúne M1/M3 y diseño M2/M8; PR9 conservada con CI propio correcto. Estado del CI conjunto y pendientes en01; no heredar resultados de otrosSHA. Merge a main autorizado tras CI y revisión final; sin borrados. Copias y límites de lectura en inventario; no se acredita M1/M3 completos o aceptados.

## M3 aislado — MAR-CHAT-008

Trabajo aislado de008 incorporado a la consolidación009. [Revisión y arranque M3](marleva-local/repositorio/docs/revision/M3/INSTRUCTIVO_M3.md). Catálogo, filtros, cursor, detalle y perfil públicos con datos ficticios; API3103, web8103 y PostgreSQL55432 exclusivos. No conecta identidad/base de M1 ni publica. Catálogo y gestión privada inyectable con fotos probados en aislamiento; identidad/elegibilidad/revisión reales, plataformas y aceptación pendientes. Estado y pruebas en la matriz M3; no declarar módulo completo ni reutilizar resultados de M1.
