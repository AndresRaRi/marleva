# Marleva

Productos y servicios entre vecinos de los siete desarrollos de Gran Santa Fe, Mérida. Cualquiera podrá explorar; solo residentes actuales podrán comprar y ofrecer. Domicilio y documentos particulares son privados. Este proyecto todavía usa datos ficticios y pagos simulados; M1 está incompleta.

## Dónde está cada cosa

| Material | Ubicación |
|---|---|
| Reglas, acuerdos, diseño y evidencia | entregables/fuentes_finales/00–03 |
| Aplicación y servicios | marleva-local/repositorio/apps/client y apps/api |
| Datos, API, procesos y pruebas | marleva-local/repositorio/docs y tests |
| Herramientas/configuración locales | marleva-local/repositorio/infra/local; secretos y herramientas ignorados |
| Historial Git | Esta raíz; sin remoto por decisión actual del usuario |

## Leer antes de trabajar

1. Instrucciones del usuario y [AGENTS](AGENTS.md), sincronizado de solo lectura.
2. [00: guía](entregables/fuentes_finales/00_GUIA_PRINCIPAL_MARLEVA.md), incluida§13 de revisión/Git/calidad.
3. [01: estado y continuidad](entregables/fuentes_finales/01_ESTADO_Y_DECISIONES_MARLEVA.md).
4. [02: alcance y diseño](entregables/fuentes_finales/02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md).
5. [03: evidencia](entregables/fuentes_finales/03_REFERENTES_Y_EVIDENCIA_MARLEVA.md).
6. [Protocolo](marleva-local/repositorio/docs/proceso/PROCESO_DESARROLLO_MARLEVA.md), [matriz M1](marleva-local/repositorio/docs/proceso/MATRIZ_CASOS_M1.md) y archivos del caso:UC/SEQ/pasos/datos/API/pruebas.
7. Inventariar desde esta raíz; leer nuevos/modificados y registrar límites. Metadatos o resúmenes no acreditan lectura completa.

## Revisar localmente

[Instructivo M1 con capturas reales](marleva-local/repositorio/docs/revision/M1/INSTRUCTIVO_M1.md). Aplicación: https://localhost:8443; capturador ficticio:http://127.0.0.1:54324. Ambos son locales. Pasos técnicos de arranque/parada en [README del código](marleva-local/repositorio/README.md). Abrir archivos ycontratos en IDE también sirve para revisar backend; no sustituye probar el recorrido.

Disponible y comprobado parcialmente: acceso/cuenta/salida/cambio por ambos buzones/MFA básico, cursor de avisos, correo durable y backend B09 de archivos ficticios privados. Pendientes: recuperación/restauración, revisión visual, Safari/nativos/físicos y casos restantes. Google/Supabase queda pendiente y no detiene lo independiente. No hay módulo M2–M10 completo; el simulador no acredita M6.

## Cada proceso y chat

Comprobar Git, fuentes y README antes de cambiar. Concordar reglas/estados/secuencia/datos/API/pruebas; revisar diseño antes de pantallas. Implementar un caso integrado y probar sus fallos, permisos, concurrencia, recuperación, rendimiento y regresión. Registrar resultados y corregirlos; no aprobar solo por tener carpetas.

Al terminar: releer finales, comprobar enlaces/diff/ignorados, actualizar README si ya no coincide y guardar commit claro tipo(módulo/caso): resultado. Al cerrar el chat, commit final ySHA, instructivo/revisión local, funcionalidades cubiertas/faltantes y porcentajes con criterios/evidencia de00 §13. FIN solo al cerrar el tema, no por terminar una subtarea.

Sin remoto: comprobar commits locales; no afirmar pull/push. Si posteriormente existe un remoto autorizado, actualizar sin descartar cambios locales antes de trabajar. Guardar, hacer commit, subir aFuentes y publicar son acciones distintas. sources/ yAGENTS raíz son referencias de solo lectura. Historial por Git, sin copias vN/fecha/ZIP de rutina.
