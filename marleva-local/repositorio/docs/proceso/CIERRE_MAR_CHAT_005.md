# Cierre MAR-CHAT-005 y continuidad

15 de octubre de 2026, America/Merida. Tema: implementación integrada y pruebas de base/M1. Cierre solicitado por el usuario. Es una fotografía de cierre, no otra fuente permanente de estado o porcentajes. Estado vigente: 01; avance: docs/avance.md; reglas: 00.

## Resultado y alcance de la revisión

PR #1 y PR #2 integrados en main. PR #2: merge b12bfca2a8a9f7e35b9c1a6dea76264cfedf88ce, 15-10-2026 11:33:29 America/Merida. Main local actualizado por avance directo hasta ese commit, sin descartar modificaciones. Cierre documental en rama codex/docs-cierre-mar-chat-005, separada de main; no implica otra integración automática.

Diez controles del PR pasaron sobre a93375b en [38777078891](https://github.com/AndresRaRi/marleva/actions/runs/38777078891), después del verde, negativa y restauración de fase 2. Revisión independiente sin hallazgos accionables en su alcance. [Pipeline posterior de main](https://github.com/AndresRaRi/marleva/actions/runs/38778339532): consultarlo por su propio resultado; el verde del PR no se atribuye automáticamente a ese merge.

Inventario desde raíz: 407 archivos no ignorados en la fotografía previa a esta acta, incluidos espejos y auxiliares. Lectura general parcial: contraste de fuentes 00–03, README/AGENTS/protocolo/matriz, estado Git/CI, cliente, contratos/modelos, pruebas pertinentes y resultados recientes de los chats de auditoría e inventario. No auditoría línea por línea de todo el código ni nuevas pruebas runtime. Hashes/rutas en artifacts ignorados, no una bitácora paralela. Secretos, dependencias instaladas, builds, binarios y cachés excluidos. No se revalidó la investigación comercial/legal/demográfica externa ni se reconstruyeron originales ausentes.

## Estado comprobado

| Parte | Integrado / disponible | Falta |
|---|---|---|
| CI fases 1–2 | Calidad, arquitectura, cobertura, integración, contrato, web, seguridad, CodeQL, dependencias e imagen; un solo disparo por PR | Fase 3: Sonar temporal base/cambio, rendimiento/automatizaciones pendientes según ADR002; sin deploy |
| Acceso/cuenta | OTP, sesión, salida, cambio de correo, segundo factor básico; API y recorridos básicos web/Android | Ramas completas, reanudación y plataformas/aceptación |
| Avisos | Backend con cursor y trabajador durable | Cliente descarta next_cursor; completar navegación/error/recarga |
| Archivos B09 | Permisos, lectura y borrado de fixtures privados | Recuperación integral; no expediente M2 |
| Recuperación operador | Siete operaciones backend, roles persistidos y pruebas HTTP | Interfaz revisada, plataformas y aceptación |
| B12 | Copias con atributos, borrados, revocación y cola en ensayos separados | Un ensayo esencial integrado en el mismo destino; no confundir resultados de destinos distintos |
| Cliente y diseño | Una ruta con cinco secciones actuales; manual con capturas | Propuesta visual aprobada antes de cambios materiales; Safari/iOS/dispositivos y accesibilidad restantes |
| M2–M10 | Diseño funcional | Implementación de módulos; no iniciar como si M1 estuviera aceptada |

Los porcentajes y sus denominadores se consultan exclusivamente en docs/avance.md. Google/Supabase permanece pendiente y no bloquea lo independiente. Dos dependencias conservan parches locales verificables; OSV original sigue identificando sus versiones. Mantener parches hasta adoptar corrección oficial compatible, sin ocultar avisos.

## Contradicciones, redundancias y limpieza

| Hallazgo comprobado | Tratamiento |
|---|---|
| Espejos sources/AGENTS raíz anteriores frente a editables actuales | Solo lectura; actualizar Fuentes/configuración con las versiones editables mediante acceso autorizado. No editar ni eliminar espejos |
| 01 mezcla estado con dos relatos locales recientes de auditoría/UC001 | Al integrar ese trabajo, conservar el resumen en tabla y enlazar matriz/actas; retirar relato duplicado solo después de preservar procedencia |
| README API conserva 17 operaciones y recuperación solo objetivo junto a cabecera de 24 | Rotular antecedentes o consolidar estado actual. No cambiar nombres estables de YAML referenciados |
| 02 §16 menciona cuatro migraciones; §16.7/modelo actual registra cinco | Corregir el conteo inicial como antecedente; migraciones aplicadas inmutables |
| 03 y protocolo conservan preparación/no ejecución en secciones históricas | Separar explícitamente antecedentes del estado actual; enlazar evidencia CI. No borrar evidencia por ser antigua |
| Matriz y protocolo acumulan planes/resultados y versiones manuales históricas | Mantener una tabla vigente arriba y trasladar narrativa necesaria a actas/Git en limpieza acotada; no reescribir resultados ni ampliar alcance |
| UT-BE-103-F y UT-BE-114 identifican pruebas distintas | Añadir sufijos inequívocos conservando correspondencia histórica cuando se consoliden pruebas |
| DATA001/DATA002 tienen igual cantidad de tablas, restricciones distintas | No son duplicados. Falta FK objetivo de EmailChange y revisión de Audit; nueva migración si procede, nunca editar las aplicadas |
| Cliente fija espera en 60 y no conserva retorno completo | Comprobar Retry-After/espera real y reanudación al completar UC001/UC009; no darlo por cubierto por pruebas backend |
| Recomendación antigua de repo privado frente a GitHub PUBLIC actual | GitHub confirmó PUBLIC; no cambiar visibilidad por esta revisión. No tomar el chat antiguo como configuración actual |
| Ramas codex/feat-ci-pipeline y codex/fix-quality-and-rules ya incorporadas en main | Candidatas a retirar después de confirmar que no haya trabajo único. No eliminadas; requiere confirmación expresa |

No se encontró una base para declarar código o archivos concretos inútiles y eliminarlos sin revisar sus consumidores. Conservar lockfiles, cinco migraciones, YAML fuente, modelos físico/objetivo, derivados usados, licencias y actas distintas. Cachés/herramientas/backups privados no se borran por rutina; primero comprobar referencias y necesidad de recuperación. La automatización de vigilancia del PR #2 fue eliminada tras su integración; la anterior de 004 sigue pausada.

## Trabajo local aún no integrado

Dos chats dejaron entregables propios sin commit ni push. Se conservaron intactos y fuera del cierre documental:

- Inventario: entregables/INVENTARIO_PANTALLAS_Y_FLUJOS_MARLEVA.md.
- Auditoría M1: cambios de matriz, secuencias, contratos B09, modelos y derivados; notas añadidas a 01.
- UC001: account.test.mjs, challenge-branches.test.mjs y actas uc001-*. El otro chat reporta 52/52 dirigidas, 163/163 unitarias y 2/2 integración PG/Auth; actas leídas, no reejecutadas por esta revisión. No son pruebas HTTP ni plataforma y aún no están acreditadas en CI del remoto.

La lista exacta está en git status, no en una promesa de árbol limpio. No mezclar estos cambios con una nueva fase hasta revisar diff, generación determinista, controles y procedencia en un PR propio. Fuentes sincronizadas modificadas preexistentes siguen fuera de commits propios.

## Única secuencia siguiente

1. Confirmar resultado del pipeline de main y revisar/integrar este cierre documental.
2. Consolidar el trabajo local de inventario/auditoría/UC001 en una rama y un PR pequeño: revisar diffs, generar desde fuentes, corregir IDs duplicados, pasar CI. No reiniciar descubrimiento ni copiar resultados a main sin validar.
3. Completar fase 3 de ADR002 en incremento separado, manteniendo la autorización de Sonar temporal local base/cambio, sin gasto/SonarCloud/deploy. Acotar herramientas a controles útiles; no añadir otra plataforma equivalente.
4. Cerrar ramas pendientes de M1 por la matriz, un caso activo a la vez. Completar UC001 antes de dar su aceptación; después dependencia siguiente. Brechas funcionales prioritarias: avisos cliente, retorno seguro de acción y ensayo esencial B12 integrado.
5. Preparar propuesta visual revisable para las pantallas necesarias; revisión del usuario antes de implementar. Completar flujos y capturas del manual, Safari/Android/iOS, accesibilidad y físicos aplicables.
6. Solo al cumplir criterios de M1, continuar M2 con soporte M8 conforme 02. Tarifas, proveedor y operación real siguen siendo decisiones posteriores.

## Chats y función

| Chat visible | Utilidad / recomendación |
|---|---|
| MAR-CHAT-005: Implementación integrada y pruebas de base/M1 | Historial de implementación/CI y cierre. Cerrar ahora; conservar como referencia, no seguir tareas nuevas aquí |
| Audita casos M1 de Marleva | Útil hasta consolidar el diff local y actas UC001. Después, archivable como antecedente |
| Inventariar pantallas y flujos | Encargo concluido; útil por su archivo local todavía no incorporado. Archivable después de integrarlo |
| Casos de uso por módulo | Origen del encargo de auditoría; no usar ejemplos antiguos para renombrar módulos o IDs |
| Documentación de pantallas y flujos | Origen del inventario; el archivo es la salida operativa, no dos chats de implementación |
| Crear repositorio GitHub | Preparación ya superada; archivable, no fuente del estado Git o visibilidad actuales |
| Marleva — implementación integrada y pruebas de base/M1 | Chat de traslado inicial, sin ejecución acreditada allí; archivable |
| Brief piloto Marleva | Contexto de principios. Reglas vigentes consolidadas en 00; no requiere seguimiento operativo |
| Chats 001–004 de alcance/preparación/desarrollo | Antecedentes y procedencia de acuerdos; consultar solo ante duda concreta. No reabrir ni renumerar para tareas nuevas |

Archivar no significa borrar. No se archivó ni eliminó ningún chat en este cierre. La lista es la parte accesible del inventario de chats, no una auditoría de todo el historial de la cuenta. Recomendación operativa: un chat nuevo activo para continuidad técnica; auditorías puntuales con alcance claro y sin escribir simultáneamente los mismos archivos.

## Prompt de continuidad

Título propuesto: MAR-CHAT-006 — Consolidación de main y siguientes brechas de M1.

PROYECTO: Marleva. Abrir MAR-CHAT-006 solo después de comprobar registro; anterior MAR-CHAT-005 cerrado. Raíz: /Users/andresramos/.codex/.chatgpt-projects/g-p-6ac952169b2081918f82b73968bd9d1a. Fecha real America/Merida.
Lee instrucciones, README, AGENTS y 00–03 completos en orden; protocolo, matriz, ADR001/002 y esta acta. Inventaría y lee nuevos/modificados; declara lectura parcial y ausentes. Conserva C01–C26, A0/SDK, sources/AGENTS raíz readonly y migraciones aplicadas inmutables.
Comprueba rama/HEAD/upstream, GitHub y main b12bfca o sucesor; PR #2 integrado. Pull --ff-only sin descartar cambios. Hay trabajo local de otros chats aún sin commit: inventario, auditoría documental y pruebas UC001. Revísalo y consolídalo por procedencia en un PR separado antes de nuevas fases; no asumir que está en main ni limpiarlo mediante reset/stash/borrado.
Primero confirma CI de main y estado del PR documental de cierre. Después sigue la secuencia de esta acta y matriz: fase 3 acotada, ramas M1 por caso, avisos cliente/retorno/B12 esencial, propuesta visual y plataformas. Google/Supabase permanece pendiente; no nuevos módulos completos, gasto, despliegue, contactos, datos/dinero reales ni cambios materiales sin autorización.
Aplica autonomía de 00 §6 en cada chat/respuesta/tarea: no confirmaciones rutinarias. Mantén diseñado/implementado/probado/aceptado separados y porcentajes solo en docs/avance.md. Usa CI como validación principal; diagnóstico local dirigido y hooks obligatorios. Relee finales, comprueba enlaces/diff/ignorados, commit/push y SHA real. No elimines archivos o ramas sin confirmación.
