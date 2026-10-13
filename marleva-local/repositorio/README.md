# Marleva local

Repositorio local: esta carpeta `marleva-local/repositorio`. API en `apps/api`, cliente en `apps/client`, herramientas/servicios en `infra/local`. Git y `.gitignore` están en la raíz del proyecto, dos niveles arriba. Hay commits locales, sin remoto ni subida. [Entrada de lectura](../../README.md).

Leer primero [proceso obligatorio y auditoría de todas las observaciones](docs/proceso/PROCESO_DESARROLLO_MARLEVA.md) y [AGENTS.md](AGENTS.md), además de las cuatro fuentes vigentes en `../../entregables/fuentes_finales`.

Estado: base/M1 en construcción y revisión documental. Código existente preservado, sin aprobación de diseño visual ni separación completa por capas. Arranque local y regresión del incremento UC008 comprobados en005. Las evidencias anteriores al traslado son históricas; comprobar estado vivo antes de usar servicios. No reanudar programación de pantallas/módulos antes de cerrar diferencias documentales.

| Material | Carpeta |
|---|---|
| Arquitectura, requisitos y protocolo | docs/proceso |
| Secuencias por módulo/caso | docs/diagramas/secuencia |
| Modelo DBML y DDL generado | docs/modelado-datos |
| OpenAPI YAML y revisión Swagger | docs/apis |
| Unitarias / integración / performance | tests/unit, tests/integration, tests/performance |
| Fixtures y resultados | tests/fixtures, tests/results |
| Manifiesto y procedencia de instalaciones | infra/local/manifest.json, infra/local/toolchain.json |

Las herramientas del proyecto se invocan con `./scripts/tool`; no editar runtime Codex ni usar instalaciones globales implícitas. Versiones exactas y hashes constan en manifiestos. Las carpetas de herramientas, descargas y secretos están ignoradas por Git y se distinguen del código.

La reubicación conserva datos/volúmenes de Colima/Supabase. Cachés y artefactos nativos contienen rutas de la ubicación anterior: deben regenerarse y comprobarse antes de volver a construir. Arranque/parada de API y arranque de servicios locales comprobados en005; repetibilidad/restauración todavía pendientes. No ejecutar un DDL completo ni reset contra una base existente para compensar un fallo.
