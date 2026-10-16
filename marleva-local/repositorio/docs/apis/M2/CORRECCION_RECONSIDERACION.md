Estado vigente: detalle del recorrido vecinal dentro del [diseño integral0.4.0](../../proceso/MATRIZ_CASOS_M2.md). Las cifras/alcances de sus cortes anteriores son históricos; contratos actuales en YAML y acta integral.

# Corrección y reconsideración sobre el mismo expediente


## Incremento D08/D09 vigente · 15-10-2026

[Conservación y revisores](CONSERVACION_REVISORES_D08_D09.md): política D08-0.1 revisable, D09-0.1 catálogo por envío, contrato0.3.1 con23 operaciones y40 esquemas. No activado ni implementado. Las cifras/resultados anteriores son históricos; las actas del nuevo incremento identifican su alcance. D08-R/D09-R siguen pendientes para operar.

15-10-2026, America/Merida. MAR-CHAT-007, continuación. MAR-M2-UC-004 / MAR-M2-SEQ-004. Diseño propio revisable, sin implementación ni aceptación. No cambia C11–C14 ni M1. Se amplía el contrato propio a 0.2.0; el modelo conserva su ID DATA001 porque es la misma fuente objetivo aún no aplicada.

## Alcance y reglas

| Situación | Preparar | Al enviar | Lo que se conserva |
|---|---|---|---|
| Última decisión correction, expediente correction | Nueva versión origin correction, motivo de reconsideración null | Nuevo envío pending sobre esa versión | Mismo expediente, decisión/envío/asignación y versión anteriores |
| Última decisión rejected, expediente rejected | Nueva versión origin reconsideration y motivo privado obligatorio | Reconsideración presentada, nuevo envío pending | Mismo expediente y vínculo a la resolución reconsiderada, sin borrar el rechazo |
| Ya existe borrador de ese recorrido | Consultarlo/editarlo; otra clave de creación recibe409 | Solo ese borrador actual puede reenviarse | No duplicar versión, historial o aviso |
| Aprobado, suspendido, pendiente o archivado | No admite este caso;409 | Ninguna elegibilidad provisional ni levantamiento de restricción | Sus recorridos específicos siguen pendientes |

No se impone una fecha límite de reconsideración ni un número máximo arbitrario. Una decisión posterior puede generar otro ciclo, siempre desde la última versión resuelta y su decisión exacta. No se reconsidera otra vez una resolución antigua mientras existe borrador, envío pendiente o resolución posterior. Un motivo nuevo no permite sobrescribir un envío congelado: después de resolverlo, se prepara otra versión conforme a la tabla.

Preparar un borrador no presenta todavía la reconsideración. Su presentación ocurre al guardar el nuevo envío. No se modifica outcome, motivo visible/interno, revisor, asignación o fecha de la decisión fuente. El vínculo de la versión enviada a sourceDecisionId/sourceSubmissionId permite identificar la resolución cuestionada sin reescribirla. finalityState y el inicio C14 no cambian automáticamente; la propuesta D08-0.1 concreta finalización e historial; D08-R mantiene aprobación material/integración pendientes.

## Preparación y edición

1. El titular consulta expediente, historial mínimo y resolución visible. Una cuenta ajena o revisor no autorizado obtiene404 sin datos. Sesión recuperada por M1 conserva identidad estable; comprobante vecinal no transfiere cuenta.
2. POST de nueva versión recibe expected_revision, origin, source_decision_id, source_submission_id y reconsideration_reason. Deben ser el antecedente exacto más reciente del mismo expediente/titular, con estado/outcome compatibles. El servidor determina el número siguiente bajo bloqueo; el cliente no manda número, estado, actor o aprobación.
3. Reautorizar y buscar recibo idempotente antes de las precondiciones de transición. Bloquear expediente, versión/envío/decisión fuente según orden común; si cambiaron o ya hay borrador,409 y consultar estado. No copiar el motivo descartándolo en silencio.
4. En un commit se crea versión draft, number siguiente, origen y vínculos, privado y recibo; se cambia currentVersionId y revisión/actividad del expediente. El estado sigue correction o rejected. Copiar solo nombre/domicilio/desarrollo/relación aún disponibles y autorizados desde servidor. Si fueron suprimidos, quedan null; nunca reconstruirlos. declaredResidenceCurrent vuelve a false y debe confirmarse de nuevo.
5. No copiar enlaces de archivos, aprobación, notas internas o credenciales. PUT de campos propios edita exclusivamente el borrador actual; reconsideration_reason se puede corregir allí, nunca sobre versión enviada. Para initial/correction debe ser null; para reconsideration, texto no vacío de hasta2000 caracteres, sin adjuntos/códigos en ese texto. Datos privados sujetos a calendario propio, no retención perpetua.

