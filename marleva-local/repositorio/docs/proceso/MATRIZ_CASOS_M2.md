# M2 y soporte M8: diseño documental integral

MAR-CHAT-007 · CONTINUACIÓN · 15-10-2026, America/Merida. Versión documental integral0.4.0. **Diseñado para revisión; sin implementación, SQL aplicado, pruebas funcionales ni aceptación acreditada.**

## Alcance, fuentes y condición de cierre

La entrega cubre M2 UC001–011 y exclusivamente M8 UC001–005 necesarios para pertenencia, oferentes, restricciones y conservación. Responde al encargo original completo; los cortes anteriores del recorrido están conservados en Git y sus actas fechadas, no son el alcance vigente. No desarrolla ofertas M3, pedidos M4, pagos M5 ni todo M8.

Fuentes de producto: [00](../../../../entregables/fuentes_finales/00_GUIA_PRINCIPAL_MARLEVA.md), [01](../../../../entregables/fuentes_finales/01_ESTADO_Y_DECISIONES_MARLEVA.md), [02](../../../../entregables/fuentes_finales/02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md), [03](../../../../entregables/fuentes_finales/03_REFERENTES_Y_EVIDENCIA_MARLEVA.md). Reglas técnicas: [protocolo](PROCESO_DESARROLLO_MARLEVA.md), [M1](MATRIZ_CASOS_M1.md). Las fuentes en esta rama son la fotografía base6fed44f; no se sobrescribe el trabajo concurrente de M1/01.

Cierre de este encargo: funciones/estados/errores,16 secuencias con pasos estables, modelo DBML y DDL derivado, YAML/Swagger propios, pantallas y matriz de pruebas trazadas, dependencias operativas y evidencia documental comprobada; commit/push de rama aislada verificables. Esto no cierra módulos implementados ni autoriza operaciones con datos reales.

## Límites y responsabilidades

- Residentes actuales de los siete desarrollos C01/C11, incluidos inquilinos/familiares. Propietario no residente o negocio cercano no adquiere pertenencia. Público explora; comprar exige pertenencia aprobada; ofrecer exige además perfil comercial habilitado y vigente.
- M1 autentica cuenta estable/sesión/MFA/recuperación. M2 es dueño del expediente, perfiles, restricciones y elegibilidad; M8 coordina revisión mediante casos/puertos de M2, sin escribir sus tablas directamente. Correo no es clave de titularidad.
- Una cuenta/un expediente y un perfil. Residencia, datos contractuales y cobertura tienen finalidades distintas. No INE, selfie, biometría, contactos a terceros, datos bancarios, tarifas inventadas o renovación anual.
- Identidad, pertenencia, habilitación comercial y financiera se mantienen separadas. Aprobar una nunca crea oferta, pago ni aprobación de otra.
- La implementación futura sigue Nest modular por capas y cliente Expo separado. Los generadores documentales no son backend, frontend de producto ni migraciones.

## Actores y autorización

| Actor | Permiso necesario y límite |
|---|---|
| Titular | Sesión vigente; solo expediente/perfil/restricciones propios. Puede leer su historial aunque pierda elegibilidad; editar/enviar perfil exige pertenencia eligible actual. Nunca decide o elige revisor. |
| Público | Proyección comercial mínima solo si perfil y elegibilidad actuales permiten ofrecer. No enumera vecinos o expedientes. |
| Comprador elegible | Resumen contractual privado del oferente vigente, finalidad precontractual explícita y límite de abuso; nunca evidencia vecinal. |
| Revisor vecinal | Perfil operativo M8 enabled, grant membership_review vigente, asignación exacta, MFA y autenticación reciente. |
| Revisor comercial | seller_review y asignación comercial propia; no hereda comprobantes vecinales. |
| Restricciones | membership_restrict/seller_restrict según objetivo; revisión de apelación solo asignada, evidencia explícitamente enlazada. |
| Gestor | membership_assign/seller_assign según ámbito; asigna a revisor con capacidad específica. No se autoaprovisiona ni asigna su propio caso. |
| Conservador | membership_conserve/seller_conserve según finalidad, MFA reciente, no titular. Agenda decisiones de conservación; no adquiere permiso de lectura de bytes. |
| Trabajador | Intención durable, reloj/lease y política; no decide vínculo vecinal ni levanta causas. |

