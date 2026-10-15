# M2: comunidad y oferentes, con soporte de M8

Estado de entrega vigente: [preparación de integración y sincronización Git autorizada](../apis/M2/INTEGRACION_Y_ENTREGA_M2_M8.md). Las menciones anteriores a «sin commit/push» describen sus incrementos documentales previos; la entrega actual se verifica por SHA remoto, sin implicar subida a Fuentes o aceptación.

15-10-2026, America/Merida. MAR-CHAT-007, continuación. Diseño documental inicial para revisión. Ningún caso está implementado, probado o aceptado como módulo M2/M8.

## 1. Alcance y procedencia

Este documento detalla la línea base de 02 §§1–5, 10–12 y 15. C09 y C11–C14 permanecen confirmadas en 01. Las elecciones operativas identificadas aquí son diseño del asistente dentro de ese límite; no son resultados de pruebas ni una aprobación de datos reales.

Fuentes: [00](../../../../entregables/fuentes_finales/00_GUIA_PRINCIPAL_MARLEVA.md), [01](../../../../entregables/fuentes_finales/01_ESTADO_Y_DECISIONES_MARLEVA.md), [02](../../../../entregables/fuentes_finales/02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md), [03](../../../../entregables/fuentes_finales/03_REFERENTES_Y_EVIDENCIA_MARLEVA.md). Proceso: [protocolo](PROCESO_DESARROLLO_MARLEVA.md) y [matriz M1](MATRIZ_CASOS_M1.md). Estas referencias en la copia aislada son una fotografía del commit base; el trabajo sin commit de M1 no está incorporado.

| Campo | Límite |
|---|---|
| Objetivo | Verificar pertenencia y habilitar oferentes mediante revisión privada, sin confundir identidad, residencia, perfil comercial y alta financiera |
| M2 | Expediente vecinal común a comprador/oferente, comprobantes, versiones, corrección/reconsideración, perfil comercial y elegibilidad |
| M8 necesario | Asignación y revisión sin conflicto, motivos, historial, restricciones y reconsideración de estos expedientes/perfiles |
| Fuera | Moderación de ofertas M3, pedidos, incidencias monetarias, pagos y medición de ventas; no implementar todo M8 por este diseño |
| Comunidad | Residentes actuales de los siete desarrollos C01/C11; inquilinos y familiares incluidos; propietario no residente no elegible |
| Acceso | Público explora; cuenta autenticada gestiona expediente propio; solo pertenencia aprobada permite comprar y solicitar alta comercial |
| Resultado de alta | Pertenencia aprobada y perfil habilitado permiten ofrecer según reglas futuras de M3; nunca publican oferta ni habilitan pagos automáticamente |
| Exclusiones | Sin INE/selfie por defecto, biometría, contacto a terceros, mapas inferidos, datos reales, gasto o publicación |

Ubicación de trabajo: copia Git aislada, rama codex/docs-m2-m8-007 desde 6fed44f. No se modifican código, migraciones, matriz, diagramas ni contratos de M1. No se conecta este diseño a generadores o contratos compartidos.

## 2. Responsabilidades e interfaces pendientes

M1 conserva identidad, sesión, cambio de correo, segundo factor y recuperación de acceso. M2 conserva expediente, evidencia y elegibilidad. M8 conserva asignaciones/permisos de revisión y decisiones operativas; una decisión invoca la transición de M2, no cambia directamente sus tablas. Un módulo no modifica tablas de otro.

Las operaciones sobre pertenencia y perfil se autorizan con identidad estable de cuenta, nunca con el correo como clave. El cambio de correo no crea otra pertenencia. La recuperación de acceso no se decide con un comprobante vecinal.

| Dependencia | Evidencia disponible | Condición futura de integración |
|---|---|---|
| M1 UC001–004/009 | Acceso/sesión implementados, retorno incompleto | Identidad/sesión vigente y retorno interno permitido, sin saltar elegibilidad |
| M1 UC007/014 | Segundo factor, roles M1 y recuperación backend | Diseñar permiso de revisor/gestor M8; los roles m1_operator/m1_access_admin no lo conceden |
| M1 UC011 B09 | Texto ficticio privado, lectura/borrado | No reutilizar su límite 1 MiB ni su contrato como carga de comprobantes M2; interfaz documental propia diseñada, integración pendiente |
| M1 UC008 | Backend de avisos/outbox | Acordar recepción de eventos M2/M8 y visualización; fallo de correo no revierte decisión |
| M1 UC013 B12 | Ensayos separados de restauración | Cierre esencial integrado M1 y ensayo adicional del expediente, versiones, restricciones y borrados M2 |
| Account/Development | Identidad y catálogo existentes | Referencias por ID, catálogo cerrado de siete, sin duplicar ni alterar tablas compartidas |
| M3/M4/M5 futuros | Sin módulos implementados | Consultar elegibilidad actual antes de operaciones nuevas; suspensión no borra obligaciones previas |

M1 y M8 no están aceptados completos. El diseño documental de M2 está autorizado por el usuario; implementación e integración siguen fuera de este encargo. La puerta A8 de 02 no se considera cumplida.

