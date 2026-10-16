# Revisar el diseño integral de comunidad y oferentes

15-10-2026 · MAR-CHAT-007. Este instructivo revisa documentación propuesta, sin producto M2 implementado o aprobado visualmente. No requiere iniciar servicios, cargar documentos personales, aplicar SQL o activar condiciones.

## Abrir y orientarse

Abrir [propuesta de pantallas](../../ui-ux/M2/propuesta.html). El selector «Pantalla» elige el recorrido; «Estado» permite comparar lo que verá cada actor. Los botones dentro de las vistas están desactivados para mostrar la intención siguiente. No guardan ni envían. [Reglas y alcance](../../proceso/MATRIZ_CASOS_M2.md), [contrato en Swagger](../../apis/M2/swagger.html) y [fuente YAML](../../apis/M2/openapi.yaml) describen la misma propuesta. Swagger también tiene ejecución desactivada.

## Recorrido del vecino

1. Datos de pertenencia: comparar edición, error de validación y guardado incierto. Esperado: guardar no envía; recuperar sesión no concede pertenencia.
2. Documentos privados: comparar carga, análisis, rechazo, evidencia reutilizable/no disponible y conflicto. Esperado: PDF/JPEG/PNG de hasta5.000.000bytes, dos finalidades máximas; no datos en URL o dirección pública.
3. Revisión y envío: comparar solicitud, corrección y reconsideración listas, envío en curso e incierto. Esperado: un envío exacto; comprobar resultado antes de repetir.
4. Estado/historial/corrección: comparar pendiente, aprobada, rechazada, campos observados y motivo privado no disponible. Esperado: mismo expediente, nueva versión al corregir/reconsiderar, ninguna nota interna ni identidad de revisor; preparar no presenta.
5. Cambio vecinal: revisar confirmación y pérdida de elegibilidad. Esperado: aprobación histórica conservada y operaciones nuevas bloqueadas hasta revisión de información vigente; obligaciones anteriores subsisten.
6. Archivo/reapertura: comparar aviso/gracia, archivado, motivo de reconsideración requerido y reapertura. Esperado:30d de inactividad confirmada, aviso disponible+7d; no archivar pendiente ni reconstruir evidencia borrada.
7. Privacidad: comparar calendario, bloqueo, borrado pendiente y completado. Esperado: «borrado» solo con confirmación suficiente; null no prueba eliminación, bloqueo no explica causa privada al titular.

## Recorrido del oferente

1. Mi perfil: revisar separación de campos públicos y contractuales privados. Esperado: domicilio/nombre legal/teléfono no se copian del expediente ni se publican. Guardado incompleto solo es borrador.
2. Estado y envío: comparar ready, condiciones en borrador/cambiadas, pendiente, habilitado, pausado, restringido e incierto. Esperado: aceptación expresa nueva por versión de condiciones activa; una condición draft no permite alta real.
3. Historial comercial: comparar corrección/reconsideración/cambio material, preparado y privado no disponible. Esperado: misma identidad del perfil, motivo nuevo al reconsiderar, versión vieja no habilita nuevas operaciones tras cambio material.
4. Perfil público: revisar exclusivamente estado public. Esperado: descripción/modalidades/cobertura/atención, sin datos privados. La vista contract_private es un ejemplo separado de comprador elegible, nunca una variante pública o descarga masiva.
5. Restricciones: comparar causa activa, borrador, evidencia opcional, envío, resolución mantenida/levantada y otra causa aún activa. Esperado: presentar no levanta; evidencia nueva vecinal usa recorrido habitual; levantar una causa no aprueba pertenencia/perfil ni otras causas.

## Contratos, diagramas y observaciones

En Swagger localizar operación por MAR_M2_API_xxx. Revisar entrada/salida/errores, x-use-case-id, x-sequence-id y pasos, tablas y permisos. Abrir [galería](../../diagramas/secuencia/M2/REVISION_RECORRIDO.html) o directamente el archivo Mermaid; no usar una imagen para sustituir su fuente. [DBML](../../modelado-datos/dbml/MAR-M2-DATA-001.dbml) es importable; [DDL](../../modelado-datos/ddl/MAR-M2-DATA-001.sql) es solo derivado de revisión, no migración.

Registrar observación con pantalla/estado, caso, SEQ:paso y resultado esperado frente a lo observado. La [matriz de pruebas](../../proceso/MATRIZ_PRUEBAS_M2_M8.json) contiene precondiciones/pasos/esperados, sin pruebas funcionales ejecutadas. [Acta integral](../../apis/M2/VALIDACION_INTEGRAL.json) informa verificaciones reales de estructuras, ejemplos y distribución; no equivale a aceptación visual.

Plataforma comprobada: DOM de propuesta local en Chrome, anchos320/390/768/1440; botones/acciones/visibilidad/desborde y Swagger sin solicitudes. No Safari, Android/iOS, lector de pantalla o rendimiento de producto. Las [capturas previas del recorrido](../../ui-ux/M2/capturas/datos.png) son históricas; no acreditan las pantallas comerciales nuevas ni aprobación. No se generaron nuevas capturas por rutina en esta ampliación.

La aceptación visual, la integración M1 A8, política/calendarios/copias reales D08-R y personas/provisión D09-R se verifican antes de activar; no son una implementación oculta en estas vistas. No sustituir ni subir Fuentes por inferencia al guardar este instructivo.
