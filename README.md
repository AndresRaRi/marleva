# Marleva: entrada única del proyecto

Git está en esta raíz. El código está en `marleva-local/repositorio/` y las fuentes editables en `entregables/fuentes_finales/`. El historial se conserva en commits, sin copias documentales numeradas ni ZIP de rutina. No hay remoto ni publicación.

## 1. Lectura en orden

1. Instrucciones del usuario y [AGENTS raíz](AGENTS.md), sincronizado de solo lectura.
2. [00: guía y reglas](entregables/fuentes_finales/00_GUIA_PRINCIPAL_MARLEVA.md).
3. [01: estado, decisiones y prompt](entregables/fuentes_finales/01_ESTADO_Y_DECISIONES_MARLEVA.md).
4. [02: alcance y diseño](entregables/fuentes_finales/02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md).
5. [03: evidencia y límites](entregables/fuentes_finales/03_REFERENTES_Y_EVIDENCIA_MARLEVA.md).
6. [Protocolo técnico](marleva-local/repositorio/docs/proceso/PROCESO_DESARROLLO_MARLEVA.md) y [matriz M1](marleva-local/repositorio/docs/proceso/MATRIZ_CASOS_M1.md).
7. Caso activo: secuencia y pasos, DBML/DDL, YAML/Swagger, código, pruebas y resultados. Leer también los restantes archivos propios accesibles por ruta y nombre; inventariar desde la raíz. Metadatos no prueban lectura.

## 2. Flujo por tarea

1. Identificar caso, alcance, dependencias y salida.
2. Concordar reglas, estados, secuencia, datos, API y pruebas antes del código.
3. Implementar dentro de la autorización; revisar diseño visual antes de modificar pantallas.
4. Ejecutar unitarias, integración, performance y regresión pertinentes; corregir fallos.
5. Releer finales y enlaces; actualizar solo la fuente afectada.
6. Revisar diferencias e ignorados, guardar commit local y continuar la siguiente dependencia. Informar avances reales al menos cada 60 segundos durante la ejecución.

## 3. Un archivo por función

Las cuatro fuentes son canónicas. Los antecedentes retirados se recuperan desde Git, commit `7a0ec5a`. `sources/` y AGENTS raíz son la excepción impuesta por sincronización: referencias de solo lectura, sin vigencia como copias editables.

El modelo físico y el objetivo tienen funciones distintas hasta completar la migración. DDL, Swagger y tipos son derivados necesarios; migraciones y actas de corridas distintas son evidencia e historial técnico. No eliminarlos como copias. Secretos, herramientas descargadas, dependencias, cachés y builds quedan fuera de Git; su reconstrucción debe documentarse.

## 4. Continuidad

MAR-CHAT-004 sigue abierto; M1 incompleta. Prompt completo en 01 y plantillas en 00. Chat abierto no significa proceso ejecutándose. FIN solo al cerrar realmente el tema; guardar, hacer commit y subir son acciones distintas.

Git de CommandLineTools está disponible. Xcode 27.0 está instalado y seleccionado; comprobación inicial pasada. Runtimes y dispositivos de simulador todavía vacíos. Builds y pruebas físicas pendientes.
