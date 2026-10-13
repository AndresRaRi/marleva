# Marleva: referentes y evidencia

Versión 1.20. Fecha de consolidación: 13 de octubre de 2026. Cambiar solo por evidencia necesaria o corrección comprobada. Reglas: [00_GUIA_PRINCIPAL_MARLEVA.md](00_GUIA_PRINCIPAL_MARLEVA.md). Decisiones: [01_ESTADO_Y_DECISIONES_MARLEVA.md](01_ESTADO_Y_DECISIONES_MARLEVA.md). Diseño: [02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md](02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md).

## Cómo leer la evidencia

| Parte | Estado y límite |
|---|---|
| Referentes | Revisión documental inicial conservada del archivo anterior. Las etiquetas describen lo registrado allí; no se repitieron pruebas ni visitas a todas las apps en esta consolidación. Verificar información cambiante cuando una decisión dependa de ella. |
| Demografía | Informe original completo conservado como anexo. No se recalcularon cifras ni se recuperaron datos primarios ausentes. No mezclar censo, capacidad y estimación. Trabajo demográfico pausado. |
| Calidad y proceso | Fuentes oficiales comprobadas para la guía: WCAG, ASVS, Nielsen Norman y GOV.UK. Son referencias para criterios, no cumplimiento acreditado. |

Hay pruebas locales parciales de Marleva en004, registradas al final; no cuentas de referentes probadas, pagos/ventas reales, rentabilidad o disposición a pagar demostradas. Sin tarifas/contratación productiva aprobadas; C26 es referencia documental. Las propuestas se deciden en 01, no por aparecer en esta evidencia.

## Parte A: registro existente de referentes

# Marleva: referentes para el cierre de MVP1

Consulta: 12 de octubre de 2026, Mérida. Primera revisión documental pública. No se probaron cuentas, apps instaladas, pagos ni pedidos. Versión móvil no observada. Las páginas oficiales describen funciones; no prueban mejoras de conversión o rentabilidad. Los mercados consultados no acreditan disponibilidad o condiciones en México.

## Registro de los trece referentes

Todos permanecen en el registro. “Verificado documental” significa que la fuente oficial permite comprobar el hallazgo limitado indicado. No significa que se recorrió la app. Incorporación de oferentes y recuperación de cuenta, salvo los puntos de Airbnb señalados, no observadas en esta revisión. Se investigarán cuando resuelvan B2/B3/B5, sin frenar la tabla funcional.