## 3. Actores, permisos y conflicto

Los nombres de permiso son capacidades documentales, no nuevos valores de RoleKey ni contratos desplegados.

| Actor/capacidad | Permitido | Prohibido |
|---|---|---|
| Público | Leer únicamente proyección pública futura del perfil elegible | Consultar si una persona tiene expediente, documentos o domicilio |
| Titular autenticado | Crear/leer/editar expediente propio en estado permitido, enviar y reconsiderar; editar perfil propio | Elegir aprobador, editar decisión/historial o aprobarse |
| Revisor vecinal M8 | Ver versión enviada asignada y evidencia pertinente; resolver | Ver expedientes no asignados; decidir el suyo o una versión antigua |
| Revisor comercial M8 | Ver perfil asignado y datos privados necesarios; resolver | Acceso automático a comprobantes vecinales o alta financiera |
| Gestor de revisión M8 | Asignar/reasignar casos y permisos de su ámbito; resolver conflictos de asignación | Otorgarse permisos a sí mismo, resolver su caso o eludir MFA |
| Tarea de conservación | Ejecutar intención de borrado vencida y sin bloqueo | Decidir pertenencia, levantar bloqueo o exponer contenido |
| Operador de conservación autorizado | Registrar causa/revisión de bloqueo y su levantamiento | Retención indefinida sin causa o usar documento bloqueado para revisión ordinaria |

Revisión/gestión requieren segundo factor vigente y autenticación reciente según política M1 (referencia documental: cinco minutos para acción sensible). Revalidar rol y asignación al confirmar, no solo al abrir pantalla. Revocación o reasignación entre lectura y decisión impide guardar. Motivo obligatorio y evento de auditoría mínimo. El titular no elige revisor. El gestor tampoco asigna su propio expediente; debe hacerlo otra persona autorizada.

Conflicto mínimo comprobable: titular y revisor son cuentas distintas. Un revisor declara conflicto adicional cuando exista; se retira de la asignación sin explicar datos privados al titular. Antes del piloto se requieren al menos dos personas autorizadas, ya previsto en 02; no se designan personas aquí. Si no hay otra persona, queda pendiente y se informa; no hay autoaprobación por urgencia.

## 4. Invariantes funcionales

| ID | Regla y comprobación |
|---|---|
| R01 | Una identidad estable y una pertenencia reutilizada para comprar/ofrecer; el alta comercial es independiente |
| R02 | Un expediente vecinal por cuenta en este diseño; corrección, reconsideración y reapertura conservan ID y agregan versiones |
| R03 | Un envío congela la versión exacta con referencias a archivos válidos; nunca se edita evidencia de una versión enviada |
| R04 | Decisión referencia expediente, versión enviada, asignación y versión de concurrencia actuales; una transición ganadora |
| R05 | Sin pertenencia aprobada, no comprar/cotizar/publicar; OTP no prueba residencia |
| R06 | Pertenencia, cobertura, domicilio privado, punto de atención y datos contractuales son finalidades distintas |
| R07 | No recopilar comprobante nuevo al pasar de comprador a oferente si la pertenencia sigue aprobada |
| R08 | Dos adjuntos como máximo por versión enviada; PDF/JPEG/PNG, hasta 5 MB decimales (5.000.000 bytes) cada uno; mostrar unidad exacta en UI/contrato |
| R09 | Archivo en carga/análisis/fallido no sirve para enviar; extensión o Content-Type no prueban formato, integridad ni seguridad |
| R10 | Nunca guardar documentos en avisos, logs, URLs públicas o almacenamiento persistente público del cliente |
| R11 | La elegibilidad efectiva combina estado de pertenencia, restricciones vigentes y, para ofrecer, perfil habilitado; no basta un valor viejo recibido por el cliente |
| R12 | Suspensión/cambio de residencia bloquea operaciones nuevas; pedidos, ayuda y restituciones previas subsisten |
| R13 | Decisión, historial mínimo y evento durable de aviso se guardan atómicamente; envío de correo después del commit |
| R14 | Una respuesta perdida no causa otro expediente/decisión. Misma clave y cuerpo conserva resultado; clave con otro cuerpo es conflicto |
| R15 | Cambios materiales del perfil generan versión revisable; no sobrescriben datos contractuales ya aceptados en pedidos futuros |
| R16 | Archivo borrado no vuelve a ser revisable por restauración; metadatos mínimos y prueba del borrado permanecen según calendario por definir |

R02 es una elección documental; R08 concreta la unidad del límite existente y no lo aumenta. Estas precisiones son diseño, no nuevas decisiones comerciales. Los calendarios de conservación no definidos no se completan con un plazo inventado.

## 5. Estados separados

### 5.1 Expediente vecinal

