# Contratos propios integrales M2/M8

MAR-CHAT-007 ·15-10-2026 · objetivo documental0.4.0. M2 UC001–011 y M8 UC001–005. **Sin implementación ni edición de contratos compartidos/M1.**

- [YAML canónico](openapi.yaml):61 operaciones propias,82 esquemas; ejemplos positivos/negativos, errores, autorización, CAS, recibos y proyecciones.
- [JSON derivado](openapi.json) y [Swagger revisable](swagger.html): generados del YAML, sin Try it out, solicitudes o persistencia de autorización.
- [Índice de ampliación](alcance-operaciones.json):38 operaciones añadidas al recorrido original, con UC/SEQ/pasos/tablas/UI. Las23 originales conservan sus IDs.
- [Casos y reglas](../../proceso/MATRIZ_CASOS_M2.md), [cobertura integral](COBERTURA_INTEGRAL.json), [acta final documental](VALIDACION_INTEGRAL.json).
- [Corrección vecinal](CORRECCION_RECONSIDERACION.md), [conservación/revisores](CONSERVACION_REVISORES_D08_D09.md), [condiciones de oferentes propuestas](CONDICIONES_OFERENTES_MVP1.md), [puertos y entrega](INTEGRACION_Y_ENTREGA_M2_M8.md).

Generar con generar-openapi.mjs usando Node24.21.0 y dependencia existente en MARLEVA_DOCUMENTATION_PACKAGE:yaml2.9.1,SwaggerParser13.1.0,SwaggerUI5.33.2. validar-documentacion.mjs usaAjv8.20.0/ajv-formats3.0.1 y comprueba ejemplos, referencias a pasos/tablas y FK tipadas. Se fijan versiones sin cambiar manifiestos/lockfiles. No se incluyen tipos en packages/contracts ni rutas de aplicación.

Semántica: sesiónM1 por transporte existente, M8 con perfil/grant/asignación/MFA actuales; recurso exacto por titular/finalidad, reautorización antes de replay/bytes. Mutaciones con revisión y clave estable;400/401/403/404/409/422/429/503 explícitos. Privacidad no-store, sin URLs públicas de documentos o notas internas en proyección del titular. El endpoint público comercial permite exclusivamente perfil actual habilitado/elegible/no pausado; contratación privada es ruta distinta para comprador elegible.

Fuentes API: YAML único; JSON/Swagger son derivados. Modelo: DBML+complemento propio→DDL no aplicado. UI y pruebas se vinculan por IDs estables. Las actas anteriores VALIDACION_OPENAPI/D08_D09/AUDITORIA/ENTREGA registran cortes históricos; VALIDACION_INTEGRAL.json identifica los hashes y verificaciones de esta entrega. Un parser no demuestra autorización/transacciones reales ni aceptación visual. Git remoto no equivale incorporación a Fuentes.
Revisión guiada: [instructivoM2](../../revision/M2/INSTRUCTIVO_M2.md) y [soporteM8](../../revision/M8/INSTRUCTIVO_M8.md).
