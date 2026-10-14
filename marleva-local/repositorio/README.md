# Ejecutar y revisar Marleva local

API separada en apps/api; cliente web/Android/iOS en apps/client. Git está dos niveles arriba. Herramientas fijadas en infra/local/tools; usar scripts/tool. Estado y lectura: [README raíz](../../README.md), [AGENTS](AGENTS.md), [protocolo](docs/proceso/PROCESO_DESARROLLO_MARLEVA.md) y [matriz](docs/proceso/MATRIZ_CASOS_M1.md).

## Antes de arrancar

Entorno comprobado en este Mac ARM64: Node24.21.0, pnpm12.11.2, PostgreSQL17/SupabaseCLI2.120.0 y Colima. La configuración privada .env y los certificados locales ya preparados son necesarios; no se publican. Otro equipo necesita preparar herramientas, variables y confianza TLS, y probar repetibilidad. No desactivar TLS ni usar datos reales.

## Arranque de este entorno preparado

Desde esta carpeta:

```sh
./scripts/tool colima start --profile marleva
./scripts/tool supabase start --workdir infra/local --network-id marleva-private --exclude studio,imgproxy,edge-runtime,logflare,vector
./scripts/tool pnpm --filter @marleva/api build
./scripts/tool node scripts/local.mjs start
```

La ruta infra/local contiene la carpeta supabase. No usar infra/local/supabase como workdir: seleccionaría un entorno distinto. Red marleva-private conservada, puertos127.0.0.1. Si falta esa red/configuración, revisar antes de crear otra o aplicar migraciones. Nunca resetear para reparar un arranque.

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
| Entorno | Versiones, imágenes, puertos y datos ficticios | infra/local/toolchain.json/manifest.json; protocolo Docker de00 §13 |

Unitarias: pnpm test:unit. Tipado: pnpm typecheck. Calidad: pnpm quality. Integración API local preparada: pnpm test:integration. Chrome: pnpm test:frontend:integration. Usar siempre scripts/tool delante. B09: pnpm test:files (detiene/reinicia Storage; no correr junto con API/carga). Outbox y SQL aislados tienen puertas explícitas en tests/README.md; outbox detiene/reinicia el capturador, no correr junto con OTP. Pruebas de rendimiento tienen protección y destinos separados; no medir contra datos ajenos.

## Estado real

Incremento UC008 en commit cd0a019: cursor por cuenta/microsegundos, índice nuevo, reintentos/lease/caducidad del correo; actas notices-*.json. Calidad global todavía falla por errores existentes; no significa que la puerta esté aprobada. B09 backend tiene tres operaciones y seis pruebas reales locales pasadas; ver files-increment.json. Recuperación/B12, visual/nativos/físicos y otros casos siguen abiertos. Google/Supabase pendiente; Flyway/PDM/Sonar en evaluación, Prisma sigue dueño de migraciones marleva.

Revisar este README al inicio/fin de cada proceso y chat; corregirlo solo si cambió la realidad. Cerrar con resultados, instructivo/revisión, porcentajes medibles y commit claro. Sin remoto por decisión del usuario; fuentes y originales sincronizados no se modifican ni se consideran subidos por guardado local.

Android: APK debug ARM64 recompilado en005; acta tests/results/android-build.json y ubicación en el instructivo. Requiere Metro. Recorrido emulado de acceso/error/OTP/cuenta/reinicio/salida pasó en1080×1920; acta tests/results/android-test.json. Los demás flujos,320×640, accesibilidad/físicos/iOS siguen pendientes. Cuota OTP corregida y probada: tests/results/otp-android-increment.md.

B12 parcial: copia física PG/Auth/metadata y tres objetos recuperados en destino aislado sin puertos, luego detenido. Origen reanudado. Actas recovery-copy/source/after-copy; procedimiento docs/proceso/RECUPERACION_B12_M1.md. Reaplicación del borrado, proveedor/API/revocación y demás casos siguen pendientes; no restauración completa acreditada.
