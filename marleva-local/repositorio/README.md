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

Base/M1: backend de avisos, archivos privados y recuperación de operadores implementado; M1 sigue incompleta. Fase 1 del CI verificada en GitHub. Fase 2 pasó localmente calidad, 139 unitarias, 38 integraciones, siete operaciones de recuperación, contrato sobre 24 operaciones y accesibilidad web. En GitHub pasaron integración, contrato, web, calidad y CodeQL sobre 69672a5. Seguridad y revisión de dependencias pasaron en GitHub sobre 9cdde72. Dos paquetes vulnerables se retiraron; otros dos conservan versión original con parches locales comprobados mediante hashes y regresiones. OSV original se conserva. El primer pipeline completo pasó en 38773873030 y la negativa de seguridad fue rechazada; la correspondencia quedó restaurada. PR #3/#4 integrados y CI propio de main 40c6583 correcto en 38789774598. Fase 3: ensayo Sonar temporal base/cambio diseñado e implementado en rama separada, control completo no probado y ejecución bloqueada por elegibilidad de licencia SSAL. Estado único y límites en [avance](docs/avance.md) y [ADR002](docs/adr/002-pipeline-ci.md). Google sigue pendiente; Prisma y YAML canónico conservados.

Revisar este README al inicio/fin de cada proceso y chat; corregirlo solo si cambió la realidad. Cerrar con resultados, instructivo/revisión, porcentajes medibles y commit claro. Origin configurado; rama codex/fix-quality-and-rules subida el 14-10, seguimiento activo y pull --ff-only comprobado. Fuentes y originales sincronizados no se modifican ni se consideran subidos por guardado local. [ADR001](docs/adr/001-consolidacion-tecnica.md), [avance](docs/avance.md), reglas en 00. Hooks desde raíz: git config core.hooksPath .githooks; precommit ejecuta quality, unitarias y cobertura; commit-msg exige Conventional Commits.

Android: APK debug ARM64 recompilado en005; acta tests/results/android-build.json y ubicación en el instructivo. Requiere Metro. Recorrido emulado de acceso/error/OTP/cuenta/reinicio/salida pasó en 1080×1920; acta tests/results/android-test.json. Los demás flujos, 320×640, accesibilidad/físicos/iOS siguen pendientes. Cuota OTP corregida y probada: tests/results/otp-android-increment.md.

Recuperación B12: copia con atributos, borrado posterior, revocación, cola restaurada y recuperación de operador probados en ensayos separados. Falta el ensayo integral y la aceptación de plataformas. [Procedimiento](docs/proceso/RECUPERACION_B12_M1.md). No mezclar destinos ni dar por restaurado todo por pasar una fase.

Recuperación de operadores UC014: siete operaciones backend y roles persistidos, revisión por otro administrador, revocación y factor nuevo. Quinta migración local aplicada. [Instructivo](docs/revision/M1/INSTRUCTIVO_M1.md), [ensayo de recuperación](tests/results/recovery-api.json) y [ensayo CI separado](tests/results/ci-operators.json). Pantallas y aceptación pendientes.

## Leer el CI

[![CI](https://github.com/AndresRaRi/marleva/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AndresRaRi/marleva/actions/workflows/ci.yml)

Pipeline en preparación por fases; consultar [avance](docs/avance.md) y [decisión técnica](docs/adr/002-pipeline-ci.md). Un resultado rojo impide integrar; abrir el job y su resumen en español, corregir la causa y repetir el mismo comando local.

| Etapa | Ejecutar desde esta carpeta |
|---|---|
| Calidad y dependencias sin uso | pnpm quality |
| Capas y duplicación | pnpm arch:check |
| Contratos y derivados | pnpm contracts:check |
| Unitarias y cobertura | pnpm test:coverage; después pnpm coverage:check |
| Compilación API/web | pnpm build |
| Imagen local, hadolint y Trivy | pnpm build:container; requiere Docker |
| Dependencias, secretos, licencias y SBOM | pnpm security:scan; bloquea avisos sin corrección comprobada |
| Preparar servicios CI separados | pnpm ci:stack:start; después pnpm ci:migrations |
| Integración general y operadores CI | pnpm ci:run integracion |
| Navegador, axe y Lighthouse | pnpm ci:run web |
| Generador de contrato | pnpm ci:run contrato; Python fijado en infra/ci/.python-version |
| Detener servicios CI conservando datos | pnpm ci:stack:stop |

El CI usa pnpm ci:run con el nombre de etapa, reutilizando los scripts anteriores. Setup genera Prisma sin conexión a datos. La imagen no incluye secretos ni herramientas locales; usuario numérico sin privilegios, varias etapas y comprobación de salud. Se compila y analiza, no se publica. La ejecución de aplicación sigue limitada al entorno local; activar despliegue exige otra decisión.

El stack CI usa puertos 54621/54622/54624/54625 y credenciales propias ignoradas. Integración y web requieren libres los puertos API 3000 y HTTPS 8443; no detener procesos ajenos. En este Mac se puede usar el proxy TLS existente mediante MARLEVA_CI_EXISTING_PROXY=1, deteniendo y restaurando únicamente la API con scripts/local.mjs. Los jobs de GitHub tienen entorno propio; NSS confía en su CA temporal, sin ignorar TLS. No ejecutar suites que detienen Auth/Storage/correo en paralelo. Migraciones aplicadas intactas; pruebas de operadores usan una base nueva independiente, no reinician cuotas de otras suites.

Requisito de GitHub: la revisión de dependencias necesita Dependency graph habilitado en Settings → Security → Advanced Security, en [ajustes de seguridad](https://github.com/AndresRaRi/marleva/settings/security_analysis). Se habilitó por solicitud del usuario y el control ya pasó. OSV analiza los lockfiles completos; su informe original se conserva y solo se reconoce una corrección local cuando coinciden sus hashes y pasan las regresiones en la misma ejecución. Cualquier aviso sin corrección comprobada bloquea. [PR #2 integrado](https://github.com/AndresRaRi/marleva/pull/2); cierre documental en [PR #3](https://github.com/AndresRaRi/marleva/pull/3), integrado por el usuario.
