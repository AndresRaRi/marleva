# M3: catálogo aislado

MAR-CHAT-008. 15-10-2026 America/Merida. Diseño previo al código. Autorización: solicitud actual del usuario para desarrollar M3 aislado. C01–C26 y 02 §§1/3/6/10–14 conservados. No integra M1/M2/M8 ni acredita M3 terminado.

## Límites y arquitectura

Rama codex/feat-m3-catalogo-008 desde main 6fed44f. API Nest independiente, sin importar main/config/database de M1. PostgreSQL exclusivo `marleva_m3_008`, esquema `m3`, contenedor `marleva-m3-008`, red propia y puerto 127.0.0.1:55432; API 127.0.0.1:3103. No usar 3000/8443/543xx/546xx, secretos, volúmenes ni servicios existentes. Commit y push de la rama aislada autorizados por instrucción posterior del usuario. Sin integración a main, publicación o llamadas a proveedores.

Capas reales: controller/DTO → casos → dominio y puertos → repositorio Prisma/PostgreSQL. Cliente: adaptador HTTP y estado de consulta independientes de pantallas. Una composición exclusiva de M3 conecta el módulo; la composición M1 permanece intacta.

M2 aún se diseña en 007. El catálogo consume una proyección de elegibilidad explícitamente ficticia, con revisión/estado/versionado. No copia expedientes ni convierte OTP en residencia. Las mutaciones se ejercitan mediante casos internos con actores ficticios en pruebas; no hay cabecera HTTP que permita elegir rol. Las rutas privadas no se montan hasta integrar identidad/roles actuales mediante un puerto, en otra etapa autorizada. Proyección pública enumera campos permitidos, nunca devuelve entidades completas.

## Reglas cerradas para este incremento

1. Cinco categorías: comida/postres, artículos cotidianos, clases, reparaciones/mantenimiento, cuidado personal no clínico. Siete desarrollos cerrados según C01; cobertura y residencia son diferentes. Sin geocodificación, proveedores externos, ranking, favoritos ni reseñas.
2. Título 3–120; descripción 20–2000 caracteres Unicode; textos normalizados NFC/trim. Producto: precio entero positivo seguro en centavos MXN, unidad 1–60, disponibilidad finita entera ≥0 o por encargo sin cantidad. Servicio: precio y unidad/cantidad nulos; se presenta «Requiere cotización». Modalidades: entrega, recogida, domicilio, establecimiento; combinación pertinente al tipo. Cobertura ≥1 desarrollo del catálogo, sin duplicados. Respuesta 1–1440 minutos; preparación ≥0 y ≤525600 minutos (límite técnico anual, no promesa comercial). Comida exige ingredientes, alérgenos y conservación; «No declarado» no se transforma en ausencia de alérgenos.
3. Versión inmutable al enviarse. Nueva edición crea borrador nuevo; anterior aprobada puede seguir pública si segura. Enviar no publica. Revisión de la versión exacta por revisor distinto del titular y con autorización/MFA actuales. Rechazo/corrección guarda motivo. Solo una versión pública. Stock cero se muestra agotado, sin reservar ni vender.
4. Pausar bloquea publicación inmediatamente, conserva versiones. Cambio de disponibilidad pausa la versión pública y exige revisión de la nueva. Miembro/oferente suspendido/pausado o pertenencia no vigente oculta lista/detalle/perfil; no destruye historial. Reanudar exige aprobación actual y datos seguros; sin botón público de habilitación.
5. Fotos hasta seis, JPEG/PNG, 5.000.000 bytes por original. Solo derivados locales validados, sin metadatos, sirven en público. Procesamiento interno y entrega de derivados implementados en UC009; carga autenticada pendiente; visualización web de fotos implementada y probada. Ningún archivo arbitrario se publica ni se aceptan URLs externas. Las pruebas con actores ficticios no acreditan M1 real.
6. Consulta: q ≤120 caracteres, categoría, desarrollo atendido, modalidad, tipo; filtro desconocido/repetido/inválido →422. limit predeterminado24, máximo50. Orden updated_at DESC/id DESC; cursor versionado con frontera exacta de microsegundos y huella de filtros. Cursor ajeno al filtro/mal formado →422; no es credencial. Lectura viva: cambios entre páginas pueden mover elementos; reiniciar consulta obtiene estado reciente, sin prometer snapshot.
7. No caché compartida de elegibilidad: no-store en respuestas; reconsulta en cada petición. Detalle oculto/inexistente →404 idéntico. Perfil solo de oferente habilitado/miembro vigente; no dirección, correo, cuenta de pago o comprobantes. Catálogo no crea pedido, cotización, reserva o ingreso.
8. Mutaciones internas: expected_version, clave UUID por actor/operación y hash canónico; misma clave/cuerpo devuelve resultado, distinto →409. Recibo/transición/evento atómicos. Fallo de DB→503, nunca lista vacía. Sin efectos externos. Eventos locales no equivalen a entrega M9. No política de retención de datos reales inventada.

## Casos, trazabilidad y pruebas

