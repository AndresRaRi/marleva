# Marleva: plan de ejecución y criterios de calidad

Aplicar las [instrucciones permanentes de comunicación y continuidad](INSTRUCCIONES_PROYECTO_MARLEVA.md). Antes de programar, cerrar funcionalidades y reglas, diagramas de actividades y secuencia, estados, modelo de datos, contratos API y estructura del proyecto. Investigar referentes para resolver decisiones concretas, con evidencia. Presentar resultados en lenguaje sencillo y tablas útiles. Al cerrar cada chat o módulo, actualizar entregables, decisiones, evidencia, pendientes y siguiente paso. La lista y el orden de módulos sugeridos por el asistente siguen siendo propuestas.

Fecha: 9 de octubre de 2026. Estado: plan propuesto; no hay software desplegado, cuentas cloud creadas, usuarios reclutados ni gasto autorizado. Las preferencias de simplicidad, calidad, comunidad cerrada de oferentes y costos contenidos provienen del usuario. Los tamaños del piloto, umbrales, plazos y stack siguen siendo propuestas.

## Objetivo y reglas de trabajo

Validar un negocio de productos y servicios entre integrantes de los siete desarrollos de Gran Santa Fe. La plataforma debe permitir descubrir y contactar una oferta con facilidad, y al oferente publicar y mantenerla sin dificultad.

El ahorro se obtiene reduciendo funciones, infraestructura y operación innecesarias. Conservar corrección funcional, accesibilidad, protección de datos, permisos, rendimiento y recuperación. No lanzar un prototipo desechable como si estuviera listo para recibir datos reales.

Cada tarea debe tener responsable, resultado esperado, dependencia, criterio de aceptación y evidencia de revisión. Mantener un tablero sencillo: pendiente, en curso, en revisión, terminado. Trabajar en incrementos cortos y mostrar recorridos completos, no solo pantallas. Una decisión queda documentada una vez; cambios de alcance se evalúan por costo, utilidad y efecto en el piloto.

## Referencias aplicables