El esquema fuerza origen/pares de referencia y número inicial único; las FKs nuevas impiden apuntar a decisión/envío de otro expediente/titular. La condición de última decisión, el outcome compatible, la secuencia del número, la copia autorizada, el motivo según origen y la inmutabilidad requieren transacción/privilegios/pruebas futuras. No se acreditan por un parser o CHECK de una sola fila.

## Documentos nuevos y reutilización explícita

El titular elige nueva carga por UC002 o vincular expresamente un documento de la versión resuelta inmediatamente anterior. Reutilizar no es copiar bytes ni publicar un documento; crea otro enlace al mismo objeto privado tras autorizar.

| Comprobación al reutilizar o enviar | Resultado si falla |
|---|---|
| Documento de la versión/envío/decisión fuente exactos, mismo expediente/titular/finalidad |404 ajeno o409 antecedente obsoleto; no enlazar |
| analysisState valid y privacyState active, objeto inmutable y análisis íntegro |409 DOCUMENT_NOT_REUSABLE o503 dependencia temporal; nueva carga si no admisible |
| Comprobante no futuro y vigente a la fecha del nuevo envío, según tres meses calendario America/Merida |422 al enviar o409 al reutilizar; pedir evidencia vigente |
| Sin borrado exigible, intención/ejecución de borrado o bloqueo; referencias bajo exclusión con conservación |409 y nueva evidencia; no revivir bytes, cancelar borrado o ampliar plazo por rutina |
| Slot1/2 libre o de la misma finalidad y máximo dos finalidades |422; no desplazar otra finalidad ni añadir tercero |

purpose y declaredDocumentDate se copian del enlace fuente validado; la operación de reutilización no acepta una fecha nueva para rejuvenecer el documento. La fecha legible real vuelve a comprobarse en revisión; el nombre del archivo no la prueba. Otro documento exige carga nueva y nueva validación. La constancia de convivencia debe seguir siendo concordante; si no puede demostrarse vigencia/coherencia, requiere sustitución.

El reemplazo elimina únicamente el enlace previo de la misma finalidad del borrador e inserta el nuevo en el mismo commit con recibo y revisión. Los enlaces de versiones enviadas permanecen. Un archivo nuevo rechazado no sustituye evidencia anterior válida. Los objetos viejos no se borran por pulsar reemplazar; su destino depende del calendario y referencias legítimas. D08-0.1/T09 concretan coordinación de borrado, referencias legítimas, copias/ledger y restauración; su implementación y validación real siguen pendientes D08-R. La operación real de reutilización no se habilita hasta resolverlos y probarlos.

## Reenvío y nueva revisión

Enviar valida origin/antecedente todavía vigentes, revisión esperada y borrador actual; completa nombre/domicilio/declaración vigente y documentos válidos, motivo si reconsideración. Bajo exclusión congela versión/enlaces/motivo, crea un envío diferente, actualiza pending, y guarda evento y recibo juntos. No hay transacción abierta esperando Auth, analizador o correo.

El gestor asigna el nuevo envío con sus reglas M8. No se hereda la asignación anterior. Puede coincidir la persona si conserva capacidad, no es titular y no declara conflicto; no se inventa obligación de una tercera persona. El revisor ve la nueva versión, su motivo y únicamente la parte visible de la decisión fuente. Permisos de documentos se emiten solo para evidencias enlazadas al nuevo envío asignado; conocer el antecedente no concede acceso a documentos/notas históricos.

Resolver produce otra decisión sobre el envío nuevo; se conserva la anterior. Aprobar, pedir otra corrección o rechazar requiere criterio y motivo actuales; ni el rechazo anterior obliga a rechazar ni presentar motivo concede pertenencia. Dos reenvíos, reasignación/decisión concurrentes o respuesta perdida conservan una transición ganadora y recibos; los ensayos reales siguen pendientes.

## Historial y datos suprimidos

GET history devuelve páginas24/máximo50 por number DESC,id DESC, cursor opaco autenticado ligado al actor/expediente, vista viva sin snapshot. Incluye IDs, origen, vínculos, fechas y resúmenes mínimos de envío/decisión. No nombre, domicilio, texto del motivo, nota interna, revisor, documentos o permisos. No perder la navegación si se insertó otra versión; para ver las nuevas, refrescar primera página.