Prefijos UC/SEQ/UI=MAR-M3-; API=MAR_M3_API_; pruebas=MAR-M3-UT/IT/PF-BE/FE-. DATA001 es fuente DBML/DDL de M3. Todos comienzan diseñados, sin pruebas acreditadas por esta tabla.

| UC | Actor, entrada y resultado | SEQ:pasos | API | Datos | UI | Pruebas y recuperación |
|---|---|---|---|---|---|---|
| 001 Explorar | Público; filtros/cursor → página elegible estable | 001:S010–S090 | 001 GET /v1/catalog/offers | SellerEligibility/Offer/OfferVersion | 001 | UT001 filtros/cursor; IT001 empates, microsegundos, frontera borrada, suspensión, SQL malicioso, campos privados; PF001 10/1000/10000 ofertas. Red/503 conserva filtro y permite reintento |
| 002 Detalle | Público; UUID → versión pública o404 | 002:S010–S070 | 002 GET /v1/catalog/offers/{id} | mismas, fotos validadas | 002 | UT002 proyección; IT002 pausada/retirada/no aprobada/suspendida/ajena; FE002 retorno y404 sin contenido viejo |
| 003 Perfil | Público; UUID → perfil mínimo y página por seller | 003:S010–S070 | 003 GET /v1/catalog/sellers/{id} | SellerEligibility | 003 | IT003 proyección y suspensión; FE003 carga/error, ninguna dirección privada |
| 004 Crear/editar | Oferente propio elegible; datos → borrador/version nueva | 004:S010–S100 | 004 POST /v1/offers;005 PATCH /v1/offers/{id} (objetivo) | Offer/OfferVersion/CommandReceipt/Event | 004 | UT004 límites/tipo/comida; IT004 idempotencia/dos actores/conflicto/reinicio; borrador no público |
| 005 Enviar | Titular; versión exacta completa → pendiente | 005:S010–S090 | 006 POST /v1/offers/{id}/submit (objetivo) | versión/evento/recibo | 004 | UT005 campos/fotos sin validar; IT005 CAS concurrente, respuesta perdida→repetir clave |
| 006 Revisar | Revisor autorizado/MFA, no dueño; versión → aprobada/corrección/rechazada | 006:S010–S110 | 007 POST /v1/offers/{id}/decisions (objetivo) | OfferVersion/Offer/Event/CommandReceipt | 005 | UT006 permisos/estados; IT006 dos revisores, versión vieja, autorrevisión, motivo, publicación única; refrescar tras409 |
| 007 Pausa/disponibilidad | Dueño; versión/stock → pausa inmediata, sin reescribir historial | 007:S010–S090 | 008 POST /v1/offers/{id}/pause (objetivo) | Offer/OfferVersion/Event/CommandReceipt | 004 | UT007 stock; IT007 detalle tras pausa y versiones intactas; FE007 doble envío y409 |
| 008 Elegibilidad | Puerto M2 vigente; restricción → ocultar inmediatamente | 008:S010–S080 | Puerto interno, sin endpoint público | SellerEligibility/Offer | 001–003 | IT008 suspensión entre lista/detalle, proveedor caído falla cerrado, pertenencia≠cobertura |
| 009 Fotos | Dueño; original → cuarentena/análisis/derivado válido | 009:S010–S100 | 009 GET /v1/catalog/photos/{id}/{size}; ingreso interno | Photo/OfferVersion | 004 pendiente | UT009 MIME real/tamaño/6máximo; IT009 EXIF, análisis fallido, concurrencia y lectura autorizada; PF009 tamaño/recursos. Procesamiento/entrega probados; carga HTTP autenticada/UI pendientes |

## Estados y errores

Oferta: activa/pausada. Versión: borrador→pendiente→aprobada/correccion/rechazada. Nueva edición conserva versión anterior; ninguna mutación reescribe versión pendiente/aprobada. Estado público es una conjunción de oferta, versión, seguridad y elegibilidad. UI: inicial/consultando/lista/vacío/error/cargando_mas/error_pagina/retirada; una respuesta tardía de otro filtro se descarta y cancelar no elimina datos de otra consulta.

400 JSON ilegible;401 sin identidad;403 actor no elegible/rol/MFA;404 recurso oculto/ajeno;409 versión/estado/clave;422 campos/cursor;429 cuota con Retry-After cuando exista limitador;503 dependencia. No declarar implementado 429 hasta probar limitador. Respuestas con código/mensaje/request_id/acción, sin stack/cuerpo/secretos.

## Pruebas antes de ejecutar

Unitarias BE: validaciones, visibilidad, transiciones, permisos y proyección. FE: validar respuestas, conservar filtros, cancelar/desorden de solicitudes, error de página y reintento. Integración BE: Nest HTTP+PG17 real exclusivo; escenarios internos usan actor controlado, no acreditan Auth/MFA reales. FE: transporte HTTP real con API exclusiva; pantallas/builds Android/iOS/web tras revisión visual. Regresión: rutas M3/módulo y hashes M1 inmutables; no suites M1 que detienen proveedores. Hooks existentes conservados al commit.

