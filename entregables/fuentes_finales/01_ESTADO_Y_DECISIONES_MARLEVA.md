# Marleva: estado y decisiones

Fecha: 13-10-2026 America/Merida. Historial por Git, sin versiones documentales manuales. MAR-CHAT-004 abierto; M1 incompleta.

Reglas [00](00_GUIA_PRINCIPAL_MARLEVA.md), diseño [02](02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md), evidencia [03](03_REFERENTES_Y_EVIDENCIA_MARLEVA.md); [entrada de lectura](../../README.md).

## 1. Decisiones confirmadas


| ID | Decisión | Fuente y límite |
|---|---|---|
| C01 | Nombre Marleva; comunidad de siete desarrollos; oferentes miembros, aunque tengan negocio fuera | Contexto original, instrucciones del proyecto y solicitud inicial de esta conversación. |
| C02 | Registro e inicio sin contraseña | Solicitud inicial y AGENTS.md vigente. Canal, método y proveedor sin elegir. |
| C03 | Catálogo, pedidos internos, compra directa y servicios con cotización | Solicitud inicial y AGENTS.md. Reglas operativas detalladas por cerrar. |
| C04 | Pagos online y efectivo; entrega/recogida por oferentes inicialmente | Solicitud inicial y AGENTS.md. No confirma pasarela, esquema de liquidación ni reparto de Marleva. |
| C05 | Cobertura limitada, validación y moderación; domicilio particular no público | Principios y enfoque comunitario. Polígonos exactos no validados. |
| C06 | Ingresos y rentabilidad como objetivos obligatorios; sin tarifas aprobadas | Instrucciones del usuario. Política de cobro C17–C19 confirmada y revisable; no hay tarifas ni resultados comerciales confirmados. |
| C07 | Frontend/backend separados; desarrollo local primero | Instrucciones del proyecto. Stack y cloud anteriores propuestos. |
| C08 | Diseño integral antes del código; reglas de lenguaje, evidencia y cierre de chats | Mensajes explícitos del usuario en esta conversación. |
| C09 | Cualquiera puede explorar; solo vecinos compran y ofrecen | Confirmación original recuperada el 12-10-2026 del chat «Marleva: alcance y diseño integral de MVP1”», ID técnico 01a1319c-2409-72a3-877e-5fd9ad582cc2: respuesta explícita del usuario a exploración pública y compra/oferta solo vecinal. No reabrir sin motivo; B2 define la comprobación. |
| C10 | Consolidar fuentes, leer todo en orden desde la raíz, releer archivos finales y actualizar solo cuando sea necesario | Última solicitud del usuario en esta conversación. |
| C11 (B2-A) | Vecino es residente actual de uno de los siete desarrollos, incluidos inquilinos y familiares; aplica a compradores y oferentes | Usuario: «Sí: residentes actuales», respuesta del 12-10-2026 en MAR-CHAT-002. No incorpora propietarios no residentes. |
| C12 (B2-B) | Revisión manual por operador autorizado; comprobante de hasta tres meses con datos innecesarios ocultos; constancia de convivencia si no está a nombre del solicitante; sin INE/selfie por defecto; corrección de rechazo en misma solicitud | Usuario: «Sí, este procedimiento», respuesta del 12-10-2026 en MAR-CHAT-002. No aprueba retención ni todo el diseño integral. |
| C13 (B2-C) | Catálogo inicial y exclusiones concretas de B2-C en 02; ofertas dudosas pendientes de revisión | Usuario: «Sí, este límite inicial», 12-10-2026. No aprueba ampliar giros ni declara cumplimiento de oferentes. |
| C14 (B2-D) | Adjuntos de domicilio/convivencia privados; borrado a los 30 días de resolución final no impugnada; registro mínimo; excepción por causa legal o controversia documentada | Usuario: «Sí, borrar esos documentos a los 30 días», tras aclarar cuáles documentos, 12-10-2026. No aplica a comprobantes de pago; aviso, calendario legal y backups antes de datos reales. |
| C15 (B3) | Código de un solo uso por correo; avisos en cuenta y mismo correo; recuperación mediante buzón original; sin transferencia de cuenta por comprobante de residencia | Usuario: «Sí: código por correo y este límite», 12-10-2026. Se acepta que sin recuperar definitivamente el buzón no se garantiza misma cuenta. No elige proveedor ni gasto. |
| C16 (B4; P05/P06) | Un oferente por pedido; compra directa de productos a precio fijo; servicios con cotización separada; sin sustitución automática ni aceptación parcial; rechazo completo y nueva aceptación ante cambios | Usuario: «Sí, estos límites de pedido», 12-10-2026. Los plazos rutinarios de 02 son decisiones documentales del asistente dentro del encargo, no promesas de operación probadas. |
| C17 (B5, patrón online) | Un cobro online por pedido mediante pasarela; comisión Marleva separada del procesamiento que soporta el oferente; depósitos agrupados por oferente, preferentemente semanales si el proveedor permite; comisión ganada al completar | Usuario: «Sí, adoptar este patrón», 12-10-2026. No aprueba porcentaje, proveedor, impuestos, base de comisión, momento exacto del cobro o control de deuda en efectivo; sin autorización de cobros reales. |
| C18 (B5, vigente y revisable) | Cobro online total tras aceptar y antes de preparar/atender; comisión al oferente sobre productos/servicio sin entrega; sin suscripción ni tarifa al comprador inicial | Usuario confirmó opción 1 y pidió posibilidad de revisarla después, 12-10-2026. Regla vigente para diseño, revisable por instrucción o análisis posterior; sin porcentaje ni activación. |
| C19 (B5 efectivo, vigente y revisable) | Comisión por pedido completado; corte semanal, transferencia agrupada, 72 h para pagar; aviso y pausa solo de pedidos nuevos en efectivo ante deuda vencida no disputada; pedidos abiertos/ayuda conservados | Usuario confirmó opción 1 y pidió análisis/revisión posterior, 12-10-2026. Tope monetario con tarifa antes del piloto; sin cargos automáticos a tarjeta. |
| C20 (B6 costos, vigente y revisable) | Reembolso procedente sin descuentos ocultos al comprador; costo de pasarela no recuperado al oferente si cancela/incumple o comprador cancela antes de inicio; a Marleva por error propio | Usuario: «Sí, esta distribución revisable», 12-10-2026. Verificar contrato/cuotas de proveedor antes de operar; no garantía de cero pérdida. No aprueba política de cancelación/cierre. |
| C21 (B6, vigente y revisable) | Devolución completa antes de iniciar preparación/atención; revisión manual después, respetando derechos y sin multas automáticas. Productos: código privado al entregar/recoger o confirmación del comprador. Servicios: confirmación del comprador. Ausencia/discrepancia a operador; sin cierre por silencio | Usuario: «Sí, adoptar esta política revisable», 12-10-2026 en MAR-CHAT-002. No modifica C20 ni aprueba tarifas, proveedor o operación real. |
| C22 (B7, base de datos) | PostgreSQL como motor central de MVP1; requisito del usuario de facilitar su sustitución futura | Usuario: «Ok, decidido Postesql, con posibilidad de cambiarlo facilmente», 12-10-2026. Se registra PostgreSQL. El asistente concreta portabilidad en02 y aclara que cambiar hosting es distinto de cambiar motor: este último requiere migración, adaptación y pruebas, sin garantizar cambio automático. No confirma Nest, cliente móvil, proveedor, gasto o programación. |
| C23 (B7, backend) | NestJS + TypeScript para API separada y backend modular de MVP1, con PostgreSQL C22 | Usuario: «si, vamos por ese», respuesta del 12-10-2026 a pregunta específica sobre NestJS + TypeScript. No confirma React Native/Expo, proveedor, versión exacta, gasto o desarrollo. |
| C24 (B7, cliente) | React Native + Expo + TypeScript para cliente compartido Android/iOS/web, con API NestJS separada y PostgreSQL | Usuario: «Ok, dale!», tras evaluación de arquitectura y recomendación concreta. No aprueba proveedor, exclusiones pendientes, gasto, publicación o programación; se conserva encargo documental. |
| C25 (línea base funcional) | Límite inicial revisable M1–M10 y exclusiones de sección1 de02; Android/iOS/web compartidos incluidos | Usuario: «Sí, confirmar este límite inicial». No autoriza código ni operación real; Stripe no confirmado: pide comparación con Mercado Pago antes. |
| C26 (B7, referencia de pagos) | Stripe Connect como referencia documental revisable para integración de pagos; cobros directos al oferente y comisión separada, depósitos agrupados cuando permitido | Usuario: «si», a pregunta final específica después de comparar Stripe/Mercado Pago. No contratación, cuentas, elegibilidad, tarifas o cobros reales aprobados. Integración sustituible; antes de operar verificar contrato/costos/saldos mexicanos. |

