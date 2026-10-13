# Contexto central de Marleva

Reglas confirmadas de comunicación y continuidad: [INSTRUCCIONES_PROYECTO_MARLEVA.md](INSTRUCCIONES_PROYECTO_MARLEVA.md). Usar lenguaje común, textos puntuales y tablas útiles, sin iconos; analizar y verificar antes de recomendar. No asumir datos faltantes. Leer contexto, plan y principios completos en cada chat y guardar los cambios antes del cierre. Las propuestas de módulos y orden del asistente aún no están confirmadas; el siguiente trabajo es cerrar alcance y diseño integral antes del código.

Actualizado: 9 de octubre de 2026. Este documento recoge las decisiones y preferencias del usuario para continuar el proyecto sin reconstruir toda la conversación. Distingue acuerdos, propuestas y asuntos pendientes.

## Qué queremos construir

**Marleva es una plataforma comunitaria para descubrir, ofrecer y contratar productos y servicios entre vecinos de Gran Santa Fe, Mérida, Yucatán.**

Queremos hacer visible la oferta de los propios vecinos: comida por encargo, postres, artículos, masajes, clases, reparaciones y otros servicios. No hace falta tener un local comercial. También puede participar un vecino que tenga su negocio fuera del conjunto y quiera atender a otros vecinos de Gran Santa Fe.

La plataforma debe permitir encontrar una oferta cuando se necesita, sin depender de haber visto un anuncio en una conversación de WhatsApp. Esta es la hipótesis central del producto; todavía no se ha medido cuánto ocurre ese problema ni validado su solución con usuarios reales.

## Lo que buscamos como negocio

Construir un negocio útil, sostenible y con una propuesta diferenciada dentro de una comunidad grande. La población por sí sola no demuestra viabilidad: debemos comprobar que los vecinos encuentran ofertas relevantes, contactan a oferentes, concretan compras y regresan; y que los oferentes obtienen resultados por los que podrían pagar.

Preferencia explícita del usuario: trabajar de forma organizada, puntual y sin rodeos; hacer las cosas bien y encontrar un negocio atractivo. Los siguientes trabajos deben producir entregables y decisiones concretas, con evidencia y pendientes visibles.

Requisitos reforzados por el usuario: facilidad, practicidad, sencillez, pocos pasos, respuestas correctas y que el usuario no se pierda. El piloto debe evitar costos innecesarios sin sacrificar calidad. Antes de avanzar a construcción, contar con un plan completo y procesos reales, verificables y funcionales. Aplicar estándares pertinentes sin sobreingeniería. `PLAN_EJECUCION_MARLEVA.md` propone etapas, responsables, entregables y criterios de aceptación; los umbrales, costos, fechas y stack no se consideran aprobados solo por estar documentados.

## Decisiones confirmadas

- **Nombre: Marleva.** Elegido por el usuario. Se propuso como juego entre Mars, su identidad personal, y llevar/acercar. No implica un servicio propio de reparto.
- **Enfoque: toda la comunidad de Gran Santa Fe.** Mantener cada desarrollo identificable, con posibilidad de explorar todo el conjunto.
- **Pertenencia: el oferente debe formar parte de Gran Santa Fe.** Tener un negocio cercano o atender a domicilio en la zona no basta por sí solo.
- **Sin requisito de local comercial.** Se incluyen emprendimientos desde casa, servicios a domicilio y negocios externos de vecinos.
- **No expandir el catálogo a proveedores de los alrededores.** El usuario considera que perder el enfoque comunitario rompería la propuesta.
- **Pendientes demográficos pausados por el usuario.** No bloquear la definición comercial por terminar Paraíso, validar límites o verificar ocupación actual.

Descriptor de trabajo, todavía propuesto: **“Productos y servicios entre vecinos de Gran Santa Fe”.** La disponibilidad de Marleva como marca, dominio, usuario de redes y nombre en tiendas de aplicaciones no se ha investigado. La investigación de aplicaciones llamadas Mars no valida Marleva.

## Los siete desarrollos

1. Gran Santa Fe I.
2. Gran Santa Fe II.
3. Gran Santa Fe Norte I.
4. Gran Santa Fe Norte II.
5. Gran Santa Fe Norte III.
6. Cerradas de Gran Santa Fe.
7. Paraíso Santa Fe.

Separar siempre el desarrollo donde pertenece el oferente, los desarrollos que atiende y el lugar donde presta el servicio. Un vecino con negocio fuera puede mostrar esa modalidad sin abrir el catálogo a negocios externos ajenos a la comunidad.

## Propuesta de primera versión, aún por validar