| Estado actual | Acción → siguiente | Actor/condición |
|---|---|---|
| sin_solicitud | Crear → borrador | Titular; creación única/idempotente |
| borrador | Guardar → borrador; enviar → pendiente | Titular; envío con campos y evidencia válidos |
| pendiente | Aprobar → aprobada; pedir corrección → correccion; denegar → rechazada | Revisor asignado, versión vigente, sin conflicto |
| correccion | Guardar nueva versión → correccion; reenviar → pendiente | Titular; conserva versión/decisión anteriores hasta su borrado debido |
| rechazada | Solicitar reconsideración con motivo y versión → pendiente | Titular; mismo expediente, sin elegibilidad provisional |
| aprobada | Declarar cambio de residencia o revisión motivada → correccion | Titular/revisor autorizado; elegibilidad se desactiva en el mismo commit; subsiste aprobación histórica |
| aprobada/correccion/pendiente/rechazada | Restricción motivada → suspendida | M8 autorizado; motivo visible y alcance, sin borrar obligaciones |
| suspendida | Reconsideración → pendiente | Titular; presentar no levanta la restricción; solo resolución autorizada puede hacerlo |
| borrador/correccion | Aviso tras 30 días sin actividad, espera de 7 días → archivada_inactividad | Tarea; una edición/envío antes de archivar invalida el trabajo viejo |
| archivada_inactividad | Reabrir → borrador o correccion según origen | Titular; nueva versión/evidencia vigente; ninguna elegibilidad automática |

No se archiva una solicitud pendiente de decisión por inactividad del revisor. Rechazada y suspendida no se convierten en borrador para ocultar su resolución. Un bloqueo específico de cuenta M1 sigue aplicando incluso si un expediente queda aprobado. No introducir renovación anual ni caducidad automática de residencia: no están acordadas.

### 5.2 Perfil comercial

| Estado | Salidas y efectos |
|---|---|
| borrador | Titular guarda; enviar completo con pertenencia aprobada → pendiente |
| pendiente | Revisor comercial: habilitado, correccion o rechazado |
| correccion/rechazado | Titular prepara versión nueva y reenvía → pendiente; mantiene historial |
| habilitado | Titular pausa → pausado; edición material → pendiente de nueva revisión; M8 suspende → suspendido |
| pausado | Titular reanuda solo si misma versión habilitada, pertenencia aprobada y sin restricciones; de otro modo exige revisión |
| suspendido | Reconsideración por titular; únicamente M8 puede levantar la causa tras revisión |

Elección conservadora: una edición material deshabilita nuevas ofertas/operaciones del perfil hasta revisar la versión; no se presume vigencia pública de otra versión contractual. Confirmar este detalle al revisar recorridos de M3; no modificar M3 por este documento. Una suspensión vecinal impide ofrecer aunque el estado comercial conserve su historia.

### 5.3 Archivo y conservación

Carga: pendiente_carga → analisis → valido o rechazado. Fallo temporal de análisis conserva pendiente recuperable; no se acepta por silencio. Conservación: activo → bloqueo_conservacion o borrado_pendiente → borrado. Estado de análisis y estado de conservación son campos separados; un archivo válido puede no estar autorizado para lectura.

En borrado_pendiente se revoca acceso ordinario; una tarea confirma ausencia real con reintento. Si aparece un bloqueo antes de borrar, se cancela/revisa la intención con exclusión concurrente. Un bloqueo no recupera bytes ya borrados. La resolución de residencia no cambia a rechazada porque su comprobante se eliminó conforme C14.

## 6. Casos de uso y orden por dependencia

Prefijo de casos/SEQ/UI: MAR-M2- o MAR-M8-. IDs estables; no renumerar por insertar casos. Los IDs de API, datos físicos y pruebas detalladas se cerrarán después de las secuencias; no acreditar trazabilidad completa con celdas pendientes.