Ningún rol de Account/M1 concede estas capacidades. Cuenta titular, gestor y revisor se comprueban en cada operación; ninguno revisa/asigna su propio caso. Conflicto adicional declarado exige reasignación sin revelar su detalle al titular. Falta de candidato mantiene caso pendiente, sin autoaprobación. La política reciente depende de M1; cinco minutos es referencia documental, no una garantía nueva implementada. [D09 y aprovisionamiento](../apis/M2/CONSERVACION_REVISORES_D08_D09.md).

## Invariantes y concurrencia comunes

Una versión enviada es inmutable. Decisión referencia envío, versión y asignación exactos; una ganadora. Actor se deriva de sesión, no del cuerpo. Decisión, transición, recibo y evento se guardan juntos; correo/proveedor fuera de transacción. Evento contiene IDs/transición/destinatario, sin documentos, nombres, teléfonos, domicilio o notas.

Cada mutación compara revisión del recurso declarada en YAML. Orden global: expediente/agregado de elegibilidad → casos de conservación → concesiones → documentos → versiones/enlaces/perfil/restricciones → envíos/asignaciones → bloqueos/tareas, ordenando UUID dentro de cada grupo. No mantener bloqueo durante carga/análisis/correo. Incorporar nuevas tablas al grupo de su agregado; nunca invertir el orden en otro recorrido. Cambios que afectan permisos incrementan eligibilityRevision en ese mismo bloqueo, incluido estado/perfil/isPaused/restricción. No confundir esa revisión con revisión del perfil o apelación.

Idempotencia: identidad+operación+clave, JSON canónico JCS, HMAC con keyId y anillo de llaves vigente, sin llaves reales en documentación. Serializar actor+operación antes de consultar todas las llaves retenidas: rotar hash no crea otro comando. Misma clave/cuerpo devuelve recibo mínimo tras reautorizar; mismo identificador con otro cuerpo409. No conservar respuesta privada antigua. Conservar clave/cuerpo en memoria ante resultado incierto, consultar recibo/estado; no crear otra intención hasta reconciliar. Reinicio del cliente consulta estado confirmado antes de nueva acción. [Puertos y huellas](../apis/M2/INTEGRACION_Y_ENTREGA_M2_M8.md).

## Estados y transiciones

| Agregado | Transición autorizada | Efecto |
|---|---|---|
| Pertenencia | inexistente→draft→pending→approved/correction/rejected | Solo revisor asignado resuelve pending; aprobación histórica no se sobrescribe. |
| Corrección | correction + preparar nueva versión→correction; enviar→pending | Preparar no presenta; conserva decisión y versión fuente exactas. |
| Reconsideración vecinal | rejected + preparar con motivo→rejected; enviar→pending | Nueva versión, mismo expediente; no habilitación provisional ni plazo de caducidad inventado. |
| Cambio vecinal | approved→correction + origin residence_change | Conservar approvedVersionId histórico; bloquear elegibilidad inmediatamente. |
| Archivo | draft/correction editable→archived_inactivity | Solo tras30d de actividad del titular y aviso durable disponible+7d; nunca pending. Rejected con borrador de reconsideración archiva versión, conserva rejected. |
| Reapertura | versión archived→nueva reopen | previousVersionId y resumeOrigin; inicial vuelve draft, correction/residence_change vuelve correction, reconsideration conserva rejected. Fuente de decisión solo si existía. |
| Perfil | inexistente→draft→pending→enabled/correction/rejected | Una versión actual; enabled solo si la misma versión fue aprobada y pertenencia sigue eligible. |
| Corrección/reconsideración comercial | correction/rejected + preparar→correction o rejected según fuente; enviar→pending | Motivo nuevo obligatorio al reconsiderar; decisión anterior permanece. |
| Edición material | enabled + preparar material_change→correction | Deshabilita proyección/oferta nueva de inmediato; approvedVersionId es histórico, no permiso para publicar la versión vieja. |
| Pausa | isPaused false↔true, independiente de base | Pausar no borra obligaciones. Reanudar exige base enabled, versión actual aprobada, pertenencia approved y sin restricciones offer/both. |
| Restricción | causa active→lifted por revisión autorizada | No cambia estado base de pertenencia/perfil. Effective suspended deriva de causas activas; levantar una no levanta otras ni aprueba datos. |
| Apelación | draft→pending→decided | Una abierta por causa. Preparar/guardar no presenta; presentar congela motivo/enlaces; maintain permite solicitud posterior sin máximo arbitrario. |
| Documento | uploading/analyzing→valid/rejected; conservación independiente | Valid solo formato/análisis técnico, nunca aprobación vecinal. delete_pending bloquea uso; deleted exige confirmación de todas las copias. |

