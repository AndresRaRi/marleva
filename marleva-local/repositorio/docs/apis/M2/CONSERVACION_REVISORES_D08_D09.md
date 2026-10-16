# D08/D09 · Conservación documental y revisores autorizados

15-10-2026 · America/Merida · MAR-CHAT-007, CONTINUACIÓN. Versión de propuesta D08-0.2/D09-0.2, contrato propio0.4.0. Encargo: concretar diseño documental; no implementar ni alterar M1. C14 está confirmado; las precisiones siguientes son propuestas revisables, no activación con datos reales ni dictamen jurídico. No se eligieron personas ni se concedieron permisos.

## 1. Decisión documental y alcance

D08 cubre adjuntos y privados vecinales/comerciales/restricciones. D09 usa consultas propias M8 ligadas a envío o apelación y ámbito. Su diseño deja de depender de un directorio general de M1. La integración pública de identidad/MFA, aprovisionamiento autorizado y pruebas reales siguen pendientes. No se declara cerrado M2/M8 ni la conservación jurídica global.

La política es versionada y fija el cálculo aplicable a cada recurso. No puede activarse una versión solo porque está escrita. Una modificación futura no alarga automáticamente plazos existentes. Antes de datos reales deben validarse el fundamento, las prescripciones concretas, aviso/canal de derechos, responsables, encargados y capacidad de depurar todas las copias. No se solicita esa aprobación para completar este diseño.

## 2. Finalización administrativa sin caducidad de derechos

C14: borrar adjuntos de domicilio/convivencia30 días después de resolución final no impugnada. No se sustituye por30 días desde carga, aprobación o rechazo. “Final” significa aquí cierre administrativo para el cómputo, no resolución judicial firme ni renuncia del titular.

Comando interno `finalize`, con `membership_conserve` vigente, MFA/reautenticación y actor distinto del titular: comprobar decisión exacta que cierra el recorrido actual (approved/rejected), o cierre por archivo de borrador que dejó sin continuar una corrección; resolución visible y cierre disponibles en cuenta y evento durable de aviso; ausencia de envío pendiente, borrador correctivo/reconsideración abierto, controversia o bloqueo pendiente. Registrar base, referencia y fecha del servidor en evento; pasar provisional→final. El correo no necesita recibirse para que la cuenta tenga la resolución. Un acuse del consumidor no prueba que el titular la leyó. No exigir un botón de aceptación ni usar silencio como renuncia. Corrección solicitada no es final mientras el recorrido permanece abierto. Si una decisión posterior cierra el recorrido, los recursos de versiones anteriores sin otra finalidad activa se anclan a esa decisión terminal del mismo expediente. No se altera el resultado correction histórico. Si el borrador se archiva tras30+7 días, el conservador puede finalizar el recorrido correctivo con referencia a ese archivo y a su última decisión; no inventar aprobación/rechazo. Un envío pendiente no se archiva ni se cierra por silencio del revisor.

La fecha inicial es la ejecución válida de ese comando, nunca se retrodata a la decisión. RetentionCase.anchorDecisionId identifica la decisión de cierre; startedAt identifica el evento de finalización relevante para ese recurso. Decision.finalizedAt conserva la primera finalización, por lo que no se usa como reloj de una refinalización posterior a impugnación: se usa el nuevo evento y se preservan los anteriores. No hay ventana de impugnación ni límite de intentos. Una revisión diaria propuesta detecta cierres pendientes y escala a responsable a los7 días; el aviso de escalamiento no concede retención indefinida ni inventa finalización. Si falta una condición, registrar tarea abierta y fecha de revisión, no fingir cumplimiento. Toda demora se mide contra el plazo que realmente resulte aplicable.

Preparar un borrador no presenta reconsideración ni reinicia C14. Sí impide un cierre administrativo nuevo mientras esté abierto. Si un documento se enlaza expresamente a ese borrador, se registra una finalidad activa verificable bajo exclusión; consultar o copiar datos no crea esa referencia. El documento ya vencido, bloqueado, en borrado o borrado nunca se reutiliza. Un borrador abierto antes de vencimiento no renueva la fecha del documento.