No presentar aprobación de toda una tabla de diseño por aprobación de una capacidad. Cambios futuros: guardar fecha, quién decidió, fuente, motivo, consecuencia y condición de revisión en este registro.

## 2. Autorizaciones y límites

A0 confirmada explícitamente el 12-10-2026: herramientas gratuitas elegibles/dependencias/imágenes/servicios y construcción/pruebas base/M1 web/Android/iOS, datos ficticios/simulador aislado. SDK Android/licencia autorizados. No volver a pedirlos. Xcode27.0 instalado y seleccionado; comprobación inicial pasó el13-10. Solo iPhone físico; simuladores aún sin runtime. No cuentas externas, gasto, publicación, contratos, contactos, cobros ni datos/dinero reales. C01–C26 vigentes; siete desarrollos/domicilio privado/demografía pausada. M2–M10 completos fuera de esta etapa; M6 simulado con pedidos después.

Antes de operación real: tarifas/topes/fiscalidad/proveedor elegible/contratos/costos/saldos, privacidad/calendarios/backups, operadores/soporte y pruebas. Stripe referencia revisable; cambiar motor requiere migración/adaptación/pruebas. Diseño visual no aprobado; procesos antes de propuesta/pantallas.

## 3. Estado actual y dependencias

| Área | Hecho | Pendiente |
|---|---|---|
| Git | Único en raíz; respaldo 7a0ec5a antes de cleanup; sin remoto/push | Commits por incremento, no copias documentales |
| Base | Proyecto en marleva-local/repositorio; Node24.21/pnpm12.11.2 propios/lockfile | Arranque y builds tras traslado; servicios de negocio detenidos |
| Arquitectura | Nest modular por capas objetivo; cliente Expo separado | AccountService/controller/cliente monolíticos, DTO/repositorios/refactor |
| Datos/API | DATA001 físico de 8 tablas; DATA002 objetivo de 13 tablas; 14 API actuales, recuperación de 7 operaciones objetivo, B09 de tres operaciones objetivo | Cotejo DB/Prisma, migración aislada, autorización/concurrencia, avisos/cursor |
| Pruebas |10 SQL114–123 pasaron en PG17 aislado; typecheck API/cliente y 9 unitarias pasaron | Línea base previa: 10 errores de lint y 31 archivos de formato; integración completa/performance/plataformas |
| B12 | Procedimiento/SEQ013/matriz con 10 casos diseñados | Ensayo recuperación/repetibilidad no ejecutado |
| Móviles | APK inicial anterior compiló/instaló; recorrido Metro falló, recompilación interrumpida | Android/iOS completos, Safari/accesibilidad/físicos; web no equivale |

