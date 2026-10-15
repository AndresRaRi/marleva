# Propuesta de pantallas M2/M8

Estado de entrega vigente: [preparación de integración y sincronización Git autorizada](../../apis/M2/INTEGRACION_Y_ENTREGA_M2_M8.md). Las menciones anteriores a «sin commit/push» describen sus incrementos documentales previos; la entrega actual se verifica por SHA remoto, sin implicar subida a Fuentes o aceptación.

15-10-2026 · America/Merida · MAR-CHAT-007 CONTINUACIÓN. Diseño para revisión, no aprobado ni implementado. [Abrir propuesta navegable](propuesta.html). Datos ficticios, sin llamadas API, guardado, envío o resolución. Los controles del producto están desactivados; los selectores exteriores permiten revisar estados predefinidos.

## Alcance y fundamento

Expediente → documentos → envío → revisión, incluida corrección y reconsideración del rechazo vecinal. Se conserva el expediente y cada resolución; no abarca suspensión, reapertura archivada, perfil comercial ni pagos. M1 conserva acceso, segundo factor y recuperación. No se rediseñan sus pantallas.

Base propia: [casos](../../proceso/MATRIZ_CASOS_M2.md), [secuencias](../../diagramas/secuencia/M2/README.md), [DBML](../../modelado-datos/dbml/MAR-M2-DATA-001.dbml), [DDL](../../modelado-datos/ddl/MAR-M2-DATA-001.sql), [OpenAPI 0.3.1](../../apis/M2/openapi.yaml), [corrección/reconsideración](../../apis/M2/CORRECCION_RECONSIDERACION.md). El incremento D08/D09 actualiza únicamente estos artefactos propios, sin modificar M1 o contratos compartidos. [Mapa canónico de pantallas](pantallas.json) y [matriz de pruebas](../../proceso/MATRIZ_PRUEBAS_M2_M8.md).

## Sistema visual propuesto

Fondo crema #FFF9F3, superficie blanca, primario ciruela #552A5F y texto #27232D; texto secundario #625B66, borde de controles #8D818C. No comunicar estados solamente por color. Tipografía del sistema, cuerpo16px, títulos28–32px, controles48px, separación16–24px. Columna móvil única; revisión M8 en dos columnas desde600px y una por debajo. Acción principal única; secundarios apilados. El prototipo usa etiquetas permanentes y estado textual; al implementar se requieren foco al primer error y resumen vinculado, anuncios de estado y pruebas con lectores reales.

Se propone componer componentes pequeños de Marleva con los componentes básicos de React Native ya presentes en el proyecto: View, Text, TextInput, Pressable, Modal, ScrollView y ActivityIndicator. Evita una instalación nueva para este recorrido. React Native Paper queda como alternativa no evaluada: no se verificó compatibilidad con la versión fijada del proyecto. Una biblioteca solo web requeriría adaptación móvil; no se adopta. La decisión visual sigue pendiente de revisión, sin cambiar dependencias ni lockfiles.

## Reglas comunes de interacción

Cada pantalla distingue carga, vacío, error y datos confirmados. Un503 no equivale a lista vacía. Un401 conduce a recuperación existente de M1. Recurso ajeno/no asignado se presenta sin confirmar su existencia. Respuesta perdida: consultar recibo/estado con la misma clave y cuerpo; no crear otra clave automáticamente. Guardar significa únicamente borrador confirmado en servidor; no prometer conservar ediciones locales tras cerrar. Sin localStorage, IndexedDB o caché pública de datos privados.

Borrador, enviado y resolución son estados separados. Preparar corrección/reconsideración agrega versión, conserva el estado correction/rejected y la resolución previa. Solo enviar produce nuevo envío pendiente. Reconsideración requiere motivo privado de1–2000 caracteres no blancos; no introduce plazo ni número de intentos. Restablecer declaración de residencia; no copiar documentos automáticamente. Reutilización explícita preserva fecha y finalidad y requiere D08 cerrado. Nunca mostrar nombre de archivo, objectKey, hash ni detalle de análisis no devuelto por el contrato.

Historial mínimo separado del detalle privado y de la resolución visible. Si private_data_available=false mostrar “Datos privados no disponibles”; no atribuir causa de borrado por un null. M8 solo ve versión asignada actual y antecedente visible autorizado; no notas internas previas ni acceso documental histórico general. Motivo visible y nota interna tienen campos claramente separados. Al perder asignación, ocultar contenido y bloquear decisión. Reautorizar al decidir y antes de entregar bytes. La revocación externa de M1 necesita coordinación, no una promesa de atomicidad global.

## Pantallas y trazabilidad

### MAR-M2-UI-001 · Datos de pertenencia

Actor: titular. Acción principal: Continuar con documentos. Guardar no envía ni habilita pertenencia. Usar revisión confirmada, no inferir guardado por respuesta tardía.

Estados revisables: editing, loading, validation_error, save_uncertain, session_expired.