PF001: PG17 real, consulta/repositorio y HTTP por separado; dataset ficticio 10/1000/10000, filtros/empates, concurrencia1/5/10, calentamiento1s/medición5s. Registrar p50/p95/p99, operaciones/s, errores y RSS/CPU del proceso; recursos globales no inferidos. Objetivo local propuesto p95≤500ms y cero respuestas incorrectas, no capacidad productiva. Prueba no sustituye filtros/permisos. PF-FE001: transporte/estado con cancelación y latencia; después carga/render de pantallas aprobadas, separado de backend.

## Cola y condición de salida

| Orden | Pendiente | Dependencia y evidencia de salida |
|---|---|---|
| D1 | Inventario/aislamiento/lectura | Raíz, ramas, hashes, procesos; lectura parcial identificada |
| D2 | Secuencias/DBML/DDL/YAML/Swagger | Generación determinista, parser y trazabilidad revisados antes del código |
| D3 | Propuesta visual | Tres pantallas y estados; revisión del usuario registrada antes de TSX |
| E1 | Lecturas públicas y casos internos | DTO/capas/persistencia/contrato/negativos reales |
| E2 | Fotos y mutaciones autenticadas | Puerto M1/M2/M8 real disponible; integrar después, sin modificar módulos ajenos ahora |
| E3 | Cliente independiente | Adaptador/estado probados; pantallas solo tras D3 |
| V1 | Calidad/rendimiento/regresión | Actas propias; no reutilizar verdes M1 como M3 |
| V2 | Aceptación | Plataformas, manual y revisión; ninguna integración main autorizada |

M3 sigue incompleto mientras fotos, mutaciones con identidad vigente, UI/plataformas y revisión estén pendientes. Documentar interfaces y probar actores ficticios permite independencia; no transforma esas dependencias en resueltas.

## Corrección de rendimiento antes del cambio

