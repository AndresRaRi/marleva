# Modelo de datos M1

14-10-2026. El [modelo físico DATA001](dbml/MAR-M1-DATA-001.dbml) representa 13 tablas de negocio y cinco migraciones aplicadas en el origen local. Auth y Storage siguen gestionados por Supabase; no se recrean. El historial técnico de migraciones no cuenta como tabla de negocio.

El [modelo objetivo DATA002](dbml/MAR-M1-DATA-002.dbml) conserva diferencias pendientes, como la relación de EmailChange y política de Audit. Tener 13 tablas en ambos no significa que sus restricciones sean idénticas. No declarar integridad total ni aplicar el DDL completo sobre una base existente.

## Recuperación de operadores

RoleAssignment conserva permisos revocables. Account.operator es su proyección compatible mediante triggers; modificar la bandera no concede permiso. MfaRecovery conserva solicitudes, revisión por otra persona, versión, tarea durable, capacidad ligada a sesión y respuestas idempotentes cifradas. No se asigna m1_access_admin automáticamente ni hay alta pública de roles.

La nueva migración 202610140001_mfa_recovery fue probada sobre las cuatro anteriores en PostgreSQL aislado y aplicada mediante Prisma al destino de ensayo y al origen local. Las cuatro anteriores permanecen intactas y esta quinta ya es inmutable. [Prueba de preservación](../../tests/results/recovery-schema.json), [flujo HTTP real](../../tests/results/recovery-api.json), [contrato y límites](../apis/M1/CONTRATO_RECUPERACION_MFA.md).

La aprobación revoca accesos; una tarea recuperable elimina el factor perdido. El titular entra de nuevo por correo, obtiene capacidad limitada, verifica otro factor y vuelve a entrar. Caducidad o fallo no restablecen privilegios. B09 conserva sus tres tablas, permisos compuestos y borrado durable. Recuperación integral B12 y plataformas siguen pendientes.

## Generar y revisar

DBML se importa en dbdiagram.io; no se ha subido a una cuenta externa. DDL físico: [DATA001](ddl/MAR-M1-DATA-001.sql); objetivo: [DATA002](ddl/MAR-M1-DATA-002.sql). Generadores usan @dbml/core 10.3.1 y complementos explícitos para índices parciales, restricciones y triggers. No exportan bootstrap ni todos los privilegios.

Usar pnpm docs:generate para documentación física y contrato canónico; pnpm docs:target para el modelo objetivo y contratos auxiliares. Generar no prueba runtime. Las migraciones aplicadas nunca se editan; cualquier corrección requiere otra migración probada. Calendarios de conservación y operación con datos reales siguen pendientes.