Cola única en [protocolo](../../marleva-local/repositorio/docs/proceso/PROCESO_DESARROLLO_MARLEVA.md), casos en [matriz M1](../../marleva-local/repositorio/docs/proceso/MATRIZ_CASOS_M1.md), ensayo [B12](../../marleva-local/repositorio/docs/proceso/RECUPERACION_B12_M1.md). No duplicar cola ni acreditar sintaxis como operación. Evidencias históricas anteriores al traslado no describen estado vivo.

## 4. Acceso, lectura y limpieza

Fuentes canónicas editables en entregables/fuentes_finales; sources/ y AGENTS raíz son referencias sincronizadas readonly preservadas y versionadas, excepción de duplicación no conjunto activo. No subida a Fuentes ni remoto. ZIP/antecedentes editables redundantes retirados después de respaldo 7a0ec5a, recuperables por Git; funciones en 00–03. JSON API único derivado en packages/contracts/openapi.json. Migraciones/DDL/modelo físico frente objetivo y actas de corridas distintas no son duplicados; conservar diferencias y fallos.

Originales ausentes: enfoque/arquitectura/informe como archivos, investigación pública/comercial, planos/auditoría geoespacial. Informe conservado en 03 no es nueva verificación; contexto/plan antecedentes recuperables en Git. No historial remoto completo ni ejemplos DBML/YAML accesibles. Inventario distingue lectura real/metadatos/categorías excluidas; no afirmar lectura de dependencias/binarios.