Al enviar reconsideración: registrar `challenged` y evento del antecedente, conservar primera `finalizedAt` y eventos previos, sin editar outcome/motivos/revisor originales. Registrar controversia concreta y recursos necesarios; no bloquear todo el expediente por costumbre. El nuevo envío tiene nueva decisión/asignación. Una finalización posterior crea evento nuevo y cálculo nuevo; la primera fecha permanece en historial. No reconstruir evidencia ya borrada: solicitar evidencia nueva si es necesaria.

## 3. Calendario propuesto por finalidad

Los plazos de esta tabla salvo C14 son elecciones de diseño para revisión; no plazos impuestos por la ley. Hora del servidor UTC, visualización America/Merida. Para este contrato, día operativo=24h y C14=30×24h; confirmar su expresión en el aviso antes de operar. No confundir días operativos con los días hábiles del procedimiento legal ARCO.

| Recurso | Inicio | Plazo/acción propuesta | Condición |
|---|---|---|---|
| Adjunto de versión resuelta | Finalización administrativa válida y última referencia legítima terminada | C14:30 días, borrar todas las copias | Bloqueo legal/controversia documentado suspende disposición, no autoriza uso ordinario |
| Carga no terminada, rechazada o válida sin enlace ni referencia legítima | Caducidad de carga, rechazo o desvinculación respectivamente |24h para limpieza del objeto, temporales y análisis | Revalidar enlaces bajo bloqueo; una lectura no prolonga. Análisis atascado escala; nunca se acepta por silencio |
| Borrador inicial/correctivo sin enviar | Última actividad confirmada | Aviso a30d,7d para continuar, archivo; purga privada30d tras archivo | No archivar envío pendiente ni ignorar controversia. Reabrir después de purga pide datos nuevos |
| Nombre/domicilio/declaración y motivo privado de versión enviada | Finalización de esa versión y fin de finalidad activa |30d para purga de la parte privada | Plazo propio propuesto, no extensión tácita de C14; copia explícita a otra versión tiene su propio caso |
| Motivo visible, campos correctivos y nota interna de decisión | Finalización válida y fin de controversia |30d para purga privada conjunta | Antes, titular ve solo motivo/campos autorizados. Mínimo de resultado/criterio queda separado |
| Permiso de lectura | Creación | Expira≤300s; eliminar secreto/hash revocado o vencido a24h | No contiene bytes; auditoría mínima separada. Nunca borrar antes de invalidar acceso |
| Recibo de comando | Commit |72h, después depurar huellas/referencias temporales | Unicidad permanente del expediente/envío/decisión impide duplicación tras expirar recibo |
| Evento de aviso | Acuse idempotente del consumidor |30d, si no tiene entrega pendiente ni obligación de auditoría | Sin texto privado; fallo del consumidor no reinicia negocio |
| Mínimo estructural de elegibilidad/decisión | Mientras sostiene estado vigente o historial necesario del expediente | Propuesta: hasta365d después del cierre del expediente y fin de responsabilidades identificadas | D08-R: validar finalidad/prescripción y diseñar depuración de FKs antes de datos reales; no hay borrado físico de este grupo representado como completo |
| Prueba mínima de borrado/ledger/registro de copias | Ausencia confirmada | Hasta vencimiento de la última copia registrada+365d de evidencia mínima, sujeto a fundamento | Sin contenido, hash de documento, domicilio ni textos; IDs siguen siendo datos vinculables. No es anonimización |
| Perfil operativo/grants/asignaciones M8 | Vigencia/revocación y última decisión relacionada | Mínimo necesario vinculado a decisiones; depuración al vencer el grupo anterior | No almacenar correo/nombre extra ni conceder derechos por etiqueta |

Una FK o enlace histórico no es necesidad legítima de conservar bytes. Para documento reutilizado, calcular obligaciones por todas las versiones que realmente lo usan: durante una revisión activa no es eliminable; al terminar, tomar el vencimiento necesario más tardío, con evento y fundamento. Nunca renovar automáticamente por cada lectura ni por la mera existencia de otra versión. La proyección `Document.retention*` registra el ancla C14; `RetentionCase.dueAt` es el vencimiento efectivo para todas las finalidades, incluidos huérfanos. No calcular con columnas antiguas aisladas.

