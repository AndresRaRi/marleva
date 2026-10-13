# Marleva: instrucciones del repositorio

Leer antes de cada proceso o cambio las instrucciones vigentes, las cuatro fuentes en ../../entregables/fuentes_finales/ y docs/proceso/PROCESO_DESARROLLO_MARLEVA.md. Aplicar el protocolo, nomenclatura y puertas documentales. Leer también docs/proceso/MATRIZ_CASOS_M1.md con estados, negativos, recuperación y pruebas; casos diseñados no equivalen a ejecutados. Inventariar/leer cambios; no afirmar lectura de resúmenes, dependencias o artefactos generados.

Para B09 leer también docs/apis/M1/CONTRATO_B09_ARCHIVOS_PRIVADOS.md; es diseño objetivo, no contrato implementado.

Documentación coherente y revisable antes del código: caso de uso, secuencia y pasos identificados, estados/errores, modelo DBML, DDL derivado y API OpenAPI YAML/Swagger. Cambios de pantallas parten del diagrama de secuencia y requieren revisión visual antes de implementación. Corregir primero el diagrama y sus contratos cuando una incidencia cambie el proceso.

API Nest modular por capas con controllers, DTOs, casos de uso, entidades/reglas de dominio, puertos, repositorios y adaptadores con responsabilidades reales. Cliente Expo separado y por módulo. No construir capas vacías ni llamar terminada a la separación actual pendiente de refactor.

Cada cambio de backend/frontend tiene pruebas unitarias y de integración para los casos necesarios; performance proporcional al cambio y regresión, con ambiente, dataset, métricas y límites. Organizar tests en unit/integration/performance, backend/frontend y módulo; resultados en tests/results. No declarar calidad, cobertura, rendimiento o cumplimiento sin evidencia.

Instalaciones oficiales verificadas, versiones/lockfiles/imágenes fijados, licencias/permisos resueltos, configuración homogénea y arranque/parada/recuperación documentados. No usar runtime Codex como instalación propia. Sin secretos/datos reales en Git o resultados; solo fixtures locales. A0 y SDKAndroid autorizados; no cuentas externas, gasto, publicación, contactos, cobros ni datos reales. No implementar M2–M10 completos durante base/M1.

Registro actual: MAR-CHAT-004, continúa abierto. Actualizar fuentes solo por cambios necesarios y releer finales antes de entregar. No tocar sources/ ni originales sincronizados. Los ejemplos DBML/YAML del usuario permanecen no recibidos hasta acceso comprobado.

Al entregar cambios, indicar nombres/versiones exactas para reemplazar Fuentes y texto de instrucciones para pegar; guardar localmente no acredita subida. No editar originales sincronizados para simularla.

## Continuidad autónoma dentro del trabajo autorizado

Instrucción explícita13-10-2026: ejecutar el plan sin esperar confirmación entre tareas ordinarias. Después de cada tarea, comprobar su salida, registrar resultado/fallo, seleccionar la siguiente dependencia y continuar. Las actualizaciones informan avances; no son solicitudes de permiso. No finalizar un turno solo por terminar una subtarea si queda trabajo autorizado ejecutable.

Detener únicamente la acción afectada por una instrucción de pausa, decisión material de alcance/diseño que requiera al usuario, gasto/publicación/contratación/contactos/datos o dinero reales, licencia/permiso no resueltos, o un bloqueo que no pueda resolverse dentro de autorización. Explicar causa y avanzar en tareas independientes. Conservar autorizaciones y decisiones vigentes; no interpretar silencio como aprobación. Ninguna regla promete ejecución cuando no existe una sesión activa o acceso efectivo.

Revisar efectos de cada cambio sobre artefactos y pruebas existentes; corregir retrospectivamente las inconsistencias causadas sin reabrir acuerdos por costumbre. Mejoras justificadas por defecto observado, riesgo concreto o medición; ideas que amplían MVP1 van a lista posterior. Una tarea se cierra con evidencia, no con un anuncio. La ruta y los pendientes viven en protocolo/matriz existentes;01 registra estado/continuidad,02 diseño,03 evidencia,00 reglas.