Continuación programada continuar-marleva-base-m1 cada hora en mismo chat; no proceso permanente ni primera ejecución acreditada. Turno finalizado no sigue ejecutando. Informar avances reales durante ejecución, resolver fallos y continuar independientes; no aprobación por silencio.

Entorno cambió durante cleanup: git/python lanzadores Apple requieren licencia Xcode no aceptada. Git/Python CommandLineTools independientes funcionan; se usan para esta tarea sin aceptar licencia por usuario. Xcode/build iOS/licencia siguen por comprobar; la consulta previa de ausencia en Applications es histórica.

## 5. Registro de chats


| ID | Tema | Fecha y estado |
|---|---|---|
| MAR-CHAT-001 | Principios, referencias y organización final de fuentes | Actualizado y cerrado documentalmente el 12 de octubre de 2026. Fecha original de apertura no registrada. |
| MAR-CHAT-002 | Alcance y diseño integral de MVP1 | Apertura estándar aquí: 12-10-2026, 14:05 America/Merida (hora de primera comprobación). Cerrado documentalmente el 12-10-2026, 17:43 America/Merida. El antecedente del mismo tema no consignó ID ni apertura estándar; se conserva su trabajo y no se inventa fecha anterior. |
| MAR-CHAT-003 | Preparación de la implementación local de MVP1 | Abierto y cerrado documentalmente el12-10-2026 America/Merida. Primera hora comprobada del trabajo17:45:50; hora exacta de ficha no registrada. No desarrollo autorizado. |
| MAR-CHAT-004 | Desarrollo local de base/M1, sujeto a autorización | Abierto el 12-10-2026 America/Merida; primera comprobación 17:54:24. En curso; A0 autorizado por confirmación explícita del usuario; revisión documental y ejecución parcial; servicios detenidos. |

## 6. Lista para después

Reparto propio, favoritos/reseñas/promociones/referidos, IA/mapas/chat general, monedero/crédito/agenda automática y apps Swift/Kotlin independientes: fuera del límite inicial C25. No incorporarlos por rutina.

## 7. Continuidad y prompt completo

004 abierto, sin FIN ni 005. Para nuevo chat comprobar ID disponible y adaptar objetivo/primer paso; toda lectura/Git/pruebas/límites se conserva.