Cargas rechazadas y huérfanas no tienen decisión final: su caso usa basisCode propio y no fuerza una falsa retentionDecisionId. Los procesos de archivo/reapertura y depuración del mínimo no están implementados; esta tabla define condiciones y pruebas, con pantallas documentales de archivo/reapertura y conservación en la propuesta integral.

### Extensión D08-0.2 a oferentes y restricciones

C14 no se extiende a contratos. `seller_version_private` conserva información mientras habilitación/contratación propia tenga finalidad activa; propuesta30d tras cierre final sin otra finalidad. `seller_decision_private`30d desde cierre final sin controversia. `restriction_private` mientras la causa active deba comunicarse y30d tras levantamiento/finalización sin controversia. `restriction_appeal_private` y `restriction_decision_private`30d tras finalización no impugnada y fin de finalidad activa. Todos estos plazos son propuestas operativas para validaciónD08-R, no plazos legales acreditados. Contratos/snapshotsM4 tienen calendario separado por definir antes de transacciones; no se borran desde M2 ni se reconstruyen desde residencia.

Objetivo tipado único por caso; ancla vecinal/comercial/restricción según finalidad y máximo una. Membership/seller/restrictionDecision conservan finalityState/primerafinalizedAt y eventos de refinalización, sin modificar outcome. Las causas activas no se finalizan para borrar el motivo requerido. Un detalle privado purgado se proyecta como no disponible; no basta un null para afirmar borrado. El mínimo estructural y las FKs deben depurarse según D08-R, sin promesa de historial perpetuo.

### Extensión D09-0.2 por ámbito

| Consulta | Contexto obligatorio | Gestor / candidato |
|---|---|---|
| M8API005 membership-reviewers | submission_id vecinalpending | membership_assign / membership_review |
| M8API007 seller-reviewers | submission_id comercialpending | seller_assign / seller_review |
| M8API018 restriction-reviewers | appeal_idpending de causa actual | membership_assign / membership_restrict o seller_assign / seller_restrict según target |

Siempre perfil operativo enabled+grant vigente; no titular y conflicto declarado atendido. Páginas24/max50, etiqueta operativa sin identidad/contacto; cursor ligado a actor/contexto. No candidato200vacío, caída503. Revalidar al asignar y al decidir; asignaciones separadas por ámbito, sin herencia. Conservación usa membership_conserve/seller_conserve, no un grant review. D09-P del documento de integración precisa arranque, revocación y doble intervención sin crear superusuario público.

## 4. Bloqueo, borrado y carreras

`hold`: causa legal o controversia concreta, referencia opaca, alcance de recursos mínimos, actor autorizado y fecha de revisión obligatoria propuesta≤7 días. El vencimiento de reviewAt genera alerta, nunca levanta el bloqueo automáticamente. No admitir “por si acaso”. Un bloqueo no habilita revisión ordinaria ni acceso del titular/revisor a los bytes. Una entrega excepcional por deber legal necesita autorización y canal separado, fuera de estas rutas.

`release`: comprobar causa resuelta y todos los bloqueos restantes; conservar el vencimiento original. Si ya pasó, iniciar disposición inmediatamente; no añadir otros30 días por levantar bloqueo. Si hay nueva resolución final relevante, registrar el cambio con base explícita. No levantar un bloqueo cuando otro sigue vigente.

Orden de exclusión futuro común: expediente → casos ordenados → concesiones ordenadas → documentos ordenados → versiones/enlaces → envíos/asignaciones → bloqueos/tareas. Preparación, enlace, envío, concesión/revocación y limpieza adoptan el orden compatible; no se afirma transacción distribuida con Auth/Storage. La autorización M1 se verifica fuera de locks de base y se revalida antes del efecto sensible.

Intención de borrado, estado delete_pending, revocación de permisos y evento se guardan juntos. Confirmar copia de la intención en ledger independiente del backup que se restaurará **antes** del borrado irreversible. Si el ledger externo falla, bloquear acceso y reintentar; no declarar borrado. Una tarea por recurso; lease y fence impiden confirmación de trabajador viejo. No ejecutar efecto externo en una transacción PG larga. Mantener exclusión de recurso mediante coordinador de conservación durante la llamada externa; ningún hold/enlace concurrente se confirma hasta resolver esa exclusión. La implementación de ese cercado distribuido sigue pendiente de prueba: un CHECK no lo garantiza.

