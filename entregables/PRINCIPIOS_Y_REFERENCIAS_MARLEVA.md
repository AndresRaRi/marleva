# Principios y referencias permanentes de Marleva

Fecha: 12 de octubre de 2026. Estado: instrucciones y decisiones confirmadas por el usuario; no acredita implementación, benchmark realizado ni validación comercial.

## 1. Uso y precedencia

Aplicar también las [reglas de comunicación y continuidad](INSTRUCCIONES_PROYECTO_MARLEVA.md): palabras comunes, frases cortas, tablas útiles, sin iconos ni adornos; analizar antes de responder, verificar hechos y señalar lo pendiente. Antes del código, cerrar funcionalidades, reglas, diagramas, datos, APIs y estructura del proyecto. No presentar como aprobados los módulos ni el orden sugeridos por el asistente.

Al comenzar cada chat, leer completos [CONTEXTO_MARLEVA.md](CONTEXTO_MARLEVA.md) y [PLAN_EJECUCION_MARLEVA.md](PLAN_EJECUCION_MARLEVA.md), después este archivo y los documentos pertinentes a la etapa. Si no están disponibles, solicitarlos y no afirmar que se leyeron.

Las instrucciones más recientes del usuario prevalecen. Este archivo registra las confirmaciones del 12 de octubre y sustituye las propuestas anteriores incompatibles sobre WhatsApp como flujo principal, ausencia de pagos internos y presupuesto como bloqueo para empezar localmente. Conservar los antecedentes para trazabilidad, sin ejecutarlos como alcance vigente.

Referencias de proyecto consultadas completas:

- [Contexto original](../sources/CONTEXTO_MARLEVA.md).
- [Plan original](../sources/PLAN_EJECUCION_MARLEVA.md).
- [Enfoque comunitario](../sources/ENFOQUE_COMUNITARIO_GRAN_SANTA_FE_APP.md).
- [Arquitectura propuesta](../sources/ARQUITECTURA_PROPUESTA_MARLEVA.md).

Los archivos de `sources/` son referencias sincronizadas de solo lectura. Las versiones de contexto y plan de esta carpeta conservan el contenido original y añaden una actualización. No modificar, renombrar, mover ni eliminar los originales.

## 2. Decisiones confirmadas

| Tema | Decisión vigente |
|---|---|
| Producto | Marleva conecta productos y servicios entre vecinos de Gran Santa Fe, Mérida, Yucatán. |
| Comunidad | Gran Santa Fe I y II; Gran Santa Fe Norte I, II y III; Cerradas de Gran Santa Fe; Paraíso Santa Fe. |
| Oferentes | Deben pertenecer a la comunidad. Pueden trabajar desde casa, a domicilio o tener un negocio fuera. Cercanía o cobertura no acreditan pertenencia. |
| Identidad | Autenticación passwordless. Método concreto, canal, proveedor y recuperación por cerrar; no están aprobados por esta decisión. |
| Transacciones | Pedidos dentro de la plataforma; compra directa de productos y servicios con solicitud y aceptación de cotización. |
| Cobro | Pagos online y efectivo. No hay pasarela, esquema de liquidación ni proveedor aprobado. |
| Entrega | Entrega o recogida a cargo de oferentes inicialmente. No implica reparto propio de Marleva. |
| Geografía | Aplicar límites de cobertura de la comunidad y de cada oferta; distinguir pertenencia, cobertura y lugar de atención. Las geometrías exactas y su validación siguen pendientes. |
| Moderación | Revisar pertenencia, perfiles y publicaciones; gestionar reportes y restricciones con motivo y trazabilidad. |
| Negocio | Generar ingresos y alcanzar rentabilidad real son objetivos comerciales obligatorios. Comisiones, suscripciones, tarifas al comprador y precios no están aprobados. |
| Construcción | Desarrollo local primero, por módulos funcionales e integrados; MVP1 completo de principio a fin y preparado para producción. |
| Arquitectura | Frontend y backend separados, contratos claros y bajo acoplamiento. El stack y proveedores del documento de arquitectura siguen propuestos. |

