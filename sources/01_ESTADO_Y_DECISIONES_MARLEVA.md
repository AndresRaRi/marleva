# Marleva: estado y decisiones

Versión 1.0. Fecha: 12 de octubre de 2026. Consolidación documental; no aprobación del diseño detallado ni autorización para desarrollar o publicar. Cambiar solo por decisiones, avances o correcciones necesarias.

Reglas permanentes: [00_GUIA_PRINCIPAL_MARLEVA.md](00_GUIA_PRINCIPAL_MARLEVA.md). Diseño: [02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md](02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md). Evidencia: [03_REFERENTES_Y_EVIDENCIA_MARLEVA.md](03_REFERENTES_Y_EVIDENCIA_MARLEVA.md).

## Contexto vigente

Marleva permite descubrir, comprar y contratar productos y servicios de vecinos de los siete desarrollos. Busca facilitar la operación y dar motivos útiles para regresar, sin suponer que puede impedir compras externas. Utilidad, repetición, pago e ingresos deben comprobarse. El descriptor «Productos y servicios entre vecinos de Gran Santa Fe» sigue propuesto; disponibilidad de marca, dominio y cuentas no está verificada.

Se trabajará localmente por módulos completos, con preparación productiva y frontend/backend separados. El presupuesto de lanzamiento no bloquea el diseño local autorizado. Las listas anteriores de ocho, nueve o diez módulos son propuestas; no son aprobaciones distintas.

## Decisiones confirmadas registradas

| ID | Decisión | Fuente y límite |
|---|---|---|
| C01 | Nombre Marleva; comunidad de siete desarrollos; oferentes miembros, aunque tengan negocio fuera | Contexto original, instrucciones del proyecto y solicitud inicial de esta conversación. |
| C02 | Registro e inicio sin contraseña | Solicitud inicial y AGENTS.md vigente. Canal, método y proveedor sin elegir. |
| C03 | Catálogo, pedidos internos, compra directa y servicios con cotización | Solicitud inicial y AGENTS.md. Reglas operativas detalladas por cerrar. |
| C04 | Pagos online y efectivo; entrega/recogida por oferentes inicialmente | Solicitud inicial y AGENTS.md. No confirma pasarela, esquema de liquidación ni reparto de Marleva. |
| C05 | Cobertura limitada, validación y moderación; domicilio particular no público | Principios y enfoque comunitario. Polígonos exactos no validados. |
| C06 | Ingresos y rentabilidad como objetivos obligatorios; sin tarifas aprobadas | Instrucciones del usuario. No hay modelo de cobro ni resultados comerciales confirmados. |
| C07 | Frontend/backend separados; desarrollo local primero | Instrucciones del proyecto. Stack y cloud anteriores propuestos. |
| C08 | Diseño integral antes del código; reglas de lenguaje, evidencia y cierre de chats | Mensajes explícitos del usuario en esta conversación. |
| C09 | Cualquiera puede explorar; solo vecinos compran y ofrecen | Confirmación consignada en el registro y ficha de alcance disponibles de otro trabajo. Se conserva con esa procedencia; no se recuperó aquí el mensaje original que la confirmó. No reabrir sin motivo; B2 define la comprobación. |
| C10 | Consolidar fuentes, leer todo en orden desde la raíz, releer archivos finales y actualizar solo cuando sea necesario | Última solicitud del usuario en esta conversación. |

No presentar aprobación de toda una tabla de diseño por aprobación de una capacidad. Cambios futuros: guardar fecha, quién decidió, fuente, motivo, consecuencia y condición de revisión en este registro.

## Propuestas existentes

| ID | Propuesta | Estado / referencia |
|---|---|---|
| P01 | Explorar sin registro; pedir cuenta al transaccionar u ofrecer | Mecanismo propuesto; elegibilidad consignada en C09. |
| P02 | Estados claros de aceptación, preparación/listo y atención; cierre identificable | Reglas por diseñar; evidencia en 03. |
| P03 | Separar estado del pedido, intento de pago, cobro y devolución | Propuesta técnica; no aprueba forma de cobro. |
| P04 | Ayuda e incidencias vinculadas al pedido | Política por cerrar en B6. |
| P05 | Sin sustitución automática de productos | Límite propuesto, no confirmado. |
| P06 | Un oferente por pedido; cotización separada de compra de productos | Límite propuesto, no confirmado. |
| P07 | M1–M10 y exclusiones adicionales de la ficha actual | Propuesta en 02, no alcance congelado. |
| P08 | Web móvil, TypeScript, Next.js, NestJS, PostgreSQL y herramientas asociadas | Arquitectura propuesta; no proveedores o cuotas vigentes aprobados. |

