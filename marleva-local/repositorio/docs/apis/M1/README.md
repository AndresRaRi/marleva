# M1: documentación API

[OpenAPI YAML canónico](openapi.yaml), [JSON generado](openapi.json), [Swagger local](swagger.html). Vista sin Try it out ni credenciales. No subida/publicación.14 acciones documentadas, incluidos Health y condiciones de transporte. Contrato parcial observado, con brechas explícitas; validación runtime/semántica y cobertura completa aún pendientes. Los tipos se generan desde el JSON derivado del YAML. No editar copias generadas a mano.

Regenerar desde raíz: `./scripts/tool node scripts/generate-documentation.mjs` y `./scripts/tool pnpm contracts`. DBML se valida al exportar; OpenAPI se valida con Swagger Parser. La validación sintáctica no acredita coherencia con todos los estados, implementación o pruebas.

Contratos objetivo separados: [recuperación MFA](openapi-objetivo-recuperacion.yaml),7operaciones; [B09 archivos](openapi-objetivo-archivos.yaml),3operaciones, y [Swagger B09](swagger-objetivo-archivos.html). No implementados. Generar con scripts/generate-m1-target.mjs; DATA002 objetivo13tablas, no esquema aplicado.