No convertir estas confirmaciones en afirmaciones de que ya funcionan o fueron validadas. Los pendientes demográficos continúan pausados; no bloquear el producto ni inventar población actual.

## 3. Referentes obligatorios y evidencia

Estudiar Uber Eats, Glovo, Just Eat, Lieferando, Thuisbezorgd, Wolt, Deliveroo, Bolt Food, foodora, DoorDash, Grubhub, Instacart y Airbnb. Prestar especial atención al onboarding de Airbnb y a la incorporación de compradores y oferentes en todos los referentes. Mantener los trece en el registro, aunque una capacidad no sea observable o aplicable.

No reinventar soluciones probadas: identificar patrones, evaluar su pertinencia para la comunidad y adaptar el más sencillo que resuelva la necesidad. No copiar marcas, textos, diseños protegidos ni complejidad que Marleva no necesita. Un patrón visto en una app no demuestra que aumente conversión o rentabilidad.

Comparar, según el módulo:

- UX: descubrimiento, filtros, fichas, onboarding, formularios, estados, accesibilidad, errores y recuperación.
- Operaciones: aceptación, disponibilidad, cotización, preparación, entrega/recogida, cancelación, incidencia y soporte.
- Pagos: autorización, confirmación, fallos, reintentos, efectivo, conciliación, liquidación y reembolsos.
- Autenticación: passwordless, sesión, recuperación, permisos, abuso y separación entre identidad y pertenencia.
- Costos: cuotas, cargos variables, mínimos, excedentes, condiciones comerciales, integración, operación y salida del proveedor.
- Modelos de negocio: quién paga, por qué valor, cuándo se cobra y qué costos soporta cada parte.

Antes de tomar una decisión basada en un referente, consultar evidencia actual verificable: documentación oficial, condiciones publicadas y recorridos observados lícitamente. Registrar fecha, país/mercado, versión o canal, rol y limitaciones. No extrapolar precios o funciones de otro mercado. No contactar terceros ni contratar o publicar para obtener evidencia sin autorización.

Usar esta ficha por hallazgo:

| Campo | Contenido requerido |
|---|---|
| Referente y capacidad | App, rol y problema examinado |
| Fuente | Enlace directo o evidencia local identificable, fecha de consulta y mercado |
| Observación | Qué se pudo comprobar y bajo qué condiciones |
| Estado de evidencia | Verificado / inferencia / no verificado / no observado |
| Aplicación a Marleva | Adoptar, adaptar o descartar, con motivo y consecuencias |
| Decisión | Identificador, estado, responsable y módulo |

**Estado actual: benchmark pendiente.** Este documento establece el método; no compara resultados ni afirma haber inspeccionado estas aplicaciones. Sin evidencia, registrar «no verificado»; no completar vacíos con supuestos presentados como hechos. El estudio debe resolver decisiones concretas y no convertirse en una investigación interminable.

## 4. Prioridades permanentes

Priorizar rapidez de entrega y de uso, simplicidad, calidad, seguridad, crecimiento y rentabilidad real. Reducir alcance y dependencias antes que sacrificar funcionamiento, accesibilidad, protección de datos o recuperación.

Cada acción debe dejar claro dónde está el usuario, qué puede hacer y qué ocurrió. Pedir únicamente datos necesarios; conservar trabajo ante errores; evitar duplicación de pedidos o cobros. No publicar domicilios particulares exactos; limitar acceso a los detalles necesarios para atender una operación.

Aplicar criterios verificables de accesibilidad y seguridad, tomando las referencias del plan, con revisión de su versión vigente al utilizarlas. No declarar conformidad WCAG, cumplimiento ASVS ni certificación sin evidencia suficiente.

Crecer con necesidades medidas, contratos estables y migraciones versionadas. No introducir microservicios, infraestructura o abstracciones por anticipación. Evaluar costo completo y condiciones de uso de servicios gratuitos; no prometer costo cero.

