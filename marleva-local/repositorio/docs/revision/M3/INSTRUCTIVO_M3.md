# Revisar M3 Catálogo

MAR-CHAT-008. 15-10-2026 America/Merida. Catálogo y gestión implementados en composición aislada con datos ficticios. La propuesta visual inicial fue aprobada; la aceptación funcional y plataformas siguen pendientes. El usuario autorizó ahora integrar a main después de las pruebas y revisión.

## Ubicación y acceso

Rama `codex/feat-m3-catalogo-008`, remoto [Marleva](https://github.com/AndresRaRi/marleva). Copia ejecutora actual: `/private/tmp/marleva-m3-008/repo`; código en `marleva-local/repositorio`. Copia managed anterior conservada en `/Users/andresramos/.codex/worktrees/m3-catalogo-aislado/g-p-6ac952169b2081918f82b73968bd9d1a`; su sincronización final debe comprobarse, no asumirse. Git de la copia ejecutora es independiente de M1.

Web local: http://127.0.0.1:8103. Catálogo: http://127.0.0.1:3103/v1/catalog/offers. Composición privada de pruebas:127.0.0.1:3104. PostgreSQL propio:127.0.0.1:55432, base marleva_m3_008, esquema m3. No hay publicación ni permanencia garantizada de procesos o archivos temporales.

Documentos: [matriz y estados](../../proceso/MATRIZ_CASOS_M3.md), [secuencias](../../diagramas/secuencia/M3/), [DBML importable](../../modelado-datos/dbml/MAR-M3-DATA-001.dbml), [DDL derivado](../../modelado-datos/ddl/MAR-M3-DATA-001.sql), [Swagger público](../../apis/M3/swagger.html), [Swagger privado](../../apis/M3/swagger-target.html), [avance y criterios](../../avance.md). No se subió el DBML a dbdiagram.io.

## Catálogo público

1. Abrir la web y escribir una búsqueda; pulsar Buscar o Enter. Escribir por sí solo no consulta.
2. Elegir categoría, desarrollo atendido y modalidad en Filtros. Limpiar filtros recupera la exploración general.
3. Ver más ofrece la página siguiente; un fallo conserva resultados y permite reintentar.
4. Ver oferta muestra precio MXN por unidad o «Requiere cotización», disponibilidad, cobertura, modalidad, respuesta y datos alimentarios. Las fotos de tarjeta y detalle tienen alternativa y recuperación ante error.
5. Ver oferente muestra únicamente perfil público y sus ofertas. No expone residencia, expediente, cuenta de pago, correo o roles.
6. Volver conserva búsqueda. Oferta retirada404, dependencia caída503 recuperable; nunca se representa una caída como catálogo vacío.

Capturas reales: [catálogo](capturas/01-catalogo.png), [detalle](capturas/02-detalle.png), [perfil](capturas/03-oferente.png). No crea compras, cotizaciones, reservas, comisiones ni ventas.

## Gestión de ofertas

«Mis ofertas» requiere que el host suministre identidad vigente a la composición privada. Sin sesión devuelve un mensaje recuperable; no existe un acceso ficticio dentro de la aplicación. El proveedor M1 real sigue pendiente. El ensayo automatizado instala sesiones ficticias en dos contextos separados; nunca copiar sus credenciales a documentación o Git.

1. Como titular elegible, Nueva oferta abre tres pasos: datos; precio/disponibilidad/cobertura; fotos y resumen. Servicios requieren cotización. Comida exige ingredientes, alérgenos y conservación.
2. Guardar borrador no publica. Ante pérdida de respuesta, reintentar conserva datos y clave de idempotencia; no duplica la oferta. [Mis ofertas](capturas/04-mis-ofertas.png).
3. Añadir JPEG/PNG de hasta5MB, máximo seis. El servidor verifica identidad, titularidad, elegibilidad y versión borrador, procesa y guarda dos derivados. La vista privada carga bytes autorizados, sin URL de originales. [Borrador con foto](capturas/05-borrador-con-foto.png).
4. Enviar a revisión bloquea esa versión. Otro revisor con permiso y MFA vigentes abre la versión exacta, revisa datos/fotos y explica motivo para aprobar, pedir corrección o rechazar. No autorrevisión. [Revisión](capturas/06-revision-con-foto.png).
5. Aprobar hace visible la versión en catálogo si sigue elegible. Editar crea otra versión sin alterar la anterior y retira la visibilidad hasta revisión. Corrección conserva el motivo y permite nueva versión.
6. Pausar oculta inmediatamente del catálogo. Conflicto409 exige refrescar; sesión401 o permiso revocado403 limpia datos privados. Cambiar de actor descarta lista y cursor anteriores.

Selección de fotos nativa pendiente. El ensayo web no acredita autenticación/MFA de personas ni conexión real M1/M2/M8.

## Preparación reproducible

Desde la raíz del código:

```sh
./scripts/tool pnpm install --frozen-lockfile
./scripts/tool node scripts/m3-stack.mjs start
./scripts/tool node scripts/m3-prepare.mjs
./scripts/tool node apps/api/node_modules/prisma/build/index.js migrate deploy --config apps/api/prisma-m3/prisma.config.ts
./scripts/tool node scripts/m3-grants.mjs
./scripts/tool node node_modules/typescript/bin/tsc -p apps/api/tsconfig.m3.json
./scripts/tool node apps/api/dist-m3/m3-main.js
```

En otra terminal compilar web desde apps/client/m3:

```sh
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 CI=1 ../../../scripts/tool node ../node_modules/expo/bin/cli export --platform web --output-dir dist
```

Después ejecutar desde raíz del código `./scripts/tool node scripts/m3-preview.mjs`. Solo para pruebas de composición privada: `MARLEVA_M3_CHECK=1 ./scripts/tool node tests/fixtures/m3-management-server.mjs`. Este servidor escribe sesiones ficticias ignoradas con permiso0600 en artifacts/m3/private-session.json; no subirlas ni incorporarlas al arranque público. La aplicación exporta createM3Management(sql,identity), exige proveedor por inyección y no crea login propio.

Detener cada proceso con Ctrl+C en su terminal; PostgreSQL propio con `./scripts/tool node scripts/m3-stack.mjs stop`, conserva volumen. No usar paradas de M1. Herramientas Node24.21.0/pnpm12.11.2 existentes enlazadas en lectura, dependencias propias fijadas por lockfile. La reconstrucción automática de pnpm necesitó red; no cambió versiones fijadas.

## Pruebas y evidencia

```sh
MARLEVA_M3_CHECK=1 ./scripts/tool node node_modules/vitest/vitest.mjs run --config vitest.m3.full-coverage.config.mjs --coverage
MARLEVA_M3_CHECK=1 ./scripts/tool node tests/integration/frontend/M3/web.mjs
MARLEVA_M3_CHECK=1 ./scripts/tool node tests/integration/frontend/M3/management-web.mjs
MARLEVA_M3_CHECK=1 ./scripts/tool node tests/performance/backend/M3/management.mjs
```

No ejecutar pruebas de carga durante otras pruebas/builds. Browser privado requiere el servidor de ensayo y sesiones vigentes. CI repite PostgreSQL limpio, migraciones propias, contratos regenerados, cobertura, Expo/Chromium, gestión y recuperación. Las credenciales no forman parte del artefacto publicado por CI.

Resultado local:87/87 pruebas M3; líneas92,67%, ramas86,47%, declaraciones91,01%, funciones93,31%. Umbral80% conservado. Incluye capas propias, render React Native Web y SQL/HTTP reales; tipos generados excluidos, worker hijo no instrumentado aunque probado por integración. React DOM con respuestas controladas no acredita proveedor real. Actas m3-full-coverage.json y resumen de cobertura.

Navegador:17 comprobaciones públicas y nueve de gestión aprobadas. Formulario/revisión y catálogo/detalle sin infracciones axe detectadas;320/1280 sin desbordamiento. No equivale a WCAG completo, Safari o dispositivos físicos. Fallo de comparación por orden de campos alimentarios y corrección documentados en matriz; regresión de render reordena esos campos. Revisión independiente encontró limpieza incompleta de lista privada al cambiar actor/revocar permiso, corregida con dos pruebas específicas.

CI completo de00be2d5 aprobado en [run38825788866](https://github.com/AndresRaRi/marleva/actions/runs/38825788866). Acredita el incremento anterior; CI del nuevo commit de gestión se comprueba por su propio SHA. Fallos previos y correcciones conservados en matriz/actas, sin bajar controles.

## Fotos y seguridad

Sharp0.35.5/libvips1.3.4, dependencias/licencias fijadas y revisadas por versión/hash. Original privado0700/0600, rutas UUID cerradas, sin enlaces simbólicos; JPEG/PNG≤5MB,16Mpíxeles/8192dimensiones. Worker con plazo5s y96MiB de espacio antiguo V8; no limita toda memoria nativa. Decodifica/recodifica a JPEG tarjeta≤480/detalle≤1600, retira metadatos y aplana transparencia. No antivirus ni moderación humana acreditados. Máximo seis posiciones y confirmación final de permisos bajo bloqueo PostgreSQL.

Lectura pública revalida versión aprobada, oferta activa y elegibilidad; solo rol de lectura. Verifica longitud/hash, no-store/nosniff. Originales, corrupción y huérfanos quedan privados; política de borrado pendiente, no borrado automático. Migraciones001/002/003 aplicadas inmutables; este incremento de gestión no añade migraciones. API privada no acepta roles del cuerpo, revalida cada solicitud; cookies mutantes exigen origen/CSRF y Bearer no se combina con cookie.

## Pendientes reales y entrega

Integración de proveedor de identidad M1, elegibilidad M2 y revisión M8; selección nativa de fotos, Safari/Android/iOS, dispositivos/accesibilidad y aceptación humana. Se completó el recorrido aislado con identidad ficticia; eso no certifica módulo productivo ni sus dependencias reales. Estado funcional conservador en avance.md, sin convertir pruebas en aceptación.

Fuentes sincronizadas permanecen de solo lectura. Solo la sección M3 de01 editable se actualiza; debe conciliarse con avances paralelos antes de reemplazar la fuente compartida.00/02/03 y configuración no requieren sustitución por este incremento. Commit/push/merge y ubicación final se informan tras comprobarlos; guardar local no implica subida a Fuentes ni despliegue.

PF-BE004 local:20 muestras por escenario tras tres calentamientos, concurrencia1; p95 creación66,613ms y lista94,231ms, cero errores, objetivo local500ms cumplido. Acta m3-management-performance.json; no capacidad productiva.
