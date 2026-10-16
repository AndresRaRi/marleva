# Propuesta completa de pantallas M2/M8

15-10-2026 ·MAR-CHAT-007 ·contrato0.4.0 · diseñada, sin aceptación/implementación acreditada.

[Propuesta navegable local](propuesta.html) · [catálogo canónico de21pantallas/157estados](pantallas.json) · [casos y reglas](../../proceso/MATRIZ_CASOS_M2.md) · [pruebas previstas](../../proceso/MATRIZ_PRUEBAS_M2_M8.json).

Selectores superiores permiten revisar cada pantalla/estado. Todos los botones de producto están desactivados: las vistas muestran estructura, texto y siguiente intención, sin guardar, llamar API o ejecutar datos. state_actions define acciones específicas por estado; respuesta incierta consulta, carga espera, resolución confirmada vuelve, permiso perdido oculta sensible. No presentar navegación de revisión como prueba funcional.

| Grupo | Pantallas |
|---|---|
| Pertenencia/documentos/envío/resolución/historial/corrección/conservación |M2UI001–007 |
| Cambio vecinal y archivo/reapertura |M2UI008–009 |
| Editor comercial/estado/condiciones/historial/público y contrato |M2UI010–013 |
| Restricción propia y reconsideración |M2UI014 |
| Revisión/asignación vecinal |M8UI001–002 |
| Cola y revisión comercial |M8UI003–004 |
| Gestión/revisión de restricciones y conservación |M8UI005–007 |

Se conserva paleta cálida y contraste de texto, tipografía de sistema, tamaño base16px, controles48px, una columna en móvil y columnas solo cuando caben. Jerarquía: título→estado visible→datos por finalidad→siguiente acción. Motivo visible y nota interna separados en revisión. Campos públicos y privados comerciales se presentan en bloques explícitos. Condiciones draft/changed bloquean envío y aceptación nunca preseleccionada. Dirección exacta nunca pública; resumen contractual privado solo comprador elegible. Documento/motivo no disponible no se reconstruye desde historial. Gracia del archivo inicia con aviso disponible; reapertura no oculta rechazo.

Accesibilidad propuesta: labels visibles, encabezados, status anunciable, foco visible, navegación por teclado/selectores y estados distinguibles por texto sin depender del color. VerificaciónDOM en320/390/768/1440px comprueba desborde, IDs/acciones y controles desactivados; no acredita lector de pantalla, WCAG, Safari o aplicaciones nativas. No se tomaron nuevas capturas de Swagger/diagramas por rutina; sus fuentes son canónicas. Las capturas anteriores son históricas, no representan las12pantallas nuevas. Aceptación visual humana pendiente antes de implementar; no confundir con comprobaciónDOM o validación estructural.
Revisión paso a paso: [instructivoM2](../../revision/M2/INSTRUCTIVO_M2.md) y [M8](../../revision/M8/INSTRUCTIVO_M8.md).
