# Marleva: referentes y evidencia

Versión 1.0. Fecha de consolidación: 12 de octubre de 2026. Cambiar solo por evidencia necesaria o corrección comprobada. Reglas: [00_GUIA_PRINCIPAL_MARLEVA.md](00_GUIA_PRINCIPAL_MARLEVA.md). Decisiones: [01_ESTADO_Y_DECISIONES_MARLEVA.md](01_ESTADO_Y_DECISIONES_MARLEVA.md). Diseño: [02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md](02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md).

## Cómo leer la evidencia

| Parte | Estado y límite |
|---|---|
| Referentes | Revisión documental inicial conservada del archivo anterior. Las etiquetas describen lo registrado allí; no se repitieron pruebas ni visitas a todas las apps en esta consolidación. Verificar información cambiante cuando una decisión dependa de ella. |
| Demografía | Informe original completo conservado como anexo. No se recalcularon cifras ni se recuperaron datos primarios ausentes. No mezclar censo, capacidad y estimación. Trabajo demográfico pausado. |
| Calidad y proceso | Fuentes oficiales comprobadas para la guía: WCAG, ASVS, Nielsen Norman y GOV.UK. Son referencias para criterios, no cumplimiento acreditado. |

No hay pruebas de producto, cuentas de referentes probadas, pagos, ventas, rentabilidad ni disposición a pagar demostradas. No hay tarifas o proveedores aprobados. Las propuestas se deciden en 01, no por aparecer en esta evidencia.

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