No hay estado base suspended en expediente/perfil: es proyección efectiva por restricciones. No convertir rechazo en borrador para ocultar resolución. Un bloqueo de cuenta M1 sigue aplicando aunque exista aprobación M2.

## Casos completos y criterios de salida

Cada UC tiene secuencia homónima MAR-M2/M8-SEQ-xxx. [Índice de diagramas](../diagramas/secuencia/M2/README.md), [operaciones canónicas](../apis/M2/openapi.yaml), [datos](../modelado-datos/M2/README.md), [pantallas](../ui-ux/M2/PROPUESTA_PANTALLAS_M2_M8.md), [pruebas](MATRIZ_PRUEBAS_M2_M8.md). La [cobertura integral](../apis/M2/COBERTURA_INTEGRAL.json) une los16 casos con sus artefactos y escenarios.

### M2 UC001–004: expediente, documentos, envío e historial

UC001: sesión válida; consultar own, crear único con clave, guardar draft completo o incompleto con revisión. No aceptar estado/actor/fecha del cliente. Cuenta/correo modificados por M1 no crean expediente nuevo. Respuesta perdida consulta recibo/expediente. Guardar no envía.

UC002: aviso de finalidad antes de cargar. PDF/JPEG/PNG real,1..5.000.000bytes decimales, hasta2 finalidades por versión: domicilio y, si no coincide titular, constancia concordante. Sin INE. Validar bytes/formato/malware del lado servidor; nombre/extensión/Content-Type no son prueba. Subir/finalizar/análisis con referencia temporal e idempotencia propia. Carga/análisis/fallo no permiten enviar; limpieza de huérfanos según D08, sin cupos infinitos.

UC003: titular selecciona versión actual; nombre/desarrollo/domicilio/declaración y evidencia completos. Fecha legible no futura y hasta3 meses calendario inclusive en America/Merida, ajuste al último día del mes, nunca90d fijos. Revalidar propietario/finalidad/estado/tamaño/fecha/enlaces bajo bloqueo, congelar y crear pending único/recibo/evento. Fallo422 detalla campos sin borrar borrador; fallo503 no aprueba. Revisor humano confirma legibilidad y vínculo, no se confunde análisis seguro con residencia.

UC004: historial mínimo paginado24/max50 number DESC,id DESC; detalle exacto propio por separado, sin notas internas. Preparar correction/reconsideration sobre última decisión y envío fuente, nueva versión con motivo privado nuevo solo reconsideration y declaración false. Reutilización solo explícita de evidencia de la fuente inmediata aún válida/disponible y legítimamente conservada; no rejuvenecer fecha ni ampliar plazo. Purga exige nuevos datos/carga. Preparar no envía; enviar usa UC003. [Detalle vigente del recorrido](../apis/M2/CORRECCION_RECONSIDERACION.md).

### M2 UC005–006: cambio de residencia, archivo y reapertura

UC005: titular approved sin envío pendiente ni borrador vigente elige relocation/evidence_update. Con revisión esperada crear residence_change enlazada a última versión/decisión aprobada; no copiar documentos, declaración false; domicilio/nombre se recapturan por finalidad si no disponibles. Estado correction, elegibilidad false y evento/recibo atómicos. No hay regreso automático a approved por cancelar pantalla. Completar UC002/003 y revisión M8. Pedidos/ayuda/restituciones anteriores subsisten.

UC006: lastActivityAt cambia solo al confirmar edición/preparación/envío del titular; lectura, análisis o asignación no lo rejuvenecen. Trabajador selecciona borrador actual30d inactivo, registra notice único por revisión observada. noticedAt solo al estar disponible en cuenta, no por correo enviado; archiveAt=noticedAt+7d. Antes de archivar compara revisión/actividad/versión/estado bajo bloqueo; edición/envío cancela intención vieja. Rejected con borrador conserva rejected. Reabrir exige versión corriente archived y revisión exacta; nueva versión reopen, previousVersionId, resumeOrigin y fuente si existía; jamás inventar decisión para inicial. Sin enlaces copiados, purgados no recuperados, declaración false; motivo nuevo si reconsideration. Respuesta incierta consulta recibo.

### M2 UC007–008: perfil comercial y condiciones