| Caso | Actor, entrada y recorrido principal | Salida, errores y recuperación |
|---|---|---|
| M2-UC-001 Crear/guardar expediente | Titular autenticado; nombre de revisión, desarrollo y domicilio privado; obtener expediente propio o crearlo; guardar borrador con versión esperada | ID estable/estado/versión; desarrollo fuera del catálogo o campos inválidos → corregir sin perder guardado anterior; carrera de creación devuelve el existente; recurso ajeno no se revela |
| M2-UC-002 Adjuntar comprobantes | Titular en estado editable; declarar tipo/tamaño/finalidad, cargar en privado, finalizar y analizar; enlazar solo archivos propios al expediente/versión | Estado por archivo y acción siguiente; tipo real/tamaño/contenido inválidos → rechazo de archivo; proveedor caído → reintentar por referencia, no enviar expediente incompleto |
| M2-UC-003 Enviar solicitud | Titular elige versión guardada; comprobante de hasta tres meses; constancia concordante si no es titular; servidor valida y congela envío | pendiente + recibo con versión/fecha; adjunto no válido, documento incompleto o versión vieja → error específico; respuesta perdida → consultar expediente antes de reenviar |
| M8-UC-001 Asignar/consultar revisión | Gestor asigna caso sin conflicto a revisor vigente; revisor accede solo a versión asignada; cola por antigüedad e ID, páginas limitadas | Asignación/versiones; sin revisores → espera explícita; dos gestores concurrentes → una asignación vigente; reasignación revoca acceso del anterior |
| M8-UC-002 Resolver pertenencia | Revisor vecinal con MFA reciente, asignación y versión; aprobar/pedir corrección/rechazar; criterio y campos recuperables visibles, nota interna separada | Estado, registro mínimo y aviso durable; autorrevisión/rol revocado → denegado; versión obsoleta → conflicto; DB caída → no decisión; fallo de correo no la repite |
| M2-UC-004 Consultar/corregir/reconsiderar | Titular consulta resultado; en correccion/rechazada crea versión corregida; motivo obligatorio al reconsiderar; vuelve a enviar mismo expediente | Nueva versión pendiente, sin borrar decisión anterior; no duplicar cuenta o expediente; evidencia ya borrada exige otra carga; las notas internas nunca se muestran |
| M2-UC-005 Declarar cambio vecinal | Titular aprobado declara cambio de residencia/evidencia; conserva histórico y prepara corrección | Elegibilidad desactivada de inmediato, ofertas no elegibles para operaciones nuevas; caída posterior al commit → estado consultable; no sustituir una declaración por logout |
| M8-UC-003 Restringir/revisar elegibilidad | Revisor autorizado registra causa, alcance y evidencia pertinente; suspende; titular reconsidera; resolución autoriza levantar o mantener causa | Registro histórico; presentar reconsideración no habilita; prohibida autorresolución; obligaciones previas conservadas; efecto en M3/pedidos es dependencia documentada |
| M2-UC-006 Archivar/reabrir | Tarea detecta borrador/corrección inactivos; aviso de 30 días y siete días de gracia; titular continúa o reabre después | Archivo de estado con motivo; carrera con edición/envío revalida actividad/versiones; no archivar pendiente por retraso del operador; reapertura no recupera documento borrado |
| M2-UC-007 Crear/editar perfil comercial | Miembro aprobado; nombre público, datos contractuales privados, modalidades, cobertura, punto de atención y tiempos; guardar versión de perfil propio | borrador/correccion; domicilio residencial no copiado al perfil público; negocio externo no invalida residencia; no recopilar datos bancarios por este caso |
| M2-UC-008 Enviar alta comercial | Miembro aprobado; versión completa y condiciones vigentes aceptadas; enviar a revisión comercial | pendiente; residencia perdida o cobertura inválida → rechazo recuperable; no crear cuenta financiera, oferta ni tarifa |
| M8-UC-004 Resolver alta comercial | Revisor comercial asignado, sin conflicto, MFA reciente; comprobar campos/condiciones y pertenencia actual; decidir | habilitado/correccion/rechazado, versión e historial; pertenencia dejó de aprobarse durante revisión → no habilitar; reintento no repite aviso |
| M2-UC-009 Consultar/pausar/reanudar perfil | Titular consulta proyección privada; pausa inmediata; reanuda solo versión habilitada y elegibilidad vigente | Estado efectivo explicable; no levantar suspensión M8 con botón reanudar; lector público solo ve proyección mínima habilitada y elegible |
| M2-UC-010 Consultar elegibilidad | Titular o consumidor interno autorizado pide capacidad concreta comprar/ofrecer sobre cuenta estable | permitido/no permitido con razón mínima y versión/fecha; dependencia caída deniega operación nueva con error recuperable, no valor permisivo de caché; no cambiar GET /me de M1 |
| M2-UC-011 Conservar/borrar evidencia | Tarea calcula plazo C14 sobre resolución final no impugnada, revisa bloqueos; revoca acceso, elimina bytes y confirma ausencia | Registro mínimo y prueba de borrado; reintento con mismo objeto; proveedor caído conserva intención; restauración exige reaplicar ledger externo antes de abrir acceso |
| M8-UC-005 Gestionar bloqueo documental | Operador autorizado registra causa legal/controversia, alcance de documentos y fecha de revisión; levantar causa con motivo | Documento bloqueado sin uso ordinario; bloqueo sin causa/revisión → inválido; levantamiento recalcula exigibilidad del borrado sin periodo nuevo arbitrario |

Cada caso exige lectura propia y separación por actor; pertenencia no equivale a documento validado por una máquina. El análisis de archivo solo declara seguridad/formato técnico; la revisión humana decide vínculo vecinal.

## 7. Detalle del primer recorrido: expediente → revisión → corrección

### M2-UC-001: crear y guardar

Precondición: cuenta/sesión M1 válidas; no recurso ajeno, rol de operador o aprobación enviados como datos confiables. Datos mínimos de borrador: ID de cuenta derivado de sesión; nombre de revisión, desarrollo y domicilio pueden guardarse incompletos, pero no enviarse incompletos. El domicilio privado es texto estructurable para revisión, no una coordenada inferida.

1. Consultar expediente propio. Si no existe, mostrar explicación de finalidad y requisitos antes de pedir archivos.
2. Crear con clave de idempotencia; exclusión por cuenta. Dos pestañas obtienen el mismo expediente.
3. Guardar campos válidos con versión esperada. Campos no permitidos se rechazan; no aceptar estado, revisor o fecha de decisión del cliente.
4. Devolver únicamente campos del titular, versión guardada y acciones permitidas. Guardar no concede pertenencia ni envía a revisión.
5. Ante corte, volver a consultar y comparar con la versión local en memoria; nunca mostrar «guardado» sin confirmación.