```text
PROYECTO: Marleva
CHAT: MAR-CHAT-004; CONTINUACIÓN, abierto. ANTERIOR: MAR-CHAT-003.
TEMA: base/M1 local autorizada, documentación y pruebas integradas.
FECHA: comprobar fecha real America/Merida.
RAÍZ GIT: /Users/andresramos/.codex/.chatgpt-projects/g-p-6ac952169b2081918f82b73968bd9d1a
OBJETIVO: continuar por la cola del protocolo hasta verificar base/M1; no cerrar por anuncios.
ESTADO: C01–C26 vigentes, A0 y SDK Android/licencia autorizados. Git único en raíz con commits locales, sin remoto. Fuentes editables estables en entregables/fuentes_finales; código en marleva-local/repositorio. Sources/AGENTS raíz sincronizados de solo lectura. Herramientas y lockfile propios; servicios de negocio detenidos. M1 incompleta; contratos de avisos/cursor, migración objetivo, refactor y pruebas integradas pendientes. DATA001 físico y DATA002 objetivo son estados distintos. B09/recuperación MFA son contratos objetivo; B12 es plan no ejecutado. Solo iPhone físico; Xcode27.0 instalado/seleccionado y comprobación inicial pasada; runtimes/simuladores vacíos, builds/iOS físico y Android físico pendientes.

1. Comprueba acceso y estado Git; lee README raíz, instrucciones del usuario y AGENTS aplicables.
2. Lee completas y en orden las cuatro fuentes en entregables/fuentes_finales: 00_GUIA_PRINCIPAL_MARLEVA.md, 01_ESTADO_Y_DECISIONES_MARLEVA.md, 02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md, 03_REFERENTES_Y_EVIDENCIA_MARLEVA.md.
3. Inventaría desde raíz y lee restantes archivos propios accesibles, incluidos nuevos/modificados, por ruta/nombre. Declara lectura parcial/faltantes; no reconstruyas originales ni declares lectura de resúmenes, secretos o dependencias.
4. Lee AGENTS del código, docs/proceso/PROCESO_DESARROLLO_MARLEVA.md y MATRIZ_CASOS_M1.md; después UC/SEQ/pasos, DBML/DDL, YAML/Swagger y pruebas del caso activo. B09/B12 según enlaces de matriz.
5. Conserva autorizaciones y límites. Solo base/M1, PostgreSQL17, Supabase local/Auth/Storage, Prisma7, correo/HTTPS, fixtures y simulador aislado. Siete desarrollos, domicilio privado, demografía pausada. No cuentas externas, gasto, publicación, contratación, contacto, cobros, datos/dinero reales ni M2–M10 completos. Stripe referencia revisable; M6 simulado con pedidos en etapa posterior. Cambiar motor exige migración/pruebas. Tarifas/topes/fiscalidad/proveedor/privacidad/calendarios/operadores siguen pendientes antes de operación real.
6. Ejecuta una tarea por dependencia: reglas/estados/errores/SEQ/datos/API/pruebas coherentes antes del código; luego incremento integrado. Revisión visual antes de modificar pantallas. No reabrir acuerdos por rutina ni repetir autorización A0/SDK.
7. Cada cambio back/front: unitarias, integración de casos necesarios, performance proporcional, negativos/permisos/concurrencia/caídas, accesibilidad y regresión. Guardar evidencia con versiones/dataset/plataforma/esperado/obtenido/fallos; no mocks como integración real ni web/Expo Go como builds Android/iOS.
8. Git único: un archivo estable por función, historial en commits; sin copias vN/fechas/ZIP de rutina. Derivados desde fuente, migraciones aplicadas inmutables. Ignorar secretos/dependencias/cachés/builds. Releer finales completos, comprobar enlaces/diff/ignorados, actualizar solo afectados y guardar commit local por incremento coherente.
9. Informa avance real al menos cada 60 segundos durante ejecución. No confundir chat abierto, turno terminado o programación horaria con proceso continuo. Resuelve fallos y continúa tareas independientes; detener solo por pausa, decisión material o permiso/bloqueo extraordinario. Silencio no es aprobación.
10. Entrega ubicación, SHA Git, acceso y subida real. Completar M1 solo tras 02 §16.4 y plataformas exigidas comprobadas; físicos pendientes no se acreditan. Usa plantillas00: INICIO una vez, CONTINUACIÓN al retomar, FIN solo cierre real con registro01 y prompt completo revisado. Para siguiente chat comprobar ID, no asignar005 por rutina; conservar este proceso y ajustar objetivo/estado/primer paso.

PRIMER PASO: comprobar última limpieza y Git; continuar contratos/ramas pendientes de M1 según la cola, sin nuevas pantallas ni M2.
ENTREGABLES: incremento comprobado, fuentes afectadas, pruebas/fallos y continuidad; sin resultados o aprobaciones inventados.
```