Primer PF001: cero errores, pero p95 hasta1414,67ms a10000 coincidencias/concurrencia10; objetivo local500ms incumplido. EXPLAIN real estimó1 fila y recorrió10000, con50364 bloques en caché y ordenación posterior. Corrección diseñada: estadísticas PostgreSQL de la expresión exacta título+descripción y ANALYZE tras cargar cada dataset. Nueva migración M3 002; 001 ya aplicada es inmutable. No forzar plan ni eliminar filtros/permisos. Repetir misma carga y regresión; si no mejora, conservar fallo y diagnosticar de nuevo. Fuentes primarias consultadas15-10-2026: [CREATE STATISTICS](https://www.postgresql.org/docs/17/sql-createstatistics.html), soporte de expresión/ANALYZE. [pg_trgm](https://www.postgresql.org/docs/17/pgtrgm.html) evaluado para búsquedas selectivas; no se instala por este paso.

Incidencia FE001 antes de corregir: transporte Node pasó, Chrome mostró error sin petición. Experimento real: fetch directo200, invocado como método de CatalogClient «Illegal invocation», ligado a globalThis200. Corregir receptor, añadir regresión con contrato nativo y repetir navegador/API real. No aceptar Node como prueba suficiente de navegador. Misma búsqueda/cursor/permiso; sin cambio visual.

Accesibilidad antes de corregir: axe en detalle señaló page-has-heading-one. SEQ001/002/003:S080 incorpora encabezado principal semántico UI001/002/003; añadir aria-level1 al título, sin cambiar aspecto, y repetir axe yrecorrido. No ignorar la regla.

## Autorización vigente de sincronización — 15-10-2026

El usuario autoriza expresamente commits, push y acciones ordinarias del desarrollo sin confirmaciones rutinarias. Esta autorización posterior permite sincronizar la rama aislada M3 y sustituye la restricción anterior de no push. No autoriza gasto, despliegue, integración a main o cambios ajenos. Las demás operaciones externas conservan sus límites. Aplicar los permisos obligatorios del entorno sin omitir controles.

## Plan de cierre de validación web — 15-10-2026

Sin cambio de alcance, pantallas, datos o API. UC001 → SEQ001:S020/S080 → API001 → Offer/OfferVersion → UI001: comprobar categoría real, búsqueda con Enter y conservación de filtro al volver. UC002 → SEQ002:S060/S080/S090 → API002 → UI002: simular retirada 404 en transporte, no mostrar detalle previo y recuperar con reintento. Las respuestas 404 simuladas son pruebas de interfaz, no prueban por sí solas elegibilidad del servidor; esa rama tiene integración PostgreSQL propia.

PF-FE001: Chrome local, viewport 390×844, contexto limpio por muestra, una muestra de calentamiento y diez medidas secuenciales. Medir carga hasta primera oferta visible, búsqueda hasta resultados y detalle hasta oferente visible, con API/PG propios. Registrar p50/p95/máximo, recursos JS, paint y heap JS si está disponible. Objetivos locales definidos antes de ejecutar: p95 carga ≤3000 ms; búsqueda/detalle ≤1000 ms; cero errores JavaScript. No medir durante builds o carga de PostgreSQL. No acredita INP de campo, Safari o plataformas nativas.

## Preparación reproducible y separación de pruebas — 15-10-2026

Defecto detectado por revisión: el patrón general de integración backend recoge M3 aunque su PostgreSQL no esté preparado; además CI genera solo el cliente Prisma M1. Corrección prevista: suite M3 con configuración propia y nombre fuera del patrón general, manteniendo su guardia obligatoria; preparar cliente M3 sin conexión ni migraciones mediante script propio llamado tras la preparación existente. No iniciar servicios de M1 ni cambiar sus contratos/migraciones. Cliente Prisma M3 generado bajo src/generated/m3, dentro de la exclusión de artefactos generados ya existente, sin cambiar reglas de capas. Verificar generación, compilación M3, seis integraciones reales y controles de arquitectura. No atribuir ejecución local a CI remoto.

Control de arquitectura: el primer análisis incluyó artefactos antiguos de Prisma; se conservan fuera del árbol de código en artifacts/m3. Tras corregirlo, capas/ciclos pasaron; duplicación detectó tres bloques del contrato TypeScript generado. Ubicar ese derivado bajo la carpeta generated de M3, ya excluida por la regla general de derivados. No excluir código escrito a mano ni rebajar umbral cero.

## UC009: procesamiento aislado de fotos — diseño previo, 15-10-2026

Entrada interna: actor ficticio autorizado por dueño y elegibilidad vigente, UUID de versión en borrador, posición 1–6 y clave UUID de foto; Buffer JPEG/PNG real de 1–5.000.000 bytes. Ninguna ruta de carga HTTP ni rol enviado por el cliente. Comprobar permiso antes del archivo y repetir en la transacción final. Misma clave/versión/posición/hash original devuelve la foto existente; clave distinta en posición ocupada o versión enviada produce 409. Hasta seis fotos por versión, serializadas mediante bloqueo de oferta. No reescribir fotos de versiones pendientes/aprobadas.

SEQ009:S040: guardar original exclusivamente bajo artifacts/m3/photos con nombres UUID propios y permisos privados. No servir archivos de esa carpeta estáticamente. Ante fallo conservar original/orfandad privada; no borrar sin política aprobada. Nunca URL externa ni nombre/ruta del usuario.

SEQ009:S060: Sharp fijado y su libvips identificado; decodificación real con failOn warning, máximo 16 millones de píxeles, dimensiones hasta 8192, una página y solo JPEG/PNG por firma y decodificador. Proceso hijo independiente: un trabajo simultáneo, tiempo máximo 5 segundos, salida limitada; sin shell. Autoorientar, fondo blanco para transparencia y recodificar JPEG, sin conservar EXIF/XMP/IPTC/ICC. Crear detalle hasta 1600 px y tarjeta hasta 480 px sin ampliar. Comprobar de nuevo formato, dimensiones, metadatos, bytes y SHA256 de los derivados. No equivale a antivirus ni moderación humana.

SEQ009:S080: solo insertar Photo ready tras completar ambos derivados y revalidar dueño/elegibilidad/borrador en PostgreSQL. Archivos parciales o filas ausentes no son públicos. Nueva migración003 agrega integridad de derivados; no cambia001/002 ni M1. GET /v1/catalog/photos/{id}/{size}, size card/detail, revalida oferta no pausada, versión pública aprobada y oferente vigente en cada lectura; devuelve JPEG no-store/nosniff con longitud fija, nunca original. Inexistente/oculta404 idéntico; integridad/dependencia503. Lista/detalle proyectan solo fotos ready de su versión pública en orden de posición. El cambio visual de galería queda separado; se puede revisar el binario público directamente.

Trazabilidad UC009→SEQ009:S020/S040/S060/S080/S090/S095→API009→Photo/OfferVersion/Offer/SellerEligibility→UI001/002 futura→UT/IT/PF-BE009. Pruebas previas: tamaño/firma/ruta, imagen truncada, SVG disfrazado, EXIF GPS eliminado y orientación aplicada, píxeles excesivos, límites/tiempo/busy del proceso, idempotencia/conflicto/concurrencia séptima foto, actor ajeno, versión enviada, original no servido, visibilidad revocada, integridad corrupta503 y recuperación. Rendimiento: 1 warmup + 10 imágenes ficticias 1600×1200 secuenciales, p95 local≤2000ms por par de derivados, cero errores; registrar versión/plataforma/tiempo/bytes/recursos disponibles. No objetivo productivo.

Incidencia PF001 con fotos: la regresión midió cero errores, pero p95 hasta 2883,03 ms, superior al objetivo local 500 ms. Conservar acta y obtener plan real. Corrección prevista: limitar/materializar primero la página y agregar fotos después, dentro de una sola consulta SQL, manteniendo filtros, permisos, orden y frontera. No ocultar el fallo ni rebajar el objetivo. Volver a ejecutar integración y la misma carga.

Dependencia: revisión oficial del 15-10-2026 identifica Sharp 0.35.5, publicado 27-09-2026, posterior a la selección inicial 0.35.1. Fijar 0.35.5 y repetir fotos antes de entregar. Documentar binario libvips y licencias; no declarar auditoría legal o antivirus. Fuentes: https://sharp.pixelplumbing.com/changelog/v0.35.5/ , https://sharp.pixelplumbing.com/api-constructor/ , https://sharp.pixelplumbing.com/api-output/ .

Plan real PF001: agregado de fotos se ejecuta 25 veces, no 10000. La causa observada es estimación de tres coincidencias frente a 10000 reales; produce 10000 búsquedas de oferta y 10000 recorridos de oferente. La paginación previa por sí sola no corrige esa estimación. Materializar la proyección elegible antes del filtro de texto, después limitar la página y agregar fotos; conservar una sola consulta y permisos vigentes. Posponer formato de fecha hasta la página final. No desactivar algoritmos del planificador ni cambiar umbrales.

Segundo PF001: materializar todas las ofertas elegibles mejoró tamaños pequeños, pero p95 de 10000/concurrencia10 siguió en 2099,91 ms. Sustituir esa lectura completa por la relación lateral de una sola versión pública por oferta (LIMIT1, coherente con la FK), siguiendo índice de ofertas/orden y aplicando filtros de versión dentro de esa relación; frontera y oferente fuera. Materializar únicamente la página final antes de agregar fotos. Mantener semántica, sin cambiar configuración del planificador. Repetir la misma prueba.

La primera relación lateral usó SELECT * interno y el rol público lo rechazó por columnas privadas. La integración detectó 503; se conserva acta y se enumeran únicamente columnas públicas, sin ampliar permisos.

Recuperación UC009 antes del ensayo: con la API M3 propia, obtener un derivado íntegro, detener únicamente PG etiquetado M3 y exigir503 también para fotos; reiniciar ese contenedor y comparar exactamente los bytes del derivado. No iniciar/parar M1. El original sigue privado y no forma parte de la lectura pública.

UI009/001/002 antes del cambio: aplicar los bloques de imagen de la propuesta visual ya aprobada, que permanecían sin implementar. SEQ001/002:S080 y SEQ009:S080/S085 → API001/002/009 → Photo → tarjeta/ detalle. Validar lista de fotos, UUID y URL exclusiva local antes de renderizar; máximo seis. Sin URL externa ni credenciales. Mostrar primera imagen en tarjeta y todas en detalle; error no oculta oferta ni permite carga. Pruebas UT-FE009 metadatos/URL, IT-FE009 imágenes reales y fallback, regresión completa web/axe/320/1280 y medición PF-FE001; Android/iOS pendientes.


## Resultado vigente de fotos — 15-10-2026, MAR-CHAT-008

Procesamiento interno y entrega pública de derivados implementados; tarjeta y detalle web muestran imágenes ficticias y conservan oferta/acciones ante error recuperable. Las capturas reales finales de catálogo, detalle y perfil fueron revisadas localmente. No hay carga HTTP autenticada. UC009 permanece incompleto; M3 conserva 3/9 criterios implementados y 0/9 aceptados. Android/iOS/Safari, integración M1/M2/M8 y aceptación pendientes.

Resultados verificables en tests/results: 44/44 unitarias M3; cobertura de líneas 96,24% y ramas 93,55% del ámbito declarado; 16/16 integraciones, incluidas nueve de fotos; 17 comprobaciones web aprobadas. Axe sin infracciones detectadas en catálogo/detalle y sin desbordamiento a 320/1280; no acredita WCAG completo. Reinicio de PostgreSQL aislado: catálogo/foto devolvieron 503 y recuperaron contenido e integridad.

Rendimiento local: procesador Sharp 0.35.5, diez muestras tras calentamiento, p95 109,590 ms frente al objetivo local de 2000 ms. Nueve escenarios de repositorio sin errores; peor p95 83,32 ms frente a 500 ms. Navegador con primera imagen decodificada: p95 carga 326,566 ms, búsqueda 159,638 ms y detalle 152,610 ms; objetivos 3000/1000/1000 ms. Sin extrapolar a producción ni dispositivos físicos.

Se conservan fallos y diagnóstico: la consulta inicial estimaba tres coincidencias frente a 10000 y excedía el objetivo. La corrección final usa proyección pública explícita y búsqueda lateral de versión, pagina antes de agregar fotos y no amplía permisos. EXPLAIN final local: 1,468 ms. Migración M3 003 aplicada e inmutable; 001/002 y migraciones M1 intactas. Sharp y su grafo nuevo están fijados en lockfile; la afirmación anterior de lockfile sin cambios corresponde al incremento anterior.

Originales privados y derivados operativos están ignorados por Git. Fuentes sincronizadas no se editaron ni subieron. Solo el añadido M3 de 01 debe conciliarse con 006/007 antes de reemplazar la fuente compartida; 00/02/03 y configuración no cambian. Continuidad: completar ingreso autenticado cuando existan contratos de identidad/elegibilidad/revisión compatibles, manteniendo aislamiento y sin integrar a main.


## CI remoto M3 — 15-10-2026, antes de ajustes

Run 38823788870 sobre 221ad41: calidad y arquitectura/contratos aprobados; 207 pruebas aprobadas pero gate de líneas nuevas falló (135/2090, 6,46%). El informe general de cobertura no incluye M3; también cuenta tipos generados como desconocidos. No bajar el 80% ni omitir lógica para aparentar cumplimiento: completar cobertura y medición antes de acreditar gate. Seguridad: SBOM, licencias y vulnerabilidades sin corrección pasan; GitLeaks señaló el identificador histórico de perfil Sonar, no una credencial. Verificado mediante git show 4af0e279: profile.key=AaFBim1byffhRH0TlHOJ, nombre Sonar way core y número de reglas. Añadir excepción exacta por regla, ruta y línea; preservar análisis de secretos.

Brecha ejecutable: el workflow general no ejecuta las integraciones M3. Añadir workflow exclusivo con PostgreSQL 17.11 fijado por digest multiarch, puerto/base/roles M3 idénticos, migraciones propias, API y Expo web efímeros, unitarias/coverage de ámbito declarado, integración real, contratos regenerados, Chromium/axe, y recuperación. Ningún servicio M1 local ni migración M1 cambia. Los resultados remotos se registran por SHA; cobertura global de código nuevo permanece pendiente hasta prueba completa, sin aprobar por resultados locales o por este workflow específico.


Plan adicional de cobertura CI: ampliar medición M3 a capas de persistencia/transporte e interfaz renderizada, mediante integración PostgreSQL/HTTP existente y React Native Web en DOM de ensayo. Mantener umbral 80%; no confundir este DOM con navegador real, ya probado aparte. Publicar LCOV por ámbito y combinar hits del mismo archivo/línea al evaluar el diff. Excluir solamente derivados reproducibles de tipos OpenAPI, que carecen de ejecución; interfaces no deben convertirse en líneas ejecutables. No excluir lógica nueva ni bajar líneas base M1. Diagnóstico local dirigido antes de CI.


Diagnóstico dirigido: 65 pruebas M3 (44 unitarias,16 integración previa,5 render con React Native Web/DOM) pasan. El primer cálculo ampliado daba 75,12% porque no incluía los JS compilados ejecutados; al incluirlos con mapas de fuente alcanza 82,75% de líneas, todavía con Prisma generado contado. Conservar generado fuera del ámbito propio y no acreditar worker hijo (sin cobertura medida). El control del diff recibirá ambos LCOV; comparar contra merge-base de main para el incremento, manteniendo línea base global histórica. Tipos generados OpenAPI y módulos exclusivamente de tipos no tienen ejecución; comprobar regeneración antes de omitirlos. No omitir archivos de lógica sin LCOV: siguen descubiertos.

CI general: separar ejecución de pruebas y evaluación agregada; cobertura agregada requiere éxito de unitarias y M3, y build requiere esa evaluación. El mismo workflow M3 será reutilizable, sin duplicar ejecución automática en cada push. No modifica lógica, contratos, migraciones o servicios M1.


CI d2a53ce, run38825249579: ensayo completo M3 remoto aprobado, unitarias/calidad/arquitectura aprobadas. Seguridad bloquea MIT-0 de @csstools/color-helpers6.1.2 y @csstools/css-syntax-patches-for-csstree1.1.15, transitivas de jsdom, no vulnerabilidades pendientes ni secretos en ese run. Textos LICENSE.md revisados localmente, idéntico SHA256947e32047a166cd05f04e45938d172b412c07cbee0b9735afd14bae30e02c2f6. Añadir revisión limitada a esos nombres/versiones/hash; ninguna aceptación genérica de paquetes desconocidos.

Incidencia de ensayo del gate: la primera prueba bajo hook heredó variables GIT_* y alteró core.bare/identidad Fixture de configuración Git compartida. Restaurados core.bare=false y ausencia de identidad Fixture; ramas/archivos de aplicación no alterados por el ensayo. Corregida limpieza de variables para todos los subprocesos del repositorio temporal; tres ensayos pasan también desde los hooks, 210 unitarias globales aprobadas. Mantener esta regresión y no repetir inicializaciones con variables heredadas.


Gate remoto d2a53ce: falló antes de evaluar cobertura porque gh rechazó sobrescribir el reporte m3-full-coverage.json ya versionado al extraer todo el artefacto sobre el checkout. Corrección previa: descargar artefacto M3 a artifacts/ci/m3-evidence y leer allí su LCOV, sin sobrescribir fuentes/reportes del checkout. El mismo run/SHA y dependencias obligatorias se conservan.


## Cierre integral de M3 en aislamiento — plan vigente

El usuario solicita terminar el alcance inicial, no cerrar por incrementos técnicos. Completar UC004–009 por recorridos unidos: dueño consulta su lista, crea/edita borrador, añade fotos, envía; revisor autorizado consulta pendientes y derivados privados, decide con motivo; versión aprobada aparece en catálogo; dueño pausa y deja de aparecer; restricción de elegibilidad oculta inmediatamente. UC001–003 conservan lo aprobado. No sumar aceptación por fixtures.

Implementar una composición Nest privada separada e inyectable, sin importar M1 y sin montarla en el bootstrap público actual. El puerto CurrentIdentity resuelve credencial opaca/cookie a actor vigente en cada solicitud; actor/rol/MFA nunca proceden del cuerpo. Ausente/revocado401, rol/MFA insuficiente403, dependencia503. Web mutante requiere origen explícito y CSRF verificado por el puerto; Bearer móvil no usa cookie. Pruebas del puerto con proveedor ficticio no acreditan proveedor M1 real. No crear login/OTP ni duplicar M1. La proyección SellerEligibility seguirá siendo fixture M2; persistencia la comprueba dentro de la transacción. M8 se consume como autorización del revisor; no se construye administración de M8.

API004–008 conservan forma, idempotencia, revisión exacta y errores existentes. Añadir API010 GET /v1/offers (propias o pendientes según rol, límite/cursor ligados al actor/ámbito), API011 GET /v1/offers/{id} (versiones/fotos privadas de propio recurso o revisor vigente/MFA), API012 PUT /v1/offers/{id}/versions/{version}/photos/{photo}?position=1 (bytes JPEG/PNG ≤5MB, identificadores cerrados), API013 GET /v1/offers/{id}/photos/{photo}/{size} (derivado privado íntegro, sin original). No copiar expedientes M2 ni aceptar URL/nombre de archivo del cliente. Sin migración de datos adicional: usar tablas M3 existentes y migraciones inmutables.

Trazabilidad: UC004→SEQ004:S010/S020/S040/S060/S080→API004/005/010/011→Offer/Version/Receipt/Event→UI004→UT/IT-BE/FE004; UC005→SEQ005:S010–S090→API006→mismas→UI004→IT005; UC006→SEQ006:S010–S110→API007/010/011/013→Version/Photo/Event/Receipt→UI005→IT006; UC007→SEQ007→API008/011→Offer→UI004→IT007; UC009→SEQ009:S010/S020/S025–S095→API012/013→Photo/Version→UI004/005→IT009. Revisar secuencias antes del código.

UI004: Mis ofertas y formulario por pasos (tipo/datos; precio/disponibilidad/cobertura; fotos/resumen/envío), máximo tres acciones principales, errores junto al campo/paso conservado y refrescar tras409. UI005: pendientes, versión exacta y fotos; aprobar/corrección/rechazo con motivo, sin autorrevisión. Misma paleta y componentes de propuesta aprobada; propuesta ampliada presentada antes de TSX. No simular éxito si falta sesión/servicio. Cliente recibe transporte/sesión por contrato, sin manejar login de M1 ni guardar credenciales en localStorage.

Pruebas necesarias: transporte privado Nest+PostgreSQL real con puerto de identidad controlado;401/revocación/CSRF/origen/rol/MFA/autorrevisión/ajeno/versionado/clave/6fotos/errores/reintento/caída. Recorrido frontend completo con servicios M3 propios y actores ficticios; no equivale a integración real M1/M2/M8. Rendimiento proporcional de mutaciones/fotos y regresión pública; CI del mismo SHA. Native builds y aceptación humana conservan sus límites explícitos. No declarar módulo completo hasta que cada criterio original tenga su salida; dependencias reales ausentes se registran como integración pendiente, sin aprobarlas por simulación.

Copia ejecutora temporal independiente en /private/tmp/marleva-m3-008/repo; conserva rama, historial y remoto GitHub. Dependencias clonadas localmente sin instalación nueva; herramientas existentes en lectura. La copia managed previa se conserva y se actualizará solo mediante fast-forward seguro al final si sigue limpia. Ninguna operación nueva usa el Git compartido de M1.


Detalle de composición antes de cliente: API014 GET /v1/offers/context devuelve actor mínimo, permisos de interfaz, oferentes propios elegibles y CSRF ligado a la sesión suministrado por CurrentIdentity. No emite sesiones, valida OTP ni reemplaza M1. Cookie de sesión sigue HttpOnly; cliente conserva CSRF en memoria y usa credentials:include/origen explícito. Puerto para nativo puede aportar Bearer desde el almacenamiento del host; M3 no guarda credenciales. CORS de ensayo admite la web M3 propia8103/8104. El contrato de identidad puede devolver csrfToken para contexto cookie; ausencia no inventa un nonce válido. Sin proveedor instalado, gestión falla cerrado con mensaje recuperable. Los fixtures solo se instalarán en composición de pruebas protegida por MARLEVA_M3_CHECK, no en bootstrap público ni en código productivo de identidad.

## Cierre del incremento de gestión — 15-10-2026

Composición privada Nest implementada y separada del bootstrap público. Proveedor de identidad requerido por inyección; el servidor de pruebas usa sesiones opacas ficticias con guardia, fuera del runtime público. API004–008/010–014, formulario por pasos, cola de revisión y lectura privada de fotos implementados. No se añadió migración ni se modificaron contratos/migraciones M1.

Navegador real: nueve comprobaciones de gestión aprobadas en m3-management-web.json, además de 17 de regresión pública en m3-web.json. Dos contextos ficticios separados: respuesta perdida después de commit y reintento con misma clave, foto privada realmente decodificada, envío, revisión por otro actor, publicación con foto, edición inmutable de stock, corrección/nueva versión y pausa/retirada. Axe sin infracciones detectadas en formulario/revisión; anchos320/1280 sin desbordamiento. No acredita WCAG completo ni plataformas nativas.

Fallo encontrado y corregido: UC009→SEQ009:S020→API012→UI004. Comparar JSON de campos alimentarios con orden distinto tras PostgreSQL producía «Guarda los cambios antes de añadir fotos» sin cambios reales. Proyección normaliza los tres campos, y la regresión de render devuelve campos reordenados. El recorrido completo posterior pasó.

Revisión independiente estática previa a integración: detectó conservación de lista/cursor privados al cambiar de actor y ante403 por revocación. Corrección: invalidar datos/cursor, cargar primera página del nuevo actor y borrar proyección ante401/403 de sesión/elegibilidad/revisión. Dos regresiones de render cubren fallo tras cambio de actor y revocación entre contexto/lista. No se relajaron reglas ni umbrales.

Autorización más reciente: el usuario solicita commit, push e integración a main para cerrar. Sustituye el límite anterior de no merge; no autoriza despliegue, gasto ni datos reales. Main remoto tiene avances de otros chats: conservarlos al resolver integración. CI00be2d5 completo aprobado en38825788866; ese resultado no acredita los cambios posteriores de gestión.

Plan proporcional PF-BE004 antes de medir: HTTP Nest/PostgreSQL propios, identidad ficticia inyectada, tres calentamientos y20 muestras a concurrencia1 por creación de borrador y lista propia24; p95≤500ms y cero errores inesperados como objetivo local, no compromiso productivo. Sin carga paralela a otras pruebas M3; conservar fixtures sin borrar datos. Fotos y catálogo conservan sus mediciones separadas.

PF-BE004 local:20 muestras por escenario tras tres calentamientos, concurrencia1; p95 creación66,613ms y lista94,231ms, cero errores, objetivo local500ms cumplido. Acta m3-management-performance.json; no capacidad productiva.

Integración preparatoria con main bf948c9: ocho conflictos documentales/configuración/lockfile resueltos conservando avances M1/Sonar y M3. Sonar conserva su gate y recibe además cobertura M3 del mismo run; no se excluye código para aprobar. Validación de integración mediante PR para evitar disparos duplicados push/PR en la rama M3. Main sigue disparando CI. Respuestas privadas llevan no-store, comprobado por integración.

CI PR9/run38841960927 sobre bfae37b: calidad,273 unitarias, arquitectura/contratos, dependencia, M3 completo87 pruebas/navegador/performance, cobertura, integración y web aprobados. Bloqueos: CodeQL marcó tipo de UUID y cinco rutas de foto; añadir comprobación explícita de tipo y confinamiento de ruta, manteniendo formato. Gitleaks escaneó69 commits e incluyó14 hallazgos de ramas M2 no ancestras de HEAD; limitar historial a HEAD (incluye todo su historial), sin excepciones de secretos ni reducción de reglas. M2 se analizará al incorporarse a la rama correspondiente. Sonar completó baseline64files y falló inventario de lenguaje del head; conservar gate, añadir diagnóstico numérico mínimo para corregir coherencia de inventario sin omitir fuentes.

Inventario Sonar: el ámbito esperado cuenta TS/TSX, pero el scope de carpetas también incluye .gitignore nuevo de infraestructura M3. Hacer explícita la inclusión TS/TSX para concordar inventario y analizador, sin excluir ningún archivo de lógica de ese ámbito. Conservar diagnóstico numérico de discordancia y gates. No atribuir el fallo remoto a esta causa hasta comprobar la siguiente ejecución.

## Consolidación009: corrección Sonar antes del código —15-10-2026

Run38843137074, SHA4641875: Sonar informa dos credenciales de fixture incrustadas en prisma-sql, lectura de ruta CLI en sharp-photo-worker, ordenación sin comparador y dos NaN globales. Duplicación279 líneas proviene exclusivamente de generated/api.ts (tipos reproducibles desde OpenAPI), no de lógica propia; comprobar regeneración y omitir solo ese derivado del cálculo CPD, manteniéndolo en análisis y sin bajar gate.

UC010→configuración de conexión: exigir M3_DATABASE_URL y M3_ADMIN_DATABASE_URL explícitas; conservar destino exclusivo/roles y fallo cerrado ante falta. CI proporciona configuración sintética, nunca secretos reales. Unitarias ausencia/rol/destino; integración PG del mismo módulo. UC009→SEQ009:S060: padre lee original privado con NOFOLLOW/tamaño/tipo regular y envía bytes por stdin acotado al hijo; hijo no recibe ni abre rutas CLI. Mantener5MB, timeout, memoria/píxeles/metadatos y estado503/422. Añadir negativa de symlink y argumento CLI ignorado por trabajador; repetir fotos/performance/regresiónM3/contratos y hooks. Sin nueva UI/contrato/datos/migración ni relajación de análisis.

PF009-PIPE previo: PNG sintético1600×1200, proceso hijo real, tres calentamientos y diez muestras a concurrencia1; medir p50/p95/máximo y RSS padre. Objetivo local p95≤500ms, cero errores/metadatos, salida íntegra≤5MB. No inferir capacidad productiva ni memoria total del hijo. Regresión89M3 pasó antes del ajuste puramente estructural de lectura para respetar anidación; hooks y CI confirman la versión final.