Postcondición: como máximo un expediente, sin cambio de elegibilidad, sin aviso de aprobación ni acceso público. Un 401 requiere renovar sesión por M1; no guardar documentos/domicilio en URL, localStorage o almacenamiento público para recuperar la tarea. Borrador confirmado permanece en servidor, lo no guardado se identifica como tal.

### M2-UC-002/003: comprobar antes de enviar

El comprobante muestra nombre/domicilio/emisor/fecha; ocultar importes/cuentas/códigos ajenos a finalidad. Si nombre no coincide, pedir constancia y comprobante concordante, sin exigir INE. La fecha se evalúa en America/Merida por tres meses calendario; límite inclusivo del día equivalente, ajustado al último día del mes cuando no existe. Documento futuro o sin fecha legible requiere corrección; no se aprueba por deducir fecha del nombre del archivo.

La interfaz explica carga, análisis, rechazo y listo. Cada carga tiene referencia idempotente y vencimiento; una carga incompleta no ocupa indefinidamente el cupo. Limpieza de cargas huérfanas y borradores requiere calendario específico antes de datos reales; no extender C14 sin decisión. Dos adjuntos por versión no autoriza acumular documentos indefinidos entre versiones.

En envío se revalidan archivos propios, integridad/estado, coherencia de referencias, campos y versión. El envío conserva instantánea inmutable. Las reglas automáticas de fecha/tamaño/formato previenen errores; no sustituyen juicio del revisor ante imagen ilegible o duda de residencia. Una misma evidencia enlazada a varias versiones no se elimina mientras una obligación legítima vigente la requiera; el diseño de retención debe resolver esas referencias.

### M8-UC-001/002 y M2-UC-004: decidir sobre lo enviado

El revisor obtiene acceso temporal tras verificar asignación, MFA, permiso y ausencia de conflicto. Sin descarga masiva; visor sin URL pública ni metadatos innecesarios. La nota interna se separa del motivo comunicado. Razones de corrección: ilegible, fecha ausente/vencida, domicilio ausente, desarrollo dudoso/fuera, vínculo insuficiente o discordancia. Los códigos detallados se fijarán en contrato propio.

Resolver comprueba todas las condiciones otra vez y compara versión; transición, decisión y aviso son una única transacción corta. No esperar al correo dentro del bloqueo. Dos revisores no ganan sobre la misma versión. Tras conflicto se consulta el resultado; no se fuerza una segunda decisión.

El titular corrige sobre mismo expediente, con nueva versión. La aprobación nunca se traslada automáticamente de evidencia antigua a otra versión. Una reconsideración conserva decisión impugnada, motivo y vínculo entre versiones; no impone un plazo de caducidad de derechos todavía no acordado.

## 8. Datos funcionales y privacidad, antes del modelo físico

| Objeto documental | Contenido mínimo/finalidad | Acceso y conservación |
|---|---|---|
| Expediente y versión | Titular, desarrollo, domicilio privado, nombre revisión, estado, versión/actividad/envío | Titular y revisión asignada; campos sensibles sujetos a calendario propio |
| Documento y enlace | Finalidad vecinal, dueño, objeto privado, hash/tamaño/tipo real, análisis y versión vinculada | Sin contenido en eventos/avisos; C14 solo a adjuntos de domicilio/convivencia |
| Decisión de pertenencia | ID/versión, actor, criterio, fecha, motivo visible y nota interna separada | Titular ve parte pertinente; registro mínimo tras borrado; nota interna no retención perpetua por defecto |
| Perfil y versión contractual | Nombre público y proyección comercial; nombre/domicilio/teléfono/atención privados por finalidad contractual | Público mínimo; titular/revisión y comprador elegible cuando corresponda, sin reutilizar comprobante |
| Asignación/capacidad M8 | Caso, ámbito, revisor, otorgante/revocación, fechas/versiones | Solo operación autorizada; no nueva bandera booleana en Account |
| Restricción | Causa, ámbito, estado, actor, fechas y reconsideración vinculada | Motivo útil al titular, datos mínimos a consumidores; conserva obligaciones |
| Retención/borrado | Documento, resolución de referencia, inicio/plazo, bloqueo/causa/revisión, intención y confirmación | No autorizar lectura por conservar bytes; prueba fuera del backup restaurado |
| Evento durable | Recurso/versión/transición/destinatario y texto mínimo | Sin documentos, domicilio, códigos o notas internas |

Existe un [modelo objetivo DATA001](../modelado-datos/M2/README.md) del recorrido y D08/D09; separa tres referencias M1 de19 tablas propuestas. No se crean tablas reales, cambios Prisma, migraciones ni DDL aplicado. Reglas T01–T12 y D08 permanecen pendientes; el modelo no representa todo M2/M8. UC004 ya incluye origen/antecedente exacto y motivo privado; ver [detalle](../apis/M2/CORRECCION_RECONSIDERACION.md).

