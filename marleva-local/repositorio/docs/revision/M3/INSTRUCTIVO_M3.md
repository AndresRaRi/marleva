# Revisar M3 Catálogo local

MAR-CHAT-008. 15-10-2026 America/Merida. Desarrollo aislado autorizado por el usuario; propuesta visual de catálogo/detalle/perfil aprobada explícitamente. La aceptación funcional sigue pendiente.

## Ubicación y acceso

Copia de trabajo: `/Users/andresramos/.codex/worktrees/m3-catalogo-aislado/g-p-6ac952169b2081918f82b73968bd9d1a`. Rama `codex/feat-m3-catalogo-008`, base main6fed44f. Código en marleva-local/repositorio; no se cambió la rama del directorio de M1. La referencia antigua a004 en ejecución está superada:004/005 cerrados, M1 continúa en006 y M2/M8 en007.

Web: http://127.0.0.1:8103. API: http://127.0.0.1:3103/v1/catalog/offers. Son accesos exclusivos de este Mac, sin publicación. Swagger público: [contrato](../../apis/M3/swagger.html); privado: [objetivo sin rutas](../../apis/M3/swagger-target.html). Modelo [DBML](../../modelado-datos/dbml/MAR-M3-DATA-001.dbml), [DDL derivado](../../modelado-datos/ddl/MAR-M3-DATA-001.sql) y [matriz](../../proceso/MATRIZ_CASOS_M3.md). Importar DBML manualmente no equivale a haberlo subido a dbdiagram.io.

## Qué se puede probar

1. Abrir catálogo. Todos los nombres, ofertas, stock e importes son ficticios.
2. Escribir una búsqueda y pulsar Buscar. Escribir por sí solo no envía peticiones.
3. Abrir Filtros y elegir categoría, desarrollo atendido o modalidad; pulsar la misma opción la retira. Limpiar filtros recupera la exploración general.
4. Ver más ofertas solicita la página siguiente; un fallo conserva las ofertas previas y permite reintentar. No se reserva stock al explorar.
5. Ver oferta muestra precio MXN por unidad o «Requiere cotización», modalidad, cobertura, disponibilidad, respuesta y datos alimentarios cuando corresponden.
6. Ver oferente carga su perfil público y sus ofertas. Nunca muestra domicilio residencial, correo, expediente, rol o cuenta de pago.
7. Volver al catálogo conserva la búsqueda. Una oferta pausada o un oferente no elegible devuelve404 recuperable. Fallo de base devuelve503, nunca catálogo vacío.

El catálogo no crea compras, cotizaciones, comisiones ni ventas. No hay botones de compra que simulen una transacción inexistente. Fotos actuales: ninguna; pipeline de carga/análisis/derivados pendiente. Los casos internos de borrador, envío, revisión y pausa se prueban con actores ficticios; no están expuestos por HTTP ni sustituyen M1/M2/M8.

## Preparación y comandos

Desde marleva-local/repositorio de esta copia:

```sh
./scripts/tool node scripts/m3-stack.mjs start
./scripts/tool node apps/api/node_modules/prisma/build/index.js generate --config apps/api/prisma-m3/prisma.config.ts
./scripts/tool node apps/api/node_modules/prisma/build/index.js migrate deploy --config apps/api/prisma-m3/prisma.config.ts
./scripts/tool node scripts/m3-grants.mjs
./scripts/tool node node_modules/typescript/bin/tsc -p apps/api/tsconfig.m3.json
./scripts/tool node apps/api/dist-m3/m3-main.js
```

El rol `m3_api` necesita USAGE del esquema y SELECT de las columnas necesarias del catálogo, sin acceso a actor, recibos, eventos o a `_prisma_migrations` ni mutaciones; fue creado exclusivamente en esta base. Las credenciales publicadas son fixtures locales, no secretos reutilizables. La guardia rechaza base/puerto/usuario distintos. M3 no lee `.env` de M1.

Compilar web desde `apps/client/m3`: `EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 CI=1 ../../../scripts/tool node ../node_modules/expo/bin/cli export --platform web --output-dir dist`. En otra terminal desde raíz del código: `./scripts/tool node scripts/m3-preview.mjs`. Detener esos dos procesos con Ctrl+C en sus propias terminales. PostgreSQL: `./scripts/tool node scripts/m3-stack.mjs stop`; conserva volumen. No usar los scripts de parada de M1.

