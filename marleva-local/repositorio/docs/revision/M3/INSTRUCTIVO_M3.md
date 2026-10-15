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

El catálogo no crea compras, cotizaciones, comisiones ni ventas. No hay botones de compra que simulen una transacción inexistente. Fotos: procesamiento interno y entrega pública de derivados disponibles; carga autenticada pendiente; visualización web de fotos implementada y probada. Los casos internos de borrador, envío, revisión y pausa se prueban con actores ficticios; no están expuestos por HTTP ni sustituyen M1/M2/M8.

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

Integrar puertos de identidad M1, elegibilidad M2 y revisión M8 cuando estén listos y se autorice integración; conservar roles actuales, revocación, MFA y no autorrevisión. Completar carga autenticada de fotos, gestión autenticada de ofertas, pantallas de gestión revisadas, plataformas y aceptación. No incorporar favoritos, reseñas, ranking pagado, ofertas externas o giros excluidos C25.

Push de la rama aislada autorizado por la instrucción posterior del usuario; sin integración a main. Guardado/commit local no actualizan Fuentes. Solo01 cambia como registro de este avance; conciliar su añadido M3 con el estado paralelo de006/007 antes de reemplazar Fuentes.00/02/03 y configuración permanente no requieren sustitución por estas reglas técnicas locales. No prometer acceso desde otros chats.

## Resultado comprobado del incremento

Commit de código local `44e437a0db239ce6d020c892013c5ca3a363e194`. Hooks obligatorios: calidad sin errores (28 avisos de longitud visibles), 201 unitarias y cobertura global aprobadas. Resultados propios M3: 38/38 unitarias, 6/6 integración backend y 1/1 transporte frontend; recorrido Chrome y caída/recuperación de PostgreSQL aprobados. Cobertura del ámbito M3 medido: líneas 95,58%, ramas 92,60%; no incluye toda la interfaz o SQL.

Nueve escenarios de rendimiento del repositorio, con 10/1000/10000 ofertas y concurrencia 1/5/10, terminaron sin errores. Peor p95 local 405,52 ms; a 10000 ofertas/concurrencia 10, 46,03 ms. No es una medida HTTP ni capacidad productiva. Se conservan las actas fallidas anteriores y su diagnóstico.

Capturas finales revisadas: [catálogo](capturas/01-catalogo.png), [detalle](capturas/02-detalle.png), [perfil](capturas/03-oferente.png). Sin desbordamiento horizontal en los anchos comprobados 320/1280; axe no detectó infracciones en catálogo/detalle. Esto no acredita WCAG completo. Inventario y límites de lectura: [registro](../../proceso/inventario-m3.json).

Comparación con la base: sin cambios en código M1, migraciones M1, contratos compartidos, fuentes sincronizadas o lockfile. El árbol estaba limpio tras el commit. Servicios de revisión locales disponibles en los accesos indicados; no se promete permanencia. Fuentes compartidas no se han subido ni reemplazado.

## Autorización vigente de sincronización — 15-10-2026

El usuario autoriza expresamente commits, push y acciones ordinarias del desarrollo sin confirmaciones rutinarias. Esta autorización posterior permite sincronizar la rama aislada M3 y sustituye la restricción anterior de no push. No autoriza gasto, despliegue, integración a main o cambios ajenos. Las demás operaciones externas conservan sus límites. Aplicar los permisos obligatorios del entorno sin omitir controles.

## Comprobaciones adicionales

La integración M3 tiene configuración propia: primero generar y compilar con `./scripts/tool node scripts/m3-prepare.mjs` y `./scripts/tool node node_modules/typescript/bin/tsc -p apps/api/tsconfig.m3.json`; después ejecutar `MARLEVA_M3_CHECK=1 ./scripts/tool node node_modules/vitest/vitest.mjs run --config vitest.m3.integration.config.mjs`. Su guardia exige la base M3, nunca se sustituye por un test omitido. La preparación común llama al generador M3 sin conexión de base; no aplica migraciones ni arranca M1.

Recorrido web ampliado: 13 comprobaciones aprobadas, con filtros reales, Enter, retorno con búsqueda y retirada 404 simulada con recuperación. Diez muestras Chrome limpias tras calentamiento: p95 carga 145,45 ms, búsqueda 97,74 ms y detalle 478,69 ms. Acta `tests/results/m3-performance-frontend.json`; objetivos locales 3000/1000/1000 ms definidos previamente y cumplidos. Medición local sin limitación de red/CPU, no resultados de dispositivos físicos.