## 9. Fallos y recuperación comunes

| Situación | Resultado esperado |
|---|---|
| Sesión vencida/revocada | 401, recuperar acceso por M1 y consultar borrador confirmado; no simular aprobación |
| Titular ajeno o documento no asignado | 404 cuando evita revelar existencia; acceso denegado sin contenido |
| Operador sin rol/MFA reciente | 403 recuperable según causa; no autoasignar rol o degradar seguridad |
| Versión vieja/asignación perdida/doble decisión | 409 con instrucción de recargar; no guardar parcialmente |
| Campos/documentos incompletos | 422 y campos corregibles; preservar el último borrador confirmado |
| Archivo demasiado grande/tipo no permitido | Error específico; no publicar ni cambiar estado a válido |
| Límite de abuso | 429 y espera real; no perder expediente ni castigar indefinidamente una red compartida |
| Base/Auth/Storage/análisis temporalmente caídos | 503 o estado de proceso explícito; no convertir fallo en lista vacía o aprobación |
| Corte tras enviar/decidir | Consultar por ID/clave; repetir misma clave/cuerpo solo si resultado no confirmado |
| Correo fallido | Decisión y aviso en cuenta conservados; reintento de envío, nunca de decisión |
| Borrado fallido | Acceso bloqueado, intención durable y reintento; no declarar borrado por pulsar botón |
| Restauración antigua | Acceso cerrado hasta aplicar borrados/restricciones y revocar accesos obsoletos |

Estos códigos son diseño del contrato nuevo; no modifican la semántica o rutas actuales de M1.

## 10. Pruebas previstas y condición de salida funcional

Todos los casos: diseñado; implementación no iniciada; pruebas no ejecutadas; aceptación pendiente. No porcentajes nuevos. La prueba de un componente M1 no se atribuye al módulo M2.

| Grupo estable | Casos/objetivo futuro |
|---|---|
| MAR-M2-UT-BE-001 | Un expediente, versión esperada, tres meses calendario y formatos/cupos; no estado/actor arbitrarios |
| MAR-M2-IT-BE-001 | Dos pestañas crean una vez en PG; A no consulta B; caída entre commit/respuesta conserva resultado |
| MAR-M2-UT/IT-BE-002 | Carga/análisis/adjunto propietario, dos archivos y límites exactos; Storage y análisis reales separados de mocks |
| MAR-M2-UT/IT-BE-003 | Envío/versiones/correcciones/reconsideraciones; carga incompleta y evidencia vencida; mismo expediente y aviso único |
| MAR-M8-UT/IT-BE-001 | Asignación/rol/MFA vigentes, autorrevisión/conflicto, reasignación y dos decisiones concurrentes |
| MAR-M8-UT/IT-BE-002 | Suspensión/reconsideración/levantamiento y consumidor de elegibilidad; ninguna obligación previa desaparece |
| MAR-M2-UT/IT-BE-004 | Alta comercial independiente, residencia reutilizada, datos públicos/privados separados y pérdida de elegibilidad concurrente |
| MAR-M2-UT/IT-BE-005 | 30+7 días de archivo con reloj controlado; carrera con actividad; nueva evidencia al reabrir |
| MAR-M2-UT/IT-BE-006 | C14: bloqueo/borrado/lease/reintento; conservación de decisión mínima y restauración sin resucitar adjunto |
| MAR-M2-UT/IT-FE-001 | Formularios por paso, guardado confirmado, carga/análisis/error y reanudación; sin datos privados persistidos públicamente |
| MAR-M8-UT/IT-FE-001 | Cola/asignación/versión visible, motivo/campos separados, pérdida de permiso y conflicto sin doble decisión |
| MAR-M2-IT-FE-002 | Perfil público mínimo; domicilio/expediente no filtrados; web/Android/iOS probados por separado |
| MAR-M2/M8-PF-BE-001 | Propuesta: 100/1000 expedientes ficticios, páginas 24/máximo50, concurrencia 1/5/10; medir latencias/errores/recursos sin afirmar capacidad |
| MAR-M2-PF-BE-002 | Carga/lectura 1 KiB/1 MiB/5.000.000 bytes, rechazo 5.000.001 bytes; límites activos, sin documentos reales |
| MAR-M2/M8-PF-FE-001 | Tiempo de tarea, peticiones, renders y recuperación en equipo/red identificados; teclado/lectores/escalado, sin inferir nativo desde Chrome |
| MAR-M2/M8-REG-001 | Regresión M1 por contratos públicos sin editarlos; sesión/avisos/permisos y preservación de cinco migraciones |

Los IDs con UT/IT/PF separados por barra representan familias previstas, no IDs ejecutados; se separarán por escenario concreto al cerrar secuencias. No crear tests que solo reflejen estas tablas.

