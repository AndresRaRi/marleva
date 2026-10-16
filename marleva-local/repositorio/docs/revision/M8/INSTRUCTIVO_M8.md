# Revisar el soporte documental M8 de M2

15-10-2026 · MAR-CHAT-007. Solo asignaciones/revisiones vecinales y comerciales, restricciones y conservación necesarias para M2. No es todo M8 ni un panel administrativo implementado.

Abrir [propuesta](../../ui-ux/M2/propuesta.html), seleccionar pantallas M8 y su estado. Revisar [casos completos](../../proceso/MATRIZ_CASOS_M2.md), [fuente autorizada de revisores](../../apis/M2/CONSERVACION_REVISORES_D08_D09.md), [aprovisionamiento y puertos](../../apis/M2/INTEGRACION_Y_ENTREGA_M2_M8.md). No se crean personas o permisos reales mediante estas vistas.

| Recorrido | Revisión y esperado |
|---|---|
| Cola/asignación vecinal M8UI001 | Candidatos por envío, perfil operativo enabled+membership_review; gestor membership_assign, ninguno titular. Comparar vacío real, falta de candidatos, caída y candidato obsoleto; seleccionar no reserva ni concede grant. |
| Decidir pertenencia M8UI002 | Solo versión enviada asignada y antecedente visible; motivo visible separado de nota interna. Comparar aprobado/corrección/rechazo, pérdida de asignación/MFA y resultado incierto. Una decisión ganadora, sin acceso histórico general. |
| Cola comercial M8UI003 | seller_assign/seller_review y asignación independiente; no hereda autorización vecinal ni comprobantes. Revisar candidatos ausentes/revocados y cola sin campos contractuales privados. |
| Revisión comercial M8UI004 | Datos pertinentes de perfil enviado. Habilitar exige pertenencia vigente; corrección exige campos y motivo. Comparar pérdida de pertenencia y decisión incierta. No oferta, tarifa o pago creado. |
| Gestión de restricciones M8UI005 | Causa/alcance/motivo separados de estado base; comercial solo ofrecer. Candidatos restrict del ámbito por apelación pending, no titular. Revisar conflicto de revisiones y falta de candidato. |
| Reconsideración M8UI006 | Solo causa, motivo y documentos explícitos de apelación asignada; acceso temporal reautorizado al servir bytes. No notas anteriores o contratos privados por permiso vecinal. Lift elimina una causa; otras pueden seguir impidiendo operar. |
| Conservación M8UI007 | Cola mínima/caso por finalidad, conservador específico no titular. Finalización/hold/release requieren referencia/base/revisión, comando estable y MFA. No leer documento por conservarlo ni borrar desdeHTTP; deleted exige todas las copias ausentes. |

En [Swagger](../../apis/M2/swagger.html) buscar MAR_M8_API_001–019. Tiene solicitudes desactivadas. Revisar sus pasos/tablas/errores y las [fuentes de secuencia](../../diagramas/secuencia/M2/README.md); no revisar PNG como sustituto de Mermaid/YAML. Las pruebas previstas están en [matriz](../../proceso/MATRIZ_PRUEBAS_M2_M8.json): dos gestores/revisores, dueño ajeno, reasignación/revocación, cambios concurrentes, caídas y reintento sin duplicar.

Registrar observación como pantalla+estado / UC / SEQ:paso / API / esperado-observado. Esperado al perder autorización: ocultar contenido, volver seguro y no guardar; incierto consulta resultado antes de otra decisión. No recibir un correo no revierte una decisión confirmada.

Verificación real limitada: ChromeDOM320/390/768/1440, fuentes/esquemas/referencias/render documental; [acta](../../apis/M2/VALIDACION_INTEGRAL.json). No interfaz aceptada, pruebas de producto, plataformas nativas o provisión real. [Captura histórica de revisión vecinal](../../ui-ux/M2/capturas/revision-m8.png) no acredita nuevas pantallas ni aceptación. D09-R requiere designación/provisión autorizada, no autoasignación; D08-R validación material y borrado/restauración real; D07 depende de M1 y acuerdos antes de activar.