Herramientas Node24.21.0/pnpm12.11.2 existentes se referencian en lectura mediante enlace local ignorado. Dependencias en la copia propia; lockfile conservado. Al primer comando, pnpm reconstruyó automáticamente el conjunto fijado en esta copia; no se presentan las copias como instalación limpia reproducida. Sin nueva tecnología o versión de framework. PG17.11 usa imagen local por digest del bundle ya instalado,512MiB/1CPU, red/volumen/puerto propios. La primera red interna no publicaba puerto; se conserva sin borrar y se añadió una red local etiquetada. Los servicios de M1/CI no se reiniciaron.

## Pruebas y límites

Actas propias en tests/results/m3-*.json; se conservan fallos de preparación, cobertura y rendimiento. La primera cobertura pasó pruebas pero incumplió ramas; se añadieron negativos del cliente, sin bajar umbrales. La consulta inicial falló el objetivo local; estadísticas de expresión y ANALYZE corrigieron la estimación. Migración001 permanece inmutable;002 añade estadísticas, sin cambio de reglas.

Probar: unitarias/cobertura con vitest.m3.coverage.config.mjs; integración backend con MARLEVA_M3_CHECK=1, puerto efímero propio; transporte frontend contra API propia en3103; navegador `tests/integration/frontend/M3/web.mjs`; rendimiento `tests/performance/backend/M3/catalog.mjs`; caída/reinicio `tests/integration/backend/M3/restart.mjs`. No medir rendimiento durante builds u otras pruebas de M3.

Cobertura de lógica incluye dominio, casos, DTOs, transporte y estado del cliente; no acredita cobertura de SQL, Nest, render nativo o toda la interfaz. Integración real cubre PostgreSQL/HTTP; actores/revisores son fixtures internos, no Auth/MFA reales. Medición de repositorio no es HTTP ni capacidad de negocio. Navegador automatizado y axe no equivalen a WCAG ni aceptación humana. Android/iOS/Safari, dispositivos físicos y accesibilidad completa pendientes. Diagramas Mermaid tienen fuente y pasos revisados; render de todas las secuencias pendiente.

## Pendientes que impiden declarar M3 completo

Integrar puertos de identidad M1, elegibilidad M2 y revisión M8 cuando estén listos y se autorice integración; conservar roles actuales, revocación, MFA y no autorrevisión. Completar fotos seguras, gestión autenticada de ofertas, pantallas de gestión revisadas, plataformas y aceptación. No incorporar favoritos, reseñas, ranking pagado, ofertas externas o giros excluidos C25.

No push, PR ni integración main por este encargo de «no operaciones externas». Guardado/commit local no actualizan Fuentes. Solo01 cambia como registro de este avance; conciliar su añadido M3 con el estado paralelo de006/007 antes de reemplazar Fuentes.00/02/03 y configuración permanente no requieren sustitución por estas reglas técnicas locales. No prometer acceso desde otros chats.

## Resultado comprobado del incremento

Commit de código local `44e437a0db239ce6d020c892013c5ca3a363e194`. Hooks obligatorios: calidad sin errores (28 avisos de longitud visibles), 201 unitarias y cobertura global aprobadas. Resultados propios M3: 38/38 unitarias, 6/6 integración backend y 1/1 transporte frontend; recorrido Chrome y caída/recuperación de PostgreSQL aprobados. Cobertura del ámbito M3 medido: líneas 95,58%, ramas 92,60%; no incluye toda la interfaz o SQL.

Nueve escenarios de rendimiento del repositorio, con 10/1000/10000 ofertas y concurrencia 1/5/10, terminaron sin errores. Peor p95 local 405,52 ms; a 10000 ofertas/concurrencia 10, 46,03 ms. No es una medida HTTP ni capacidad productiva. Se conservan las actas fallidas anteriores y su diagnóstico.

Capturas finales revisadas: [catálogo](capturas/01-catalogo.png), [detalle](capturas/02-detalle.png), [perfil](capturas/03-oferente.png). Sin desbordamiento horizontal en los anchos comprobados 320/1280; axe no detectó infracciones en catálogo/detalle. Esto no acredita WCAG completo. Inventario y límites de lectura: [registro](../../proceso/inventario-m3.json).

Comparación con la base: sin cambios en código M1, migraciones M1, contratos compartidos, fuentes sincronizadas o lockfile. El árbol estaba limpio tras el commit. Servicios de revisión locales disponibles en los accesos indicados; no se promete permanencia. Fuentes compartidas no se han subido ni reemplazado.

## Autorización vigente de sincronización — 15-10-2026

El usuario autoriza expresamente commits, push y acciones ordinarias del desarrollo sin confirmaciones rutinarias. Esta autorización posterior permite sincronizar la rama aislada M3 y sustituye la restricción anterior de no push. No autoriza gasto, despliegue, integración a main o cambios ajenos. Las demás operaciones externas conservan sus límites. Aplicar los permisos obligatorios del entorno sin omitir controles.