| Referencia | Tipo | Aplicación concreta |
|---|---|---|
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Estándar de accesibilidad | Objetivo AA: etiquetas, contraste, foco, teclado, formularios y procesos completos. Automatización y revisión manual; no declarar conformidad por aprobar un escáner |
| [Heurísticas Nielsen Norman](https://www.nngroup.com/articles/ten-usability-heuristics/) | Guía de usabilidad, no certificación | Lenguaje familiar, acciones visibles, consistencia, prevención de errores y recuperación |
| [OWASP ASVS](https://owasp.org/projects/asvs) | Estándar de verificación de seguridad | Elegir controles según riesgos y registrar pruebas de acceso, sesiones, validación, archivos y secretos; no afirmar certificación o cumplimiento total sin auditoría |
| [Core Web Vitals](https://web.dev/articles/vitals) | Métricas de experiencia web | Objetivos publicados de buena experiencia: LCP ≤2.5 s, INP ≤200 ms y CLS ≤0.1, evaluados al percentil 75 con datos de campo cuando haya muestra suficiente |
| [Discovery/alpha/beta de GOV.UK](https://www.gov.uk/service-manual/agile-delivery/how-the-alpha-phase-works) | Referencia de entrega por etapas | Investigar, probar recorridos, lanzar piloto controlado y decidir con evidencia. Adaptar al proyecto; no copiar requisitos o tiempos gubernamentales |

No existe una sola receta obligatoria para una app comunitaria. Usar estas referencias con criterios de aceptación propios y proporcionados al riesgo; no imponer ceremonias o certificaciones costosas al piloto.

## Experiencia objetivo

**Comprador:** entrar → buscar/explorar → abrir oferta → contactar por WhatsApp. Como objetivo de diseño, desde una oferta visible llegar al contacto en dos acciones. No convertir un número arbitrario de clics en criterio único de calidad. Evitar pantallas obligatorias de bienvenida y pedir solo los datos necesarios para la acción. Volver desde una ficha conserva búsqueda y filtros. Registro para explorar/contactar y acceso público o por invitación requieren una decisión explícita de producto antes de implementar.

**Oferente:** iniciar sesión → completar perfil comunitario → crear oferta → enviarla a revisión → conocer su estado → editar/pausar. Revisar pertenencia antes de habilitar publicaciones visibles. Usar un formulario breve con secciones claras, errores junto al campo y recuperación del trabajo si falla la conexión. No ocultar un formulario largo en diez pantallas para aparentar simplicidad.

**Administración:** revisar pertenencia y ofertas, aprobar o rechazar con motivo, gestionar avisos de datos incorrectos y suspender contenido cuando proceda. El sistema impide editar ofertas ajenas y registra acciones de moderación.

Estados imprescindibles: carga, sin resultados, conexión fallida, envío en curso, guardado correcto, sesión vencida y publicación pendiente/rechazada. En caso de rechazo, explicar cómo corregir. Si no hay oferta, no introducir negocios externos como reemplazo.

## Secuencia de ejecución

| Etapa | Entregables | Criterio de salida |
|---|---|---|
| 1. Definición del piloto | Brief de negocio, alcance mínimo, hipótesis, presupuesto máximo, responsables, reglas comunitarias y métricas | Se sabe qué se probará, quién operará y cómo se decidirá; quedan resueltas las decisiones necesarias del piloto |
| 2. Diseño del servicio | Flujos de comprador/oferente/admin, información de fichas, política de revisión, mapa de pantallas | Cada acción tiene entrada, resultado y manejo de error; no hay datos o pasos sin propósito |
| 3. Prototipo navegable | Maqueta móvil con tres casos: venta desde casa, servicio a domicilio y negocio externo de residente | Usuarios de prueba entienden qué ofrece Marleva y completan tareas; resolver bloqueos antes del desarrollo público |
| 4. Base técnica | ADR de stack/cloud, monorepo, contrato API, modelo de datos, entorno local, CI y migraciones | Frontend/API separados, pruebas reproducibles y reglas de acceso claras; costo estimado y límites documentados |
| 5. Versión funcional | Catálogo/búsqueda, fichas, publicación, edición/pausa, contacto y moderación; instrumentación mínima | Recorridos completos funcionan; pertenencia y autorización se validan en servidor; información ficticia separada de ofertas reales |
| 6. Preparación de operación | QA móvil/accesibilidad/seguridad, backups/restauración, monitoreo, soporte, onboarding y contenido autorizado | Sin fallos que impidan tareas o expongan datos; publicación, despliegue y recuperación comprobados |
| 7. Piloto controlado | Propuesta: 15–20 oferentes y 30 días; revisión semanal de resultados y problemas | Evidencia suficiente de utilidad, repetición y esfuerzo operativo; documentar también ausencia de resultados |
| 8. Decisión comercial | Informe de resultados, prueba concreta de cobro y prioridades siguientes | Decisión de continuar, ajustar o detener basada en comportamiento y disposición real a pagar |

Dependencia principal: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Verificación del nombre y preparación de candidatos pueden realizarse junto con diseño. Reclutar/comunicar/publicar y contratar servicios se realizan solo con autorización correspondiente; este plan no ejecuta esas acciones.

La base local puede prepararse con ejemplos ficticios cuando el diseño lo permita. No comprar infraestructura antes de saber qué exige el piloto. No comprometer fechas globales sin fijar capacidad de trabajo, participantes y presupuesto; los 30 días miden el piloto, no toda la construcción.

## Responsabilidades propuestas

- Usuario/promotor: objetivo comercial, acceso a la comunidad, decisiones de alcance/presupuesto y responsable de operación.
- Desarrollo/diseño: convertir el alcance en flujos, prototipo, código, pruebas, despliegue y documentación. En este chat puedo preparar entregables técnicos y de producto dentro de lo autorizado.
- Moderación/soporte: comprobar pertenencia, revisar ofertas y responder problemas; debe haber una persona designada antes del piloto.
- Participantes: ofrecen retroalimentación y autorizan sus fichas. No inferir que un participante acepta publicación por compartir un anuncio previo.

Una persona puede cubrir varios roles; cada tarea conserva un responsable. Se presenta al usuario una decisión concreta cuando cambia alcance, gasto o exposición pública, no cada elección rutinaria de implementación.

## Criterios de aceptación del piloto

1. Solo perfiles elegibles y ofertas aprobadas son visibles. Probar intentos de publicación no autorizada y modificación de ofertas ajenas.
2. Búsqueda devuelve ofertas relevantes y comunica cuando no hay resultados; botón de contacto abre el destinatario correcto con texto pertinente.
3. Errores recuperables conservan datos; acciones importantes muestran confirmación y evitan duplicados.
4. Interfaz móvil funciona con teclado/lector de pantalla y zoom; imágenes optimizadas y diseño sin saltos molestos. Verificar los criterios AA aplicables y documentar pendientes.
5. Recorridos principales se prueban en Android/Chrome e iPhone/Safari, y con red lenta. Emulación ayuda, pero no reemplaza por completo dispositivos reales.
6. Permisos, sesiones, entradas y cargas de archivos tienen pruebas. Secretos no llegan al navegador ni a Git. Domicilios particulares no se exponen públicamente.
7. Backups incluyen datos y fotos; restauración verificada, monitor y canal de soporte disponibles. Revertir un despliegue no supone revertir automáticamente una base de datos.
8. Instrumentación mide consultas y contactos sin registrar chats, teléfonos completos o contenido privado innecesario. Confirmación de pedidos por participantes es voluntaria.

Propuesta de prueba cualitativa del prototipo: comenzar con cinco compradores y tres oferentes de distinta facilidad digital. Objetivo inicial de producto: al menos cuatro de cinco compradores encuentran una oferta pertinente y llegan al contacto sin indicaciones; al menos dos de tres oferentes completan una publicación válida sin intervención. Son umbrales de trabajo para detectar bloqueos, no estándares internacionales ni prueba estadística de éxito. Si hay fallos, iterar y ampliar evidencia.

## Medición comercial

Registrar por cohorte/semana: visitantes, búsquedas con/sin resultado, contactos únicos por oferta, pedidos confirmados, compradores que repiten, perfiles actualizados y tiempo de moderación/soporte. Definir con precisión cada evento y el denominador antes del piloto. No llamar comprador a quien solo abrió WhatsApp.

Separar éxito de uso de éxito económico. Para economía: ingresos efectivamente cobrados menos hosting/correo/otros gastos directos y tiempo operativo registrado. No presentar un piloto manual intensivo como rentable sin reconocer trabajo del operador. Umbrales de negocio, precio y número de compradores a reclutar se fijan en la etapa 1; todavía no hay valores aprobados.

## Control de costos

Presupuesto a completar: dominio, aplicación/API, base/Auth, fotos/transferencia, correo y margen de contingencia. Anotar proveedor, cuota incluida, posible excedente, disparador de pago y responsable. Comparar costo mensual completo y horas de operación, no solo precio de hosting.

Usar planes gratuitos compatibles con el uso y desarrollo local mientras sea adecuado. La opción técnica actual —Next.js/NestJS/PostgreSQL con Cloud Run/Supabase— está propuesta, no elegida irrevocablemente. Evaluar su carga de dos despliegues y varios servicios frente al presupuesto/capacidad real en etapa 1/4. Mantener separación aunque cambie el proveedor o se aloje en infraestructura más simple.

Ahorros concretos del piloto: contacto por WhatsApp mediante enlace, revisión comunitaria manual con reglas, sin reparto/cobros internos, sin mapas embebidos, sin IA, sin microservicios. No recortar las pruebas críticas, recuperación, accesibilidad o soporte para pagar cero.

Alertas de gasto no son límites duros. Configurar controles de instancias, tamaño/número de fotos, retención y abuso. Probar exportación para conservar una salida de proveedor. Servicios de pago requieren autorización previa al gasto.

## Condición de terminado para cada cambio

Cumple aceptación; revisión visual/funcional correspondiente; pruebas críticas pasan; sin exposición de datos; cambios de API/esquema documentados; comportamiento de error cubierto; costo e impacto operacional entendidos. Registrar evidencia y pendientes. No marcar terminado por tener código o capturas bonitas.

## Siguiente entrega concreta

Completar el brief de piloto de una página con alcance, decisiones pendientes, flujo objetivo, presupuesto y métricas. Después elaborar prototipo navegable. Este plan organiza ese trabajo y conserva las prioridades; no autoriza empezar a desarrollar toda la app sin resolver el alcance mínimo.

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

## Apertura y cierre de trabajo

Aplicar [ESTANDAR_CHATS_MARLEVA.md](ESTANDAR_CHATS_MARLEVA.md). Antes de terminar un chat, actualizar resultado, decisiones, evidencia y pendientes, y entregar archivo de continuidad con el próximo prompt revisado. No marcar una etapa terminada por cambiar de chat. Próximo objetivo: alcance y diseño integral de MVP1, según [CONTINUIDAD_MAR_CHAT_001.md](CONTINUIDAD_MAR_CHAT_001.md).