| Referente / problema / rol | Mercado y canal consultado | Fuente oficial | Hallazgo y límite | Aplicación propuesta / decisión |
|---|---|---|---|---|
| Airbnb: cuenta y primeros pasos; comprador/oferente | Ayuda global, inglés con localización SG; ayuda en español | [Crear cuenta](https://www.airbnb.com/help/article/221), [verificar identidad](https://es.airbnb.com/help/article/1237) | Verificado documental: permite varias vías de registro; distingue alta de cuenta y verificación al reservar/publicar. Verificación no garantiza identidad; no acredita pertenencia a Gran Santa Fe | Adaptar alta por necesidad y separación entre acceso y elegibilidad. No copiar contraseñas ni documentos oficiales por defecto. P01; B1–B3 |
| Uber Eats: recogida; comprador | Ayuda, localización sr-RS; mercado operativo exacto no identificado | [FAQ de recogida](https://help.uber.com/sr-RS/ubereats/restaurants/article/pick-up-order-faq?nodeId=dceda7b6-cc5a-4351-beae-b87ae7c28de9) | Verificado documental: número de identificación para comprobar pedido recogido. No verifica procedimiento mexicano | Adaptar identificación y confirmación de entrega; no implica reparto propio. P02; B4/B6 |
| Glovo: métodos de pago; comprador | FAQ en español; país variable | [Ayuda](https://glovoapp.com/docs/es/faq/) | Verificado documental: los medios disponibles dependen del país y se muestran al pedir; efectivo en moneda local cuando está habilitado | Mostrar medios aplicables a cada operación; no asumir disponibilidad mexicana. B5 |
| Just Eat: recogida y efectivo; comprador | Reino Unido, ayuda web | [Recogida](https://www.just-eat.co.uk/help/article/203097401) | Verificación parcial: índice de búsqueda oficial describe recogida y efectivo en ciertos restaurantes; apertura devolvió una sola línea, sin cuerpo útil. Flujo no observado | Pista para M7; no adoptar condiciones sin lectura adicional. B4/B5 |
| Lieferando: error de pago; comprador | Alemania, centro de ayuda en inglés | [Pagos](https://www.lieferando.de/en/customerservice/section/payments) | Verificado documental: sección específica de pago online fallido. Solución detallada y flujo no revisados | Reservar recuperación de pagos en M6; no deducir métodos/costos. B5/B6 |
| Thuisbezorgd: medios de pago; comprador | Países Bajos, ayuda en inglés | [Opciones de pago](https://www.thuisbezorgd.nl/en/customerservice/topic/payment-options) | Verificado documental: página de ayuda de opciones; efectivo y procedimiento no verificados en texto recuperado | Mantener como referente; no extrapolar opciones desde Lieferando o Just Eat. B5 |
| Wolt: pedido y cobro; comprador | Alemania, condiciones en inglés | [Condiciones](https://explore.wolt.com/en/deu/terms) | Verificado documental: contempla retención al pedir y cargo a la entrega; identifica participantes del contrato y cobro. No prueba que ese esquema esté disponible para Marleva | Separar pedido, intento de pago y cobro; decidir destinatario antes de pasarela. No copiar reglas legales alemanas ni créditos de devolución. P03; B5 |
| Deliveroo: pedido activo, entrega propia e incidencia; comprador | Reino Unido, FAQ web | [Preguntas frecuentes](https://deliveroo.co.uk/faq) | Verificado documental: ayuda dentro del pedido; cancelación solicitada puede depender de preparación; entrega del socio no permite seguir al repartidor como la propia | Adaptar ayuda por pedido y estados manuales sin mapa; no copiar tarifas o condiciones. P02/P04; B4/B6 |
| Bolt Food: efectivo; comprador | Página global en inglés; mercados variables | [Producto](https://bolt.eu/en/food/) | Verificado documental: anuncia tarjeta, efectivo y saldo. Elegibilidad regional y flujo de saldo no comprobados | Mantener efectivo y online ya confirmados; descartar saldo propio propuesto. B5 |
| foodora: ingresos por membresía; comprador | Suecia, condiciones web en inglés | [foodora PRO](https://www.foodora.se/en/contents/subscription-terms) | Verificado documental: membresía con cobro recurrente. No acredita disposición a pagar por Marleva ni conveniencia de suscripción comunitaria | Referencia comercial para comparar después de definir valor; no aprobar suscripciones. B5 |
| DoorDash: preparación y recogida; oferente | Canadá, ayuda comercial web en inglés | [Cómo funciona recogida](https://help.doordash.com/en-ca/merchants/article/order-pickup) | Verificado documental: aceptar, indicar tiempo, avisar al cliente y marcar listo. No prueba capacidad de un oferente doméstico | Adaptar pasos y distinguir listo de completado; sin importar su logística. P02; B4/B6 |
| Grubhub: entrega o recogida; comprador | Estados Unidos, FAQ de integración Yelp | [FAQ](https://www.grubhub.com/help/faq/yelp) | Verificado documental: ambas modalidades; fuente específica de Yelp, no recorrido completo de app | Mostrar modalidad antes de confirmar; no asumir iguales tarifas ni reglas. B4 |
| Instacart: indisponibilidad; comprador | Documentación Storefront en inglés, orientación comercial de EE. UU.; mercado por comercio | [Reemplazos](https://docs.instacart.com/storefront/learn_about_your_storefront/cart_and_checkout/replacements) | Verificado documental: elegir reemplazo o devolución; página actualizada el 25 de agosto de 2026. Describe Storefront, no todas las pantallas de Marketplace | Manejar falta de producto; propuesta MVP1 sin sustitución automática. No trasladar afirmaciones de satisfacción sin estudio. P05; B4/B6 |

## Qué decisiones ayuda a resolver

| ID | Propuesta para Marleva | Evidencia | Consecuencia / límite |
|---|---|---|---|
| P01 | Explorar sin registro y pedir cuenta al comprar/cotizar u ofrecer; pertenencia separada de sesión | Airbnb distingue creación y requisitos de reserva/publicación | La exploración pública es inferencia de diseño, no hallazgo de ese artículo. B1 quedó cerrado en C09: exploración abierta y compra/oferta solo vecinal; canal sin contraseña no se deriva de Airbnb |
| P02 | Estados visibles de aceptación, preparación/listo y entrega/recogida; confirmación identificable | DoorDash y Uber Eats; Deliveroo distingue entrega del socio | Menos dependencia de mapas. Quién confirma cierre, plazo y ausencia se cierran en B4/B6 |
| P03 | Estado de pedido separado del estado financiero; registrar cobro y devolución | Wolt, condiciones de Alemania | Evita tratar “pagado” como “entregado”. Arquitectura propuesta; no elección de retención o pasarela |
| P04 | Ayuda y cancelación vinculadas al pedido con motivo y resolución registrada | Deliveroo FAQ, Reino Unido | Necesario para terminar casos fallidos; política propia pendiente, sin importar plazos legales |
| P05 | Ante falta de producto no cambiar automáticamente lo comprado; rechazo o devolución según etapa | Instacart muestra que reemplazar requiere decisiones propias | Reduce complejidad propuesta; reserva/stock, rechazo parcial y devolución se cerrarán en B4/B6 |
| P06 | Un oferente por pedido | Juicio de diseño por operación de Marleva; no se atribuye a un referente | Simplifica aceptación, atención y liquidación. Es una restricción propuesta, no evidencia de mejora comercial |

La revisión permite proponer patrones. No cierra por sí sola pertenencia, método sin contraseña, monetización o política de pago. No se investigaron tarifas de pasarelas, requisitos fiscales mexicanos ni contratos de plataforma en esta entrega. Para B5 se necesitan fuentes mexicanas vigentes y comparación de cobro al oferente/plataforma antes de aprobar el esquema.

## Continuidad

Estado: investigación inicial terminada para la ficha funcional; estudio específico de acceso/pagos pendiente en sus fichas. Responsable de investigación: asistente. Responsable de decisiones materiales: usuario. Las propuestas P01–P06 se registran en [01_ESTADO_Y_DECISIONES_MARLEVA.md](01_ESTADO_Y_DECISIONES_MARLEVA.md). No hay tarifas aprobadas por esta investigación. El usuario confirmó después la elegibilidad de acceso en C09; no fue aprobada por el benchmark.

## Parte B: informe demográfico original conservado

Origen: INFORME_GRAN_SANTA_FE.md, 9 de octubre de 2026. El contenido siguiente es antecedente documental, no verificación nueva. Los archivos de auditoría mencionados no están disponibles en esta raíz; no afirmar reproducción del cálculo. Los pendientes siguen pausados.

# Gran Santa Fe: cruce geoespacial con Censo 2020

Fecha de elaboración: 9 de octubre de 2026.

## Resultado

Las cifras siguientes son sumas directas de registros de manzana del Censo 2020; no se estimaron personas ni viviendas. “Viviendas” corresponde a `VIVTOT` (viviendas totales). La asignación principal incluye una manzana cuando su punto representativo cae dentro del polígono del desarrollo.

| Desarrollo | Relación OSM | Manzanas | Habitantes (`POBTOT`) | Viviendas (`VIVTOT`) | Viviendas habitadas (`TVIVHAB`) |
|---|---:|---:|---:|---:|---:|
| Gran Santa Fe | 19047420 | 31 | 2,523 | 959 | 797 |
| Gran Santa Fe II | 19047421 | 34 | 5,291 | 2,301 | 1,771 |
| Cerradas de Gran Santa Fe | 19047422 | 9 | 462 | 213 | 151 |
| Gran Santa Fe Norte I¹ | 19047423 | 37 | 3,715 | 1,768 | 1,342 |
| Gran Santa Fe Norte II | 19047424 | 17 | 311 | 450 | ≥127² |
| Gran Santa Fe Norte III | 19047425 | 0 | No calculable³ | No calculable³ | No calculable³ |
| Paraíso Santa Fe | 19047419 | 0 | No calculable³ | No calculable³ | No calculable³ |

Total de los cinco desarrollos calculables: **12,302 habitantes y 5,691 viviendas totales**, distribuidos en 128 manzanas. Estas cifras corresponden a límites comunitarios y siguen siendo provisionales por desarrollo.

¹ La relación cartográfica se llama “Gran Santa Fe Norte”; se interpreta como Norte I por exclusión y por estar separada de Norte II y III.  
² Cinco manzanas tienen `TVIVHAB` suprimido por confidencialidad; 127 es únicamente la suma de valores publicados. `POBTOT` y `VIVTOT`, que son las métricas principales solicitadas, no tienen supresión en las manzanas seleccionadas.  
³ El Marco Geoestadístico 2020 no contiene manzanas urbanas cuyo punto representativo caiga dentro de estos polígonos actuales. Esto **no demuestra población cero**: impide producir un total por manzana con este producto.

## Límites empleados y grado de verificación

Se usaron siete relaciones de límite administrativo nivel 10 de OpenStreetMap (IDs indicados en la tabla). Son polígonos públicos, inspeccionables y reproducibles, pero **no son una cartografía oficial del Ayuntamiento**. Sus versiones consultadas fueron editadas entre el 27 de abril y el 10 de agosto de 2025, por lo que además son posteriores al Censo 2020.

El Ayuntamiento confirma la existencia y nomenclatura general de Gran Santa Fe, Gran Santa Fe II y Gran Santa Fe Norte mediante documentación urbanística y fiscal; el Geoportal municipal permite buscar colonias, direcciones y predios. Sin embargo, no se encontró una descarga pública oficial que separe en polígonos las siete etapas. Por ello, estos resultados deben tratarse como un cruce reproducible con límites comunitarios, no como cifras oficiales municipales por fraccionamiento.

## Metodología reproducible

1. Se descargó de INEGI el Marco Geoestadístico del Censo de Población y Vivienda 2020 para Yucatán y la capa de manzana (`31m`).
2. Se descargó el archivo estatal “Principales resultados por AGEB y manzana urbana” (`RESAGEBURB_31CSV20.csv`).
3. Se reconstruyeron las siete relaciones multipolígono de OpenStreetMap y se conservaron en WGS84.
4. Se revisaron todas las manzanas de Yucatán, sin restringir la localidad censal, y se reproyectaron desde México ITRF2008/LCC a WGS84. La primera versión restringía la localidad a Mérida (0001); la revisión agregó la manzana de Caucel `3105000754439001`, con 21 habitantes y 10 viviendas, a Gran Santa Fe II.
5. Cada manzana se asignó a un solo desarrollo si su punto representativo quedaba cubierto por el polígono. La unión se hizo con `CVEGEO = ENTIDAD + MUN + LOC + AGEB + MZA`.
6. Se sumaron `POBTOT`, `VIVTOT` y `TVIVHAB`. Los asteriscos de confidencialidad se conservaron como valores suprimidos, nunca como cero.

## Control de fronteras y limitaciones

- La regla alternativa “más de 50% del área de la manzana dentro del polígono” coincide con la regla principal en seis de siete polígonos. En Gran Santa Fe agrega la manzana `3105000015776002`: el total alternativo sería 2,846 habitantes y 1,064 viviendas. Esta es la principal sensibilidad del resultado.
- Algunos límites discurren por vialidades y cortan polígonos censales; la regla de punto representativo evita doble conteo, pero no puede dividir los conteos de una manzana.
- Las fronteras OSM son posteriores al levantamiento censal. Un desarrollo construido o delimitado después de marzo de 2020 puede no tener manzanas equivalentes en el Marco 2020.
- El producto por manzana cubre manzanas urbanas; no permite atribuir población rural dispersa dentro de un polígono actual.
- `VIVTOT` incluye viviendas habitadas y no habitadas. Para análisis de demanda residencial conviene mostrar también `TVIVHAB`, con la advertencia de supresión indicada.

## Archivos de auditoría

- `gran_santa_fe_limites_osm.geojson`: los siete polígonos empleados.
- `gran_santa_fe_resultados.json`: totales, claves de manzana y conteos de supresión.
- `gran_santa_fe_resumen.csv`: tabla compacta.
- `analysis_gran_santa_fe.py`: procedimiento reproducible.

## Fuentes

- INEGI, Censo de Población y Vivienda 2020, Principales resultados por AGEB y manzana urbana, Yucatán.
- INEGI, Marco Geoestadístico 2020, Yucatán, capa de manzana.
- Ayuntamiento de Mérida, Geoportal municipal y documentación de Protección Civil/desarrollo urbano.
- OpenStreetMap, relaciones 19047419 a 19047425, licencia ODbL.

## Ampliación con plano de Norte III aportado por el usuario

El plano de Grupo Promotora Residencial / CADEPROCSA S.A. de C.V. identifica Gran Santa Fe Norte III, tablaje 22925, plano de cerradas y fecha noviembre de 2023. Es evidencia del proyecto del desarrollador; por sí solo no acredita un deslinde catastral certificado ni la ocupación actual.

Se transcribieron los rótulos de viviendas, siguiendo los números de cerrada del plano:

| Cerrada | Rótulo de etapa | Viviendas indicadas |
|---:|---|---:|
| 1 | 1E1A | 113 |
| 2 | 1E2A | 100 |
| 3 | 1E3A | 106 |
| 4 | 1E4A | 98 |
| 5 | 1E5A | 103 |
| 6 | 1E6A | 113 |
| 7 | 1E7A | 76 |
| 8 | 1E8A | 76 |
| 9 | 1E9A | 74 |
| 10 | 1E10A | 91 |
| 11 | 2E2A | 93 |
| 12 | 2E3A | 102 |
| 13 | 2E1A | 94 |
| 14 | 2E5A | 148 |
| 15 | 2E4A | 107 |
| 16 | 2E6A | 94 |
| 17 | 2E7A | 76 |
| 18 | 2E8A | 99 |

**Etapa 1: 950; etapa 2: 813; total: 1,763 viviendas indicadas.** La suma refleja el programa residencial dibujado, no un conteo censal ni una verificación de obras terminadas.

La revisión de la cartografía OSM ya descargada encontró dentro de Norte III calles 7, 9, 9 A, 9 B, 9 C, 9 D, 11, 11 A, 11 B, 11 C, 13, 13 A, 13 B y 13 C, presentes en el plano. Esto respalda la identificación de la zona y el trazado general. No se calculó un porcentaje de coincidencia de superficies: el PDF no aporta coordenadas de control y no se ha georreferenciado su línea de límite. El archivo está rasterizado y no contiene texto extraíble.

Se auditó la capa completa de manzanas 2020 de Yucatán, incluidas otras localidades y ambos ámbitos registrados en ella. Norte III y Paraíso siguieron sin manzanas cuyo punto representativo estuviese cubierto por sus polígonos OSM. Este resultado descarta que la ausencia se debiera al filtro anterior de localidad, pero no determina cuántos residentes tuvieron en 2020.

El usuario confirmó posteriormente que la imagen de WhatsApp corresponde a Paraíso Santa Fe. La identificación se registra como información aportada por el usuario, sin convertirla en validación oficial de su perímetro. El recorte carece de fecha y título identificador legibles.

## Escenarios de planeación y lectura de Paraíso

Para Norte III se autoriza trabajar con una estimación. Se usa la capacidad del plano de 1,763 viviendas y tres personas por vivienda ocupada. La ocupación supuesta se aplica al programa total del proyecto; por ello incorpora también el supuesto de que esas viviendas estén construidas/disponibles. Los escenarios no verifican obras ni ocupación:

| Ocupación efectiva del programa | Habitantes estimados, redondeados a decenas |
|---:|---:|
| 60% | 3,170 |
| 80% | 4,230 |
| 100% | 5,290 |

El 80% es una hipótesis de trabajo y tres personas es un redondeo de la relación aproximada observada en los datos locales de 2020. No se presentan como un estándar estadístico externo ni como medición actual.

En la imagen de Paraíso se leen con suficiente claridad nueve conteos de viviendas: 119, 98, 103, 109, 85, 142, 92, 128 y 130. Su suma es 1,006 viviendas indicadas. Hay dos rótulos adicionales sobre la franja izquierda, borrosos o atravesados por flechas, que no se transcriben como cifras confirmadas. **1,006 es un subtotal de lectura, no el total del desarrollo.** No se sustituye un rótulo ilegible por una estimación y no se calcula todavía población total de Paraíso con ese subtotal incompleto.

Las hipótesis de ocupación y tamaño del hogar de Norte III no cambian los resultados del Censo 2020 ni resuelven la correspondencia entre los planos y los polígonos geográficos. Falta una copia más legible del plano de Paraíso o confirmación de sus dos conteos borrosos para completar el cálculo residencial del proyecto.

No se agrega 1,763 al total de 5,691 del Censo: corresponden a fechas, fuentes y conceptos distintos. Para completar habitantes por las siete zonas se necesitan límites georreferenciados verificables y, donde no existe cobertura censal de manzana, información adicional de ocupación o un producto estadístico adecuado. La fecha del plano de 2023 no demuestra por sí sola que todo Norte III se construyera después de 2020.


## Consulta puntual B2 — 12 de octubre de 2026

Motivo: verificar la separación entre cuenta y habilitación antes de diseñar pertenencia. Fuentes públicas oficiales: [alta de cuenta Airbnb](https://www.airbnb.com/help/article/221), ayuda global en inglés con localización SG; [verificación de identidad](https://es.airbnb.com/help/article/1237), ayuda en español. Texto accesible consultado; sin cuenta, app ni pruebas de reserva.

Hallazgo limitado: Airbnb distingue el alta de cuenta de la verificación necesaria para reservar o publicar. Declara que la verificación no garantiza identidad y que los datos aportados no se comparten con otros participantes. Aplicación propuesta: separar sesión, pertenencia y publicación en Marleva; revisar datos privados. No prueba residencia vecinal, eficacia de revisión manual, plazos de documentos ni conveniencia de recoger identificaciones. B2-A/B/C son decisiones propias pendientes, no reglas importadas. Los otros doce referentes conservan su revisión previa; no se afirma nueva consulta a todos.

Cambio: versión 1.1 agrega únicamente evidencia necesaria para B2. La demografía y el registro de trece referentes se conservan.


## B2-C/D: evidencia puntual mexicana — 12-10-2026

Fuentes primarias públicas; consulta de texto pertinente, sin afirmar lectura integral de las 24 páginas de la ley ni auditoría jurídica. [LFPDPPP, Cámara de Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf), texto vigente con última reforma DOF 14-11-2025, artículos 10–16, 18, 20 y 24: tratamiento limitado a finalidades; datos necesarios, adecuados y relevantes; aviso, seguridad, confidencialidad y supresión/bloqueo según conservación aplicable. Límite: no fija 30 días para comprobantes vecinales. La propuesta B2-D requiere calendario propio y revisión de causas de conservación antes de datos reales.

[Buenas prácticas, COFEPRIS](https://transparencia.cofepris.gob.mx/?p=563): lista NOM-251-SSA1-2009 para higiene de alimentos y bebidas; el índice es referencia, no revisión completa de norma ni comprobación de un oferente. [Aviso de riesgo, COEPRIS San Luis Potosí](https://coepris.slpsalud.gob.mx/index.php/391-aviso-de-riesgo-sobre-la-comercializacion-de-medicamentos-en-sitios-web): expone requisitos y riesgos de venta online de medicamentos. Límite: no prueba procedimientos aplicables a cada negocio de Yucatán ni permite declarar cumplimiento.

Aplicación: mantener alimentos en alcance con reglas/requisitos propios y proponer excluir giros que añaden controles al MVP. La lista completa B2-C es una elección de alcance de Marleva, no una lista de prohibiciones legales derivada de esas páginas. Confirmación de B2-A/B procede del usuario, no de estas fuentes. Motivo de versión 1.2: concretar los dos límites pendientes de B2 con evidencia mínima.


## B3: viabilidad de métodos — 12-10-2026

Documentación técnica primaria global de Supabase, no referencia de uso vecinal en México ni elección de proveedor. [Acceso por correo](https://supabase.com/docs/guides/auth/auth-email-passwordless): admite enlace y código de un solo uso; el código se verifica para crear sesión. [Acceso por teléfono](https://supabase.com/docs/guides/auth/phone-login): requiere proveedor SMS y advierte controlar costos/abuso; disponibilidad mexicana, precio y entrega no verificados. [Acceso Google](https://supabase.com/docs/guides/auth/social-login/auth-google): describe integración social; documentación consultada parcialmente, sin cuenta configurada ni recorrido probado.

Aplicación propuesta en 02: comparar correo, SMS y acceso social. El costo real y la preferencia de vecinos siguen sin medir; no afirmar que el correo será gratis o que todos tienen acceso. La pérdida de correo exige diseñar recuperación; pertenencia no sustituye autenticación. No se aprobaron proveedor, precio o método en esta consulta.


### B3: correo productivo y límite de recuperación

Consulta 12-10-2026, documentación global primaria Supabase: [SMTP propio](https://supabase.com/docs/guides/auth/auth-smtp) señala que el envío por defecto está restringido y no destinado a producción; requiere configurar envío propio para uso real. No copiar cuotas como promesa de costo cero. [Cambio de usuario](https://supabase.com/docs/reference/javascript/auth-updateuser) y [sesiones](https://supabase.com/docs/guides/auth/sessions): páginas abiertas, contenido pertinente aún por contrastar antes de elegir integración; no se afirma flujo probado ni aprobación del proveedor. La política de recuperación propuesta en 02 es decisión de diseño propia, no garantía del servicio ni recuperación integral acreditada.

C13/C14 confirmados por el usuario el 12-10-2026; fuente de aprobación en 01. La evidencia no convierte plazos operativos en obligación legal. Motivo de versión 1.3: añadir límite de envío productivo y separar recuperación pendiente de mera creación de cuenta.


## B5: modelos de flujo de fondos — 12-10-2026

[Stripe: cobros directos](https://docs.stripe.com/connect/direct-charges.md?platform=web&ui=stripe-hosted), documentación técnica global: cargos en cuenta conectada, comisión de aplicación y reembolsos con manejo propio de esa comisión; confirmación por eventos del servidor. [Stripe: marketplace](https://docs.stripe.com/connect/marketplace): describe modelo donde la plataforma recibe y paga a oferentes, con responsabilidades de costos/disputas. [Stripe Connect México](https://stripe.com/mx/connect): página accesible, no confirma elegibilidad específica de Marleva ni cuentas de sus vecinos. Página de cuentas legacy consultada como antecedente; no elegir tipos legacy para nueva base por esa lectura. Variante de destination charges no recuperable; no se afirma revisión completa.

Aplicación: comparar destinatario de cobro antes de escoger pasarela, separar pago de atención, comisión propia y devolución. No se verificaron tarifas, alta de un oferente concreto, capacidad fiscal de Marleva ni liquidaciones en México. No hay contratación, cuentas creadas, pruebas o proveedor aprobado. Motivo 1.4: registrar C15 en estado y avance independiente B4/B5.


### B5: evidencia mexicana adicional, 12-10-2026

[Mercado Pago México: integración Split 1:1](https://www.mercadopago.com.mx/developers/es/docs/split-payments/split-1-1/integration-configuration/integrate-marketplace): acceso autorizado a cuenta de vendedor; reparto entre vendedor/marketplace; comisión de proveedor descontada primero y limitaciones para reembolsar cuando vendedor carece de fondos. Los ejemplos con BRL no definen moneda o condiciones de Marleva. [Stripe Connect México, precios](https://stripe.com/mx/connect/pricing): costos varían según modelo de plataforma; no equivale a costo total cero ni aprobación de cuenta específica. Precios no adoptados; comparar contrato/configuración antes de proveedor.

[SAT: declaración informativa por plataformas](https://wwwmat.sat.gob.mx/declaracion/41038/presenta-tu-declaracion-informativa): describe obligaciones bajo intermediación/cobro y retenciones. Solo consulta orientativa de la página oficial, no análisis completo de ISR/IVA ni determinación del régimen de Marleva. No concluir exención de obligaciones por elegir cobro directo. Antes de cobro real faltan revisión de situación del promotor/oferentes, requisitos y facturación.

Motivo 1.5: decisión C16 registrada en 01 y evidencia mínima para el esquema B5. Sin proveedor, tarifas ni resultados comerciales aprobados.


## B5: patrones actuales y costos de movimientos — 12-10-2026

Consulta solicitada por el usuario. Fuentes oficiales, sin cuentas ni pagos probados; no demuestra rentabilidad de Marleva.

| Fuente / mercado | Hallazgo limitado |
|---|---|
| [Uber Eats precios México](https://merchants.ubereats.com/mx/es/pricing/) | Planes Lite/Plus/Premium indican procesamiento incluido; cifras no se adoptan como tarifa Marleva |
| [Uber, pago a establecimientos](https://help.uber.com/es/merchants-and-restaurants/article/cu%C3%A1ndo-recibo-mi-pago-?nodeId=a1753785-9fd9-4fcb-b866-45bdf7bbca7d) | Ayuda en español describe depósitos semanales; localización de ayuda no garantiza condiciones contractuales de todos los mercados |
| [DoorDash FAQ](https://merchants.doordash.com/en-us/faq), EE. UU. | Marketplace cobra comisión sobre subtotal e incluye procesamiento; Online Ordering separa procesamiento; depósitos semanales u opciones diarias |
| [Airbnb tarifas](https://www.airbnb.com/help/article/1857), global con reglas México | Tarifa descontada del pago a anfitrión; hay transición entre estructuras, no asumir un porcentaje mundial único |
| [Airbnb envío de pagos](https://www.airbnb.com/help/article/425), ayuda global | Calendario de envío al anfitrión y tiempos del método de cobro; no trasladar plazos a pedidos de comida |
| [Stripe precios México](https://stripe.com/mx/pricing) | Tarjeta nacional 3.6% + MXN3, excluye IVA; comisiones de procesamiento/Connect originales no se devuelven en reembolso según página |
| [Stripe Connect precios México](https://stripe.com/mx/connect/pricing) | Modelo plataforma controla precios: MXN35/cuenta activa/mes y 0.25% + MXN12 por depósito; modelo donde Stripe factura al conectado tiene estructura diferente |

Los cálculos hipotéticos de versiones anteriores de02 excluían IVA y otros costos; no eran previsión comercial ni costo fiscal final. La ficha consolidada ya no los usa como base de decisión. No combinar modelos de precios distintos. Descuento integrado y depósitos agrupados no equivalen a cero movimientos internos ni eliminan cargos por cada compra. Configuración real y elegibilidad siguen pendientes.

Efectivo: [Uber México, cobro en efectivo para repartidores](https://www.uber.com/mx/es/drive/delivery/cash-delivery/) describe compensación de importes contra ganancias electrónicas y saldos pendientes. Fuente de rol repartidor, no contrato de oferentes Marleva; adaptar solo la idea contable con autorización y soporte del proveedor, sin copiar límite de deuda. No se verificó compensación específica en Mercado Pago/Stripe para cuentas Marleva.

Motivo 1.6: solicitud explícita de comparar funcionamiento actual, ingresos y costo de movimientos; sustituir una elección prematura por decisión con impacto económico visible. B5 no aprobado.


## B6: derechos e información contractual — 12-10-2026

[Ley Federal de Protección al Consumidor, Cámara de Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPC.pdf), texto consultado con última reforma DOF 12-12-2025; lectura puntual de artículos 53–56 y 76 Bis, no de las 119 páginas completas. El artículo 76 Bis exige información del proveedor para reclamaciones y condiciones/costos antes de transacción; artículo 56 contiene revocación y una condición específica de servicios. No cerrar reclamaciones por silencio ni presumir pérdida de derechos por iniciar preparación. Aplicación propia: datos contractuales privados al comprador elegible antes de contratar, separados de residencia; revisión por caso de cancelaciones posteriores al inicio. No se determinó aplicabilidad jurídica de cada giro ni cumplimiento de Marleva. Motivo 1.7: corregir el momento de información contractual y preservar derechos en matriz B6.


## B6: cancelación y confirmación de recepción — 12-10-2026

Consulta solicitada por usuario; evidencia documental, sin cuentas/pedidos probados. [Uber Eats, cancelar pedido](https://help.uber.com/es/ubereats/restaurants/article/cancelar-pedido?nodeId=36d2fa2a-4b17-4ee8-8dfd-b1b72f5e1141), ayuda en español sin mercado contractual comprobado: no cobro antes de aceptación, artículo dice no reembolso al iniciar preparación. [Ayuda es-ES](https://help.uber.com/es-ES/ubereats/restaurants/article/cancelar-un-pedido?nodeId=2dd11499-181c-4849-90c0-ce5b7c3d245c) expresa posible falta de reembolso tras empezar; conservar diferencia y no declararla regla mexicana.

[DoorDash consumidores, Estados Unidos](https://help.doordash.com/en-us/consumers/article/how-do-i-cancel-my-order?ctry=US&divcode=IL): matriz de reembolso según confirmación del restaurante y asignación de repartidor; soporte para fallos de entrega. [Deliveroo FAQ Reino Unido](https://deliveroo.co.uk/faq): cancelación/modificación solicitada por pedido, con límites al preparar/asignar repartidor. No copiar condiciones legales o multas a Marleva.

[Uber Eats PIN, ayuda nl-NL](https://help.uber.com/nl-NL/ubereats/restaurants/article/pin-code-authentication?nodeId=0bddc2bc-be45-4032-b17e-aa7e55a3d2a4): comprador comparte código y repartidor lo valida para completar. No demuestra uso universal/México ni identidad vecinal. Adaptación propuesta: código de recepción para entrega/recogida y confirmación de servicios, sin sustituirlo por teléfono ni cerrar por silencio. Distribución de costos C20 aprobada por usuario, no por benchmark. Motivo 1.8: responder cómo actúan apps sin convertirlo en aprobación B6.


## B7: requisitos técnicos consultados, sin decisión — 12-10-2026

Consulta puntual para preparar base local, no instalación, compilación o prueba de compatibilidad. [Node releases](https://nodejs.org/en/about/previous-releases): línea 24 LTS y 24.21.0 en página consultada; [Next instalación](https://nextjs.org/docs/app/getting-started/installation): documentación 16.4.0 y mínimo Node 20.9; [Nest primeros pasos](https://docs.nestjs.com/first-steps) y [releases](https://github.com/nestjs/nest/releases): requisitos de runtime/generador y 12.1.3 publicada 12-10-2026. No adoptar Node 20 por ser mínimo: fuente Node lo muestra fuera de soporte.

[PostgreSQL versionado](https://www.postgresql.org/support/versioning/) muestra 17.11 y 18.6 soportadas; [Supabase CLI local](https://supabase.com/docs/guides/local-development/cli/getting-started) documenta PostgreSQL/Auth/Storage local en contenedores y runtime compatible; [CLI release](https://github.com/supabase/cli/releases/latest) redirigió a 2.120.0. No demuestra que esa CLI use exactamente PG17.11 ni costo/licencia de runtime de contenedores del usuario.

[Prisma requisitos v7](https://www.prisma.io/docs/orm/v7/reference/system-requirements) admite Node 24; [releases Prisma](https://github.com/prisma/orm/releases) mezcla RC8 y otra línea 0.17 en latest. No confundir namespaces/paquetes o adoptar RC por orden del índice; versión ORM estable específica y compatibilidad pendientes. [TypeScript releases](https://github.com/microsoft/TypeScript/releases) muestra 7.0.2 y 6.0.3; [React release](https://github.com/react/react/releases/latest) redirigió a 19.3.0; [pnpm release](https://github.com/pnpm/pnpm/releases/latest) a 12.11.2. No se probó la combinación ni soporte de decoradores/tooling entre líneas de TypeScript.

[OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html), especificación primaria abierta parcialmente: candidata para contrato REST/JSON; no contrato Marleva generado ni validado. Fuentes describen disponibilidad/requisitos limitados; faltan selección material B7, versiones exactas coherentes, lockfiles y pruebas futuras autorizadas. Ningún proveedor productivo ni gasto aprobado. Motivo 1.9: conservar consulta técnica independiente mientras se cierra B6, sin suponer base construida.


### B7: aclaración de versiones y sesiones — 12-10-2026

Fuentes primarias: [estado de Prisma ORM](https://www.prisma.io/docs/orm/release-status) y [release 7.10.0](https://github.com/prisma/orm/releases/tag/7.10.0). Lectura de secciones pertinentes: ORM7 continúa soportado; 8 sigue RC en la página fechada 12 de octubre; CLI sin versión puede traer 8 mientras @prisma/client sigue 7.10.0. Se resuelve la ambigüedad anterior para la propuesta: fijar CLI y cliente 7.10.0 juntos, sin instalar latest ni mezclar APIs v8. No se ejecutó instalación. [Plantilla oficial Nest](https://github.com/nestjs/typescript-starter/blob/master/package.json), dependencias consultadas, usa línea12 y TypeScript6; apoya elegir TS6.0.3 en vez de migrar a7 por novedad, sin probar combinación Marleva.

[Sesiones Supabase](https://supabase.com/docs/guides/auth/sessions), secciones pertinentes: sesión por defecto sin límite y restricciones administradas sujetas a plan; [SSR](https://supabase.com/docs/guides/auth/server-side) describe cookies/PKCE y advierte API beta de paquete SSR; [updateUser](https://supabase.com/docs/reference/javascript/auth-updateuser) permite cambio de correo autenticado, pero ejemplo no acredita doble confirmación por sí solo. Consecuencia: diseñar límites propios de sesión y comprobar configuración de cambio de correo; no prometer controles de plan gratuito ni delegar autorización comercial en token. Lectura parcial de documentación, no pruebas ni proveedor aprobado. Motivo 1.10: resolver namespace ORM y documentar límites de autenticación antes de B7.


## B7: referentes móviles y comparación solicitada — 12-10-2026

Motivo: el usuario cuestiona el paso de web a app, propone compartir lenguaje/framework y pide comparación. Son solicitudes de análisis; no aprobación del canal, exclusiones ni stack. No se han instalado apps, ejecutado prototipos, contratado o contactado personas. Fuentes oficiales consultadas en secciones pertinentes; la existencia de vacantes acredita tecnología del rol citado, no auditoría completa del producto.

| Referente | Evidencia y límite |
|---|---|
| Airbnb | [Vacante oficial móvil](https://careers.airbnb.com/positions/8250093/) describe Swift/Kotlin nativos separados. [Retiro de React Native](https://medium.com/airbnb-engineering/sunsetting-react-native-1868ba28e30a) es antecedente de2018 y advierte revalidar conclusiones; no usarlo para descartar tecnologías actuales |
| Uber Eats | [Artículo oficial2017](https://www.uber.com/de/en/blog/ubereats-react-native/) documenta React Native para panel de restaurantes, no toda la app actual del comprador |
| Glovo | [Vacante iOS](https://careers.deliveryhero.com/job/ios-engineer-in-barcelona-spain-jid-9094) indica Swift; [Android Quick Commerce](https://careers.deliveryhero.com/job/android-engineer-quick-commerce-in-barcelona-spain-jid-7243) indica Kotlin para equipo del grupo; no inventario completo de app |
| Wolt | [Android](https://careers.wolt.com/en/jobs/6806366) documenta Kotlin/Compose; [iOS](https://careers.wolt.com/en/jobs/6820976) Swift/SwiftUI; páginas sin fecha de publicación comprobada |
| Deliveroo | [Guía oficial de entrevistas](https://careers.deliveroo.co.uk/our-interview-guide-mobile-engineering/) identifica Swift/Kotlin según plataforma |
| DoorDash | [Vacante iOS oficial](https://careersatdoordash.com/jobs/software-engineer-ios-all-teams/5630454/) identifica Swift; [vacante de empresa en YC](https://www.ycombinator.com/companies/doordash/jobs/BV8AJW4Tt-software-engineer-android) identifica Kotlin Android; no arquitectura integral |
| Just Eat / Lieferando / Thuisbezorgd | [Rol logístico JET](https://careers.justeattakeaway.com/de/de/job/TAKEGLOBALR053011DEDE/iOS-Developer) usa Swift; no atribuir módulo logístico a apps completas de compradores de tres marcas |
| Bolt Food / foodora / Grubhub / Instacart | Framework actual de compradores no confirmado suficientemente. Búsquedas sin evidencia adecuada no prueban ausencia de un framework; no rellenar con sitios que venden clones |

Mantenimiento comprobado: [Ionic9.0.7](https://github.com/ionic-team/ionic-framework/releases/tag/v9.0.7) y [Capacitor8.5.3](https://github.com/ionic-team/capacitor/releases/tag/8.5.3), publicados7-10-2026; [Ionic soporte](https://ionicframework.com/docs/reference/support) línea9 activa y8 en mantenimiento; [Capacitor soporte](https://capacitorjs.com/docs/main/reference/support-policy) línea8 activa. Fecha final de soporte activo TBD, no compromiso perpetuo. [Requisitos Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup): herramientas distintas de Android/iOS y macOS/Xcode para construir iOS local. Consultas no prueban estabilidad de Marleva o disponibilidad de herramientas del equipo.

### Comparación documental de alternativas

| Criterio aplicado a acuerdos | Ionic React + Capacitor | React Native + Expo | Flutter |
|---|---|---|---|
| Interfaz compartida | React web empaquetado con Capacitor; web y apps con misma base | Componentes móviles nativos; React Native Web para compartir web; excepciones por plataforma | Widgets Dart compartidos para Android/iOS/web; motor propio de presentación |
| Lenguaje junto al backend candidato Nest | TypeScript principal, además HTML/CSS/SQL/configuración | TypeScript principal, además SQL/configuración y ajustes nativos cuando hagan falta | Dart en cliente y TypeScript en Nest; cambiar backend a Dart sería otra decisión, no requisito de Flutter |
| Catálogo, pedidos y cotizaciones | Viable documentalmente; sin recorrido Marleva probado | Viable documentalmente; sin recorrido Marleva probado | Viable documentalmente; sin recorrido Marleva probado |
| Exploración pública C09 | Encaje directo con web; indexación no automática | Expo soporta web y salida estática; adaptar enlaces y pantallas públicas | Soporta app web; documentación advierte límite para indexación/contenido documental; SEO no es requisito comercial confirmado |
| Pago integrado | Verificar integración web/móvil, retorno y autenticación de tarjeta; no asumir plugin oficial para cualquier pasarela | SDK Stripe React Native documentado e integración Expo; web necesita mecanismo propio; no elige Stripe ni prueba Connect México | Verificar soporte, mantenimiento y origen del paquete de la pasarela por plataforma; no atribuir soporte oficial sin prueba |
| Pertenencia/documentos | Selección/carga privada, autorizaciones y borrado en API; comprobar experiencia móvil | DocumentPicker documentado; mismo control privado API; permisos/formatos y selección web por comprobar | Selección mediante integración pertinente; mismas reglas API; paquete por comprobar |
| Seguridad y recuperación | No garantizadas por framework; sesiones, secretos, CSRF/cookies, duplicados y soporte diseñados por plataforma | No garantizadas por framework; SecureStore móvil, cookies web y permisos API; duplicados/soporte iguales | No garantizadas por framework; almacenamiento seguro por integración y permisos API; duplicados/soporte iguales |
| Accesibilidad/mantenimiento | Comprobar teclado, lector, foco, navegación y WebView; mantener framework/plugins/herramientas | Comprobar TalkBack/VoiceOver, teclado web, foco, navegación y pares Expo/RN | Comprobar semántica, lector, escalado y teclado web; mantener Dart/Flutter/plugins |

Fuentes de comparación: [Ionic React](https://ionicframework.com/react) e [introducción Capacitor](https://capacitorjs.com/docs) describen reutilización web y acceso a funciones de plataforma; [componentes React Native](https://reactnative.dev/docs/intro-react-native-components), sección básica con aviso de arquitectura heredada, documenta vistas nativas, no prueba de rendimiento; [código por plataforma](https://reactnative.dev/docs/platform-specific-code) admite excepciones; [Expo web](https://docs.expo.dev/workflow/web/) documenta React Native Web y salida estática. Corrige la impresión anterior de que React Native obliga a una interfaz web completamente independiente.

[Stripe en Expo](https://docs.expo.dev/versions/latest/sdk/stripe/) documenta SDK móvil, versiones vinculadas al SDK Expo y configuración de retorno; consulta parcial, sin pago probado. No acredita misma librería para web, oferta financiera, cuotas o compatibilidad Connect específica de Marleva. [DocumentPicker](https://docs.expo.dev/versions/latest/sdk/document-picker/), [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) y [construcción local](https://docs.expo.dev/guides/local-app-development/): páginas pertinentes abiertas; soporte/configuración detallada pendiente antes de base. Expo permite construcción local documentada; no contratar EAS ni convertir Expo Go en prueba suficiente de aplicación productiva.

[Flutter multiplataforma](https://flutter.dev/development), [arquitectura](https://docs.flutter.dev/resources/architectural-overview), [web FAQ](https://docs.flutter.dev/platform-integration/web/faq), [accesibilidad](https://docs.flutter.dev/ui/accessibility) y [canales de releases](https://docs.flutter.dev/install/archive): lectura de secciones pertinentes, no documentos completos; app web, widgets Dart, semántica y canal estable. No se recuperó tabla dinámica de versiones exactas del archive ni se adopta número anunciado como combinación probada. [Versiones RN](https://reactnative.dev/versions): consulta del índice, sin selección exacta compatible con Expo aún.

### Resultado propuesto, no aprobación

Recomendación revisada del asistente: React Native + Expo + TypeScript para Android/iOS y exploración web, con API Nest/PostgreSQL separada. Motivo: el usuario quiere evitar reconstrucción web→app y pregunta por calidad/mantenimiento de app; Expo conserva posibilidad web compartida y documenta integración móvil de pagos. Ionic + Capacitor sigue alternativa válida si se prioriza reutilización de una interfaz web existente; actualmente no existe código que conservar. Flutter cumple móvil/web, pero añadiría lenguaje al backend TypeScript candidato. No se atribuye la recomendación al uso de RN por los trece referentes ni a superioridad universal.

Tradeoff aceptable solo con decisión posterior: módulos de pago, sesión, almacenamiento seguro, archivos y navegación necesitan adaptaciones por plataforma; no prometer100% de reutilización ni migración cero. No hay medidas de velocidad, consumo, horas, porcentaje compartido, ahorro, equipo disponible o rentabilidad. No existe requisito de mapa en vivo/IA/reparto propio que justifique ampliar MVP1. Ninguna alternativa genera ingresos por sí misma; backend y medición conservan C17–C21 y no cambian comisión/costos. La técnica puede conservar datos al añadir cliente, pero cambios de proveedor/esquema pueden exigir migración y plan propio.

Decisión pendiente del usuario: elegir la propuesta RN/Expo o alternativa antes de sustituir base candidata Next en02. Después: fijar pares Expo/RN/React y contratos de sesión/retorno/carga, retirar propuestas técnicas superadas y cerrar aceptación documental. Las funciones adicionales y la publicación no se aprueban por elegir tecnología. Motivo1.11: conservar evidencia de consultas B7, corregir simplificación de opciones y justificar recomendación comparativa.


## B7: backend y bases de datos — 12-10-2026

Solicitud: comparar lo documentado por referentes y facilidad/pros/contras para MVP1, conservando todos los acuerdos. La solicitud no confirma la recomendación del cliente RN/Expo ni el backend. Investigación pública primaria, sin auditoría de arquitectura completa, pruebas, contratación o contactos.

| Referente | Backend / datos documentados | Límite |
|---|---|---|
| Airbnb | [Servicios](https://airbnb.tech/infrastructure/sitar-agent-building-a-reliable-dynamic-configuration-sidecar-at-scale/) en Java, Python, Go, TypeScript y Ruby; [bases online](https://airbnb.tech/infrastructure/beyond-synthetic-testing-capturing-and-replaying-real-database-workloads-at-airbnb/) compatibles con MySQL | Piezas descritas por ingeniería; no un framework único ni toda su flota |
| Uber / ecosistema Eats | [Trabajo de2025](https://www.uber.com/de/en/blog/how-uber-oci-and-ampere-co-optimized-oci-ampereone-m-a4-compute/) describe servicios Java/Go; [Docstore2024](https://www.uber.com/co/en/blog/how-uber-serves-over-40-million-reads-per-second-using-an-integrated-cache/) sobre MySQL y cache; [rol de plataforma](https://jobs.uber.com/en/jobs/303058/) enumera MySQL/Docstore/Redis y otros sistemas | Arquitectura Uber, no inventario exclusivo Eats; artículos2016 sobre stack solo antecedentes |
| Wolt | [Rol backend](https://careers.wolt.com/en/jobs/6780389): Python/FastAPI, PostgreSQL, MongoDB, Redis y Kafka; otros equipos Kotlin/Go | Rol y varios equipos; fecha de publicación no comprobada; no inferir que toda compra usa todas las bases |
| Deliveroo | [Guía ingeniería](https://careers.deliveroo.co.uk/interview-guide-for-engineers/) indica Go/Ruby; [rol infraestructura](https://careers.deliveroo.co.uk/role/software-engineer-ii-infrastructure-343ffc9bc080/) cita PostgreSQL/DynamoDB/Redis como experiencia deseable | Vacante no prueba uso obligatorio en pedidos ni inventario actual completo |
| DoorDash | [Migración backend2021](https://careersatdoordash.com/blog/migrating-from-python-to-kotlin-for-our-backend-services/) a Kotlin con Postgres/Cassandra; [pruebas2022](https://careersatdoordash.com/blog/how-to-boost-code-coverage-with-functional-testing/) incluye Postgres/CockroachDB/Cassandra; [build2024](https://careersatdoordash.com/blog/distributed-build-service-for-monorepos/) confirma backend Kotlin al construir aquel sistema | Fechas históricas explícitas; no afirmar BD única o mismos despliegues actuales |
| Instacart | [Cutovers2023](https://company.instacart.com/tech-innovation/zero-downtime-postgresql-cutovers) documenta flota PostgreSQL en AWS RDS | Backend/lenguaje completo no verificado; no copiar escala o proveedor |
| Glovo | [Rol Data Platform](https://careers.deliveryhero.com/job/engineer-ii-python-data-platform-tech-foundations-in-barcelona-spain-jid-7277) menciona Go y experiencia relacional MySQL/PostgreSQL/Aurora/MariaDB | Título Python y cuerpo Go no coinciden; requisitos de equipo del grupo no acreditan motor de pedidos Glovo |
| Grubhub | [Ingeniería](https://careers.grubhub.com/engineering) documenta infraestructura Cassandra y muchos servicios | No motor único de compras ni lenguaje/framework completo verificado |
| Just Eat / Lieferando / Thuisbezorgd / Bolt Food / foodora | Stack exacto de pedidos y BD de cada marca no verificados suficientemente en esta consulta | No rellenar desde clones, Bolt.new/BoltCMS, sitios de perfiles o tecnología del grupo sin vínculo concreto |

Lectura de extractos/secciones relevantes y resultados oficiales; no documentos técnicos completos ni arquitectura privada. No concluir abandono de SQL porque DoorDash migró un servicio a Cassandra. Relacional, documental, clave-valor/cache y eventos resuelven problemas distintos. Kafka es transporte de eventos, no sustituto de una base financiera; Redis no se propone como registro definitivo de dinero. El patrón útil para Marleva es preservar consistencia y recuperación, no multiplicar motores por copiar empresas grandes.

### Comparación de backend para reglas ya acordadas

| Opción | Ventaja para Marleva | Trabajo/costo/riesgo relativo, sin medición |
|---|---|---|
| NestJS + PostgreSQL | TypeScript como cliente candidato; módulos/validación/permisos y API separada; transacciones/reportes relacionales | Mayor estructura inicial que una API mínima; hay que implementar reglas, tareas, pruebas y operar servicio/base |
| Express/Fastify + PostgreSQL | TypeScript posible y arranque pequeño; Nest usa Express por defecto o Fastify opcionalmente | La organización, permisos, validación y tareas comunes requieren decisiones propias; menos archivos no acredita menos trabajo del MVP completo |
| Django + PostgreSQL | ORM y panel administrativo inicial incluidos; estructura madura para datos/revisión | Python adicional al cliente TypeScript; OTP por correo, permisos por pedido y pagos siguen necesitando integración. El admin genérico no sustituye los recorridos de operador |
| FastAPI + PostgreSQL | Python, validación basada en tipos y contrato API documentados; API separada | Modelos/migraciones/admin/tareas se eligen aparte; introduce otro lenguaje. No problema de rendimiento demostrado que justifique cambiar por novedad |
| Supabase como backend principal | PostgreSQL, autenticación y archivos integrados reducen trabajo de infraestructura básica | Pedidos, comisiones, reembolsos y disputas siguen requiriendo lógica de servidor, transacciones y tareas. API generada/RLS no reemplazan esas reglas. Servicio alojado añade cuotas/costos y configuración; local también tiene operación |

Fuentes: [Nest](https://docs.nestjs.com/), introducción/arquitectura, TypeScript y adaptadores; [Express](https://expressjs.com/), características generales; [Django](https://docs.djangoproject.com/en/5.2/intro/overview/), modelos y administración; [FastAPI](https://fastapi.tiangolo.com/features/), validación y OpenAPI; [Supabase Database](https://supabase.com/docs/guides/database/overview), base PostgreSQL con servicios adicionales. Consulta parcial y juicio de diseño; no benchmarking ni estudio de tarifas. Supabase es proveedor/plataforma, PostgreSQL es motor; Nest es framework y Prisma es herramienta de acceso/migraciones, no bases rivales entre sí.

### Comparación de bases

| Opción | Pros pertinentes | Contras / decisión propuesta |
|---|---|---|
| PostgreSQL relacional | Relaciones, transacciones, restricciones únicas y consultas de comisión/conciliación; permite datos flexibles dentro de modelo explícito | Requiere esquema, migraciones, índices, control de conexiones y backups/restauración. Recomendado como único motor de negocio inicial |
| MySQL/InnoDB relacional | También soporta transacciones; viable para pedidos/dinero | También exige modelo/migraciones/operación. No se demostró ventaja concreta que justifique cambiar propuesta PostgreSQL |
| MongoDB documental | Documentos flexibles y transacciones multidocumento disponibles | Relaciones/reportes y controles de integridad requieren modelado específico; flexibilidad no elimina migraciones. Sin necesidad de MVP1 que justifique un segundo motor |
| Firestore documental administrado | Integración cliente y transacciones documentadas | Reportes relacionales y datos repetidos requieren diseño adicional; costos según lecturas/escrituras/borrados y otros conceptos. No prometer precio por banco ni gratis; dependencia de APIs/reglas proveedor |
| SQLite embebida | Arranque local simple, SQL y transacciones; válida en muchos servidores pequeños | Un escritor por archivo; API puede usarla, pero no se propone para negocio central ni para probar en motor distinto del previsto. Usarla en teléfono no sincroniza pedidos/pagos por sí sola |

Fuentes: [PostgreSQL transacciones](https://www.postgresql.org/docs/current/tutorial-transactions.html) y [restricciones](https://www.postgresql.org/docs/current/ddl-constraints.html), secciones únicas/relaciones; [MySQL InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-model.html), modelo transaccional; [MongoDB transacciones](https://www.mongodb.com/docs/manual/core/transactions/); [Firestore transacciones](https://firebase.google.com/docs/firestore/manage-data/transactions) y [facturación](https://firebase.google.com/docs/firestore/pricing), operaciones documentadas sin tarifa específica; [SQLite usos](https://www.sqlite.org/whentouse.html), concurrencia y uso servidor. No decir que NoSQL carece de transacciones o que SQLite solo sirve para demos. Comparación del encaje con Marleva, no superioridad universal.

### Recomendación de backend y facilidad

Mantener propuesta NestJS + TypeScript + PostgreSQL en una sola aplicación modular, API independiente de cliente. Prisma7 ya candidato para acceso/migraciones, con versiones compatibles y sin depender de latest; no cambia por este análisis. Supabase Auth/Storage sigue candidato de integración, no aprobación de todo el backend o proveedor productivo. Ninguna función obliga ahora a Cassandra, MongoDB, Redis, Kafka, Kubernetes o microservicios. Empezar con una base de negocio y tareas durables respaldadas por ella; ampliar infraestructura solo por necesidad comprobada.

Esta recomendación considera sencillez del MVP completo, no solo tiempo de crear la primera tabla. Supabase puede reducir pasos de cuenta/archivos; Django puede reducir trabajo de panel genérico. No se conoce experiencia real del equipo ni se midieron horas/costos: no prometer que Nest es el más fácil para toda persona. Para la preferencia actual de lenguaje compartido y C07, el juicio del asistente favorece Nest/PostgreSQL sin reabrir capacidades.

Aplicación a C11–C21: pertenencia/perfil y datos contractuales separados; cotización/pedido guardan versiones aceptadas; aceptación/reserva de disponibilidad se guarda completa o no se guarda; IDs únicos de intento/evento/reembolso y control de versión; efectivo recibido y comisión por cobrar son registros distintos; corte semanal/72horas/pausa según C19; devoluciones procedentes C20/C21 y retención documental C14 conservadas. Tarifa/tope/fiscalidad siguen pendientes de activación, no se inventan por elegir BD.

Transacción de base no incluye el cobro externo de pasarela: confirmar eventos, reintentar sin duplicar y conciliar. No mantener bloqueo de base mientras se espera banco. Registrar operación y aviso/tarea en misma transacción local; procesar tarea después, con reintento e identificador único. Un movimiento de base no genera por sí solo transferencia bancaria o comisión de pasarela; costo de infraestructura según proveedor y uso es un concepto separado del cargo financiero C17–C20.

Fotos y documentos en almacenamiento de archivos con permisos/finalidad, no tarjeta/CVV ni comprobantes públicos. BD conserva referencias/estados/fechas de eliminación; backup debe permitir restaurar y reaplicar borrado C14 antes de acceso. Desarrollo local con datos ficticios y mismo motor PostgreSQL; proveedor alojado, región, precios, cuentas, revisión legal y responsables antes de datos/dinero reales, sin contratación actual. Migrar hosting no obliga a rehacer todas las pantallas; diferencias de Auth/Storage/proveedor pueden exigir plan de salida, no migración cero.

B7 permanece pendiente de decisión material; este análisis no aprueba cliente RN/Expo, backend, proveedores, tarifas o publicación. Si usuario confirma base, consolidar02 para eliminar candidatos superados y fijar contratos/versión local coherentes. Motivo1.12: evidencia comparativa de backend/BD y recomendación aplicada al MVP completo.


## B7: arquitectura elegida y compatibilidad de base — 12-10-2026

C22/C23/C24 constan en01; los apartados anteriores conservan la condición histórica de propuesta al momento de su consulta. La evidencia no es fuente de aprobación. Nueva lectura puntual de documentación primaria, no prueba/instalación ni auditoría completa de sitios.

| Fuente | Hallazgo limitado y aplicación |
|---|---|
| [React Native, entorno](https://reactnative.dev/docs/environment-setup), [Expo FAQ](https://docs.expo.dev/faq/), [Nest módulos](https://docs.nestjs.com/modules), [PostgreSQL soporte](https://www.postgresql.org/support/versioning/) | Framework Expo recomendado por RN, uso productivo documentado y servicios EAS opcionales; módulos Nest y soporte de mayores PG. Aplicación: cliente compartido/API modular/base única; no garantía de estabilidad del producto ni cambio de motor automático. Secciones pertinentes, no sitios completos. |
| [Expo SDK](https://docs.expo.dev/versions/latest/) | Tabla consultada: SDK57, RN0.86, React19.2.3, RNWeb0.21.0 y Node mínimo22.13; Android7/API36 e iOS16.4/Xcode26.4. Elegir conjunto compatible, no React19.3 independiente. Requisitos de tienda futuros se verifican aparte. |
| [Conjunto oficial SDK57](https://raw.githubusercontent.com/expo/expo/sdk-57/packages/expo/bundledNativeModules.json), [Expo Stripe](https://docs.expo.dev/versions/latest/sdk/stripe/), [SecureStore](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/) | Rama consultada: RN0.86.3, Router57.0.26, SecureStore57.0.4, DocumentPicker57.0.3; StripeRN0.64.0. Rama mutable: fijar resolución/commit al construir. SDK móvil distinto de web; SecureStore no sustituye base de obligaciones ni respaldo de cuenta. No builds acreditados. |
| [Supabase configuración CLI](https://supabase.com/docs/guides/local-development/cli/config), [OTP](https://supabase.com/docs/reference/javascript/auth-signinwithotp), [TOTP](https://supabase.com/docs/guides/auth/auth-mfa/totp), [Storage permisos](https://supabase.com/docs/guides/storage/security/access-control) | Lectura parcial de campos/secciones: OTP configurable y plantilla Token; SMTP local, db.major_version configurable, AAL de factor y permisos de archivos. No afirmar major17/patch17.11 como bundle inspeccionado ni controles de plan productivo gratis. API conserva permisos/sesión propios; service_role no cliente. |
| [Stripe cobros directos](https://docs.stripe.com/connect/direct-charges?platform=web&ui=stripe-hosted), [calendario payouts](https://docs.stripe.com/connect/manage-payout-schedule) | Reembolso no devuelve application_fee por defecto; opción automática prorratea cargo total. Marleva excluye entrega de base de comisión: calcular reverso explícito por conceptos, no proporción ciega del total. Calendario semanal depende de configuración, fondos y responsabilidad. No elegibilidad mexicana/costos/saldos de Marleva comprobados. |

Resultado documental:02 v1.13 reúne contratos, estados, datos y base compatible de partida; combinación sin instalar/probar. Supabase local/Prisma son decisiones rutinarias de diseño, sin cuentas reales. Stripe Connect es referencia propuesta aún por confirmar; ni contratar ni activar cobros. Versiones/runtimes/digests y pruebas se verifican en construcción autorizada. Motivo1.13: consolidar decisiones de arquitectura y corregir compatibilidad/reversos sin ampliar MVP1 o declarar cumplimiento.


## Stripe Connect frente a Mercado Pago para Marleva — 12-10-2026

Consulta primaria puntual solicitada antes de elegir; alcance confirmado C25 no aprueba pasarela. Precios públicos orientativos, no oferta contractual marketplace ni impuestos/costo total determinado. Secciones de precios y documentación pertinentes, lectura parcial; ayuda Mercado Pago sobre costos no recuperada, sustituida por página oficial Checkout.

| Criterio | Stripe Connect | Mercado Pago Split1:1 |
|---|---|---|
| Cobro/comisión | [Cobros directos](https://docs.stripe.com/connect/direct-charges?platform=web&ui=stripe-hosted): cuenta oferente y application_fee | [Integración México](https://www.mercadopago.com.mx/developers/es/docs/split-payments/split-1-1/integration-configuration/integrate-marketplace): cuenta vendedor OAuth, fee pasarela primero y comisión marketplace después |
| Precio de cobro orientativo | [Payments México](https://stripe.com/mx/pricing): tarjeta nacional3.6% + MXN3 | [Checkout México](https://www.mercadopago.com.mx/herramientas-para-vender/check-out):3.49% + IVA inmediato;2.95% + IVA a30d. Otra [página comercial oficial](https://vendedores.mercadopago.com.mx/pasarela-de-pagos-b) añade MXN4; no resolver discrepancia como tarifa Split confirmada |
| Cuenta/depósito | [Connect precios](https://stripe.com/mx/connect/pricing): Stripe factura al conectado sin cargos adicionales cuenta/depósito a plataforma; si plataforma controla precios, MXN35/cuenta activa/mes y0.25% + MXN12/depósito | Costos exactos por cuenta marketplace/retiro y control central de retiro semanal no confirmados; no asumir cero por silencio |
| Devolución | Reverso application_fee explícito permite ajustar base sin entrega; saldo/costos/disputa según configuración, sin garantía cero pérdida | Integración documenta restitución proporcional entre vendedor/marketplace y limitación total si vendedor sin fondos. Devolución solo entrega puede exigir compensación de fee adicional no comprobada |
| Cliente elegido | Integración móvil StripeRN/Expo documentada; web aparte | Checkout Pro redirige; API admite pago en entorno propio. Integración Expo nativa/Split y retorno deben comprobarse; no afirmar imposible |

Aritmética ilustrativa, MXN antes de impuestos/extras y sin comisión Marleva: total100 → Stripe6.60, MP3.49 a7.49 según aplique fijo4;300 →13.80 frente10.47 a14.47;1000 →39.00 frente34.90 a38.90. Rangos por discrepancia pública del fijo, no cotización ni prueba de que Stripe sea más barato. No comparar porcentaje sin componente fijo y contrato exacto. Disponibilidad en30 días no equivale a depósito semanal; no seleccionar por precio menor ignorando plazo. Ambos necesitan cuenta/alta financiera del oferente y conciliación.

Modelo Connect de plataforma controla precios: veinte cuentas activas y cuatro depósitos de1000 cada una dan20×35 +80×(12+2.50)=1860 mensuales antes de impuestos/procesamiento. Escenario ficticio, no tamaño del piloto ni modelo contratado; el otro modelo no lleva esas mismas tarifas de cuenta/depósito. Sirve para no mezclar esquemas ni absorber gastos fijos sin ingresos medidos.

Juicio del asistente: preferir Stripe Connect como referencia técnica revisable por integración Expo y control explícito del reverso de comisión; iniciar análisis con cobros directos y proveedor facturando procesamiento al oferente. No se acredita que ese modelo/gestión de riesgo/payout esté habilitado para Marleva o todos sus vecinos. Si términos elegibles exigen costos de cuenta/depósito que hacen inviable contribución, comparar oferta concreta MP antes de activar. Ninguna pasarela gratis ni elegida; tarifas Marleva, soporte, contracargos, fiscalidad y saldo de devolución siguen pendientes de operación. Motivo1.14: comparación pedida por usuario, discrepancia de precio fijo explícita, cifras calculadas identificadas y límites de costo/retorno/devolución.

## MAR-CHAT-003: entorno y contraste técnico — 12-10-2026

Evidencia obtenida mediante comandos de consulta y lectura de rutas habituales. Sin instalación, descargas de paquetes/imágenes, arranque de servicios, cuentas, builds, conexión a bases ajenas ni pruebas de Marleva. Primera hora comprobada del trabajo: 17:45:50 America/Merida (23:45:50 UTC). El inventario y acceso documental se registran en01; las tareas futuras en02 §16.

| Elemento | Resultado observado | Clasificación y límite |
|---|---|---|
| Sistema | `sw_vers`: macOS27.0.1, build26A434; `uname -m`: arm64 | Disponible; compatibilidad completa con herramientas futuras no probada |
| Disco | `df -h .`: 660Gi disponibles en volumen de datos | Disponible al consultar; no reserva de espacio ni prueba de rendimiento |
| Memoria/virtualización | `sysctl -n hw.memsize` denegado por entorno restringido | No comprobadas; comprobar antes de asignar recursos a VM/emuladores, sin inferir RAM |
| Git | `git --version`: 2.54.0 (Apple Git-157) | Disponible; no existe .git en raíz del proyecto |
| Navegadores | Google Chrome.app y Safari.app en /Applications | Archivos disponibles; versiones y ejecución del cliente no comprobadas |
| Node habitual | `command -v node npm corepack` y versiones no encuentran ejecutables | Faltan en PATH consultado; no prueba ausencia de otras instalaciones |
| Node incluido | Ruta del runtime facilitada por load_workspace_dependencies; ejecución absoluta devuelve v24.19.0 | Disponible dentro de esta sesión; distinto de base24.21.0; no garantiza acceso fuera de Codex |
| pnpm incluido | Wrapper leído; `pnpm --version`:11.25.0; package.json confirma11.25.0 | Disponible, distinto de base12.11.2; npm no presente en node_modules incluido |
| Dependencias de Marleva | Sin package.json, lockfile, código ni node_modules del proyecto; TS/Nest/Expo/Prisma no presentes en paquetes incluidos examinados | Faltantes para construir; no se usó npx ni instalación implícita |
| Contenedores | docker/podman/colima no en PATH; binarios habituales y sockets consultados ausentes; sin Docker/OrbStack en carpetas Applications consultadas | Runtime no encontrado; daemon, API Docker, Compose y ejecución ARM64 no comprobados |
| Supabase | CLI no en PATH ni ruta Homebrew consultada | Faltante para base prevista; bundle e imágenes no inspeccionados |
| PostgreSQL | psql/pg_dump/pg_restore no en PATH; sin escucha visible en5432/54322 | Herramientas no encontradas; servidor/versión real no comprobados. No concluir ausencia global por PATH |
| Android | Sin Android Studio en Applications consultadas; ~/Library/Android/sdk ausente; adb/emulator/sdkmanager no en PATH | Faltan herramientas en rutas consultadas; dispositivos reales no comprobados |
| JDK | /usr/libexec/java_home -V no encuentra Java Runtime; java/javac son lanzadores del sistema | JDK no encontrado; no tratar presencia del lanzador como JDK funcional |
| iOS | xcode-select apunta a /Library/Developer/CommandLineTools; xcodebuild -version falla; xcrun no encuentra simctl | Xcode completo/simulador no encontrados. CLTools27.0.0.0.1788430756 disponibles |
| Ruby/CocoaPods/Watchman | Ruby2.6.10; pod y watchman no en PATH | Ruby disponible; CocoaPods/Watchman no encontrados; Ruby actual no validado para futuro conjunto de pods |
| Puertos | lsof no devuelve listeners visibles en3000,8081,5432,54321,54322,54324 | Sin ocupación visible en esos puertos al consultar; no bind probado ni garantía de disponibilidad;8443/54323/54325 no comprobados |

Runtime incluido: `/Users/andresramos/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`. pnpm: `/Users/andresramos/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm`. Bundle26.1011.11113. No editar este runtime para convertirlo en instalación de proyecto. No se inspeccionaron secretos, credenciales, perfiles de navegador ni bases de otros trabajos.

### Fuentes primarias consultadas y consecuencia

Consulta de secciones pertinentes, no lectura completa de todos los sitios ni auditoría de paquetes. Los contenidos web son mutables; fijar artefactos de construcción después de autorización.

| Fuente directa | Resultado limitado / consecuencia |
|---|---|
| [Expo SDK](https://docs.expo.dev/versions/latest/) | Reconfirma SDK57/RN0.86/React19.2.3/RNWeb0.21 y Node mínimo22.13; Android7+, compile/target36, iOS16.4+, Xcode26.4+. Node incluido24.19 supera mínimo, pero no coincide con versión fijada. Mantener conjunto de02; requisitos de tienda aparte |
| [Bundle SDK57](https://raw.githubusercontent.com/expo/expo/sdk-57/packages/expo/bundledNativeModules.json) | Reconfirma RN0.86.3, Router~57.0.26, SecureStore~57.0.4, DocumentPicker~57.0.3, React/ReactDOM19.2.3. Rangos no prueban patches resueltos; guardar commit y lockfile en construcción |
| [Node releases](https://nodejs.org/en/about/previous-releases), [pnpm12.11.2](https://github.com/pnpm/pnpm/releases/tag/v12.11.2), [TypeScript6.0.3](https://github.com/microsoft/TypeScript/releases/tag/v6.0.3), [Nest12.1.3](https://github.com/nestjs/nest/releases/tag/v12.1.3) | Fuentes publicadas accesibles; Node24 LTS y24.21.0 listado. No instalar estos artefactos ni sustituirlos por latest. No acredita combinación compilada |
| [Nest starter](https://github.com/nestjs/typescript-starter/blob/master/package.json), [Prisma v7 requisitos](https://www.prisma.io/docs/orm/v7/reference/system-requirements), [Prisma7.10.0](https://github.com/prisma/orm/releases/tag/7.10.0) | Starter consultado usa módulos ESM, TS6 y Vitest; Prisma admite Node24/TS5.4+. Concretar API ESM y adaptador PostgreSQL compatible; prueba real de decoradores, generación y migración sigue pendiente |
| [Build local Expo](https://docs.expo.dev/guides/local-app-development/), [entorno RN](https://reactnative.dev/docs/set-up-your-environment) | Build local requiere Android Studio/Xcode según plataforma; RN recomienda JDK17. Su guía general menciona plataforma35; para proyecto SDK57 manda compile/target36 de Expo y configuración generada, no copiar35. Simulador no reemplaza dispositivo real |
| [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), [CLI2.120.0](https://github.com/supabase/cli/releases/tag/v2.120.0) | CLI fijable por proyecto; entorno local requiere runtime Docker compatible y primer arranque descarga imágenes. Lista Colima entre alternativas. Inicio local no necesita vincular cloud. Capturador de correo del bundle mostrado como Mailpit; identidad real se inspecciona al construir |
| [Supabase config](https://supabase.com/docs/guides/local-development/cli/config) | Describe db.major_version, OTP/plantillas y captura local. Nombres inbucket heredados frente a Mailpit en guía: usar configuración real de CLI fijada. Configurar OTP600s/60s y demostrar captura; no heredar3600s. Doble confirmación de correo y cinco fallos se prueban en adaptación de API |
| [Colima](https://github.com/abiosoft/colima), [licencia Docker Desktop](https://docs.docker.com/subscription-billing/desktop-license/) | Colima publica licencia MIT y runtime para macOS. Docker Desktop tiene condiciones de licencia; no asumir uso gratuito elegible. Base propuesta Colima con motor/API Docker, pendiente instalación/compatibilidad local; no se contrató producto |
| [pnpm install](https://pnpm.io/cli/install) | frozen-lockfile falla si falta o discrepa lockfile. Crear resolución una vez y comprobar segunda instalación sin modificarla; no resolver flotantes en cada arranque |

Resultado: la base de02 sigue documentalmente consistente, con diferencias concretas entre herramientas previstas y presentes. Compatibilidad final, RAM/virtualización, acceso a registros de descargas, imágenes ARM64/digests, TLS, Android/iOS y PostgreSQL ejecutado siguen sin comprobar. No cambiar motor, canal ni proveedor por estos faltantes. Motivo1.15: evidencia solicitada para preparar arranque y atribuir prerrequisitos de base/M1; C01–C26 y demografía conservados.


## Evidencia local004: ejecución parcial y corrección documental

12-10-2026 America/Merida; versión1.16. Las comprobaciones de003 anteriores son históricas. A0/SDKAndroid autorizados según01. Herramientas propias en marleva-local/repositorio/infra/local/tools; no runtime Codex. RAM16GiB/virtualización1,macOS27.0.1 ARM64 comprobados en004. Instalada baseNode24.21.0/pnpm12.11.2; Colima0.10.3/Lima2.2.1,DockerCLI29.3.1/engine29.5.2,Compose5.6.0,SupabaseCLI2.120.0,JDK17.0.20.1+1,AndroidCLI22.0/platform-tools37.0.1/emulator37.2.12/API36. Manifiestos/hashes procedencia en infra/local/toolchain.json y manifest.json; este último captura ambiente anterior al traslado, no estado vivo actual. No imprimir credenciales de .env/secrets.

Servicios locales se iniciaron antes del traslado, con PG17/Auth/Storage/correo y HTTPS certificado local confiado. Manifiesto consultado: PostgreSQL17.11, imagen postgres:17.11.0.004 linux/arm64 y digest registrado. No inferir que continúa activo. Se detuvieron API/HTTPS,Supabase y VM manteniendo datos antes de trasladar a repositorio. Arranque/rutas/artefactos móviles luego del traslado por comprobar. Instalaciones globales/cachés identificadas en protocolo, no portabilidad total probada.

| Comprobación | Resultado efectivamente obtenido | Límite |
|---|---|---|
| Integración antigua + simulador/configuración |13 tests pasaron en última corrida anterior al traslado | Clasificación mezclada; cobertura incompleta, no repetida ahora |
| Chrome HTTPS anterior | OTP/cuenta/cookie segura/sin localStorage/foco/salida pasaron | NoSafari ni todas las pantallas, accesibilidad o dispositivos |
| Android anterior | APK debugARM64 inicial compiló e instaló en emulador | Primer acceso falló por Metro; recompilación tras ajuste interrumpida, sin éxito final |
| iOS/Xcode | Usuario instalará y aceptará licencia; disponeiPhone | Instalación/build/recorrido físico no comprobados |
| Docs actuales | DBML exportado DDL; OpenAPI YAML validado por SwaggerParser; tipos generados | No comparación DB viva ni semántica completa; Mermaid no renderizado/verificado aún |
| Unitarias reorganizadas |9 pasaron en3 archivos:5backend y4adaptadorfrontend | Primer intento4frontend falló por resolución Flow; corregidos mocks, no cambio de UI. No unitarias de todos estados de pantalla |
| Performance/restauración/archivos privados/recuperaciónMFA | No resultados completos | Runners parciales/planes no equivalen a pruebas |

Evidencias históricas en tests/results/before-reorganization; nuevas en tests/results, con límites. Código revisado confirma AccountService concentra persistencia/proveedor; DTOs/repositorios por módulo y separación cliente pendientes. DBML señala falta de FK EmailChange.accountId; Audit/roles/retención requieren revisión. APIusa Record genérico y clienteany; no conformidad con arquitectura o estándar declarada. Concurrencia/caducidad/caídas/outbox/recuperación, plataformaSafari/iOS y pruebas físicas incompletas. NoM1completa.

Generación usa @dbml/core10.3.1 (CLI retirado por dependencias innecesarias),yaml2.9.1,swagger-ui-dist5.33.2,SwaggerParser13.1.0; paquetes fijados/lockfile. Swagger local sin enviar solicitudes/credenciales. No cuenta/subida a dbdiagram.io; archivo listo para importar, sintaxis DBML comprobada por parser/exportador. Ejemplos DBML/YAML anunciados por usuario no accesibles, no leídos.

Motivo: registrar hechos locales y corregir distancia entre documentación/preparación e implementación. Sin nueva investigación de mercado, aprobación visual, operación financiera real o reapertura demográfica.

Comprobación adicional de esta revisión: pnpm install --frozen-lockfile --offline pasó con12.11.2. git check-ignore excluyó .env, claveCA, herramientas, node_modules, Prisma generado y APK. DDL exportado añade esquema/comentarios y FKsDEFERRABLE ausentes en SQL aplicado; omite privilegios. Diferencias estáticas registradas en docs/modelado-datos/README.md; no comparación con DB viva ni equivalencia automática.


## Comprobación documental13-10-2026

ContratoYAML0.2.0→JSON/tipos/Swagger yDBML→DDL regenerados con herramientas locales fijadas. SwaggerParser aceptó14 operaciones; condiciones de transporte ybrechas descritas, no pruebas de respuestasAPI reales. SEQ008 corrige afirmación paginación inexistente. DDLNOT DEFERRABLE por transformación explícita conserva SQLbaseline; comparación estática, sinDBviva. Matriz de13 procesos/estados/negativos/pruebas previstas; ningún caso≥100 ni performance/umbral presentado como resultado. Servicios ypantallas detenidos. No nuevos builds móviles, restauración ni operación financiera. No nueva investigaciónexterna ni originales recuperados; demografíapausada. Motivo1.17: evidencia de corrección documental ylímites ante instrucción del usuario de continuar.

Resultado adicional13-10-2026: typecheckAPI ycliente completaron exit0 después de regenerar tipos. Segunda generación conservó hashes deDDL/JSON/Swagger/tipos;14 operaciones tienenUC/SEQ y2FKemitidas NOT DEFERRABLE. Acta tests/results/documentation-20261013.json. Estas comprobaciones no ejecutan APIs, negocio, móviles operformance.


Avance efectivo13-10-2026, MAR-CHAT-004: modelo objetivo MAR-M1-DATA-002.dbml/DDL en docs/modelado-datos separado del físicoDATA001; asignaciones de permisos revocables, recuperaciónMFA con otro administrador yobjeto ficticioB09. SEQ014 recupera factor sin transferir buzón y conserva caída proveedor. Contrato objetivo openapi-objetivo-recuperacion.yaml describe3 operaciones planeadas, separado de14 actuales. DBML/exportación ySwaggerParser aceptaron estos artefactos; no implementación, DB aplicada o pruebas runtime. InvariantesSQL parciales, reenrolamiento limitado yweb/CSRF requieren completar antes de código. Revisión local, sinM1completa.
Corrección de entrega: retirar instrucción de cargarZIP aFuentes, vía no disponible segúnusuario. Paquete queda solo local; no nuevas instrucciones de interfaz sin comprobación. Sources/ZIPoriginales intactos.


13-10-2026: cerrado detalle documental de reenrolamiento limitadoUC014 (7operaciones objetivo), sesiónnueva después de revocar, capacidadligada/vencida/deunuso, Origin/native/CSRF/idempotencia/errores. DATA002/DDL incluye restriccionesparciales/checks; generador propio docs:target ySwaggerobjetivo.8/8integridadSQL pasaron enPG17 desechable sinred/puertos, distinto deMarleva; ningúnDDL aplicado a negocio. Primeracorrida3/8 porreadinesstemporal ysegunda8/8 trascorregiresperaTCP; reportes tests/results/data-target-20261013*.json. Contenedorlimpiado; VM iniciadasoloparaprueba yparada solicitada al terminar. NoAPI/cliente/MFA/Storage/runtime/performance acreditados. Próximo: completar contratoStorage y coherencia restantes antes derefactorintegrado; no nuevaspantallas niM2.

## Evidencia B09 objetivo —13-10-2026

Generador scripts/generate-m1-target.mjs aceptó DATA00213tablas y YAML B09tresoperaciones; genera DDL ySwagger objetivo separado deAPIactual. Prueba MARLEVA_SCHEMA_CHECK=1 pnpmtest:schema, reporte [data-target-b09-20261013.json](../../marleva-local/repositorio/tests/results/data-target-b09-20261013.json):10pasaron,0fallaron, SQL114–123. ImagenPGlocal exacta public.ecr.aws/supabase/postgres@sha256:06ddc7962e11ab0f4f0334fd05671e97c30ea202f6e6a7113800bd3d6e416108, pull=never, contenedor único desechable sinred/puertos. Caso122vínculo entre titulares/TTL301srechazado y300sválido;123estado pendiente incompleto rechazado/intenciónválida. Reporte ycódigo conservan límites; no todos los checks/autorizaciónruntime probados.

dockerpsvacío confirma limpieza delcontenedor. VMlocal iniciada solo para SQL ydetenida al terminar; datos/servicios negocio no iniciados. No API/Storage/cliente/performance/móvil nuevos comprobados. Generación sintáctica no prueba operación. Cambio1.20: evidencia necesaria de esta corrida, no certificación.

## Calidad y entorno —13-10-2026

Metadatos del registro oficial por paquete (registry.npmjs.org/eslint/latest,@eslint%2Fjs/latest,typescript-eslint/latest,prettier/latest,globals/latest,eslint-plugin-react-hooks/latest), consultados concurl tras consulta pnpmview sinrespuesta en sandbox. Argumento fetch-retries no admitido por CLIlocal: no usarlo como comprobación de instalación. Versiones exactas de02 instaladas como devDependencies conignore-scripts; MITsegúnregistro. [typescript-eslint compatibilidad](https://typescript-eslint.io/users/dependency-versions/) y [Prettier instalación exacta](https://prettier.io/docs/install) consultadas; metadata deparser peerTS>=4.8.4<6.1.0 admite6.0.3, ESLint10 yNode24 cumplen. No evaluación integral de licencias transitivas.

[Acta calidad](../../marleva-local/repositorio/tests/results/quality-baseline-20261013.json): typecheckAPI/cliente exit0,9unitarias/3archivos pasaron381ms; ESLint10errores/0warnings yformato31archivos pendientes. Primera configuración11incluíafalsopositivo document de callbackPlaywright; globalsbrowser definidos solo enharnessfrontend, reglas conservadas yreporte inicialguardado. Frozenofflineignore-scripts exit0 yhashlockfileantes/después idéntico b32a42d82f79064ef2d1baca07585a3422a8cd8a0edeb171df58af445d42854a. GeneradosDDL/Swaggerobjetivo iguales tras formatear generador/testSQL. No nueva integraciónAPI/performance/móvil ni estándar completo acreditado.

Consulta actualxcode-select -p devuelve /Library/Developer/CommandLineTools; xcodebuild -version exit1requiereXcodecompleto. No coincidenciasXcode*.app en/Applications. No prueba ausencia enotrasrutas ni aceptación de licencia; iOSsiguependiente. Demografía/originalessin cambios.