Un catálogo con perfiles y publicaciones, organizado por categoría y desarrollo atendido. Cada oferta muestra descripción, fotos autorizadas, precio o cotización, disponibilidad, modalidad de atención/entrega y contacto comercial por WhatsApp. Considerar favoritos, actualización de datos y moderación de perfiles/publicaciones.

No publicar el domicilio particular exacto de un oferente; la recogida puede acordarse directamente. Definir cómo se comprueba la pertenencia comunitaria: seleccionar un desarrollo y confirmar un teléfono no son pruebas suficientes de residencia.

Se recomendó empezar con un sitio web para celular compartible por enlace y evaluar una PWA/app instalable después. **Es una recomendación, no una decisión final de tecnología ni un producto ya construido.** El usuario quiere una experiencia sencilla y un nombre con fuerza de app.

Chat propio, logística de reparto, pagos integrados, red social general, avisos y reportes municipales no están aprobados como núcleo de la primera versión. El producto prioritario es la oferta entre vecinos.

## Cómo se propone probar el negocio

Preparar una definición de negocio de una página y una prueba con ofertas reales autorizadas. Se sugirió un piloto de 30 días con 15–20 vecinos oferentes, contacto por WhatsApp y un catálogo móvil. Los tamaños, plazos y criterios de éxito están pendientes de aprobación y diseño; el piloto no se ha iniciado.

Medir contactos pertinentes, pedidos confirmados, compradores que regresan y oferentes que pagan. Un clic de WhatsApp no equivale a una venta. Se propuso acceso gratuito para vecinos y probar herramientas o presencia destacada de pago para oferentes después de demostrar resultados. **No hay precio, modelo de cobro o previsión de ingresos definidos.** La publicidad, si existe, conserva el requisito comunitario.

## Qué sabemos y qué no sabemos

- Análisis geoespacial provisional: cinco zonas suman **12,302 habitantes y 5,691 viviendas del Censo 2020**, en 128 manzanas sin duplicación. Se usaron límites comunitarios de OpenStreetMap, aún sin validación oficial completa.
- Gran Santa Fe II incluye una manzana de Caucel añadida en la corrección del filtro de localidad. Usar los archivos actualizados, no el subtotal anterior de 12,281 habitantes y 5,681 viviendas.
- Norte III: plano del desarrollador de noviembre de 2023 con **1,763 viviendas previstas**. El escenario de unas **4,230 personas** supone 80% del programa construido y ocupado y tres personas por vivienda. No es población medida ni capacidad construida confirmada.
- Paraíso: el usuario identificó el plano de WhatsApp. Nueve rótulos legibles suman **1,006 viviendas previstas**, con dos conteos pendientes. Es un subtotal incompleto.
- No sumar conteos censales, capacidades de proyecto y estimaciones como si fueran un total actual comparable.
- La investigación pública encontró comercios, proveedores externos, opiniones y problemas comunitarios. No confirmó todavía un inventario de emprendimientos de residentes, demanda por Marleva o disposición a pagar.
- No se inspeccionaron chats privados de WhatsApp ni grupos privados de Facebook; no se contactó a vecinos o negocios, ni se publicaron ofertas reales.

## Corrección clave del enfoque anterior

Las primeras investigaciones se centraron demasiado en locales y proveedores cercanos. **No usar esas listas como catálogo inicial de Marleva.** El criterio de inclusión correcto es pertenencia a la comunidad. Las noticias y opiniones del entorno sirven como antecedentes; no justifican cambiar el núcleo del producto a un portal municipal o directorio de todo Mérida.

## Documentos de apoyo

- `ENFOQUE_COMUNITARIO_GRAN_SANTA_FE_APP.md`: detalle de alcance y propuesta de producto.
- `INFORME_GRAN_SANTA_FE.md`: metodología, cifras y limitaciones demográficas.
- `gran_santa_fe_resultados.json`, `gran_santa_fe_resumen.csv`, `gran_santa_fe_limites_osm.geojson`: resultados y geometrías provisionales.
- `INVESTIGACION_PUBLICA_GRAN_SANTA_FE.md`: fuentes públicas, señales y candidatos externos; contexto secundario.
- `ANALISIS_COMERCIAL_GRAN_SANTA_FE.md`: propuesta comercial anterior; sus hipótesis requieren revisión con el enfoque comunitario.

## Próximo paso recomendado

El usuario pidió evaluar tecnología estándar, sencilla, portable y global, frontend/backend separados dentro del mismo repositorio, bajo acoplamiento, alta cohesión, servicios externos económicos y evolución DevOps. La recomendación investigada está en `ARQUITECTURA_PROPUESTA_MARLEVA.md`: TypeScript, Next.js, NestJS, PostgreSQL y contenedores. **Es propuesta técnica, no stack aprobado ni implementado.**