UC: MAR-M2-UC-001. Secuencia/pasos: MAR-M2-SEQ-001:S010,S060,S080,S085,S090,S130. API: MAR_M2_API_001, MAR_M2_API_002, MAR_M2_API_003, MAR_M2_API_004. Datos: M2MembershipApplication, M2MembershipVersion, M2MembershipVersionPrivate, M2MembershipCommandReceipt. Pruebas asociadas por campo ui en la matriz canónica.

### MAR-M2-UI-002 · Documentos privados

Actor: titular. Acción principal: Revisar antes de enviar. PDF/JPEG/PNG, máximo dos finalidades y5.000.000bytes por archivo. Reutilizar solo de versión fuente exacta y admisible; no cambiar su fecha.

Estados revisables: ready, uploading, analyzing, file_rejected, permit_expired, reusable, unavailable, conflict.

UC: MAR-M2-UC-002, MAR-M2-UC-004. Secuencia/pasos: MAR-M2-SEQ-002:S030,S050,S070,S085,S090,S140,S145,S150; MAR-M2-SEQ-004:S092,S094,S096,S098. API: MAR_M2_API_005, MAR_M2_API_006, MAR_M2_API_007, MAR_M2_API_008, MAR_M2_API_010, MAR_M2_API_011, MAR_M2_API_017. Datos: M2MembershipDocument, M2MembershipVersionDocument, M2MembershipDocumentAccess, M2MembershipCommandReceipt. Pruebas asociadas por campo ui en la matriz canónica.

### MAR-M2-UI-003 · Revisión y envío

Actor: titular. Acción principal: Enviar solicitud. En reconsideración el CTA es Enviar reconsideración. No mostrar enviado hasta recibo/consulta confirmados. Mantener clave/cuerpo; no repetir con clave nueva.

Estados revisables: ready, sending, send_uncertain, validation_error, conflict.

UC: MAR-M2-UC-003, MAR-M2-UC-004. Secuencia/pasos: MAR-M2-SEQ-003:S040,S060,S080,S090,S100,S120; MAR-M2-SEQ-004:S100,S105,S110,S120. API: MAR_M2_API_003, MAR_M2_API_009, MAR_M2_API_012. Datos: M2MembershipApplication, M2MembershipVersion, M2MembershipSubmission, M2MembershipCommandReceipt, M2MembershipEvent. Pruebas asociadas por campo ui en la matriz canónica.

### MAR-M2-UI-004 · Estado y resolución

Actor: titular. Acción principal: Ver historial. Motivo visible sin notas internas ni revisor. Sin promesa de tiempo de decisión. Aprobación vecinal no habilita por sí sola perfil comercial/pagos.

Estados revisables: empty, pending, correction, rejected, approved, loading, service_error.

UC: MAR-M2-UC-001, MAR-M2-UC-003, MAR-M2-UC-004. Secuencia/pasos: MAR-M2-SEQ-001:S050,S140; MAR-M2-SEQ-003:S090,S100; MAR-M2-SEQ-004:S010,S030,S040,S120. API: MAR_M2_API_001, MAR_M2_API_003, MAR_M2_API_014, MAR_M2_API_016. Datos: M2MembershipApplication, M2MembershipSubmission, M2MembershipDecision, M2MembershipDecisionPrivate. Pruebas asociadas por campo ui en la matriz canónica.

### MAR-M2-UI-005 · Historial y detalle

Actor: titular. Acción principal: Ver detalle de versión. Página mínima sin PII; abrir versión/resolución por separado. No recuperar suprimidos desde otra proyección. Revisor no hereda este acceso.

Estados revisables: history, private_unavailable, loading, service_error, forbidden.

UC: MAR-M2-UC-004. Secuencia/pasos: MAR-M2-SEQ-004:S020,S030,S035,S040. API: MAR_M2_API_014, MAR_M2_API_015, MAR_M2_API_016, MAR_M2_API_010, MAR_M2_API_011. Datos: M2MembershipVersion, M2MembershipVersionPrivate, M2MembershipSubmission, M2MembershipDecision, M2MembershipDecisionPrivate, M2MembershipDocumentAccess. Pruebas asociadas por campo ui en la matriz canónica.

### MAR-M2-UI-006 · Corrección y reconsideración

Actor: titular. Acción principal: Preparar borrador. Mismo expediente, versión nueva, motivo privado obligatorio solo en reconsideración; declaración vecinal reiniciada. Preparar no presenta; enviar sí.

Estados revisables: correction, reconsideration, draft, validation_error, prepare_uncertain, conflict, private_unavailable.

UC: MAR-M2-UC-004. Secuencia/pasos: MAR-M2-SEQ-004:S035,S050,S055,S060,S065,S080,S090,S100. API: MAR_M2_API_003, MAR_M2_API_004, MAR_M2_API_012, MAR_M2_API_013, MAR_M2_API_015, MAR_M2_API_016. Datos: M2MembershipApplication, M2MembershipVersion, M2MembershipVersionPrivate, M2MembershipDecision, M2MembershipCommandReceipt. Pruebas asociadas por campo ui en la matriz canónica.

### MAR-M8-UI-001 · Cola y asignación

