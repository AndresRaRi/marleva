# Pruebas Marleva

Leer primero docs/proceso/PROCESO_DESARROLLO_MARLEVA.md,02 §16.4 y secuencias del módulo. IDs y casos se vinculan a UC/SEQ/paso. Carpetas: unit/integration/performance → backend/frontend → módulo. Fixtures solo ficticios; resultados sin secretos. Ninguna carpeta vacía equivale a prueba realizada.

- Unitarias: simulador, validación/cifrado backend y adaptador API frontend. Pruebas de pantallas/estados, reglas restantes y configuración completa pendientes.
- Integración backend: suite repetida en005:12casos pasaron. Nuevo/existente ahora usa una cuenta existente real del entorno ficticio. La cobertura completa M1 sigue pendiente.
- Integración frontend: recorrido Chrome repetido en005, script en tests/integration/frontend/M1/web-test.mjs. Safari y recorridos Android/iOS completos no comprobados.
- Performance: runners locales protegidos para readiness y navegación Chrome. No ejecutados; no son pruebas completas de carga/negocio ni del dispositivo físico. Revisar dataset, objetivos, calentamiento y casos autenticados antes de ejecutar.
- Resultados anteriores: tests/results/before-reorganization. Conservan fecha/rutas de corrida original; no describen resultado posterior al traslado.

Comandos desde raíz: pnpm test:unit, test:integration, test:frontend:integration. Performance: MARLEVA_PERFORMANCE_LOCAL=1 pnpm test:performance:backend o frontend, solo con entorno local preparado y plan revisado. No se arranca ni resetea base automáticamente al ejecutar pruebas.

SQL objetivo aislado: MARLEVA_SCHEMA_CHECK=1 ./scripts/tool pnpm exec vitest run tests/integration/backend/M1/data-target.test.mjs. Crea su contenedor sinred/puertos desdeimagen local fijada (pull=never), aplicaDDLobjetivo, pruebas yelimina contenedor; requieremotorDocker disponible. No ejecutarlo como parte de APIactual sinVMni variable explícita. Reportes data-target-20261013*.json:8/8final, primerfallo conservado. No pruebaAPI/cliente/performance.

005: test:outbox requiere MARLEVA_OUTBOX_CHECK=1 y SMTP capturado local iniciado; excluido de test:integration para no detener SMTP durante OTP. Usa PG17 desechable enlocalhost, detiene/reinicia solo el capturador local, limpia su contenedor. test:integration cubre API/Auth real ycursor73avisos. PF-BE-108 en tests/performance/backend/M1/notices.mjs usa100cuentas/34990avisos aislados, calentamiento10s y60s porconcurrencia; es repositorio/PG, no capacidadHTTP/Auth/frontend. Primerosfallos conservados enresults.