Verificar disponibilidad del nombre Marleva y concretar la prueba de negocio: quién ofrece, qué problema resolvemos, cómo se incorporan perfiles, qué se mide y qué resultado permitiría invertir en el producto. No iniciar publicaciones, contactar a terceros o asumir aprobación de cobros solo por existir este contexto.

## Actualización confirmada — 12 de octubre de 2026

Consultar y aplicar [PRINCIPIOS_Y_REFERENCIAS_MARLEVA.md](PRINCIPIOS_Y_REFERENCIAS_MARLEVA.md) como instrucciones permanentes. Esta copia conserva íntegramente el texto anterior como antecedente; esta actualización y las instrucciones más recientes del usuario prevalecen en caso de contradicción.

El usuario confirma MVP1 modular de principio a fin: autenticación passwordless, pedidos dentro de la plataforma, compra directa y servicios con cotización, pagos online y efectivo, entrega/recogida por oferentes inicialmente, límites geográficos y moderación. Se conservan los siete desarrollos y la pertenencia comunitaria de oferentes. WhatsApp como flujo principal y una versión sin pedidos/pagos internos quedan sustituidos como propuesta de MVP1; no se aprueba una integración de mensajería.

Generar ingresos y alcanzar rentabilidad real es objetivo comercial obligatorio; no hay comisiones, suscripciones, tarifas ni proveedores aprobados. Desarrollo local primero: el techo de inversión no bloquea el trabajo local autorizado, pero costos y autorización deben resolverse antes de comprometer gasto o publicar. Stack, cloud, método concreto passwordless, políticas operativas y lista exacta de módulos siguen por cerrar según corresponda. El catálogo anterior no representa por sí solo el MVP1 completo.

Cerrar pendientes uno por uno, registrar decisiones confirmadas/propuestas/pendientes y no reabrir sin motivo. Completar y confirmar una única línea base de módulos y aceptación, congelarla y enviar ideas nuevas al backlog. Estudiar los trece referentes indicados en el nuevo archivo, especialmente onboarding, con evidencia verificable; el benchmark no se ha realizado en esta entrega.

Siguiente entrega: ficha única de alcance MVP1 con módulos, responsables, dependencias, exclusiones y criterios verificables. Los tamaños y plazos del piloto anteriores siguen siendo propuestas. Esta actualización documental no autoriza desarrollar la app, contactar terceros, contratar servicios ni publicar.


## Continuidad — ficha MVP1, 12 de octubre de 2026

El usuario encargó cerrar alcance y diseño integral antes de programar. Se prepararon [funcionalidades, módulos, dependencias, exclusiones y aceptación](ALCANCE_MVP1_MARLEVA.md), [registro común de decisiones](REGISTRO_DECISIONES_MARLEVA.md) y [referentes con fuentes y límites](REFERENTES_MVP1_MARLEVA.md). Esta ficha prevalece como propuesta actual sobre las antiguas listas de módulos; todavía no está congelada ni aprobada en conjunto.

Confirmación nueva C09: cualquiera puede explorar el catálogo, pero solo vecinos de los siete desarrollos pueden comprar y ofrecer. B1 queda cerrado. La forma de comprobar pertenencia de compradores y oferentes sigue pendiente en B2. No se aprobó ningún método de autenticación, tarifa, pasarela o stack.

Se leyeron completos los tres documentos vigentes, el enfoque comunitario y la arquitectura propuesta. La revisión documental inicial conserva los trece referentes y sus límites; no se observaron recorridos autenticados ni se probaron pagos. La arquitectura anterior requiere añadir pedidos, cotizaciones y pagos; sus proveedores y cuotas no se verificaron en esta entrega.

Estado real: primera ficha entregada; módulos y exclusiones adicionales propuestos; recorridos, diagramas, estados, datos, APIs y base aún sin cerrar. Sin software, publicación, contratación o contacto a terceros. Siguiente paso: B2, regla de pertenencia y alta/habilitación de compra; después B3–B6 y diseño común. B7 se cierra antes de la base del proyecto. Presupuesto de lanzamiento y demografía no bloquean este trabajo documental.

## Estándar confirmado de chats

Usar [ESTANDAR_CHATS_MARLEVA.md](ESTANDAR_CHATS_MARLEVA.md) en cada chat: apertura con ID, fecha, tema, objetivo y entregables; cierre con archivos del resultado y continuidad, evidencia, pendientes y prompt revisado. No asumir aprobación por cerrar. El próximo chat preparado es MAR-CHAT-002, alcance y diseño integral de MVP1; consultar [CONTINUIDAD_MAR_CHAT_001.md](CONTINUIDAD_MAR_CHAT_001.md). Todavía no se ha creado.
