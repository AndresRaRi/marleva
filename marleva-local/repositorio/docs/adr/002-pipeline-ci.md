# ADR002: pipeline por etapas, sin despliegue

14-10-2026. Implementación autorizada por el usuario. Fase 1 en preparación; ninguna fase acreditada en GitHub todavía.

El repositorio es público y main es principal. Usar ejecutores estándar Ubuntu: GitHub documenta minutos gratuitos para repositorios públicos. La consulta del plan personal respondió 404 por permisos; no se solicita token ni amplía permisos. No activar opciones de pago ni cambiar ajustes.

Cada etapa llama scripts pnpm locales. Setup compartido toma Node de .node-version y pnpm de packageManager, instala el lockfile congelado y genera Prisma sin conectarse a una base. Solo credenciales ficticias de ensayo; secretos de este Mac no se suben. Dependencias/actions fijadas; permisos mínimos, límite de tiempo y resumen español. Fases siguientes solo después de verde y prueba negativa revertida con otro commit.

| Función | Elección / versión / licencia | Motivo |
|---|---|---|
| Reglas y complejidad | ESLint 10.12.0 + sonarjs 4.2.2, LGPL-3.0-only | Complementa reglas de TS, no sustituye tipado; peer ESLint 8/9/10 |
| Código y dependencias sin uso | knip 6.41.0, ISC | Reconoce workspaces; Node 20.19 o 22.12+ |
| Capas y ciclos | dependency-cruiser 18.6.0, MIT | Relaciones TS con imports de tipos; Node 22/24/26+ |
| Duplicación | jscpd 5.4.1, MIT | Ejecutable ARM64 comprobado; soporta TypeScript/TSX; evita un segundo detector |
| Contrato | Redocly CLI 2.63.0, MIT | Valida referencias/operaciones/seguridad; Node 22.12+ compatible |
| Cobertura | Vitest/V8 5.0.4 existente | Una sola fuente LCOV/JSON; línea base versionada, código nuevo mínimo 80% |

Metadatos npm verificados y ejecutables probados localmente con Node 24.21.0 ARM64. Tipado TS 6.0.3 permanece. Compatibilidad de cada analizador se acredita por ejecución, no únicamente engines. Referencias: https://knip.dev/reference/configuration, https://github.com/sverweij/dependency-cruiser, https://github.com/SonarSource/SonarJS, https://redocly.com/docs/cli/rules/oas/no-unresolved-refs, https://docs.github.com/en/billing/concepts/product-billing/github-actions.

PMD para reglas no analiza TypeScript; CPD no se instala porque jscpd cubre esa función. SonarCloud no autorizado. iOS excluido del CI por instrucción del usuario. SonarQube local se evalúa en fase 3, con límites TS y análisis de PR documentados; no declarar ese soporte por anticipado. CD solo borrador, despliegue deshabilitado.

La auditoría inicial de reglas nuevas encontró 21 errores de complejidad/anidación. Se separarán lectura/validación de entrada, renovación de sesión, transporte del cliente y conciliación del proveedor, conservando comportamiento. No cambios visuales. Unitarias, cobertura con trinquete y regresión API/cliente prueban el refactor. El contrato B09 requiere incorporar fixtureCapability al canónico; no es cambio de permiso.

Configuración del inventario: pg se usa en bootstrap.mjs y se incluye como entrada. @prisma/client se usa en el cliente generado ignorado por Git; excepción concreta documentada, no dependencia muerta. El plugin Expo de Knip presupone expo-updates aunque app.json no lo habilita; excepción de falso positivo, no se instala actualización OTA. openssl/adb son herramientas del sistema homologadas; scripts/tool es lanzador shell existente. No se excluyen pruebas ni lógica del inventario. Se retiran @types/pg y expo-status-bar sin uso; Supabase se declara en raíz para las pruebas que lo importan directamente.

Sonar, decisión del usuario 14-10-2026: aprobada comparación de base y cambio en instancia temporal, sin servicio externo ni gasto. No se atribuye análisis nativo de PR a Community. El trinquete usa líneas ejecutables de LCOV; continuaciones de una misma expresión y firmas TypeScript no son líneas ejecutables adicionales. Archivos modificados sin instrumentación se consideran no cubiertos, no se omiten.

Docker: Node 24.21.0 bookworm-slim, hadolint 2.15.1 (GPL-3.0) y Trivy 0.76.0 (Apache-2.0), imágenes fijadas por digest en infra/ci/images.json. Imágenes descargadas en ARM64. Node conserva su licencia y la imagen incluye licencias de componentes Debian; no se atribuye una sola licencia a todo el sistema. Hadolint exige usuario numérico y HEALTHCHECK JSON; corregidos tras fallo inicial, sin desactivar reglas. El builder local heredado advierte que requiere buildx futuro; GitHub usa Docker/BuildKit del runner.

OpenSSL de la imagen: versión candidata comprobada 3.0.22-1~deb12u1, fijada explícitamente para Prisma; no se ignora el aviso de biblioteca faltante. Instalación de dependencias en capa previa a copiar código para conservar caché. Trivy conserva caché local ignorada y su informe no contiene secretos de la aplicación.

Primer Trivy falló por paquetes Debian 12 sin corrección indicada y herramientas opcionales incluidas por deploy heredado. Se conserva ci-image-first-failure.json. Corregir sin excepciones: runtime mínimo distroless cc Debian 13, mismo binario exacto Node 24.21.0 copiado desde builder verificado; ABI contrastada, licencia Apache-2.0 de distroless y componentes Debian. Deploy moderno de pnpm 12.11.2 separa peers opcionales de desarrollo; no borrar node_modules manualmente ni ocultar paquetes al escáner. Referencias: https://github.com/GoogleContainerTools/distroless y https://github.com/pnpm/pnpm/issues/16409. El contenedor debe importar API y responder salud con configuración ficticia antes de Trivy; ningún servicio real ni publicación.

Resultado local: 122 unitarias y 12 SQL; regresiones API/Chrome pasaron. Imagen ARM64 fb127ba32b05 pasó arranque/salud y Trivy sin altas/críticas. Acta ci-phase1-local.json. El trinquete de líneas nuevas cubre aplicación en apps; los scripts y YAML del CI se validan con ejecuciones completas y fallo deliberado, sin atribuirles cobertura unitaria. Ninguna fase verde remota hasta observar sus jobs.

Primera ejecución GitHub 38678799733: calidad, arquitectura/contratos y unitarias pasaron, pero cleanup de setup-node intentó guardar un store inexistente calculado desde la raíz. Cache explícita con actions/cache v5, MIT, SHA caa296126883cff596d87d8935842f9db880ef25, sobre el store real del workspace; se retira caché automática de setup-node, sin duplicar detectores ni desactivar errores. Build quedó bloqueado por ese fallo, no se acredita ejecutado.