Medir pedidos completados, repetición, ingresos efectivamente cobrados, disposición real a pagar, costos variables y trabajo operativo. Separar volumen transaccionado de ingresos de Marleva. Incluir pagos, reembolsos, soporte, moderación e infraestructura en la economía cuando correspondan; identificar supuestos. Población, registros, clics y pagos simulados no son clientes ni ventas reales.

## 5. Cierre de decisiones y congelación de MVP1

Cerrar pendientes uno por uno, empezando por el que desbloquea el siguiente entregable. No abrir nuevas decisiones si pueden resolverse rutinariamente dentro del alcance. Consultar al usuario cuando cambien materialmente alcance, gasto o publicación.

El núcleo confirmado del MVP1 queda fijado por la sección 2. La lista exacta de módulos, sus límites y criterios todavía requiere una ficha de alcance cerrada; no presentar como aprobada una lista anterior que solo fue propuesta.

Completar una única línea base de MVP1: capacidades incluidas, exclusiones, módulos, dependencias, responsables, criterios de aceptación y recorridos completos. Una vez confirmada, congelarla. Las ideas nuevas van al backlog, con beneficio esperado y condición para revisarlas, sin incorporarse automáticamente. Una necesidad indispensable para cumplir el núcleo confirmado se resuelve en el alcance; no se descarta como idea nueva.

No reabrir decisiones sin un motivo documentado: evidencia nueva, fallo relevante, incompatibilidad, riesgo real o instrucción del usuario. Registrar impacto, alternativa y resolución antes de cambiar la línea base.

Registro permanente de decisiones:

| ID | Tema y decisión | Estado | Evidencia/motivo | Responsable | Fecha | Dependencias | Condición de revisión |
|---|---|---|---|---|---|---|---|
| Por asignar | Registrar cada decisión concreta | Confirmada / propuesta / pendiente | Fuente identificable | Por asignar | Fecha real | Módulos afectados | Motivo específico |

No sustituir este registro por conversaciones dispersas. «Propuesta» no autoriza implementación de una decisión material ni contratación; «pendiente» debe indicar qué falta y quién lo resuelve.

## 6. Protocolo de trabajo por módulo

1. Leer el contexto vigente y revisar decisiones ya cerradas. Identificar el objetivo del módulo y la dependencia que desbloquea.
2. Redactar una ficha breve: entradas, resultados, reglas, roles, límites, responsable, dependencias y criterios de aceptación. Consultar referentes para las decisiones concretas necesarias.
3. Cerrar únicamente pendientes que bloquean esa ficha. Documentar alternativas y recomendación; pedir dirección solo si la decisión es material.
4. Implementar localmente cuando se autorice desarrollo, con datos ficticios identificados, frontend/API separados y contratos versionados. Este encargo documental no autoriza desarrollar la app.
5. Verificar el recorrido completo, errores, permisos e integración con módulos anteriores. El pago simulado verifica integración técnica, no cobro real.
6. Corregir fallos que impidan aceptación. Terminar e integrar el módulo antes de avanzar al siguiente; no declarar cerrado un conjunto de pantallas aisladas.
7. Registrar entregables, decisiones, evidencia, pendientes, costos e impacto operativo; actualizar documentos editables y señalar el siguiente módulo.

No usar un techo de inversión como requisito para comenzar trabajo local autorizado. Antes de gasto, contratación o lanzamiento, cerrar costos y autorizaciones pertinentes. Preparación productiva significa diseñar y comprobar despliegue, configuración, migraciones, permisos, backups, restauración, observabilidad y soporte; no equivale a autorización para publicar.

## 7. Checklist de aceptación para cada módulo

