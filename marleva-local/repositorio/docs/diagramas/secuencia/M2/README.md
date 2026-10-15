# Secuencias M2 y soporte de revisión M8

15-10-2026. MAR-CHAT-007. Diagramas objetivo; sin implementación ni pruebas runtime. La revisión visual documental de cinco secuencias se detalla al final. Las flechas a M1 representan dependencia de contratos existentes, sin cambios en ellos. La persistencia por módulos es conceptual: M8 solicita transiciones de M2; no modifica sus tablas directamente.

Casos/reglas/estados: [matriz M2](../../../proceso/MATRIZ_CASOS_M2.md). Los pasos Sxxx son estables dentro de cada secuencia. Las etiquetas se insertan sin renumerar las existentes.

| Caso | Secuencia | Regla crítica | API/datos/UI/prueba |
|---|---|---|---|
| MAR-M2-UC-001 | [M2-SEQ-001](MAR-M2-SEQ-001.mmd), S010–S140 | Crear y guardar expediente | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M2-UC-002 | [M2-SEQ-002](MAR-M2-SEQ-002.mmd), S010–S150 | Carga privada y validación de evidencia | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M2-UC-003 | [M2-SEQ-003](MAR-M2-SEQ-003.mmd), S010–S120 | Enviar versión de pertenencia | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M2-UC-004 | [M2-SEQ-004](MAR-M2-SEQ-004.mmd), S010–S120, incluidos S035/S055/S065/S092–S098/S105 | Consulta, corrección y reconsideración | API013–017 y DATA001 alineados; UI/pruebas de servicios pendientes |
| MAR-M2-UC-005 | [M2-SEQ-005](MAR-M2-SEQ-005.mmd), S010–S110 | Cambio de residencia y bloqueo de operaciones nuevas | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M2-UC-006 | [M2-SEQ-006](MAR-M2-SEQ-006.mmd), S010–S100 | Archivo por inactividad y reapertura | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M2-UC-007 | [M2-SEQ-007](MAR-M2-SEQ-007.mmd), S010–S080 | Crear y editar perfil comercial | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M2-UC-008 | [M2-SEQ-008](MAR-M2-SEQ-008.mmd), S010–S080 | Enviar alta comercial | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M2-UC-009 | [M2-SEQ-009](MAR-M2-SEQ-009.mmd), S010–S090 | Pausa, reanudación y proyección del perfil | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M2-UC-010 | [M2-SEQ-010](MAR-M2-SEQ-010.mmd), S010–S080 | Consulta de elegibilidad por capacidad | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M2-UC-011 | [M2-SEQ-011](MAR-M2-SEQ-011.mmd), S010–S110 | Conservación, borrado y recuperación documental | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M8-UC-001 | [M8-SEQ-001](../M8/MAR-M8-SEQ-001.mmd), S010–S100 | Asignación y cola de revisión | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M8-UC-002 | [M8-SEQ-002](../M8/MAR-M8-SEQ-002.mmd), S010–S145 | Decisión sobre pertenencia | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M8-UC-003 | [M8-SEQ-003](../M8/MAR-M8-SEQ-003.mmd), S010–S120 | Restricción y reconsideración vecinal/comercial | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M8-UC-004 | [M8-SEQ-004](../M8/MAR-M8-SEQ-004.mmd), S010–S110 | Decisión de alta comercial | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |
| MAR-M8-UC-005 | [M8-SEQ-005](../M8/MAR-M8-SEQ-005.mmd), S010–S100 | Bloqueo de conservación y levantamiento | Pendientes de cierre físico/contrato/UI y detalle de pruebas; familias en matriz |

## Revisión y siguiente dependencia

Revisión textual: cada caso tiene secuencia; se representan negativas, concurrencia y recuperaciones pertinentes. Las familias de prueba de la matriz todavía deben descomponerse y enlazarse a pasos concretos. No declarar trazabilidad UC→SEQ→API→datos→UI→prueba completa por tener estos archivos.

Parse y render locales de las 16 secuencias comprobados con Mermaid 11.12.0. Galería de seis secuencias M2-SEQ001/002/003/004 y M8-SEQ001/002; acta vigente distingue revisiones del incremento y anteriores; [vistas locales](REVISION_RECORRIDO.html). Las otras10 solo acreditan parse/render, no revisión funcional exhaustiva. No solicitudes, base de datos ni pruebas de producto. La propuesta visual de pantallas es una etapa posterior y no está aprobada.

[DATA001](../../../modelado-datos/M2/README.md) detalla datos del primer recorrido y controles estructurales/pendientes. El [contrato propio inicial](../../../apis/M2/README.md) propone 21 operaciones del recorrido UC001–004; los IDs/pasos están trazados en su YAML. UC004 conserva expediente/antecedente y diferencia borrador/presentación; [diseño](../../../apis/M2/CORRECCION_RECONSIDERACION.md). Próximo: propuesta revisable de pantallas y pruebas; mantener M1/contratos compartidos intactos. Retención de documentos reales depende de D08 de la matriz.

## D08/D09 · 15-10-2026

SEQ011 concreta finalización, ledger/copia/ausencia y consulta propia; SEQ004:S130/S135/S140 alinea impugnación y referencias; M8SEQ001:S001–S005/S025 alinea catálogo por envío. Pasos previos conservados. [Propuesta](../../../apis/M2/CONSERVACION_REVISORES_D08_D09.md). No hay worker ni API implementados.
