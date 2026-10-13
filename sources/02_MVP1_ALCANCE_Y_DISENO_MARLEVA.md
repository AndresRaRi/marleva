# Marleva: alcance y diseño de MVP1

Versión 1.0. Fecha de consolidación: 12 de octubre de 2026. Estado: ficha para cierre, no alcance aprobado ni diseño completado. Reglas: [00_GUIA_PRINCIPAL_MARLEVA.md](00_GUIA_PRINCIPAL_MARLEVA.md). Decisiones y pendientes: [01_ESTADO_Y_DECISIONES_MARLEVA.md](01_ESTADO_Y_DECISIONES_MARLEVA.md). Evidencia: [03_REFERENTES_Y_EVIDENCIA_MARLEVA.md](03_REFERENTES_Y_EVIDENCIA_MARLEVA.md).

La ficha siguiente conserva la propuesta funcional disponible. Sus referencias a carpetas antiguas describen su origen, no el orden vigente de lectura. Los IDs M1–M10 y B2–B7 se conservan para no romper trazabilidad. El estado y los responsables se mantienen en 01; las reglas operativas y el diseño se completan aquí cuando se resuelvan. No usar los recorridos de aceptación como orden de cobro aprobado.

# Marleva: ficha de alcance MVP1

Fecha: 12 de octubre de 2026. Estado: primera ficha para cierre; capacidades confirmadas, división en módulos y límites adicionales propuestos. No es una línea base aprobada ni autorización de desarrollo.

## Base vigente

Leídos completos: contexto, plan y principios de `entregables/`, enfoque comunitario y arquitectura de `sources/`. Prevalece la actualización del 12 de octubre: pedidos y pagos internos sustituyen el antiguo flujo principal por WhatsApp. Las fuentes sincronizadas se conservan intactas.

Comunidad confirmada: Gran Santa Fe I y II; Norte I, II y III; Cerradas de Gran Santa Fe; Paraíso Santa Fe. Solo oferentes pertenecientes a ella. Se admiten trabajo desde casa, atención a domicilio y negocio externo de un vecino. Pertenencia, cobertura y lugar de atención son datos distintos.

## Funcionalidades y módulos propuestos

“Confirmada” identifica la capacidad; no aprueba automáticamente los detalles de esta tabla. Los criterios son objetivos de comprobación, todavía sin pruebas ejecutadas.

| ID / módulo propuesto | Funcionalidades | Base | Dependencias | Exclusiones | Criterio de aceptación propuesto |
|---|---|---|---|---|---|
| M1 Acceso y cuenta | Registro e inicio sin contraseña; sesión, salida y recuperación; permisos de comprador, oferente y administración | Sin contraseña confirmado; canal pendiente | Acceso confirmado C09; método B3 | Contraseñas propias; varios canales iniciales por defecto | Reintento y sesión vencida permiten continuar; otra persona no accede a cuenta ajena |
| M2 Comunidad y oferentes | Solicitud de pertenencia, revisión, perfil y cobertura por desarrollo; modalidades de atención | Confirmada; prueba de pertenencia pendiente | M1; reglas de M8; B2 | Proveedores ajenos; domicilio particular público; aprobación como garantía de calidad | Un no aprobado no publica; negocio externo conserva vínculo con el vecino |
| M3 Catálogo y ofertas | Crear, editar, pausar; categoría, fotos, precio o cotización, disponibilidad; búsqueda y filtros | Catálogo confirmado; campos y categorías por diseñar | M2, M8 | Ampliar resultados a proveedores externos; favoritos y reseñas propuestos para después | Solo ofertas elegibles visibles; sin resultados comprensible; precio y modalidad claros |
| M4 Pedidos de compra directa | Resumen, cantidades, total, modalidad, envío, aceptación/rechazo, historial y seguimiento | Pedido interno confirmado; un oferente por pedido propuesto | M1–M3; M6, M7; B4 | Carrito de varios oferentes; sustituciones automáticas; cambios de precio tras aceptar | Repetir envío no duplica pedido; guarda lo comprado y el importe acordado |
| M5 Solicitud y cotización | Describir necesidad; respuesta con trabajo, importe, fecha/modalidad y vigencia; aceptar/rechazar; convertir en pedido | Confirmada; forma de negociación propuesta | M1–M3; M4, M6, M7; B4 | Chat general, subastas, cobro por horas abiertas, agenda automática | Cotización vencida no se acepta; una aceptación crea un pedido con la versión aceptada |
| M6 Pagos y conciliación | Online y efectivo; intentos, resultado, reintento, reembolso y registro de importes recibidos/debidos | Ambas formas confirmadas; destinatario y proveedor pendientes | M4/M5; B5, B6 | Monedero propio, crédito, pagos divididos entre oferentes; suscripción sin aprobar | Pago y pedido tienen estados separados; confirmación del proveedor verificable; no hay doble cobro |
| M7 Entrega, recogida y servicio | Oferente atiende; modalidad, plazo, dirección privada cuando se necesita; marcar listo/en camino/completado según caso | Responsable confirmado; reglas de cierre pendientes | M4/M5, M6; B4, B6 | Repartidores de Marleva, mapa en vivo, optimización de rutas | Rechaza cobertura no permitida; datos privados solo para participantes autorizados; servicio y producto pueden completarse |
| M8 Moderación e incidencias | Revisión de pertenencia/ofertas; reportes, motivos, suspensión; ayuda vinculada al pedido y resolución registrada | Moderación confirmada; procedimiento pendiente | M1; aplica sobre M2–M7; B2, B6 | Red social, reportes municipales; automatización de disputas | Moderador autorizado registra motivo; suspensión no borra obligaciones de pedidos abiertos |
| M9 Avisos de operación | Mostrar solicitudes, aceptación, pago, cotización y problemas; envío externo solo por canal elegido | Necesario para operar; módulo y canal propuestos | M1, M4–M8; B3/B4 | WhatsApp API, SMS y notificaciones móviles por defecto; campañas | Estado disponible en cuenta aunque falle aviso externo; fallo de aviso no duplica operación |
| M10 Medición y operación | Pedidos completados, repetición, ingresos propios, costos, soporte y moderación; exportación operativa | Objetivo comercial confirmado; eventos por definir | M4–M8; B5 | Equiparar ventas totales a ingresos de Marleva; panel analítico complejo | Distingue pedido, pago, devolución e ingreso propio; registra trabajo operativo |