Borrar almacenamiento primario, análisis, temporales, derivados y copias registradas; confirmar ausencia idempotentemente. Timeout no es éxito; objeto ausente verificable sí permite completar. Una nueva causa recibida después del borrado no revive bytes; se registra ausencia. Purgar campos privados aplicables, conservar únicamente mínimos autorizados. Al completar borrado de documento, limpiar objectKey, sha256, tipo/tamaño observados y referencia del analizador; conservar el veredicto técnico histórico sin exigir datos purgados. Al purgar una versión, limpiar también la declaración privada (false), sin cambiar el resultado histórico de pertenencia. Fallo del proveedor mantiene delete_pending/error, acceso denegado, reintento1/5/30min y escalamiento tras24h, sin afirmar cumplimiento puntual si el plazo venció.

## 5. Copias y restauración

Propuesta elegida: **copias privadas M2 separadas y depurables por recurso**, nunca incorporar bytes/documentos/textos privados a un backup general inmutable que impida cumplir su fecha. Inventario `Replica` para primario/backup/temporary/analysis; crear copia exige registrarla antes de hacerla accesible y purgeBy no posterior al vencimiento efectivo. Para recursos con revisión activa, copia con caducidad técnica≤24h renovable solo si la finalidad sigue activa; actualización del calendario propaga vencimiento a todas las copias. No se aprueba retener un backup otros30 días después de C14 ni se confunde inaccesibilidad lógica con eliminación física.

No se adoptó borrado criptográfico como sustituto sin validación de llaves y copias. Si el proveedor no permite eliminación selectiva verificable, esa estrategia de copia queda descartada y la activación bloqueada; no se modifica B12/M1 para ocultar incompatibilidad. Los cambios futuros de backups requieren coordinación propia.

Restaurar inicialmente cerrado: verificar inventario y ledger externo íntegro con marca de agua posterior al corte; si falta o está atrasado no abrir. Reaplicar intenciones/borrados, bloqueos vigentes, revocaciones y vencimientos; invalidar permisos/sesiones técnicas viejas mediante interfaz acordada. Confirmar ausencia en todas las réplicas; comparar IDs/relaciones y evidencia mínima. Restauración no reabre plazos. Un documento C14 borrado no vuelve a ser revisable desde una copia. Ensayo esencial M2 adicional a B12 sigue pendiente.

## 6. Fuente autorizada de revisores D09

Fuente: `M8MembershipReviewerProfile` habilitado (etiqueta tipo REV-DEMO01, sin nombre/correo) **y** `M8MembershipReviewGrant` capability membership_review vigente. Consulta `MAR_M8_API_005 GET /v1/m8/membership-reviewers?submission_id=…`: solo gestor con membership_assign, MFA reciente, envío pendiente de ámbito vecinal y no propio. No roles de registro, Account.operator ni búsqueda global de cuentas.

Filtrar dueño del expediente y conflictos ya registrados. No inferir conflictos personales desconocidos: el revisor conserva obligación de declararlos y retirarse. La lista no necesita que el candidato tenga una sesión abierta ni garantiza su MFA futuro; esos controles se exigen al acceder/decidir. Devuelve reviewer_id, reviewer_grant_id, revisiones de grant/perfil y etiqueta operativa única. Página24/máximo50, sin total; orden etiqueta,id, cursor ligado a gestor/envío/filtros. Cada página reautoriza. El gestor conoce el significado de etiquetas por el registro operativo autorizado, fuera de la proyección del titular. Cero candidatos da vacío útil; caída de datos503, jamás vacío.

Asignar (`MAR_M8_API_002`) conserva su entrada existente y vuelve a resolver perfil/grant bajo bloqueo; no confía en el resultado anterior ni en IDs manipulados. Si revocado/deshabilitado/propio/conflicto o envío ya resuelto:409 sin asignación. La lista no reserva candidato; seleccionar no concede permiso. Sin candidato elegible, el envío permanece pendiente y se escala; no autoasignar al titular ni crear grants para resolver urgencia.

