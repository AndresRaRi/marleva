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

B12 comprobó filas y contenido de una copia aislada, reaplicó un borrado, recuperó una caída de Storage, rechazó accesos antiguos y permitió OTP nuevo conservando cuentas/permisos. La copia perdió atributos de Storage: el destino se reparó solo para los tres fixtures; la copia completa se repitió conservando atributos; faltan MFA, cola, migración y plataformas. [Procedimiento y resultados](marleva-local/repositorio/docs/proceso/RECUPERACION_B12_M1.md).

## Cada proceso y chat

Comprobar Git, fuentes y README antes de cambiar. Concordar reglas/estados/secuencia/datos/API/pruebas; revisar diseño antes de pantallas. Implementar un caso integrado y probar sus fallos, permisos, concurrencia, recuperación, rendimiento y regresión. Registrar resultados y corregirlos; no aprobar solo por tener carpetas.

Al terminar: releer finales, comprobar enlaces/diff/ignorados, actualizar README si ya no coincide y guardar commit claro tipo(módulo/caso): resultado. Al cerrar el chat, commit final y SHA, instructivo/revisión local, funcionalidades cubiertas/faltantes y porcentajes con criterios/evidencia de docs/avance.md. FIN solo al cerrar el tema, no por terminar una subtarea.

Remoto: https://github.com/AndresRaRi/marleva.git. El 14-10 se subió codex/fix-quality-and-rules, se configuró su seguimiento y pull --ff-only confirmó actualización; comprobar estado/divergencias antes de sincronizar, sin descartar cambios locales. Guardar, hacer commit, subir a Fuentes y publicar son acciones distintas. sources/ y AGENTS raíz son referencias de solo lectura. Historial por Git, sin copias vN/fecha/ZIP de rutina.

Plan técnico aprobado: [decisiones únicas](marleva-local/repositorio/docs/adr/001-consolidacion-tecnica.md), [avance funcional](marleva-local/repositorio/docs/avance.md) y la guía 00. El 14-10 pasaron tipado, lint, formato, 67 pruebas unitarias, cobertura de lógica de cuenta y regresión Chrome. Sonar, CI y la aceptación completa de M1 siguen pendientes. Hooks locales: git config core.hooksPath .githooks; requieren herramientas preparadas y no corrigen archivos automáticamente.