UC007: miembro approved sin restricción offer/both. Crear un perfil/versión inicial; no pedir comprobante vecinal de nuevo. Nombre público≤100, descripción≤1000, modalidades únicas delivery/pickup/on_site/remote, cobertura IDs1..7 única, attention_mode private_location/customer_location/remote, response_minutes1..1440, service_window≤500. Draft admite null/listas vacías; envío exige completo. Guardado PUT sustituye conjunto completo, nunca mezcla silenciosamente versiones.

Privado contractual: legal_name≤200, contract_address≤1000, phone E164, support_hours≤500, attention_address≤1000 cuando pickup/private_location; reconsideration_reason≤2000 solo origen correspondiente. Aporte expreso, sin copiar nombre/domicilio del expediente. Un negocio fuera del fraccionamiento no invalida residencia; cobertura sigue siete. No dirección exacta pública en MVP1. No datos bancarios, tarifas o proveedor financiero aquí.

Corrección/reconsideración/material_change: preparar nueva versión desde decisión/versión actuales exactas, sin envío abierto. Correction solo tras correction; reconsideration solo rejected con motivo no vacío; material_change solo enabled. Copiar valores comerciales aún disponibles a draft propio no conserva aceptación ni transforma datos purgados; parte purgada se recaptura. Conserva origin/previousVersionId/sourceDecisionId. Material_change bloquea difusión inmediatamente. Guardar no presenta.

UC008: sesión/pertenencia elegibles bajo bloqueo; validar modalidad/cobertura/campos: pickup exige private_location y punto privado; attention_mode remote exige modality remote; on_site requiere cobertura declarada. Política de condiciones única active, ID/hash exactos y aceptación expresa por cada versión. [Texto propuesto](../apis/M2/CONDICIONES_OFERENTES_MVP1.md) permanece draft; no se activa por existir archivo. Si draft/retirada/cambió409 y mostrar texto vigente para aceptar otra vez. Envío congela, registra aceptación y pending único/recibo/evento. No crea ofertas/pagos ni aprobación por silencio.

### M2 UC009–010: perfil, elegibilidad y contratación futura

UC009: consulta privada propia e historial aun suspendido; private_data_available rige detalle, no inferir borrado de null. Público solo id/version_id y campos comerciales mínimos de versión actual enabled, no pausada y eligible. Otros404. Nunca accountId/expediente/legalName/teléfono/domicilio/nota/revisor. Pausa independiente disponible sin borrar historial; reanudar valida misma versión y todas las causas. Cambiar versión material exige revisión nueva; una decisión antigua no autoriza publicar.

UC010: buy = pertenencia approved + ninguna restricción buy/both + identidad vigente. offer añade perfil enabled, currentVersionId=approvedVersionId, !isPaused y ninguna restricción offer/both. Retornar razones mínimas/eligibilityRevision/fecha;503 ante dependencia, no permiso por caché. GET es informativo, no reserva. Consumidor futuro usa EligibilityGuard dentro de unidad de trabajo acordada, bloqueo M2 retenido hasta commit de nueva operación para evitar carrera con restricción; nunca consulta tablas M2 directamente o cambia GET /me.

Resumen privado precontractual: comprador actual buy eligible, oferente offer eligible, finalidad explícita y10/min/cuenta propuesto; devolver solo datos contractuales de versión exacta, jamás expediente. Privado no disponible409; no rellenar desde residencia. API no crea pedido. M4 deberá guardar snapshot contractual al contratar y definir su calendario legal separado antes de transacciones; M2 no reescribe acuerdos previos.

### M2 UC011 y M8 UC005: conservación completa

C14 confirmado: adjuntos vecinales30d desde resolución final no impugnada, no desde aprobación automática. Finalización administrativa separada no impone plazo para reconsiderar. Política D08-0.2 propuesta: mantiene C14 e incorpora privados comerciales/restricciones con finalidades distintas. [D08 detalle](../apis/M2/CONSERVACION_REVISORES_D08_D09.md) y [extensión integral](../apis/M2/INTEGRACION_Y_ENTREGA_M2_M8.md).

Datos comerciales privados activos se conservan mientras exista finalidad de habilitación/contratación; propuesta de purga30d tras cierre final y fin de finalidad activa, no aplicación de C14 a contratos. Motivos de restricción mientras causa activa; privados de apelación/decisión30d tras resolución final sin impugnación ni otra finalidad legítima. No purgar dato compartido si otra referencia legítima actual lo necesita, ni aceptar retención indefinida por una FK sola. La política jurídica, cierre de cuenta, registro mínimo y contratos M4 exigen validación material D08-R antes de datos reales; no afirmar plazo legal acreditado.