Actor: gestor o revisor según capacidad. Acción principal: Abrir revisión asignada. assigned para revisor y pending para gestor, sin domicilios/nombres. Fuente D09-0.1 propia por envío; sin UUID manual ni Account.operator.

Estados revisables: queue, empty, loading, mfa_required, assignment_unavailable, conflict.

UC: MAR-M8-UC-001. Secuencia/pasos: MAR-M8-SEQ-001:S010,S020,S030,S050,S060,S070,S090,S100. API: MAR_M8_API_001, MAR_M8_API_002. Datos: M2MembershipSubmission, M8MembershipAssignment, M8MembershipReviewGrant. Pruebas asociadas por campo ui en la matriz canónica.

### MAR-M8-UI-002 · Revisar y resolver

Actor: revisor asignado. Acción principal: Confirmar decisión. Revisión solo del envío asignado actual y parte visible de antecedente; motivo visible/nota interna separados. Reautorizar al confirmar y antes de responder bytes. Si pierde asignación, ocultar contenido sensible.

Estados revisables: review, approved, rejected, mfa_required, assignment_lost, decision_uncertain, document_unavailable, loading.

UC: MAR-M8-UC-002. Secuencia/pasos: MAR-M8-SEQ-002:S010,S020,S030,S035,S040,S050,S060,S070,S100,S120,S145. API: MAR_M8_API_003, MAR_M8_API_004, MAR_M2_API_010, MAR_M2_API_011, MAR_M2_API_012. Datos: M2MembershipVersion, M2MembershipVersionPrivate, M2MembershipDocumentAccess, M2MembershipDecision, M2MembershipDecisionPrivate, M8MembershipAssignment, M2MembershipCommandReceipt. Pruebas asociadas por campo ui en la matriz canónica.

## Dependencias y límites

D08: conservación, bloqueos y supresión coordinados antes de habilitar reutilización. Rechazo/aprobación no inicia automáticamente30d ni autoriza conservación indefinida. D09-0.1: fuente contractual propia ya diseñada; selector con etiquetas operativas y casos vacío/error/conflicto. Botones de producto desactivados porque es maqueta. D09-R: aprovisionamiento e integración pendientes. No inventar nombres ni introducir UUID manual como experiencia normal. El permiso de M8 no se deduce de Account.operator. Quedan pendientes integración M1, retorno, MFA, capacidades, avisos y ensayo de restauración. No se modifica ningún contrato compartido para resolverlos aquí; el diseño usa contratos propios.

La aprobación es solo pertenencia vecinal; no concede perfil comercial ni pagos. El ejemplo visual no garantiza duración de revisión. El piloto y la implementación requieren revisión visual humana, cierre de dependencias y pruebas reales.

## Referentes consultados y límites

Consulta15-10-2026. [Airbnb: verificación de identidad](https://www.airbnb.com/help/article/1237) respalda explicar finalidad y privacidad del paso; no se copian sus requisitos de identidad, selfies ni conservación. [Componentes oficiales React Native](https://reactnative.dev/docs/components-and-apis) respalda la alternativa de componentes básicos; la documentación pública actual no certifica compatibilidad de paquetes con la versión fijada local. [Accesibilidad React Native](https://reactnative.dev/docs/accessibility) distingue soporte por plataforma; requiere VoiceOver/TalkBack reales. [W3C: contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) orienta contraste textual; medir pares del prototipo no acredita cumplimiento completo.

## Estado y continuidad

Propuesta documental guardada localmente en copia aislada. Ningún caso del producto ejecutado. Sin SQL, implementación, commit, push o subida a Fuentes. No se actualiza01 compartido para preservar el trabajo concurrente de006; sources permanece de solo lectura: incorporar avance documental cuando se concilien fuentes, manteniendo implementación0%. Siguiente pendiente: revisar visualmente esta propuesta, atender D08-R/D09-R y las condiciones de integración con la puerta de implementación sin tocar M1.

## Continuación D08/D09

[Política y catálogo propios](../../apis/M2/CONSERVACION_REVISORES_D08_D09.md). La maqueta agrega UI007 Privacidad y conservación con7 estados, y4 estados de candidatos en M8UI001. Total9 pantallas/66 vistas. Datos ficticios; selección no asigna ni concede permiso. API018 presenta calendario/estado sin causas legales privadas; M8API005 solo candidatos del envío autorizado. El mapa canónico pantallas.json contiene trazabilidad actual; las listas anteriores describen el corte previo y no sustituyen ese mapa. D08-R/D09-R permanecen como puertas reales antes de operar.

## Acciones por estado · revisión integral

El mapa pantallas.json ahora incluye state_actions para las66 vistas. Las acciones visibles se cotejan con ese mapa; las cuatro vistas nuevas cubren envío correction/reconsideration y revisión reconsideration/correction confirmada. Un resultado confirmado solo permite volver a la cola; incertidumbre exige consultar resultado. Indicador privado de versión y de decisión se evalúan por separado. Capturas de entregas anteriores son históricas; esta revisión comprueba DOM/acciones desde archivos, sin nuevas capturas ni aceptación visual.