## Pendientes que desbloquean el trabajo

| ID | Resolver | Qué bloquea | Responsable |
|---|---|---|---|
| B2 | Cómo comprobar pertenencia de compradores/oferentes, quién revisa, rechazo/corrección y ofertas restringidas | Alta, habilitación de compra y publicación | Asistente prepara propuesta mínima; usuario confirma cambios materiales. |
| B3 | Método sin contraseña, recuperación y canal de avisos | Recorridos y contrato de identidad | Comparación con evidencia; decisión material del usuario. |
| B4 | Unidad del pedido, disponibilidad, aceptación, vencimientos y contenido de cotización | Reglas, recorridos y estados | Asistente concreta rutina; usuario confirma límites materiales. |
| B5 | Quién recibe pagos, cuándo cobra/liquida y cómo ingresa dinero Marleva | Diseño financiero y selección de pasarela | Usuario sobre comparación documentada. Tarifas aún aplazadas; no inventarlas. |
| B6 | Cancelación, ausencia, cumplimiento, efectivo, reembolsos e incidencias | Estados finales y recuperación | Asistente prepara matriz; usuario confirma política material. |
| B7 | Canal de producto, tecnologías e integraciones concretas | Base del proyecto | Decisión técnica documentada después de reglas necesarias. |

No preguntar todo a la vez. Atacar el primero que bloquea el entregable y avanzar en trabajo independiente. Presupuesto de publicación, dominio, marca, fecha/tamaño del piloto y operador no bloquean la consolidación actual; se resuelven cuando detengan gasto o lanzamiento. Demografía continúa pausada.

## Plan de avance y condiciones de cierre

| Paso | Resultado | Condición de cierre |
|---|---|---|
| Actual: diseño integral | 02 con alcance, reglas, recorridos, diagramas, estados, datos, APIs y base propuesta | Documentos coherentes; decisiones bloqueantes resueltas; alcance explícitamente confirmado. |
| Base local | Proyecto reproducible, separación web/API, configuración, migraciones y verificaciones | Solo después de autorización de desarrollo; ejecución local comprobada. |
| Módulos | Función real integrada, errores y permisos | Criterios por módulo cumplidos con evidencia; orden final aún por cerrar. |
| Preparación productiva | Operación, acceso, costos, soporte, despliegue, backups y restauración | Pruebas pertinentes y responsables designados; publicación autorizada. |
| Piloto y negocio | Pedidos, repetición, costos, ingresos y disposición real a pagar | Evaluación basada en comportamiento real; umbrales/plazos no aprobados. |

Propuestas anteriores de 15–20 oferentes, 30 días y pruebas con cinco compradores/tres oferentes no son compromisos ni resultados. El prototipo y su prueba se incorporan al diseño cuando sirvan para resolver bloqueos; no se consideran hechos.

## Lista para después

| Idea | Estado |
|---|---|
| Reparto propio y motocicleta | Posterior; sin gasto autorizado. |
| Favoritos, reseñas, recompra automática, promociones, anuncios y referidos | Propuestas de valor/retención; confirmar exclusiones de MVP1 antes de congelar. No integrarlas por aparecer en referentes. |
| App nativa, IA, mapas en vivo, recompensas y chat general | Propuestas posteriores o descartes iniciales propuestos; no aprobadas como funciones de MVP1. |

## Lectura y revisión de esta entrega

Se inventariaron los archivos accesibles desde la raíz. Se revisaron las instrucciones actuales, los cinco documentos de `sources/` y los nueve Markdown de `entregables/`, además de esta conversación visible. Se consultó el chat «Brief piloto Marleva» mediante una respuesta limitada y recortada; no se afirma haber leído toda esa conversación ni otros chats. Los acuerdos principales se contrastaron con instrucciones y documentos disponibles. Los enlaces externos del benchmark se conservaron como evidencia previa, no como prueba nueva ejecutada aquí.

| Ubicación | Archivos revisados / papel |
|---|---|
| Raíz | AGENTS.md: instrucciones sincronizadas actuales, solo lectura. |
| sources/ | CONTEXTO_MARLEVA.md, PLAN_EJECUCION_MARLEVA.md, ENFOQUE_COMUNITARIO_GRAN_SANTA_FE_APP.md, ARQUITECTURA_PROPUESTA_MARLEVA.md, INFORME_GRAN_SANTA_FE.md: antecedentes completos disponibles, solo lectura. |
| entregables/ | Contexto, plan, principios, instrucciones, estándar, continuidad 001, alcance MVP1, referentes MVP1 y registro de decisiones: versiones anteriores usadas para consolidar. |
| entregables/fuentes_finales/ | Las cuatro fuentes numeradas: conjunto vigente preparado, versiones finales releídas antes de entregar. |