Cada caso tiene un objetivo tipado exacto (document/private de versión/decisión vecinal, seller_version_private/seller_decision_private/restriction_private/restriction_appeal_private/restriction_decision_private), máximo una ancla del ámbito correcto. Calendario calculado, holds con base/referencia/revisión, actor no titular y capacidad específica. Cola mínima da acceso a casos, no contenido. finalize/hold/release con command_id UUID=Idempotency-Key, revisión y evento mínimo durable; HTTP agenda, no borra. Release recalcula exigibilidad sin nueva gracia arbitraria.

Trabajador revoca uso, intención/lease/ledger externo, elimina todas las réplicas privadas/temporales/copias depurables y comprueba ausencia antes de deleted. Error mantiene acceso cerrado y reintento; proveedor/ledger caídos nunca éxito. Copias de contenido deben permitir borrado selectivo en fecha: backup general inmutable que excede plazo no satisface diseño. Restauración cerrada hasta reaplicar ledger/restricciones y revocar permisos. No prometer borrado criptográfico no ensayado.

### M8 UC001–002: asignar y resolver pertenencia

Gestor membership_assign obtiene cola/candidatos por envío pendiente; perfil operativo enabled y grant membership_review vigente, no titular ni conflicto. Páginas24/max50 antigüedad/id, sin directorio/contacto/PII. Asignar/reasignar usa CAS, cierra anterior y revoca permiso; una activa por envío. Revisor ve solo versión enviada asignada, evidencia pertinente y antecedente visible. Autenticación/MFA/asignación se revalidan al abrir, al decidir y antes de servir bytes, no solo al emitir permiso300s.

Resolver approved/correction/rejected con código y motivo visible; correction exige campos específicos, nota interna separada. CAS expediente/envío/asignación; decisión única, revisión/cierre/evento/recibo juntos. Revocación/conflicto impide escritura; pérdida de respuesta consulta recibo. Correo fallido no repite decisión. [Fuente y aprovisionamiento D09](../apis/M2/CONSERVACION_REVISORES_D08_D09.md).

### M8 UC003: restricciones y reconsideración

Revisor restrict del ámbito, MFA reciente y no titular registra objetivo, scope, código/motivo visible y nota interna separados. Membership admite buy/offer/both; seller solo offer y perfil del mismo expediente. Revisiones de expediente/perfil/elegibilidad esperadas se comparan bajo bloqueo; causa active/evento/recibo e incremento de elegibilidad juntos, sin alterar decisiones base.

Titular consulta causas propias; prepara/guarda apelación con motivo obligatorio y cero a2 enlaces documentales explícitos de **una versión enviada propia**. Sin evidencia adicional: null y[]. Evidencia nueva de residencia se reúne por UC005 evidence_update y UC002/003, no otra ruta de cargas. La restricción sigue vigente; aprobación vecinal tampoco la levanta. Envío congela motivo/enlaces; una apelación abierta por causa.

Gestor consulta candidatos ligados a apelación pending y ámbito; reviewer membership_restrict/seller_restrict con perfil operativo vigente, ninguno titular. Asignación independiente con CAS, no hereda vecinal/comercial. Revisor solo motivo actual y evidencia enlazada, antecedente visible pertinente; permiso de documento por API039 y bytesAPI011 reautoriza ruta restrict exacta. No contratos privados, notas históricas ni otros documentos por inferencia.

Resolver lift/maintain con motivo/código y CAS causa+asignación+apelación pending. Una decisión/apelación, cerrar asignación, actualizar causa/revisión/elegibilidad/evento/recibo. Lift solo esa causa; mantener admite apelación posterior nueva sin máximo/plazo inventado. Titular lee latest_decision_id y resolución visible sin nota/revisor. Pedidos y derechos previos subsisten.

### M8 UC004: revisión comercial

Gestor seller_assign y candidatos seller_review por envío comercial, no titular/perfil deshabilitado; CAS perfil/asignación y una activa. Revisor asignado accede versión comercial enviada y antecedente visible, no comprobantes vecinales ni notas históricas. Decisión enabled exige pertenencia approved y sin restricciones offer, datos completos/condiciones exactas; correction/rejected puede resolver deficiencias sin conceder elegibilidad. Código approved_seller solo enabled; correction exige campos concretos. Una decisión/envío, aprobadoVersionId solo enabled, cierre/asignación/revisiones/evento/recibo atómicos. No oferta ni alta financiera. Correction/reconsideration usa UC007 y reenvía por UC008.