- [ ] Objetivo, alcance, exclusiones, responsable y dependencias definidos.
- [ ] Decisiones confirmadas respetadas; propuestas y pendientes identificados.
- [ ] Referentes pertinentes consultados con evidencia; lo no comprobado marcado.
- [ ] Contrato API y cambios de datos documentados; frontend/backend separados.
- [ ] Recorrido de éxito integrado con resultados visibles y comprensibles.
- [ ] Carga, vacío, error, sesión vencida, reintento y recuperación tratados cuando apliquen.
- [ ] Autorización en servidor, propiedad de recursos y pertenencia comprobadas según el módulo.
- [ ] Accesibilidad, privacidad, seguridad y abuso revisados con evidencia proporcional al riesgo.
- [ ] Pruebas pertinentes de reglas e integración realizadas; operaciones críticas sin duplicados.
- [ ] Costos, dependencias externas e impacto operativo conocidos o pendientes explícitos.
- [ ] Configuración local reproducible, sin secretos expuestos; migraciones y recuperación previstas cuando apliquen.
- [ ] Documentación, evidencia y registro de decisiones actualizados; ideas nuevas enviadas al backlog.
- [ ] Criterios de aceptación cumplidos e integración revisada antes del siguiente módulo.

Marcar «no aplica» con motivo cuando corresponda. Una casilla marcada requiere evidencia, no intención. Antes de producción, además verificar recorridos completos de compra directa y cotización, pagos online y efectivo, entrega/recogida, moderación e incidencias; pruebas reales autorizadas, restauración y responsable de operación. Las políticas concretas de cancelación, reembolso, conciliación y soporte aún deben cerrarse.

## 8. Cierre de esta entrega

Entregables: este archivo y copias revisadas de contexto y plan con referencia y precedencia explícitas. Evidencia: lectura completa de los cuatro documentos locales y decisiones de la solicitud actual. No se investigaron precios ni se aprobó proveedor alguno; no se implementó software, contrató servicio, contactó tercero o publicó contenido.

Siguiente paso documental: cerrar la ficha única de alcance y módulos de MVP1, resolviendo solo decisiones bloqueantes y conservando el núcleo confirmado. Monetización debe investigarse y validarse sin inventar tarifas aprobadas ni postergarse indefinidamente después de construir.


## Continuidad — ficha MVP1, 12 de octubre de 2026

El usuario encargó cerrar alcance y diseño integral antes de programar. Se prepararon [funcionalidades, módulos, dependencias, exclusiones y aceptación](ALCANCE_MVP1_MARLEVA.md), [registro común de decisiones](REGISTRO_DECISIONES_MARLEVA.md) y [referentes con fuentes y límites](REFERENTES_MVP1_MARLEVA.md). Esta ficha prevalece como propuesta actual sobre las antiguas listas de módulos; todavía no está congelada ni aprobada en conjunto.

Confirmación nueva C09: cualquiera puede explorar el catálogo, pero solo vecinos de los siete desarrollos pueden comprar y ofrecer. B1 queda cerrado. La forma de comprobar pertenencia de compradores y oferentes sigue pendiente en B2. No se aprobó ningún método de autenticación, tarifa, pasarela o stack.

Se leyeron completos los tres documentos vigentes, el enfoque comunitario y la arquitectura propuesta. La revisión documental inicial conserva los trece referentes y sus límites; no se observaron recorridos autenticados ni se probaron pagos. La arquitectura anterior requiere añadir pedidos, cotizaciones y pagos; sus proveedores y cuotas no se verificaron en esta entrega.

Estado real: primera ficha entregada; módulos y exclusiones adicionales propuestos; recorridos, diagramas, estados, datos, APIs y base aún sin cerrar. Sin software, publicación, contratación o contacto a terceros. Siguiente paso: B2, regla de pertenencia y alta/habilitación de compra; después B3–B6 y diseño común. B7 se cierra antes de la base del proyecto. Presupuesto de lanzamiento y demografía no bloquean este trabajo documental.

## 9. Estándar de chats confirmado

Aplicar [ESTANDAR_CHATS_MARLEVA.md](ESTANDAR_CHATS_MARLEVA.md): ID, fecha real, objetivo y entregables al abrir; resultado documentado y archivo de continuidad con prompt revisado al cerrar. No confundir cierre de chat con aprobación de propuestas. El marcador FIN se usa solo al cierre. Consultar [CONTINUIDAD_MAR_CHAT_001.md](CONTINUIDAD_MAR_CHAT_001.md) para el siguiente trabajo.
