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

## Estado real y entrega Chrome

Main91b0d19 integra PR8–13; su [CI38935513484](https://github.com/AndresRaRi/marleva/actions/runs/38935513484) está aprobado. Acceso/cuenta, cambio por ambos buzones, avisos/retorno, salida entre sesiones y recuperación MFA tienen pruebas reales Chrome/API. B12 esencial Chrome está probado y repetido desde el mismo backup; no RPO/RTO productivos. [Actas y límites](docs/proceso/RECUPERACION_B12_M1.md). M1 conserva implementación y aceptación separadas en [avance](docs/avance.md).

[PR14](https://github.com/AndresRaRi/marleva/pull/14) completa verificaciones de carreras de sesión, teclado/foco/navegación/zoom y rendimiento remoto, junto con controles periódicos y manual. Consultar su SHA/CI y el main posterior antes de integrar; no heredar verdes. Revisión estática resuelta y401unitarias/cobertura locales aprobadas al guardar el incremento inicial. No despliegue ni módulos nuevos.

El [instructivo único](docs/revision/M1/INSTRUCTIVO_M1.md) permite probar Chrome y registrar aceptación. Android/iOS están apagados y pendientes por petición del usuario; Safari fuera del cierre actual. Evidencia Android14-10 conservada, no sustituye la repetición de la versión actual. Directorio iOS generado localmente no compilado/aprobado: se conserva sin incluirlo en la entrega. Google permanece fuera de estas funciones, sin cambiar OTP ni proveedor.

SonarCloud privado y sus controles negativos/restauración se mantienen. No reabrirlos por rutina ni desactivar gates. Prisma y contratos YAML canónicos, migraciones y recursos originales conservados. Hooks de raíz ejecutan calidad, unitarias y cobertura; GitHub Actions es la validación principal.

## Leer el CI

[![CI](https://github.com/AndresRaRi/marleva/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AndresRaRi/marleva/actions/workflows/ci.yml)

Pipeline activo sin despliegue; consultar [avance](docs/avance.md) y [decisión técnica](docs/adr/002-pipeline-ci.md). Un resultado rojo impide integrar; abrir el job y su resumen en español y corregir la causa según00§13; CI es validación principal y los diagnósticos locales se limitan a lo necesario.

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
| Rendimiento M1 remoto/periódico | Workflow m1-verificacion.yml; no emuladores ni stack local |
| Detener servicios CI conservando datos | pnpm ci:stack:stop |

El CI usa pnpm ci:run con el nombre de etapa, reutilizando los scripts anteriores. Setup genera Prisma sin conexión a datos. La imagen no incluye secretos ni herramientas locales; usuario numérico sin privilegios, varias etapas y comprobación de salud. Se compila y analiza, no se publica. La ejecución de aplicación sigue limitada al entorno local; activar despliegue exige otra decisión.

El stack CI usa puertos 54621/54622/54624/54625 y credenciales propias ignoradas. Integración y web requieren libres los puertos API 3000 y HTTPS 8443; no detener procesos ajenos. En este Mac se puede usar el proxy TLS existente mediante MARLEVA_CI_EXISTING_PROXY=1, deteniendo y restaurando únicamente la API con scripts/local.mjs. Los jobs de GitHub tienen entorno propio; NSS confía en su CA temporal, sin ignorar TLS. No ejecutar suites que detienen Auth/Storage/correo en paralelo. Migraciones aplicadas intactas; pruebas de operadores usan una base nueva independiente, no reinician cuotas de otras suites.

Requisito de GitHub: la revisión de dependencias necesita Dependency graph habilitado en Settings → Security → Advanced Security, en [ajustes de seguridad](https://github.com/AndresRaRi/marleva/settings/security_analysis). Se habilitó por solicitud del usuario y el control ya pasó. OSV analiza los lockfiles completos; su informe original se conserva y solo se reconoce una corrección local cuando coinciden sus hashes y pasan las regresiones en la misma ejecución. Cualquier aviso sin corrección comprobada bloquea. [PR #2 integrado](https://github.com/AndresRaRi/marleva/pull/2); cierre documental en [PR #3](https://github.com/AndresRaRi/marleva/pull/3), integrado por el usuario.

## Continuación UC008, 15-10-2026

PR #7 integrado en main db2ec7d. Incremento siguiente en codex/feat-m1-paginacion-avisos: cargar más avisos conserva lista y cursor ante error, impide petición duplicada y termina al agotar cursor. Actualizar cuenta vuelve a primera página. Pruebas: notice-pages/account-notices y recorrido paginated-notices incorporado al ensayo web de CI. API009, modelo y migraciones conservados. SonarCloud conservado; CI del código consolidado902308e aprobado en38847365871. Consultar HEAD documental vigente enPR8; aceptaciónM1 pendiente.

## M3 aislado

Composición aislada autorizada en008, ahora reunida en009: [revisión y comandos](docs/revision/M3/INSTRUCTIVO_M3.md). No usar los scripts de arranque/parada M1 para M3. API3103, web8103 yPG55432 propios; solo datos ficticios. Catálogo público y gestión privada inyectable: borrador/edición, fotos, envío, revisión y pausa, probados con identidad ficticia. Integración real M1/M2/M8, plataformas y aceptación pendientes; M3 no completo.

Consolidación009: la API M3 requiere M3_DATABASE_URL explícita y los ensayos/admin M3_ADMIN_DATABASE_URL; destino127.0.0.1:55432/marleva_m3_008 y rolesm3_api/postgres respectivamente. Configuración exclusivamente ficticia del entorno local existente: `export M3_DATABASE_URL=postgresql://m3_api:fixture-api-only@127.0.0.1:55432/marleva_m3_008` y `export M3_ADMIN_DATABASE_URL=postgresql://postgres:fixture-only@127.0.0.1:55432/marleva_m3_008`. No usar en producción. CI las proporciona explícitamente; no hay contraseña predeterminada en runtime.