## Errores y recuperación de todos los recorridos

400 forma/cursor/clave inválidos;401 sesión inválida→recuperar por M1;403 capacidad/MFA/finalidad;404 ajeno/no disponible;409 revisión/fuente/asignación/política cambió→recargar;422 campos/documentos incompletos→corregir sobre guardado confirmado;429 esperar Retry-After real;503 dependencia caída→reintentar sin suponer lista vacía/aprobación. Bytes204/formatos específicos se mantienen según YAML, no respuestaJSON genérica.

En cargas/decisiones inciertas conservar clave/cuerpo y consultar resultado. Al perder permiso ocultar sensible y cerrar visor; no restaurar DOM privado por Atrás/caché. No URL con secretos, localStorage/IndexedDB de PII, log de cuerpo o dirección pública. Access token por cabecera, TTL≤300s, no-store y autorización recurso/actor/versión/asignación otra vez al leer.

## Pendientes documentales y puertas de activación

| ID | Cierre documental de este paquete | Condición posterior verificable |
|---|---|---|
| D01 |16 casos con actores/reglas/estados/errores completos aquí | Revisar cambios materiales de producto, sin inventar aceptación. |
| D02 |16 secuencias fuente con pasos estables y cobertura integral | Probar transacciones/orden de bloqueos en implementación. |
| D03 |41 tablas propias objetivo, DDL derivado y FK/CHECK revisados documentalmente | Ensayar nueva migración/SQL/permisos en destino aislado; no modificar aplicadas. |
| D04 |YAML0.4.0,61 operaciones propias, Swagger sin ejecución | Implementar adaptadores/DTOs y pruebas runtime; no editar compartidos aquí. |
| D05 |Propuesta completa de pantallas/estados y acciones para todo alcance | Aceptación visual humana antes de implementar pantallas. No se da por aprobada. |
| D06 |Matriz detallada de unitarias/integración/performance/regresión trazada | Ejecutar con producto implementado y plataformas reales identificadas. |
| D07 |Puertos propios, manejo de fallos/CAS/eventos y checklist A8 preparados | M1 A8 e integración efectiva de identidad/MFA/avisos/Storage/restauración; consumidores futuros. |
| D08 |Política operativa propuesta, casos tipados/holds/purga/copias/ledger definidos | D08-R: validar fundamento/calendarios, registro mínimo/FKs y borrado/restauración reales antes de datos reales. |
| D09 |Fuente propia y procedimiento de aprovisionamiento/revocación/conflictos, tres ámbitos | D09-R: designar personas autorizadas y ejecutar provisión/MFA/pruebas reales; no autootorgar. |
| Entrega |Rama propia; commit y push autorizados, comprobación de SHA remoto en cierre | Git no equivale merge, publicación de app, activación ni subida a Fuentes. |

## Continuidad preparada para 01 y siguiente chat

No se modifica01 concurrente. Texto para conciliación: «15-10-2026 MAR-CHAT-007: diseño documental integral M2 UC001–011 y M8 UC001–005 en rama codex/docs-m2-m8-007. Matriz/SEQ/DBML-DDL/YAML-Swagger/UI/pruebas y puertos alineados; ver VALIDACION_INTEGRAL.json y SHA remoto de entrega. Sin implementación o pruebas funcionales M2/M8; M1/contratos compartidos intactos. D07-A8, D08-R, D09-R y aceptación visual son puertas de activación, no tareas documentales omitidas. Fuentes compartidas no actualizadas por inferencia».

Prompt revisado para continuidad tras entrega: «Marleva: revisar y preparar integración del diseño integral M2/M8 entregado por MAR-CHAT-007. Comprobar rama/SHA remoto y leer fuentes00–03 vigentes, AGENTS, protocolo, matricesM1/M2 y VALIDACION_INTEGRAL.json. Revisar propuesta visual completa y condicionesD07/A8,D08-R,D09-R; conservar separación diseñado/aceptado/implementado/probado. No reabrir decisiones cerradas sin evidencia, ni sobrescribirM1/contratos compartidos o aplicarDDL. Ejecutar tareas documentales/integración preparatoria autorizadas sin confirmaciones básicas; implementación solo dentro de autorización concreta y dependencias comprobadas».
