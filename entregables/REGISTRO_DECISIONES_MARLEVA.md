# Marleva: registro común de decisiones

Fecha: 12 de octubre de 2026. Fuente vigente de estado: confirmaciones del usuario en principios y solicitud actual. Una fila propuesta o pendiente no autoriza implementación ni gasto.

| ID | Tema y decisión | Estado | Evidencia/motivo | Responsable | Fecha | Dependencias | Condición de revisión |
|---|---|---|---|---|---|---|---|
| C01 | Siete desarrollos; oferentes pertenecientes a ellos; negocio externo de vecino permitido | Confirmada | Contexto, principios §2 y AGENTS.md | Usuario | 12-10-2026, registro de acuerdos previos | M2/M3/M7 | Instrucción del usuario o problema demostrado |
| C02 | Acceso sin contraseña | Confirmada | Principios §2 | Usuario | 12-10-2026 | M1; B3 concreta método | Instrucción o evidencia nueva |
| C03 | Pedidos internos; compra directa y cotizaciones | Confirmada | Principios §2 | Usuario | 12-10-2026 | M4/M5 | Instrucción o incompatibilidad demostrada |
| C04 | Online y efectivo; entrega/recogida por oferentes inicialmente | Confirmada | Principios §2 | Usuario | 12-10-2026 | M6/M7 | Instrucción o problema operativo demostrado |
| C05 | Cobertura y moderación; domicilio particular no público | Confirmada | Principios §2/§4; enfoque comunitario | Usuario | 12-10-2026 | M2/M3/M7/M8 | Instrucción o riesgo demostrado |
| C06 | Objetivo de ingresos y rentabilidad; sin tarifas aprobadas | Confirmada | Principios §2/§4 | Usuario | 12-10-2026 | B5/M10 | Evidencia comercial o instrucción |
| C07 | Frontend/backend separados; tecnologías y cloud anteriores siguen propuestas | Confirmada | Principios §2 y arquitectura original | Usuario | 12-10-2026 | B7 | Decisión técnica explícita |
| C08 | Cerrar diseño integral antes del código; este encargo es documental | Confirmada | Solicitud de este chat | Usuario | 12-10-2026 | Todos | Nueva autorización del usuario |
| P01 | Explorar sin registro; cuenta al transaccionar u ofrecer | Propuesta de mecanismo; elegibilidad confirmada en C09 | Referentes, Airbnb; diseño adaptado | Usuario decide; asistente recomienda | 12-10-2026 | B1/M1–M3 | Cierre del mecanismo de acceso |
| P02 | Estados de aceptación, preparación/listo y atención; confirmación identificable | Propuesta | Referentes: DoorDash, Uber Eats y Deliveroo | Asistente prepara; usuario confirma reglas | 12-10-2026 | B4/B6 | Cierre de estados |
| P03 | Separar pedido, intento de pago, cobro y devolución | Propuesta técnica | Referentes: Wolt; necesidad de conciliar | Asistente | 12-10-2026 | M4–M7/B5 | Diseño financiero |
| P04 | Ayuda e incidencia ligadas al pedido | Propuesta | Referentes: Deliveroo; terminar operaciones fallidas | Asistente; usuario confirma política | 12-10-2026 | M8/B6 | Cierre de política |
| P05 | Sin sustituciones automáticas | Propuesta | Referentes: Instacart; contener alcance | Usuario | 12-10-2026 | M4/B4 | Confirmación de límites |
| P06 | Un oferente por pedido; cotización separada de compra de productos | Propuesta | Menor complejidad de atención y liquidación; no beneficio comercial probado | Usuario | 12-10-2026 | M4–M7/B4 | Confirmación de límites |
| P07 | M1–M10 y exclusiones adicionales de ficha | Propuesta | Ficha de alcance: necesidades del núcleo confirmado | Usuario | 12-10-2026 | Toda la ficha | Revisión/confirmación de línea base |
| C09 (cierra B1) | Cualquiera puede explorar; solo vecinos de los siete desarrollos compran y ofrecen | Confirmada | Respuesta explícita del usuario en este chat | Usuario | 12-10-2026 | M1–M5; B2 define comprobación | Instrucción del usuario o evidencia nueva |
| B2 | Prueba comunitaria de compradores/oferentes y reglas de publicación | Pendiente | Identidad no acredita residencia | Usuario con propuesta del asistente | 12-10-2026 | Compra/alta/moderación | B1 cerrado; resolver ahora |
| B3 | Canal sin contraseña, recuperación y avisos | Pendiente | Método/proveedor no elegidos | Usuario con investigación del asistente | 12-10-2026 | Acceso/avisos | Antes de contratos de identidad |
| B4 | Unidad de pedido, aceptación, disponibilidad, vigencia y fecha | Pendiente | Capacidades confirmadas; operación sin cerrar | Usuario con propuesta del asistente | 12-10-2026 | Recorridos/estados | Antes de diagramas/datos |
| B5 | Destinatario del cobro, liquidación e ingreso de Marleva | Pendiente | No hay esquema ni tarifas aprobados | Usuario con evidencia del asistente | 12-10-2026 | Pagos/APIs | Antes de elegir pasarela |
| B6 | Cancelación, cierre, ausencia, reembolso e incidencias | Pendiente | Necesario para finalizar casos fallidos | Usuario con propuesta del asistente | 12-10-2026 | Estados/aceptación | Antes de congelar diseño |
| B7 | Canal de producto, stack e integraciones concretas | Pendiente | Arquitectura del 9 de octubre propuesta y anterior al núcleo actual | Usuario | 12-10-2026 | Base del proyecto | Tras definir flujos y finanzas |

Detalle, dependencias y recomendaciones: [ficha de alcance](ALCANCE_MVP1_MARLEVA.md). Evidencia externa: [referentes](REFERENTES_MVP1_MARLEVA.md). No se crean decisiones nuevas por repetirlas en otro documento.

## Cierre del chat

Entregables guardados y revisión documental de coherencia realizada. No hay pruebas funcionales ni cumplimiento de estándares acreditado. Alcance detallado todavía en revisión. Sin desarrollo, publicación, contacto a terceros o contratación. Próximo paso: resolver B2 con la elegibilidad de C09; después recorridos y reglas antes de diagramas, estados, datos, APIs y base del proyecto.