Módulo significa un grupo de responsabilidades del producto. No exige un servicio o despliegue separado. M8 no se construye “al final”: aporta permisos y revisión desde el alta del primer oferente. M6 y M7 deben diseñarse junto con M4 y M5 para que el pedido sea realizable.

## Límites propuestos para contener MVP1

| Propuesta | Razón | Consecuencia |
|---|---|---|
| Un oferente por pedido; productos de precio fijo en compra directa | Una aceptación, entrega y liquidación por operación | Comprar a otro vecino requiere otro pedido |
| Una solicitud de servicio produce una cotización vigente a la vez; cambios crean una nueva versión | Guardar qué aceptó el cliente | Trabajo, importe y fecha se acuerdan antes del pedido; no se cambia silenciosamente |
| Solicitud estructurada y aclaraciones ligadas a ella | Permitir cotizar sin un chat general | Diseñar información mínima y respuesta cuando falten datos |
| Disponibilidad y plazo definidos por oferente; sin agenda sincronizada ni promesa de entrega inmediata | Cubrir encargos y servicios con pocas dependencias | Se necesita aceptación y vencimiento de solicitudes |
| Cobertura por los siete desarrollos con comprobación operativa de dirección dudosa | Evitar depender ahora de polígonos sin validar | No prueba ubicación automáticamente; no amplía cobertura ni reabre demografía |
| Avisos en cuenta y un canal externo por elegir | Que el oferente conozca pedidos sin tener abierta la página | El canal de acceso no queda elegido por esta propuesta |
| Posponer favoritos, reseñas, promociones, anuncios, referidos, app nativa, IA y mapas embebidos | No son necesarios para cerrar una compra o servicio | Van a la lista para después; no se eliminan controles de seguridad o ayuda |

Confirmado fuera: proveedores ajenos a la comunidad, reparto propio inicial y portal municipal. Las restantes exclusiones son recomendaciones de esta ficha, no decisiones previas del usuario.

## Responsables y dependencias

| Trabajo | Responsable propuesto | Dependencia / salida |
|---|---|---|
| Preparar fichas, referencias y diseño común de M1–M10 | Asistente en este encargo | Usuario resuelve decisiones materiales; documentos revisables |
| Confirmar acceso, reglas comunitarias, operación y negocio | Usuario/promotor | B2–B6; registro de confirmaciones |
| Revisión de pertenencia, moderación, soporte y efectivo | Operador por designar por el usuario | Procedimientos definidos en diseño; persona asignada antes del piloto |
| Comparar método de acceso y pagos disponibles en México | Asistente, sin crear cuentas ni contratar | B3/B5; costos y límites con fuentes actuales |

Orden de diseño propuesto: acceso (regla de elegibilidad confirmada) y pertenencia → catálogo → compra directa y cotización con pagos/atención → incidencias y avisos → datos, APIs y aceptación común → decisión técnica y base documental. No es orden de programación aprobado.

## Únicamente pendientes que bloquean el cierre

No todos bloquean la tabla actual. Cada pendiente indica el entregable que detiene. Se resuelven en este orden; no hace falta decidirlos todos a la vez.