Verificación posterior de preparación: generación y compilación M3 aprobadas, siete integraciones propias aprobadas. El descubrimiento general de integración muestra únicamente M1; M3 se ejecuta con su configuración explícita. Arquitectura aprobada con cero violaciones y duplicación cero en código propio. Los derivados se mantienen fuera de ese análisis según la exclusión de carpetas generated existente; los primeros fallos quedan registrados. No se ha ejecutado ni acreditado CI remoto de este incremento.

## Fotos: incremento aislado UC009

El procesamiento interno recibe bytes JPEG/PNG y actor ficticio autorizado; no hay carga HTTP ni cabeceras que asignen un rol. Guarda el original privado y produce dos JPEG nuevos: tarjeta hasta 480 px y detalle hasta 1600 px, sin ampliar. Revalida dueño, elegibilidad y borrador al guardar. Límite de seis posiciones, 5 MB por original, 16 millones de píxeles y dimensiones hasta 8192. Proceso hijo con plazo máximo de cinco segundos y un trabajo por instancia; espacio antiguo de V8 limitado a 96 MiB. Esto no limita toda la memoria nativa ni sustituye un aislamiento de producción.

Los originales, fallos y archivos sin referencia quedan privados en artifacts/m3/photos; no se borran automáticamente y no se sirven estáticamente. Rutas de archivos y tamaños son cerrados. Una fila ready exige manifest de ambos derivados, dimensiones y hashes válidos. Nueva migración M3 003; 001/002 y M1 no se reescriben.

La lectura `GET /v1/catalog/photos/{id}/card` o `/detail` comprueba la versión pública aprobada, oferta activa y oferente vigente, y verifica longitud/hash antes de enviar JPEG con no-store/nosniff. Original no permitido, oculta404, corrupción503 con recuperación. El JSON del catálogo enumera fotos de su propia versión; la tarjeta muestra la primera foto y el detalle hasta seis, con texto alternativo y recuperación ante fallos.

Ejecutar las pruebas propias con la configuración de integración M3 indicada arriba; las nueve pruebas IT-BE009 cubren EXIF GPS ficticio/orientación, PNG/transparencia, corrupta, cabecera APNG, límite de seis/concurrencia, idempotencia, permisos antes/después de procesamiento, archivo alterado/recuperación, rol de solo lectura y timeout real. Los casos son locales y no acreditan autenticación real o moderación. El análisis consiste en decodificar y recodificar imágenes; antivirus y revisión humana no se dan por cumplidos.

Ejemplo público generado por las pruebas: consultar `tests/results/m3-photo-example.json` para UUID y URL actuales; solo funciona mientras los servicios M3 de esta copia estén activos. No contiene una foto ni datos reales. Rendimiento del procesador: `MARLEVA_M3_CHECK=1 ./scripts/tool node tests/performance/backend/M3/photos.mjs`. Regresión de catálogo y fallos conservados en actas m3-performance*.json.