## 8. Resultado de cleanup

Solicitud del usuario13-10: todo Git, archivo único por función, pasos/lectura/prompts simples y avance visible. Historial antiguo del estado y lecturas se conserva en 7a0ec5a, no repetido aquí. Fuentes/instrucciones/código bajo Git local; Git es historial. Cleanup no acredita M1 ni pruebas nuevas de negocio. SHA final/verificaciones en entrega.

Verificación del cleanup: generación DBML/DDL y YAML/JSON/Swagger válida; contratos/tipos generados y typecheck API/cliente pasaron. ESLint del generador modificado pasó; no nueva prueba de negocio/integración/performance. Derivados existentes conservan contenido, no reaparece JSON duplicado ni se sobrescribe índiceAPI. Eliminados31archivos redundantes/reservas; recuperables en7a0ec5a. Secretos/dependencias/builds ignorados, originales sincronizados intactos. Acta en tests/results/cleanup-git.json; Git conserva historial, no nuevo paqueteZIP. Descriptor comercial/marca/dominio/cuentas siguen propuestos o no verificados.

## 9. Revisión tras interrupción por créditos —13-10-2026

Git comprobado: el corte dejó limpieza staged/modificada, sin commit final; solo7a0ec5a existía. No describir limpieza como finalizada hasta guardar y comprobar el commit.

Xcode actual: /Applications/Xcode.app/Contents/Developer, versión27.0/build27A266a. xcodebuild -checkFirstLaunchStatus exit0; simctl list runtimes/devices available exit0 conlistas vacías después de permiso de entorno. Primera consulta simctl falló por sandbox, no por ausencia comprobada deXcode. No descargar runtimes ni acreditar build/recorrido físico por esta consulta. La dependencia previa de licencia bloqueando herramientas es histórica, superada por comprobación inicial actual; no afirmar revisión legal de términos.

M1 significa acceso y cuenta. Código comprobado delega OTP/verifyOtp/refreshSession/updateUser yMFA a @supabase/supabase-js; no genera motor de identidad propio. APIMarleva conserva permisos por recurso, sesiones/revocación propias y coordinación de avisos. Usuario solicita reducir retrabajo/delegar; revisar qué controles propios son necesarios antes de continuar refactor, sin eliminarlos a ciegas.

Google es alternativa/propuesta, no aprobación de cambioC15 ni autorización de cuentas externas. [Supabase Google](https://supabase.com/docs/guides/auth/social-login/auth-google) documenta web/nativo/Expo y configuraciónGoogleCloud/OAuth conclientID/secret/callback; [correo sin contraseña](https://supabase.com/docs/guides/auth/auth-email-passwordless) ya cubreOTP. Consulta puntual, no proveedor productivo contratado. Propuesta: mantener SupabaseAuth, reducir capa propia a requisitos necesarios y evaluar Google adicional sin excluir correo/noGoogle. Sustituir método/recuperación requiere decisión del usuario y coherencia contratos/datos/pruebas.

Para cerrar el tema de orden/documentación de004: (1) commit de limpieza e inventario/enlaces comprobados; (2) registrar decisión o pendiente explícito de estrategia de acceso y entregar prompt de005 para implementación/pruebas con alcance intacto. No esperar M1 completa para cerrar un chat de preparación/corrección; tampoco presentar el cierre delchat comoM1terminada. M1 restante: contratos/ramas, migración/refactor integrado, pruebas de seguridad/concurrencia/caídas/avisos/archivos/recuperación/performance, builds/plataformas/accesibilidad y restauración/repetibilidad. No porcentaje ni fecha fiable sin cerrar estrategia y comprobar estas dependencias.