GET versión exacta y GET decisión visible son del titular. Si se suprimió su parte privada, mostrar private_data_available false y campos null o correction_fields vacío, según recurso; conservar solo mínimos permitidos. No reconstruir desde avisos, logs, backups u otra versión. El motivo copiado voluntariamente en otra versión tiene su propia finalidad/calendario; borrar uno no autoriza preservar duplicados indefinidamente. Conservar historial técnico no aprueba conservación legal ilimitada.

## Trazabilidad y pruebas futuras

| UC / SEQ:paso | API propia | Datos fuente | Prueba futura necesaria |
|---|---|---|---|
| UC004 / S030–S040 | MAR_M2_API_014/015/016 | Version, Submission, Decision y privados por proyección | MAR-M2-IT-BE-004-A: historial del titular; B: ajeno/público sin datos; C: privado suprimido no reconstruido |
| UC004 / S050–S090 | MAR_M2_API_013 | Version.origin/sourceDecisionId/sourceSubmissionId; VersionPrivate.reconsiderationReason; Application/Receipt | IT-BE-004-D: dos preparaciones concurrentes una versión; E: source ajena/antigua; F: motivo y estado/origen compatibles |
| UC004 / S092–S098 | MAR_M2_API_017 | VersionDocument + Document; Application/Receipt | IT-BE-004-G: vínculo explícito y fecha original; H: borrado/bloqueo/vencido; I: reemplazo solo borrador, tercero rechazado |
| UC004 / S100–S120; UC003 / S040–S110 | MAR_M2_API_009 | Nuevo Submission/Event/Receipt, versión congelada | IT-BE-004-J: borrador no presenta, commit sí; K: reenvío único/caída tras commit; L: historial previo intacto |
| M8-UC002 / S040–S145 | MAR_M8_API_003/004 | Nueva Assignment/Decision y antecedente visible | MAR-M8-IT-BE-001-G: no heredar asignación; H: solo documentos de versión asignada; I: otra decisión sin sobrescribir anterior |

Prefijos completos MAR-M2- para IT-BE-004. UT-BE-004-A–F: estado/origen, número, motivo/normalización, tres meses calendario, fecha no rejuvenecida y forma de recibo. Frontend: UT/IT-FE-004-A–D borrador/presentada, guardado confirmado, datos suprimidos y conflicto sin perder texto no guardado en memoria; sin almacenamiento público persistente. Performance proporcional futura PF-BE-004: historial sintético10/50/1000 versiones, páginas24/50 y concurrencia1/5/10, latencias/errores/recursos y permisos; no carga real ejecutada ni umbral piloto aprobado. Regresión: envío inicial, B09/M1 por contratos públicos y recibos anteriores, sin modificarlos. UI/aceptación siguen pendientes; no se acredita trazabilidad completa por estos IDs.

## Verificación y continuidad

Fuentes canónicas: [YAML](openapi.yaml), [DBML](../../modelado-datos/dbml/MAR-M2-DATA-001.dbml), [DDL derivado](../../modelado-datos/ddl/MAR-M2-DATA-001.sql), [SEQ004](../../diagramas/secuencia/M2/MAR-M2-SEQ-004.mmd), [matriz](../../proceso/MATRIZ_CASOS_M2.md). [Swagger](swagger.html) y [galería](../../diagramas/secuencia/M2/REVISION_RECORRIDO.html) son revisión documental. Actas de validación en esta carpeta y en el modelo; no pruebas de servicios o base.

El recorrido no depende de Google, tarifas o demografía. Antes de implementar siguen pendientes integración M1, concesiones/revocación M8, transacciones/privilegios, análisis/almacenamiento inmutable, consumidor de eventos, protección HMAC y D08. Reconsideración de suspensión, archivo/reapertura y alta comercial quedan fuera de este corte. Pantallas y pruebas ya propuestas; siguiente: revisión del conjunto y dependencias D08-R/D09-R desde estos contratos, conservando el límite documental.

Trabajo local aislado en codex/docs-m2-m8-007. Sin cambios M1/contratos compartidos, migraciones aplicadas, implementación, SQL ejecutado, datos reales o publicación. Fuentes/01 compartida no se sobrescriben; conciliación007 sigue pendiente. No hay sustituciones de Fuentes/configuración ni subida acreditadas por guardar estos archivos.
