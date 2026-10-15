# Contratos M3

El contrato canónico disponible es [openapi.yaml](openapi.yaml): cuatro lecturas públicas, incluida entrega de fotos. [Swagger](swagger.html) se genera sin permitir solicitudes. Los tipos del cliente y JSON son derivados.

[Contrato privado objetivo](openapi-target.yaml) y [Swagger objetivo](swagger-target.html): cinco operaciones diseñadas, sin rutas HTTP montadas. No aceptan un rol del cliente; requieren integrar sesión M1, elegibilidad M2 y revisión M8 vigentes. Los casos internos de prueba no acreditan esos proveedores.

Generar desde la raíz del código: `./scripts/tool node scripts/m3-docs.mjs`. Usa herramientas fijadas del lockfile existente. No genera ni modifica documentos de M1. DDL actual incluye restricciones y estadísticas de expresión suplementarias a DBML; migraciones M3 aplicadas quedan inmutables.

Fotos: ingreso interno con actores ficticios, validación/recodificación y entrega pública de derivados implementados. Solo fotos listas de la versión pública vigente aparecen en photos. Originales privados, sin carga HTTP ni URL arbitraria. La visualización web está implementada y probada; el ingreso autenticado requiere integración posterior.