Dependencia fijada: Sharp 0.35.5 (Apache-2.0), binario @img/sharp-libvips 1.3.4 (LGPL-3.0-or-later). Versiones de bibliotecas efectivamente cargadas y plataforma en el acta de rendimiento; integridades npm en lockfile/acta m3-sharp-package.json. Instalación local con scripts desactivados y binarios precompilados. README de la biblioteca conserva su inventario de licencias. El control de licencias solo reconoce esta familia/version de binarios bajo esa licencia; otras dependencias desconocidas siguen bloqueadas. No certifica obligaciones de una distribución futura. Fuentes oficiales consultadas 15-10-2026: [Sharp](https://sharp.pixelplumbing.com/changelog/v0.35.5/), [decodificador](https://sharp.pixelplumbing.com/api-constructor/), [salida](https://sharp.pixelplumbing.com/api-output/), [identificador de licencia](https://spdx.org/licenses/LGPL-3.0-or-later.html).


## Resultado vigente de fotos — 15-10-2026, MAR-CHAT-008

Procesamiento interno y entrega pública de derivados implementados; tarjeta y detalle web muestran imágenes ficticias y conservan oferta/acciones ante error recuperable. Las capturas reales finales de catálogo, detalle y perfil fueron revisadas localmente. No hay carga HTTP autenticada. UC009 permanece incompleto; M3 conserva 3/9 criterios implementados y 0/9 aceptados. Android/iOS/Safari, integración M1/M2/M8 y aceptación pendientes.

Resultados verificables en tests/results: 44/44 unitarias M3; cobertura de líneas 96,24% y ramas 93,55% del ámbito declarado; 16/16 integraciones, incluidas nueve de fotos; 17 comprobaciones web aprobadas. Axe sin infracciones detectadas en catálogo/detalle y sin desbordamiento a 320/1280; no acredita WCAG completo. Reinicio de PostgreSQL aislado: catálogo/foto devolvieron 503 y recuperaron contenido e integridad.

Rendimiento local: procesador Sharp 0.35.5, diez muestras tras calentamiento, p95 109,590 ms frente al objetivo local de 2000 ms. Nueve escenarios de repositorio sin errores; peor p95 83,32 ms frente a 500 ms. Navegador con primera imagen decodificada: p95 carga 326,566 ms, búsqueda 159,638 ms y detalle 152,610 ms; objetivos 3000/1000/1000 ms. Sin extrapolar a producción ni dispositivos físicos.

Se conservan fallos y diagnóstico: la consulta inicial estimaba tres coincidencias frente a 10000 y excedía el objetivo. La corrección final usa proyección pública explícita y búsqueda lateral de versión, pagina antes de agregar fotos y no amplía permisos. EXPLAIN final local: 1,468 ms. Migración M3 003 aplicada e inmutable; 001/002 y migraciones M1 intactas. Sharp y su grafo nuevo están fijados en lockfile; la afirmación anterior de lockfile sin cambios corresponde al incremento anterior.

Originales privados y derivados operativos están ignorados por Git. Fuentes sincronizadas no se editaron ni subieron. Solo el añadido M3 de 01 debe conciliarse con 006/007 antes de reemplazar la fuente compartida; 00/02/03 y configuración no cambian. Continuidad: completar ingreso autenticado cuando existan contratos de identidad/elegibilidad/revisión compatibles, manteniendo aislamiento y sin integrar a main.


## Validación CI y cobertura ampliada

El primer CI de 221ad41 falló:207 pruebas pasaron pero el gate del diff no recibía cobertura M3; GitLeaks señaló un identificador histórico de perfil Sonar. Acta m3-ci-first-failure.json. El segundo intento b0e2e3a detectó comando Prisma no localizado y sustitución accidental de una excepción previa de GitLeaks; corregidos sin relajar el escáner. Ambos identificadores documentales quedan limitados por regla/ruta/línea.

Se añadieron cinco integraciones de render React Native Web con jsdom 30.1.3 (solo pruebas, MIT), React/ReactDOM de la versión del cliente 19.2.3. React/DOM reales y respuestas HTTP simuladas; no equivalen a navegador o plataformas físicas. La dependencia jsdom y sus transitivas están fijadas en lockfile; excepción de antigüedad de esa versión registrada por pnpm. Sin scripts de instalación adicionales.

Configuración vitest.m3.full-coverage.config.mjs:65 pruebas M3 (44UT+16IT previas+5 render), fuentes backend/cliente y JS compilado con mapas a TS; tipos generados excluidos, worker hijo no cubierto aunque sí probado por integración. Resultado local: líneas91,31%, ramas85,71%, declaraciones90,13%, funciones82,22%; ámbitos más amplios que el acta histórica de lógica, no comparar porcentajes sin su alcance. Umbral80% en las cuatro métricas. Gate agregado de diff contra merge-base main:547/617=88,65%; archivos sin cobertura siguen descubiertos, tipos puros y derivados de OpenAPI reproducidos no tienen ejecución.

CI general conserva la línea base global y agrega los LCOV del mismo run/SHA. Build depende de ese gate y del ensayo M3 reusable:PostgreSQL17.11 fijado por digest, base/puerto/roles propios, migraciones M3, Nest, Expo/Chromium, errores/fotos/axe y recuperación. Sin conectar servicios locales M1, sin tocar sus contratos/migraciones y sin integración a main. Resultados remotos pendientes de verificación del SHA nuevo; no dar por aprobado por mediciones locales.