No se encontraron archivos primarios de auditoría geoespacial, plano original de Paraíso, análisis comercial ni investigación pública mencionados en antecedentes. Se conserva esa falta; no se necesita resolverla para esta etapa ni reabrir demografía. Cualquier decisión futura que dependa de esos archivos requiere acceso comprobado.

Estado de entrega: archivos locales disponibles; carga a Fuentes no comprobada. No hay repositorio Git en esta raíz y no se enviaron archivos a un repo. Las instrucciones compartidas no se modificaron directamente; se entrega el texto final para pegar.

## Registro de chats

| ID | Tema | Fecha y estado |
|---|---|---|
| MAR-CHAT-001 | Principios, referencias y organización final de fuentes | Actualizado y cerrado documentalmente el 12 de octubre de 2026. Fecha original de apertura no registrada. |
| MAR-CHAT-002 | Alcance y diseño integral de MVP1 | ID reservado en el estándar anterior. Existencia/apertura no comprobada en esta entrega; comprobar antes de crear un duplicado. |

## Continuidad activa: prompt revisado

Usar MAR-CHAT-002 solo si todavía no existe. Si ya existe, continuar allí con este encargo; comprobar su registro antes de asignar otro ID.

```text
PROYECTO: Marleva
CHAT: MAR-CHAT-002, si el registro confirma que no existe todavía.
TEMA: Alcance y diseño integral de MVP1
FECHA: Registra fecha real al abrir, en America/Merida.
ANTERIOR: MAR-CHAT-001

Lee primero las instrucciones vigentes y después, completos y en orden:
00_GUIA_PRINCIPAL_MARLEVA.md, 01_ESTADO_Y_DECISIONES_MARLEVA.md,
02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md y 03_REFERENTES_Y_EVIDENCIA_MARLEVA.md.
Inventaría desde la raíz todas las carpetas y fuentes accesibles y lee
también los demás archivos, incluidos los nuevos. Registra versiones,
ubicación, vigencia y faltantes. No declares lectura completa de resúmenes.

OBJETIVO
Retomar la ficha existente y cerrar alcance y diseño común de MVP1 antes
de programar. No empieces otra definición desde cero.

PUNTO DE PARTIDA
Respeta C01–C10. El alcance detallado, módulos, orden, tarifas, métodos de
pertenencia/acceso y proveedores no están aprobados. Hay una revisión
documental inicial de referentes, no pruebas de apps ni validación comercial.

PRIMER PASO
Ataca B2: presenta una propuesta mínima de comprobación de pertenencia,
alta y habilitación para comprar/ofrecer, con errores y corrección de rechazo.
Usa la evidencia disponible y verifica solo lo que haga falta para decidir.
Señala únicamente decisiones materiales que requieran al usuario.

DESPUÉS
Cierra B3–B6 cuando bloqueen reglas, recorridos y estados; después deriva
diagramas de actividades y secuencia, datos y contratos API. Resuelve B7
para documentar la base local. Mantén funciones, reglas y diseño coherentes.
No amplíes MVP1 ni reabras acuerdos sin motivo. Conserva demografía pausada.

LÍMITES
Este encargo es documental. No programes, publiques, contrates ni contactes
terceros. No inventes información, tarifas, aprobaciones o resultados.

ENTREGABLES
Actualiza 02 con el resultado de diseño y 01 con decisiones, estado y
continuidad. Actualiza 03 solo por evidencia nueva necesaria. Mantén 00
estable. Usa nombres existentes; crea otro archivo solo si hace falta.
El diseño se cierra con aceptación coherente, decisiones bloqueantes
resueltas y alcance confirmado; si queda incompleto, registra qué continúa.

FORMA Y CIERRE
Inicia con la ficha estándar. Lenguaje común, tablas puntuales y sin iconos.
Relee cada archivo final guardado antes de entregarlo. Al cerrar, entrega
resultado y continuidad con el próximo prompt completo revisado; indica
ubicación, acceso y qué debe incorporarse a Fuentes. Termina con FIN.
```

Revisión del prompt: nombres y enlaces existentes, acuerdos y procedencia, propuestas separadas, B2 como primer pendiente, demografía pausada, límites documentales y entregables. No implica que el nuevo chat se haya creado ni que sus fuentes estén cargadas.

## Registro de cambios

| Fecha | Cambio | Motivo |
|---|---|---|
| 12-10-2026 | Consolidación inicial en cuatro fuentes y traslado de continuidad a este archivo | Solicitud explícita del usuario: fuentes estables, lectura completa y avance sin duplicaciones. |
