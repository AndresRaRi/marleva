# M3: catálogo aislado

MAR-CHAT-008. 15-10-2026 America/Merida. Diseño previo al código. Autorización: solicitud actual del usuario para desarrollar M3 aislado. C01–C26 y 02 §§1/3/6/10–14 conservados. No integra M1/M2/M8 ni acredita M3 terminado.

## Límites y arquitectura

Rama codex/feat-m3-catalogo-008 desde main 6fed44f. API Nest independiente, sin importar main/config/database de M1. PostgreSQL exclusivo `marleva_m3_008`, esquema `m3`, contenedor `marleva-m3-008`, red propia y puerto 127.0.0.1:55432; API 127.0.0.1:3103. No usar 3000/8443/543xx/546xx, secretos, volúmenes ni servicios existentes. No push, PR, publicación o llamadas a proveedores: el límite actual «no operaciones externas» prevalece sobre sincronización habitual. Git local conserva el incremento.

Capas reales: controller/DTO → casos → dominio y puertos → repositorio Prisma/PostgreSQL. Cliente: adaptador HTTP y estado de consulta independientes de pantallas. Una composición exclusiva de M3 conecta el módulo; la composición M1 permanece intacta.

M2 aún se diseña en 007. El catálogo consume una proyección de elegibilidad explícitamente ficticia, con revisión/estado/versionado. No copia expedientes ni convierte OTP en residencia. Las mutaciones se ejercitan mediante casos internos con actores ficticios en pruebas; no hay cabecera HTTP que permita elegir rol. Las rutas privadas no se montan hasta integrar identidad/roles actuales mediante un puerto, en otra etapa autorizada. Proyección pública enumera campos permitidos, nunca devuelve entidades completas.

## Reglas cerradas para este incremento

1. Cinco categorías: comida/postres, artículos cotidianos, clases, reparaciones/mantenimiento, cuidado personal no clínico. Siete desarrollos cerrados según C01; cobertura y residencia son diferentes. Sin geocodificación, proveedores externos, ranking, favoritos ni reseñas.
2. Título 3–120; descripción 20–2000 caracteres Unicode; textos normalizados NFC/trim. Producto: precio entero positivo seguro en centavos MXN, unidad 1–60, disponibilidad finita entera ≥0 o por encargo sin cantidad. Servicio: precio y unidad/cantidad nulos; se presenta «Requiere cotización». Modalidades: entrega, recogida, domicilio, establecimiento; combinación pertinente al tipo. Cobertura ≥1 desarrollo del catálogo, sin duplicados. Respuesta 1–1440 minutos; preparación ≥0 y ≤525600 minutos (límite técnico anual, no promesa comercial). Comida exige ingredientes, alérgenos y conservación; «No declarado» no se transforma en ausencia de alérgenos.
3. Versión inmutable al enviarse. Nueva edición crea borrador nuevo; anterior aprobada puede seguir pública si segura. Enviar no publica. Revisión de la versión exacta por revisor distinto del titular y con autorización/MFA actuales. Rechazo/corrección guarda motivo. Solo una versión pública. Stock cero se muestra agotado, sin reservar ni vender.
4. Pausar bloquea publicación inmediatamente, conserva versiones. Cambio de disponibilidad pausa la versión pública y exige revisión de la nueva. Miembro/oferente suspendido/pausado o pertenencia no vigente oculta lista/detalle/perfil; no destruye historial. Reanudar exige aprobación actual y datos seguros; sin botón público de habilitación.
5. Fotos hasta seis, JPEG/PNG, 5.000.000 bytes por original. Solo derivados locales validados, sin metadatos, sirven en público. Falta el procesador de carga/análisis: ninguna carga arbitraria se acepta ni publica. Fixtures visuales propios no acreditan pipeline real. API de fotos y procesamiento permanecen pendientes; no URL externa proporcionada por el cliente.
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
| 009 Fotos | Dueño; original → cuarentena/análisis/derivado válido | 009:S010–S100 | Puerto Archivos (pendiente) | Photo | 004 | UT009 MIME real/tamaño/6máximo; IT009 EXIF, análisis fallido, concurrencia y lectura autorizada; PF009 tamaño/recursos. Sin implementación del pipeline no acreditar este caso |

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