Salida de esta etapa: funciones/actores/estados y negativos definidos; separación M1/M2/M8 comprobada documentalmente; decisiones materiales pendientes identificadas. Las 16 secuencias objetivo están en el [índice](../diagramas/secuencia/M2/README.md); modelo físico, contrato y UI deben coincidir antes de implementación. UC004 separa borrador de reconsideración presentada y conserva decisiones previas; no levanta suspensiones ni inventa caducidad.

## 11. Pendientes en orden y límites de revisión

| Pendiente | Estado / salida siguiente | Responsable |
|---|---|---|
| D01 Delimitación/casos/estados | Primer diseño documentado aquí; revisión funcional pendiente | Asistente prepara; usuario revisa cambios materiales |
| D02 Secuencias y trazabilidad completa | 16 secuencias parseadas/renderizadas; cinco del recorrido revisadas visualmente. Modelo/contrato/pantallas y183 pruebas del recorrido documentados y trazados; otros recorridos, aceptación y ejecución pendientes. Índice en [M2](../diagramas/secuencia/M2/README.md) | Asistente |
| D03 Datos DBML/DDL propios | Recorrido expediente/documentos/envío/revisión modelado en [DATA001](../modelado-datos/M2/README.md); parser, referencias y generación determinista comprobados. Sin SQL aplicado; otros recorridos pendientes | Asistente |
| D04 OpenAPI/Swagger propios | [Contrato inicial](../apis/M2/README.md): 23 operaciones propias YAML/JSON/Swagger del recorrido UC001–004/M8-UC001–002; validación documental y revisión local, sin runtime. Otros recorridos pendientes | Asistente |
| D05 Pantallas revisables | Propuesta del recorrido:9 pantallas/66 vistas, acciones por estado, paleta/tipografía/componentes; aceptación visual humana pendiente antes de implementar | Asistente/usuario |
| D06 Matriz de pruebas detallada | Propuesta del recorrido:183 casos con trazabilidad, negativos/recuperación, rendimiento y regresión. Cero pruebas del producto ejecutadas | Otros recorridos y ejecución pendientes |
| D07 Integración | M1 A8 pendiente; permisos M8, eventos/archivos y consumidores acordados; sin editar contratos compartidos aquí | Coordinación posterior |
| D08 Conservación real | Diseño D08-0.1 concreto: finalización separada, calendarios, bloqueos/copia/ledger; propuesta no activada | D08-R: validar política/fundamento, copias depurables y mínimo/FKs antes de datos reales |
| D09 Revisores | Fuente D09-0.1 propia por envío: perfil operativo+grant, consulta M8API005 | D09-R: aprovisionamiento autorizado e integración/pruebas con M1 |

D08-0.1 concreta finalización administrativa separada y calendarios sin plazo de impugnación. Aprobar/rechazar no inicia automáticamente los30 días. C14 sigue vigente; D08-R mantiene bloqueada la activación real hasta validar fundamento/política/capacidad y pruebas. La investigación jurídica concreta se hará para cerrar esa decisión, no para convertir una referencia histórica en cumplimiento actual.

Google pendiente, tarifas y demografía no bloquean D02–D06 independientes. No se aprueba implementar por revisar este documento.

## 12. Continuidad

MAR-CHAT-007 permanece abierto. Encargo: diseño documental M2 con soporte mínimo M8, sin implementar ni tocar M1/contratos compartidos. D04 del recorrido tiene [propuesta propia revisable](../apis/M2/README.md), sin cerrar D04 global. UC004 tiene [diseño detallado](../apis/M2/CORRECCION_RECONSIDERACION.md), origen/antecedentes/motivo privado y cinco operaciones nuevas. Pantallas y pruebas del recorrido ya propuestas. Siguiente dependencia: revisión del conjunto, aceptación visual e integración operativa; T01–T12 y D08-R/D09-R siguen pendientes de implementación/integración/validación material. No repetir descubrimiento ni cambiar decisiones C01–C26.

Guardar este archivo en una copia aislada no actualiza Fuentes compartidas ni el chat 006. No se modifica 01 concurrente. El registro 007 y el enlace al diseño se transferirán mediante conciliación del estado, sin sobrescribir cambios de M1. No hay pruebas de producto ni implementación que acreditar.

## Verificación documental del recorrido — 15-10-2026

Registro histórico del primer corte:16 secuencias renderizadas con Mermaid 11.12.0; cinco inspeccionadas visualmente. Corregidos separadores de mensajes, reautorización al finalizar carga, versión/cupo bajo bloqueo, permiso corto de lectura y vinculación de decisión a envío/asignación/revisor. Sin renumerar pasos existentes. DATA001 y complemento propios generan DDL de 13 tablas nuevas, 34 FK, 59 CHECK y 4 índices parciales; definiciones externas M1 y bootstrap excluidos. Parse/import documental y segunda generación determinista comprobados; ver acta en el modelo. Ninguna ejecución SQL ni prueba runtime. No declarar cierre de D03 global: perfil comercial, restricciones/conservación completas y demás recorridos no están modelados en este corte.

## Continuación D08/D09 · 15-10-2026

