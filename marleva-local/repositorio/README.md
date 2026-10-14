# Ejecutar y revisar Marleva local

API separada en apps/api; cliente web/Android/iOS en apps/client. Git está dos niveles arriba. Herramientas fijadas en infra/local/tools; usar scripts/tool. Estado y lectura: [README raíz](../../README.md), [AGENTS](AGENTS.md), [protocolo](docs/proceso/PROCESO_DESARROLLO_MARLEVA.md) y [matriz](docs/proceso/MATRIZ_CASOS_M1.md).

## Antes de arrancar

Entorno comprobado en este Mac ARM64: Node 24.21.0, pnpm 12.11.2, PostgreSQL 17/Supabase CLI 2.120.0 y Colima. La configuración privada .env y los certificados locales ya preparados son necesarios; no se publican. Otro equipo necesita preparar herramientas, variables y confianza TLS, y probar repetibilidad. No desactivar TLS ni usar datos reales.

## Arranque de este entorno preparado

Desde esta carpeta:

```sh
./scripts/tool colima start --profile marleva
./scripts/tool supabase start --workdir infra/local --network-id marleva-private --exclude studio,imgproxy,edge-runtime,logflare,vector
./scripts/tool pnpm --filter @marleva/api build
./scripts/tool node scripts/local.mjs start
```

La ruta infra/local contiene la carpeta supabase. No usar infra/local/supabase como workdir: seleccionaría un entorno distinto. Red marleva-private conservada, puertos 127.0.0.1. Si falta esa red/configuración, revisar antes de crear otra o aplicar migraciones. Nunca resetear para reparar un arranque.

Aplicación: https://localhost:8443. Salud: https://localhost:8443/health/ready. Capturador: http://127.0.0.1:54324. Leer [instructivo M1](docs/revision/M1/INSTRUCTIVO_M1.md), con capturas y límites. El proxy usa el build web existente en apps/client/dist; si falta, compilar el cliente con su script build y comprobar el resultado antes de servirlo.

## Parada conservando datos

```sh
./scripts/tool node scripts/local.mjs stop
./scripts/tool supabase stop --workdir infra/local
./scripts/tool colima stop --profile marleva
```

No borrar volúmenes. Estado API/proxy: scripts/local.mjs status. Arranque/parada local comprobados; instalación limpia/restauración todavía pendientes.

## Pruebas y lectura por parte

| Parte | Qué hace | Revisión/prueba |
|---|---|---|
| Backend | Autoriza y guarda reglas/datos; integra Auth/Storage/correo | docs/apis/M1 YAML/Swagger; apps/api/src; tests/unit/backend y integration/backend |
| Frontend | Presenta pasos, errores y acciones | apps/client; tests/unit/frontend e integration/frontend; instructivo/capturas |
| Base | Conserva esquema e historial | apps/api/prisma; docs/modelado-datos DBML/DDL; migraciones aplicadas inmutables |
| Entorno | Versiones, imágenes, puertos y datos ficticios | infra/local/toolchain.json/manifest.json; protocolo Docker de 00 §9 |

Unitarias: pnpm test:unit. Tipado: pnpm typecheck. Calidad: pnpm quality. Integración API local preparada: pnpm test:integration. Chrome: pnpm test:frontend:integration. Usar siempre scripts/tool delante. B09: pnpm test:files (detiene/reinicia Storage; no correr junto con API/carga). Outbox y SQL aislados tienen puertas explícitas en tests/README.md; outbox detiene/reinicia el capturador, no correr junto con OTP. Pruebas de rendimiento tienen protección y destinos separados; no medir contra datos ajenos.

## Estado real

Incremento UC008 en commit cd0a019: cursor por cuenta/microsegundos, índice nuevo, reintentos/lease/caducidad del correo; actas notices-*.json. El 14-10 pasaron tipado, lint, formato, 69 pruebas unitarias, cobertura de lógica de cuenta y regresión Chrome; Sonar y CI siguen pendientes. B09 backend tiene tres operaciones y seis pruebas reales locales pasadas; ver files-increment.json. Recuperación/B12, visual/nativos/físicos y otros casos siguen abiertos. Google/Supabase pendiente; Prisma/YAML canónico conservados por plan aprobado, Sonar local/CI por integrar, Flyway alternativa futura.

Revisar este README al inicio/fin de cada proceso y chat; corregirlo solo si cambió la realidad. Cerrar con resultados, instructivo/revisión, porcentajes medibles y commit claro. Origin configurado; rama codex/fix-quality-and-rules subida el 14-10, seguimiento activo y pull --ff-only comprobado. Fuentes y originales sincronizados no se modifican ni se consideran subidos por guardado local. [ADR001](docs/adr/001-consolidacion-tecnica.md), [avance](docs/avance.md), reglas en 00. Hooks desde raíz: git config core.hooksPath .githooks; precommit ejecuta quality, unitarias y cobertura; commit-msg exige Conventional Commits.

Android: APK debug ARM64 recompilado en005; acta tests/results/android-build.json y ubicación en el instructivo. Requiere Metro. Recorrido emulado de acceso/error/OTP/cuenta/reinicio/salida pasó en 1080×1920; acta tests/results/android-test.json. Los demás flujos, 320×640, accesibilidad/físicos/iOS siguen pendientes. Cuota OTP corregida y probada: tests/results/otp-android-increment.md.

B12 parcial: copia PG/Auth/metadata/contenido, borrado posterior reaplicado, caída de Storage recuperable, accesos antiguos rechazados y OTP nuevo con IDs/permisos conservados. Destino aislado con puertos solo 127.0.0.1; origen intacto. Incidencia: cp perdió atributos Storage; reconstrucción limitada de tres fixtures, prueba de nuevo helper pasada, copia completa nueva pasó. Actas recovery-provider/metadata-repair/xattrs y procedimiento docs/proceso/RECUPERACION_B12_M1.md. Recuperación runtime de operadores, ensayo integral, plataformas/repetibilidad/PF113 pendientes; no restauración completa acreditada.

B12: cola restaurada con pg_dump, reinicio PG y nuevos procesos pasó en recovery-outbox.json; entrega exclusiva al capturador del destino. El proveedor recuperó un operador ficticio con otro revisor/AAL2 y OTP/TOTP nuevos: recovery-operator-provider.json. Esta prueba no integra las siete operaciones de recuperación ni roles persistidos, capacidad/idempotencia/conciliación o interfaz. Leer el procedimiento antes de repetir; el ensayo de correo detiene solo el capturador del destino.

Recuperación de operadores UC014: siete operaciones backend disponibles en el contrato canónico, con roles persistidos, revisión por otro administrador, revocación y segundo factor nuevo. Quinta migración local aplicada; 13 tablas de negocio. Pasos en docs/revision/M1/INSTRUCTIVO_M1.md y resultados en tests/results/recovery-api.json. Pantallas nuevas y aceptación pendientes; no asignar administradores reales desde los fixtures.