| ID | Decisión necesaria | Bloquea | Recomendación inicial | Quién resuelve |
|---|---|---|---|---|
| B2 | Qué acredita pertenencia de compradores y oferentes; quién revisa, cómo corregir rechazo; ofertas permitidas/restringidas | Alta, habilitación de compra, revisión y publicación | Revisión manual con evidencia mínima y acceso privado; declaración o teléfono solos no bastan. Establecer criterios antes de aceptar reales | Usuario con propuesta documental del asistente |
| B3 | Método sin contraseña, recuperación y canal de avisos | Recorridos de acceso y errores; contrato de identidad | Comparar código por correo con teléfono y acceso social en México; no elegir por parecido con Airbnb | Asistente investiga; usuario confirma la opción material |
| B4 | Unidad del pedido, disponibilidad, aceptación y vencimientos; contenido/vigencia de cotización y fecha de atención | Recorridos, estados y reglas de pedido | Un oferente; no mezclar cotización y productos en el mismo pedido; guardar importe y trabajo aceptados | Usuario confirma límites; asistente concreta reglas rutinarias |
| B5 | Quién recibe el pago online, cuándo se cobra/paga al oferente y cómo cobrará Marleva | Diseño financiero, selección de pasarela y contratos de pago | Comparar cobro directo al oferente y esquema de plataforma; medir ingresos propios y efectivo aparte. Ninguna comisión elegida | Usuario con evidencia del asistente |
| B6 | Cancelación, no aceptación, ausencia, cumplimiento, reembolso e incidencia; quién decide y registra efectivo | Estados finales, recuperación y aceptación integral | Matriz por etapa y modalidad; distinguir cancelación de devolución; no cerrar por pago solamente | Usuario sobre propuesta del asistente |
| B7 | Canal de producto y stack para la base; proveedor de acceso/pagos tras B3/B5 | Base del proyecto e integración concreta; no la tabla funcional | Mantener propuesta de web móvil y backend modular separado; revisar compatibilidad sin contratar | Usuario; asistente prepara decisión técnica |

Presupuesto de publicación, dominio, marca, fechas/tamaño del piloto y persona operadora no detienen esta ficha ni el trabajo documental actual. Se tratan cuando bloqueen el gasto o el piloto. Demografía sigue pausada. No se aprueban valores ni condiciones de proveedores anteriores.

## Relación con arquitectura anterior

Frontend/backend separados y contratos claros están confirmados. TypeScript, Next.js, NestJS, PostgreSQL, Prisma, pnpm, contenedores, Cloud Run y Supabase siguen propuestos. No se verificaron sus versiones ni precios en esta entrega y no se recomiendan cuotas antiguas como vigentes.

La arquitectura del 9 de octubre cubre un catálogo con contacto: su lista de módulos omite pedidos, cotizaciones, pagos y atención. Debe revisarse después de B3–B6. Se propone conservar un backend modular y añadir estos límites; no introducir microservicios. Favoritos deja de ser prioridad propuesta. “Sin pagos” y “WhatsApp principal” no aplican a MVP1.

## Aceptación integral que deberá quedar diseñada

| Caso | Resultado comprobable futuro |
|---|---|
| Compra online y entrega del oferente | Oferta elegible → pedido aceptado → pago confirmado → entrega completada; sin duplicados |
| Compra en efectivo y recogida | Pedido → listo → recogida → registro de efectivo y cierre; pago no se presume por marcar listo |
| Servicio cotizado online y en efectivo | Solicitud → cotización vigente → aceptación → pedido → pago según regla → servicio realizado |
| Venta desde casa, servicio a domicilio y negocio externo de vecino | Los tres pueden completar su modalidad sin exponer domicilio privado al público |
| Falla o rechazo | Sin disponibilidad, cotización vencida, pago fallido, sesión vencida y conexión interrumpida tienen salida clara |
| Cancelación o suspensión | Motivo y autorizaciones registrados; devolución/obligaciones abiertas no desaparecen |
| Seguridad y accesibilidad | Permisos comprobados en servidor; errores comprensibles, teclado y recuperación; sin afirmar cumplimiento sin pruebas |

## Estado y siguiente paso

Entregados: ficha funcional, registro común y primera investigación documental de referentes. No se han cerrado recorridos, diagramas, datos, APIs ni tecnología. No hay pruebas de producto, ventas, implementación ni validación comercial.

Acceso confirmado: cualquiera puede explorar; solo vecinos de los siete desarrollos pueden comprar y ofrecer. La comprobación concreta para compradores y oferentes se define en B2. Siguiente decisión: B2 y recorrido de alta; continuar B3–B6 antes de estados, diagramas, datos y APIs. Congelar esta ficha solo cuando el usuario confirme sus límites y se cierre su aceptación; cada cambio posterior necesita motivo registrado.

## Arquitectura de partida: propuesta, no decisión