Aprovisionamiento: antes del piloto, dos personas designadas mediante proceso autorizado, identidad estable verificada por M1 y factor preparado. Un otorgante con autoridad previamente registrada concede/revoca M8 con auditoría; ninguna persona se otorga capacidad a sí misma. El primer otorgante requiere acta de designación y doble intervención fuera de la API pública; no se crea aquí un endpoint de superadministrador ni se eligen personas ficticias como reales. Integrar y probar ese arranque sigue siendo condición operativa, no motivo para dejar indefinido el catálogo. Concesión membership_conserve es distinta de revisar/asignar; solo propuesta de capacidad, no permiso activado.

## 7. Contratos internos y públicos

[OpenAPI propio](openapi.yaml)0.4.0:61 operaciones HTTP,82 esquemas. `RetentionCommand` conserva su puerto interno finalize/hold/release y tiene adaptador HTTP propio propuestoM8API016; no existe ruta implementada ni worker. M8API017/019 permiten detalle/cola de casos mínimos autorizados. Su resultado mínimo es referencia de evento, revisión y estado consultable; errores forbidden, conflict, policy_not_active, ledger_unavailable o dependency_unavailable, sin texto legal privado. Autenticar tarea técnica por identidad de servicio acotada, sin permisos de decisión/pertenencia.

Estado del titular: casos paginados con resource_type/resource_id, state, fecha prevista, completed_at y estado de cálculo. Sin referencia legal, revisor, causa del bloqueo, ubicación de copia o fundamento. Fecha prevista no es promesa de éxito: held=blocked, error=delayed; mostrar “Borrado pendiente” si no hay confirmación. Ausencia del recurso no autoriza afirmar que fue borrado; solo completed con evidencia suficiente. Este recurso no tramita solicitudes ARCO ni promete sus plazos.

## 8. Evidencia jurídica y límites

Consulta15-10-2026: [LFPDPPP, texto vigente Cámara de Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf), última reforma indicada14-11-2025. Artículos10–12: necesidad/finalidad;14–15: información y aviso;24–25: cancelación, bloqueo y supuestos de conservación;29: persona/departamento responsable. Esta evidencia respalda separar finalidad, bloqueo y supresión. **No determina los plazos operativos de la tabla ni que30 días sea un mandato legal general.** No usar la numeración de la ley anterior: en este texto la cancelación está en24, no25. Los plazos de prescripción concretos y tratamiento de solicitudes requieren validación pertinente antes de datos reales. Una controversia vecinal no es automáticamente una reclamación de consumo o deuda financiera.

## 9. Trazabilidad, estado y siguiente pendiente

UC011→SEQ011:S001/S005/S010–S130→M2API018/puerto RetentionCommand→RetentionCase/Hold/Task/Event/Replica→UI007→casos D08 de la matriz. UC M8-001→SEQ001:S001–S005/S025/S030/S050→M8API005/002→ReviewerProfile/ReviewGrant/Assignment→M8UI001→casos D09. UC004:S130/S135/S140 vincula referencias/impugnación con conservación.

[Modelo](../../modelado-datos/M2/README.md), [pantallas](../../ui-ux/M2/PROPUESTA_PANTALLAS_M2_M8.md), [pruebas](../../proceso/MATRIZ_PRUEBAS_M2_M8.md). Todo sigue diseñado, sin implementación, SQL aplicado, pruebas runtime ni aceptación visual. D08-R mantiene abierta la validación material y depuración del mínimo; D09-R, el aprovisionamiento e integración. La reutilización real no se habilita por cerrar el texto de D08.

Continuidad propuesta para conciliar en01: «MAR-CHAT-007 abierto: diseño aislado M2/M8, D08-0.1/D09-0.1 revisables, modelo19 tablas y contrato0.3.1; conservar C14 y pendientes D08-R/D09-R, sin implementación ni cambios M1». No se sobrescribe01 concurrente ni sources; guardar localmente no equivale a subir Fuentes o aprobar políticas.

Prompt siguiente: «Continuar MAR-CHAT-007 desde D08-0.1/D09-0.1; leer fuentes vigentes y acta, revisar coherencia y observaciones de pantallas, cerrar puerta documental y dependencias M1/aprovisionamiento/conservación jurídica antes de implementar. Mantener mismo expediente/historial, sin tocar M1 ni contratos compartidos, sin datos reales, activación o confirmaciones rutinarias».