[Diseño concreto](../apis/M2/CONSERVACION_REVISORES_D08_D09.md), [pantallas](../ui-ux/M2/PROPUESTA_PANTALLAS_M2_M8.md), [pruebas](MATRIZ_PRUEBAS_M2_M8.md). D08/D09 diseñados para revisión, no aceptados ni implementados. UC011 y SEQ011 se amplían; UC004 integra conservación sin cambiar expediente; M8UC001 tiene catálogo de candidatos. Modelo19 tablas; contrato0.3.1/23 operaciones. No se habilita reutilización real ni se altera C14/M1. Siguiente: revisión coherente y cierre de dependencias operativas/materiales antes de implementación.

## Revisión integral del recorrido · 15-10-2026

MAR-CHAT-007, CONTINUACIÓN. Corte: UC001–004/011 y soporte M8UC001–002. Diseño aislado, no todo M2/M8; sin implementación ni cambios M1. Contrato0.3.1,19 tablas/47 FK/83 CHECK,9 pantallas/66 vistas y183 pruebas planificadas. Validación en [acta propia](../apis/M2/VALIDACION_AUDITORIA.json).

| ID de revisión | Inconsistencia | Corrección documental |
|---|---|---|
| MAR-M2-AUD-A01 | Finalidad contradictoria | M8SEQ002:S145 y ejemplos de decisión aún usaban pendiente de definición. Se alinean con provisional, comando de cierre separado y D08-R. |
| MAR-M2-AUD-A02 | Proyección privada contradictoria | Version false con PII y VisibleDecision sin indicador propio eran aceptados por esquema. Se cierran condiciones de nulidad/declaración y se agrega private_data_available a decisión visible. |
| MAR-M2-AUD-A03 | Borrado incompatible con integridad | El documento válido exigía hash/objeto después de purgarlos. CHECKs distinguen evidencia disponible de veredicto técnico histórico; deleted limpia referencias/huellas. Purga privada reinicia declaración. |
| MAR-M2-AUD-A04 | Tareas/calendario incompletos | scheduled/delete_pending/error/deleted requieren calendario; completed respeta vencimiento. running exige lease y complete referencia de ledger externo; no se afirma garantía entre proveedores. |
| MAR-M2-AUD-A05 | Órdenes de bloqueo distintos | Envío, revisión y política usaban órdenes diferentes. Se normaliza expediente→casos→concesiones→documentos→versiones/enlaces→envíos/asignaciones→bloqueos/tareas, conservando IDs. |
| MAR-M2-AUD-A06 | Acciones de pantalla heredadas | Borrador preparado no vuelve a preparar; respuesta incierta consulta; vacío inicia solicitud; carga espera; pérdida de permiso vuelve. state_actions es fuente canónica por vista. |
| MAR-M2-AUD-A07 | Origen del envío y resultado M8 | Se agregan vistas de envío de corrección/reconsideración y resultado de corrección confirmado; resultados M8 cierran acciones de decidir. Revisión inicial no muestra motivo de reconsideración. |
| MAR-M2-AUD-A08 | Pruebas genéricas incorrectas | La transferencia es204 sin JSON y own/creación de B no es404 ajeno. Se concretan fixtures/pasos, escenarios de UI y negativos/recuperación para23 operaciones. |
| MAR-M2-AUD-A09 | Trazabilidad y pendientes desactualizados | Se enlazan pasos de conservación en contratos propios; D05/D06 ya tienen propuesta del recorrido. Se separan pendientes reales de integración/aceptación/otros recorridos. |
| MAR-M2-AUD-A10 | Ejemplos temporales y privacidad | Se alinea fecha del resumen con su envío anidado; se rechazan estados final sin fecha, provisional con fecha y pendiente de borrado como complete. Todas las verificaciones son documentales. |

Estos hallazgos se cierran solo como coherencia documental del corte revisado. No equivalen a aceptación, implementación, integridad SQL ejecutada o transacciones probadas. Permanecen D07 integración M1, D08-R política jurídica/copia/depuración mínima y D09-R aprovisionamiento; revisión visual humana y plataformas antes de implementar. Registro de007 para conciliar posteriormente en01 sin sobrescribir006. Sin subida a Fuentes, commit/push o publicación por guardar archivos.

Prompt de continuidad: «Continuar MAR-CHAT-007 desde la revisión integral del recorrido y su acta. Leer cambios vigentes; atender observaciones y dependencias de integración/privacidad/aprovisionamiento. Conservar expediente e historial, no reabrir hallazgos sin evidencia nueva, sin implementar M2/M8 ni tocar M1/contratos compartidos, sin confirmaciones rutinarias».

## Preparación de integración y entrega · 15-10-2026

[Puertos consumidores y entrega](../apis/M2/INTEGRACION_Y_ENTREGA_M2_M8.md). Especificación propia de identidad, avisos, archivos y HMAC/rotación; procedimiento D09-P listo documentalmente. No son interfaces compartidas implementadas. Modelo objetivo19 tablas/47 FK/83 CHECK;191 casos diseñados, cero pruebas del producto M2/M8 ejecutadas. Commit/push autorizados; resultados finales se informan por SHA remoto, sin fusionar ni subir Fuentes por inferencia.