Resumen del documento ARQUITECTURA_PROPUESTA_MARLEVA.md del 9 de octubre. No se aprobaron ni revalidaron proveedores, versiones o cuotas en esta consolidación. El original permanece intacto como antecedente local. Su catálogo por WhatsApp y su omisión de pagos no definen el MVP1 vigente.

| Parte | Propuesta existente | Regla o decisión pendiente |
|---|---|---|
| Repositorio | TypeScript; web Next.js/React y API NestJS/Node.js en un mismo repositorio | Compilación y despliegue separados; confirmar tecnologías en B7. |
| Backend | Una aplicación con módulos; PostgreSQL y Prisma | Límites de negocio públicos; no acceder libremente a datos internos de otro módulo. Añadir pedidos, cotizaciones, pagos y atención. |
| Contrato | REST/JSON, OpenAPI y cliente generado | Validar solicitudes en servidor; tipos de programación no bastan. Confirmar versión y formato de errores. |
| Datos | Entidades de negocio separadas de respuestas públicas; migraciones versionadas | Guardar importes/versiones aceptados y proteger información personal. Modelo completo todavía pendiente. |
| Local | Contenedores y entorno reproducible; datos ficticios; configuración documentada | Sin secretos en código ni Git. Confirmar estructura antes de construir. |
| Acceso y archivos | Integraciones detrás de interfaces pequeñas | Sin criptografía propia; prever migración de cuentas, sesiones y fotos. Proveedor y método en B3/B7. |
| Cloud | Cloud Run para web/API; Supabase para datos/acceso/archivos | Solo candidatos. Revisar costos, regiones, permisos, cuotas, continuidad y condiciones antes de decidir. |
| Calidad | Pruebas de reglas, integración y recorridos completos | Permisos por recurso, prevención de duplicados, errores y recuperación; runner y herramientas por confirmar. |
| Operación | Despliegue reproducible, registros, monitor, backups de datos/fotos y restauración | Volver a una versión del código no revierte automáticamente la base de datos. |
| Crecimiento | Mejorar consultas, índices y fotos antes de separar servicios | Colas, caché, infraestructura como código o app nativa solo por necesidad medida. Sin Kubernetes o microservicios por anticipación. |

No trasladar cifras de planes gratuitos antiguas como si fueran vigentes. Autenticación, correo, almacenamiento, pagos y hosting tienen requisitos y costos distintos. Un enlace de WhatsApp no es una integración gratuita de su API. Evitar mapas o geocodificación si no resuelven una necesidad confirmada; esto no sustituye decidir cómo aplicar cobertura.

## Diseño por completar en este mismo archivo

| Sección | Estado real | Debe contener antes del código |
|---|---|---|
| Reglas y permisos | Pendiente | Actor, acción, condición y prohibición; B2–B6. |
| Recorridos y errores | Pendiente | Entrada, pasos, salida, fallos y recuperación para compra/cotización/atención/moderación. |
| Estados | Pendiente | Estados de cuenta, pertenencia, oferta, cotización, pedido y pago; transiciones y permisos. |
| Diagramas de actividades | Pendiente | Decisiones y caminos alternativos, con nombres claros. |
| Diagramas de secuencia | Pendiente | Usuario, interfaz, API, datos e integraciones; éxito, fallos y reintentos críticos. |
| Modelo de datos | Pendiente | Entidades, relaciones, restricciones, historial y datos privados. |
| Contratos API | Pendiente | Solicitudes, respuestas, autorización, errores, límites y prevención de duplicados. Contrato ejecutable cuando corresponda. |
| Base del proyecto | Pendiente | Tecnologías decididas, carpetas, configuración local, versiones, migraciones, pruebas y preparación productiva. |
| Construcción por módulos | Pendiente | Orden definitivo, dependencias, responsable y aceptación integrada. |

## Comprobación antes de cerrar un módulo

| Revisar | Evidencia necesaria |
|---|---|
| Objetivo y límites | Funciones incluidas y excluidas; decisiones aplicadas. |
| Datos y contrato | Coinciden con reglas y estados; cambios documentados. |
| Uso completo | Recorrido integrado de éxito y errores; resultados comprensibles. |
| Permisos y privacidad | Pruebas de acciones ajenas/no autorizadas y datos mínimos. |
| Accesibilidad y seguridad | Criterios pertinentes comprobados; límites y pendientes visibles. |
| Cobros y duplicados | Pruebas pertinentes de reintentos y conciliación; distinguir simulación de pago real. |
| Operación y costos | Impacto, dependencias, configuración y recuperación conocidos. |
| Cierre | Pruebas apropiadas y criterios cumplidos; resultado actualizado en 01. |

Marcar no aplica con motivo. El checklist es un criterio de trabajo, no evidencia de pruebas realizadas. Antes de producción comprobar recorridos completos, operación, controles, costos y autorizaciones reales.
