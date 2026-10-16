# Matriz de pruebas prevista M2/M8

15-10-2026 ·MAR-CHAT-007 ·Contrato0.4.0.

Fuente única de escenarios: [JSON detallado](MATRIZ_PRUEBAS_M2_M8.json), 416 casos diseñados, cero ejecutados sobre M2/M8. integración:395, unitaria:10, regresión:4, rendimiento:6, accesibilidad:1. Los191 IDs previos se conservan; la ampliación cubre todos los recorridos originales. Cada escenario tiene precondición, pasos, esperado, UC→SEQ/paso→API→tablas→UI, dependencia y evidencia nula. No se acreditan cobertura funcional por conteo ni pruebas de negocio por validar un esquema.

[Diseño integral](MATRIZ_CASOS_M2.md) · [cobertura porUC](../apis/M2/COBERTURA_INTEGRAL.json) · [pantallas](../ui-ux/M2/propuesta.html).

Ejecución futura: tests/unit/backend|frontend/M2|M8, tests/integration/backend|frontend/M2|M8, tests/performance/backend|frontend/M2|M8 y regresión según protocolo; no se crean carpetas vacías o tests de espejo. FixturesA/B/revisor/gestor/conservador ficticios, reloj controlado y dos transacciones reales para carreras. Requiere producto implementado y adaptadoresPG/Auth/Storage/avisos/ledger reales locales; mocks no acreditan integración.

Los ensayos de archivos incluyen1/5.000.000/5.000.001bytes y límite de3meses calendario; pertenencia, oferentes, apelaciones, archivo, políticas, grants, rotación, purga, restauración y acceso cruzado tienen negativos y recuperación. Rendimiento usa100/1000 casos, concurrencia1/5/10 y umbrales de ingeniería propuestos; no resultados ni SLA. Chrome/Safari/Android/iOS se reportan separadamente con equipo/red/versiones.

Los hooks de la rama ejecutan regresión de la baseM1 disponible. Sus resultados están en el cierre de entrega y no prueban M2/M8.
