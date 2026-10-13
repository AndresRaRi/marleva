# Modelo de datos M1, en revisión

Fuente: [DBML](dbml/MAR-M1-DATA-001.dbml). Exportación: [DDL PostgreSQL](ddl/MAR-M1-DATA-001.sql). Copiar/importar el DBML en https://dbdiagram.io/d; sin credenciales ni datos reales. Parser/exportador local @dbml/core10.3.1 aceptó el archivo; no se subió ni abrió en una cuenta externa.

Comparación estática con Prisma y migración002: ocho tablas, campos, defaults, uniques, tres índices y dos FKs existentes. DBML conserva las brechas físicas para no inventar integridad implementada. Exportación no equivale exactamente al SQL aplicado: crea esquema/comentarios, FKs ahora NOT DEFERRABLE por transformación explícita del generador, concordantes con SQL aplicado; omite GRANT/REVOKE/bootstrap. Prisma relaciones usan defaults de referencialidad que también deben explicitarse y contrastarse. DB viva no comparada en esta revisión porque servicios detenidos. No reescribir001/002 aplicadas ni aplicarDDL íntegro a base existente.

DATA002 contiene el modelo objetivo de roles/recuperación y FKEmailChange; ver apartados siguientes. Siguen pendientes B09 completo, política Audit/conservación y migración comparada; BUG002/003 distinguen brecha original y corrección documental. DBMLM1 no constituye modelo completo M2–M10; Auth/Storage administrados por proveedor no se recrean. Generar con pnpm docs:generate; revisión de diferencias antes de migración futura.

13-10-2026: corregido exportador para conservar restricciones no diferibles. No se cambia DBML lógico ni migraciones aplicadas. Privilegios son responsabilidad de bootstrap/migraciones; no se exportan desde DBML. BUG003 resuelto solo en generación documental; cotejo con DB viva pendiente.


## Objetivo DATA002 —13-10-2026

[DBML objetivo](dbml/MAR-M1-DATA-002.dbml), distinto del físico DATA001. Añade asignaciones revocables de permisos M1, recuperación MFA auditable y objeto privado ficticioB09; FKEmailChange. NO implementado. legacyOperator solo identifica transición: una migración futura convierte fixtures identificados a roles, compara permisos y después elimina boolean; nunca dos fuentes permanentes de autorización. Mantener UUID/authId, sin crear cuenta nueva ni transferir buzón.

Recuperación: titular verifica su correo original, solicita; otro m1_access_admin vigente conAAL2/reautenticación aprueba, jamás titular. Revocar sesiones primero; tarea idempotente revoca factor con proveedor y conserva provider_pending ante caída. Capacidad de reenrolamiento10min, un uso, hash en servidor, solo factor nuevo; luego OTPnuevo yAAL2 antes de operar. Caducidad no restaura factor/permiso; discrepancia requiere conciliación. Sin otro administrador disponible, pendiente; no saltar control ni recuperar por domicilio. Bootstrap ficticio explícito no autoriza personas reales.

Invariantes adicionales para futura migraciónSQL: una asignación activa porcuenta/rol (índice parcial), una recuperación activa porcuenta, aprobador distinto del titular, requester=accountId, version positiva, expiración posterior a creación, bytes1–1MiB y borrado consistente. El generador añade esas restricciones parciales/deestado al DDL objetivo; ocho pruebas SQL aisladas pasaron según matriz/resultados. Esto no acredita migración de negocio ni API: NO aplicarDDL completo a la base existente. Audit conserva actor mínimo por finalidad; no inventar conservación30d deM1 a partir deC14. No datos reales hasta calendario/responsables jurídicos.

Pruebas necesarias: MAR-M1-IT-BE-107 aprobación propia/ajena, pérdida de rol, caída antes/después proveedor, capability vencida/usada y nuevaAAL; IT-BE-111 titularA/ajenoB/público/URLexpirada/borrado/hash; UT-BE-107 reglas/estados, PF-BE-107/111. Diseñadas, no ejecutadas.


## Reenrolamiento y restricciones cerrados como diseño local

La aprobación no devuelve una capacidad a la sesión ya revocada. Titular obtiene nuevo OTP del mismo buzón y pide capacidad desde sesión nueva; hash se vincula a recoveryId/accountId/sessionId y vencimiento10min. Solo existe una vigente; renovar invalida anterior. Solicitar/enrolar con clave idempotente no crea factores duplicados; registrar factorId antes de exponer URI. Verificar solo ese factor y confirmar estado del proveedor. Completar consume capacidad y revoca sesiones, luego nuevo OTP/AAL2; cambios de rol, cuenta o versión invalidan acceso. Caída en enrolamiento o verificación queda conciliable, jamás repetir efecto externo a ciegas. Recuperación expira24h después de solicitar (detalle técnico local, no SLA); no revivir permisos por vencer.

Restricciones PostgreSQL complementarias en [SQL objetivo](ddl/MAR-M1-DATA-002.sql): índices parciales de roles/recuperación/capacidad, actores separados, versiones/fechas coherentes, estado de archivo/hash/tamaño. Añadidas de forma reproducible por generador; DBML contiene entidades/relaciones y SQL expresa restricciones que su exportador no soporta. No migración aplicada. Eliminar legacyOperator exige migración comparada con permisos; no rename silencioso del campo actual.

Conciliación13-10-2026: DATA001 físico8tablas; DATA002 objetivo13tablas/DDL complementado, no aplicado. B09 ya tiene capacidades, versión/intención durable y YAML objetivo; implementación/migración/pruebas API pendientes; leer [especificación parcial](../apis/M1/CONTRATO_B09_ARCHIVOS_PRIVADOS.md).

Actualización B09: FixtureAccess yFixtureDeletion, FKscompuestas de titular/sesión/objeto, TTL≤300s/estados/hash.10SQL114–123 pasaron en destino desechable; no validación completa de API/Storage ni migración aplicada.

13-10-2026,005: índice Notice(accountId,createdAt,id) en DATA002 y nueva migración202610130001_notice_cursor. Ensayo aislado sobre002 y rollback pasaron; aplicado solo índice a marleva-m1, conteo1aviso antes/después eindexdef cotejados. DATA001 ahora registra índice físico; continúan8tablas negocio (+_prisma_migrations técnica), sinroles/recuperación/Storage objetivo aplicados. DDLsnapshot se regenera, no aplicado íntegro. Actas notices-migration.json ynotices-migration-local.json en tests/results.
