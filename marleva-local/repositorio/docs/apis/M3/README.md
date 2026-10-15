# Contratos M3

El contrato canónico disponible es [openapi.yaml](openapi.yaml): tres lecturas públicas. [Swagger](swagger.html) se genera sin permitir solicitudes. Los tipos del cliente y JSON son derivados.

[Contrato privado objetivo](openapi-target.yaml) y [Swagger objetivo](swagger-target.html): cinco operaciones diseñadas, sin rutas HTTP montadas. No aceptan un rol del cliente; requieren integrar sesión M1, elegibilidad M2 y revisión M8 vigentes. Los casos internos de prueba no acreditan esos proveedores.

Generar desde la raíz del código: `./scripts/tool node scripts/m3-docs.mjs`. Usa herramientas fijadas del lockfile existente. No genera ni modifica documentos de M1. DDL actual incluye restricciones y estadísticas de expresión suplementarias a DBML; migraciones M3 aplicadas quedan inmutables.

Fotos: tabla y reglas diseñadas; carga/análisis/derivados/entrega de imágenes pendientes. Las respuestas actuales llevan photos vacío. No se aceptan URLs arbitrarias ni archivos sin validar. Ninguna fila o carpeta acredita un pipeline de imágenes.
