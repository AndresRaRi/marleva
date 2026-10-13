# M1: procesos y secuencias

Actualizado13-10-2026;14 secuencias. Archivos Mermaid editables, pasos estables S010/S020. `partial`: implementación/pruebas parciales anteriores al traslado; `pending`: diseño objetivo sin ejecución completa. No módulos aprobados por crear diagrama. Leer protocolo y02 antes de cambiar.

| Caso | Secuencia | Proceso | API/vínculo | Estado |
|---|---|---|---|---|
| MAR-M1-UC-001 | [MAR-M1-SEQ-001](MAR-M1-SEQ-001.mmd) | Solicitar código | POST /v1/auth/challenges | partial |
| MAR-M1-UC-002 | [MAR-M1-SEQ-002](MAR-M1-SEQ-002.mmd) | Verificar código y abrir cuenta | POST /v1/auth/verifications | partial |
| MAR-M1-UC-003 | [MAR-M1-SEQ-003](MAR-M1-SEQ-003.mmd) | Consultar cuenta y renovar sesión | GET /v1/me | partial |
| MAR-M1-UC-004 | [MAR-M1-SEQ-004](MAR-M1-SEQ-004.mmd) | Salir de sesión actual o todas | DELETE /v1/auth/sessions/current; DELETE /v1/auth/sessions | partial |
| MAR-M1-UC-005 | [MAR-M1-SEQ-005](MAR-M1-SEQ-005.mmd) | Iniciar cambio de correo | POST /v1/auth/email-changes | partial |
| MAR-M1-UC-006 | [MAR-M1-SEQ-006](MAR-M1-SEQ-006.mmd) | Confirmar ambos buzones | POST /v1/auth/email-changes/{id}/confirmations | partial |
| MAR-M1-UC-007 | [MAR-M1-SEQ-007](MAR-M1-SEQ-007.mmd) | Segundo factor y permiso de operador | POST /v1/auth/mfa/enrollments; POST /v1/auth/mfa/verifications; GET /v1/operator/access | partial |
| MAR-M1-UC-008 | [MAR-M1-SEQ-008](MAR-M1-SEQ-008.mmd) | Consultar y entregar avisos durables | GET /v1/notifications; worker interno | partial |
| MAR-M1-UC-009 | [MAR-M1-SEQ-009](MAR-M1-SEQ-009.mmd) | Recuperar acceso o pérdida de buzón | Política C15; no transferencia por residencia | pending |
| MAR-M1-UC-010 | [MAR-M1-SEQ-010](MAR-M1-SEQ-010.mmd) | Dependencias y configuración local | GET /health/live; GET /health/ready | partial |
| MAR-M1-UC-011 | [MAR-M1-SEQ-011](MAR-M1-SEQ-011.mmd) | Objeto ficticio privado | B09; especificación parcial, modelo/YAML/adaptador pendientes | pending |
| MAR-M1-UC-012 | [MAR-M1-SEQ-012](MAR-M1-SEQ-012.mmd) | Simulador de pagos aislado | B10 harness; no endpoint financiero real | partial |
| MAR-M1-UC-013 | [MAR-M1-SEQ-013](MAR-M1-SEQ-013.mmd) | Restaurar base y archivos sin revivir accesos | B12/02 §16.4; ejecución pendiente | pending |

Pantallas actuales: MAR-M1-UI-001 acceso; UI-002 cuenta; UI-003 cambio de correo; UI-004 operador; UI-005 avisos. Estilo visual no aprobado. Cada prueba/incidencia deberá enlazar UC/SEQ/paso; pruebas existentes todavía requieren esa trazabilidad completa.

Proceso objetivo adicional: MAR-M1-UC-014 / [SEQ014](MAR-M1-SEQ-014.mmd), recuperación MFA con otro administrador. No implementado; modeloDATA002 ycontratoobjetivo separados del físico/actual. Pruebas de107 ampliadas, no ejecutadas.

Para UC011 leer [B09](../../../apis/M1/CONTRATO_B09_ARCHIVOS_PRIVADOS.md). Para UC014 leer contrato objetivo de recuperación; sus siete operaciones son diseño, no endpoints implementados. Los casos SQL114–121 son evidencia de integridad aislada, no pruebas de estos recorridos.
