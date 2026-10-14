# Marleva: estado y decisiones

Fecha: 14-10-2026 America/Merida. Historial por Git, sin versiones documentales manuales. MAR-CHAT-004 cerrado documentalmente el13-10-2026 America/Merida,14:25. Base/M1 incompleta; MAR-CHAT-005 continúa con incrementos locales UC008, B09, cuota OTP y Android emulado.

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

### TO DO de alta prioridad: MAR-TODO-AUTH-001

Estado: PENDIENTE. Prioridad: ALTA. Usuario confirma el13-10-2026 dejar pendiente la estrategia de acceso como TO DO; no aprueba implementación de Google ni sustituir C15.

Acción: evaluar inicio con Google mediante Supabase y revisar qué lógica propia de autenticación puede reducirse usando capacidades existentes del proveedor. Comparar correo vigente frente a Google adicional, vinculación de cuentas, recuperación, permisos, web/Android/iOS, requisitos externos y pruebas. Responsable del análisis: asistente; decisión material del método: usuario. No crear cuentas ni configurar credenciales externas por este registro.

Salida: recomendación concreta, cambios necesarios en secuencias/contratos/datos/pruebas y decisión registrada antes de implementar el cambio. Revisar antes del refactor de autenticación que dependa de esa estrategia. Mantener C15 vigente mientras tanto y continuar tareas independientes; este TO DO no bloquea el cierre documental del chat ni implica M1 completa. No duplicarlo en listas paralelas.

| Área | Hecho | Pendiente |
|---|---|---|
| Git | Único en raíz; respaldo 7a0ec5a antes de cleanup; sin remoto/push | Commits por incremento, no copias documentales |
| Base | Arranque005 comprobado en marleva-m1/red marleva-private; Node24.21.0/pnpm12.11.2; puertoslocalhost | Repetibilidad/restauración y builds nativos pendientes |
| Arquitectura | UC008 extraído: controller/query/casos/puertos/reglas/repositorios/SMTP; cliente separado | Resto AccountService/cliente y arquitectura M1 todavía parciales |
| Datos/API | DATA001: 11 tablas de negocio; DATA002: 13 objetivo. API canónica 0.4.0: 17 operaciones, incluido cursor y B09 aplicado | Recovery: 7 operaciones objetivo. Retención, roles y autorización restantes pendientes |
| Pruebas | Actas005 notices/files/otp: unitarias/SQL/API/SMTP/mediciones parciales; typecheck API/cliente, Chrome y recorrido básico Android pasaron | Lint global falló con8errores en medición anterior; dos variables corregidas después, sin nueva aprobación global. Visual/Safari/iOS/físicos/recuperación y cobertura completa pendientes |
| B12 | Procedimiento/SEQ013/matriz con 10 casos diseñados | Ensayo recuperación/repetibilidad no ejecutado |
| Móviles | APK debug ARM64 recompilado y recorrido Android API36 a1080×1920 pasó14-10; actas android-build/test | Otros flujos Android,320×640, iOS/accesibilidad/físicos; emulador no equivale a físico |

Cola única en [protocolo](../../marleva-local/repositorio/docs/proceso/PROCESO_DESARROLLO_MARLEVA.md), casos en [matriz M1](../../marleva-local/repositorio/docs/proceso/MATRIZ_CASOS_M1.md), ensayo [B12](../../marleva-local/repositorio/docs/proceso/RECUPERACION_B12_M1.md). No duplicar cola ni acreditar sintaxis como operación. Evidencias históricas anteriores al traslado no describen estado vivo.

## 4. Acceso, lectura y limpieza

Fuentes canónicas editables en entregables/fuentes_finales; sources/ y AGENTS raíz son referencias sincronizadas readonly preservadas y versionadas, excepción de duplicación no conjunto activo. No subida a Fuentes ni remoto. ZIP/antecedentes editables redundantes retirados después de respaldo 7a0ec5a, recuperables por Git; funciones en 00–03. JSON API único derivado en packages/contracts/openapi.json. Migraciones/DDL/modelo físico frente objetivo y actas de corridas distintas no son duplicados; conservar diferencias y fallos.

Originales ausentes: enfoque/arquitectura/informe como archivos, investigación pública/comercial, planos/auditoría geoespacial. Informe conservado en 03 no es nueva verificación; contexto/plan antecedentes recuperables en Git. No historial remoto completo ni ejemplos DBML/YAML accesibles. Inventario distingue lectura real/metadatos/categorías excluidas; no afirmar lectura de dependencias/binarios.

Antecedente de004: continuación programada continuar-marleva-base-m1, después desactivada al cierre. No hay automatización005 ni ejecución permanente. Turno finalizado no sigue ejecutando. Informar avances reales durante ejecución, resolver fallos y continuar independientes; no aprobación por silencio.

Antecedente del cleanup, superado por comprobación de Xcode en§9: entorno cambió durante cleanup: git/python lanzadores Apple requieren licencia Xcode no aceptada. Git/Python CommandLineTools independientes funcionan; se usan para esta tarea sin aceptar licencia por usuario. Xcode/build iOS/licencia siguen por comprobar; la consulta previa de ausencia en Applications es histórica.

## 5. Registro de chats


| ID | Tema | Fecha y estado |
|---|---|---|
| MAR-CHAT-001 | Principios, referencias y organización final de fuentes | Actualizado y cerrado documentalmente el 12 de octubre de 2026. Fecha original de apertura no registrada. |
| MAR-CHAT-002 | Alcance y diseño integral de MVP1 | Apertura estándar aquí: 12-10-2026, 14:05 America/Merida (hora de primera comprobación). Cerrado documentalmente el 12-10-2026, 17:43 America/Merida. El antecedente del mismo tema no consignó ID ni apertura estándar; se conserva su trabajo y no se inventa fecha anterior. |
| MAR-CHAT-003 | Preparación de la implementación local de MVP1 | Abierto y cerrado documentalmente el12-10-2026 America/Merida. Primera hora comprobada del trabajo17:45:50; hora exacta de ficha no registrada. No desarrollo autorizado. |
| MAR-CHAT-004 | Desarrollo local de base/M1, sujeto a autorización | Abierto el 12-10-2026 America/Merida; primera comprobación17:54:24. Cerrado documentalmente13-10-2026,14:25; commit538c351 comprobado en005. Base/M1 incompleta; A0 vigente. |
| MAR-CHAT-005 | Implementación integrada y pruebas de base/M1 | CONTINUACIÓN14-10-2026 America/Merida tras créditos. Incrementos UC008/B09/cuota OTP/Android emulado; permanece abierto, no M1 completa. |

## 6. Lista para después

Reparto propio, favoritos/reseñas/promociones/referidos, IA/mapas/chat general, monedero/crédito/agenda automática y apps Swift/Kotlin independientes: fuera del límite inicial C25. No incorporarlos por rutina.

## 7. Continuidad y prompt completo

004 cerrado documentalmente, confirmado por HEAD inicial538c351;005 continúa por solicitud expresa del usuario y referencia recuperada. Título: Marleva — implementación integrada y pruebas de base/M1. Conservar autorizaciones y pendientes; cierre no acredita M1 completa.

```text
PROYECTO: Marleva
CHAT: MAR-CHAT-005; CONTINUACIÓN, conservar ID y comprobar registro. ANTERIOR: MAR-CHAT-004.
TEMA: Implementación integrada y pruebas de base/M1.
FECHA: registrar fecha real America/Merida.
RAÍZ: /Users/andresramos/.codex/.chatgpt-projects/g-p-6ac952169b2081918f82b73968bd9d1a

1. Comprueba acceso y Git. Lee instrucciones del usuario, README raíz y AGENTS aplicables; después completas y en orden las fuentes estables en entregables/fuentes_finales: 00_GUIA_PRINCIPAL_MARLEVA.md, 01_ESTADO_Y_DECISIONES_MARLEVA.md, 02_MVP1_ALCANCE_Y_DISENO_MARLEVA.md, 03_REFERENTES_Y_EVIDENCIA_MARLEVA.md.
2. Inventaría desde raíz y lee restantes archivos propios accesibles/nuevos/modificados por ruta/nombre. Declara faltantes o lectura parcial; no reconstruyas originales ni afirmes lectura de resúmenes, secretos o dependencias.
3. Lee AGENTS del código y docs/proceso/PROCESO_DESARROLLO_MARLEVA.md y MATRIZ_CASOS_M1.md dentro de marleva-local/repositorio; luego UC/SEQ/pasos, DBML/DDL, YAML/Swagger y pruebas del caso. Documentación coherente antes del código; revisión visual antes de pantallas.
4. C01–C26, desarrollo local A0 y SDKAndroid/licencia autorizados: conservar, no volver a pedirlos. M1 significa acceso/cuenta, sigue incompleta. Supabase ya gestiona OTP, renovación y MFA; no reconstruir autenticación existente. MAR-TODO-AUTH-001 pendiente de ALTA prioridad: evaluar Google/Supabase y reducción de lógica propia; implementación no aprobada. Dejarlo pendiente y avanzar independientes; no refactor dependiente sin cerrar estrategia.
5. Git único en raíz, nombres estables, un archivo por función e historial por commits; sin copias vN/fechas/ZIP. Commits72b79a8 limpieza y76b34b5 TO DO; comprobar HEAD actual. Sources/AGENTS raíz sincronizados readonly; no modificar. Derivados desde fuente; migraciones aplicadas inmutables; secretos/dependencias/cachés/builds ignorados. No remoto/subida acreditados.
6. Código/herramientas propios en marleva-local/repositorio. Arranque005 comprobado conpuertoslocalhost; comprobar estado vivo antes de usar, no asumir servicios activos. DATA001 físico11tablas yDATA002 objetivo13 no intercambiables. API17parciales conAPI009cursor yB09tresoperaciones implementadas, recuperación7objetivo; B12plan noejecutado. Actas005 describenunitarias,integración real,SMTP,SQL ymedición aislada; no cobertura completa. Xcode27.0/build27A266a instalado/seleccionado ycomprobación inicial pasada; runtimes/simuladores vacíos. Solo iPhone físico, Android físico pendiente. No acreditar nativo conweb/ExpoGo.
7. Primer paso: comprobar el commit/actas005 y los archivos nuevos/modificados. UC008 cursor yworker tienen incremento local comprobado; no repetir sin cambios. B09 tiene migración/adaptador/API probados; comprobar commit y actas files-*.json sin repetir casos sin cambios. Continuar recuperación MFA y B12 por dependencias; mantener estrategia Google/Supabase pendiente. El refactor que dependa de la estrategia de acceso permanece pendiente por MAR-TODO-AUTH-001; la revisión documental de Recovery puede continuar. No inferir aprobación. Después entorno/pruebas restantes ypropuesta visual revisable; no nuevaspantallas sin revisión ni nuevosmódulos. Cada cambio back/front: unitarias, integración, negativos/permisos/concurrencia/caídas, performance proporcional, accesibilidad y regresión; registrar versiones/dataset/plataforma/esperado/obtenido/fallos. Restauración/repetibilidad y web/Android/iOS exigidos en02 §16.4 antes de M1 completa.
8. Solo fixtures, PostgreSQL17, Supabase local/Auth/Storage, Prisma7, correo/HTTPS ysimulador aislado. Siete desarrollos, domicilio privado, demografía pausada. Sin cuentas externas,gasto,publicación,contratación,contactos,cobros,datos/dinero reales ni M2–M10 completos. Stripe referencia revisable; M6simulado conpedidos después. Cambiar motor exige migración/pruebas; tarifas/topes/fiscalidad/proveedor/privacidad/calendarios/operadores pendientes antes de operación real.
9. Continúa tareas ordinarias por dependencia sin esperar confirmaciones; resuelve fallos y avanza independientes. Detén solo acción afectada por pausa,decisión material o permiso/bloqueo extraordinario. Informa avances reales almenos cada60segundos durante ejecución; chat abierto/turno terminado/programación horaria no equivalen a actividad continua. No silencio como aprobación.
10. Aplica00 §13: revisar README al inicio/fin de proceso/chat, instructivo con capturas reales/revisión local, porcentaje por módulo con criterios/evidencia y commit final claro. Sin remoto por elección del usuario: verificar commits, no pull/push. Flyway/PDM/Sonar siguen en evaluación, un dueño por esquema y migraciones inmutables. Relee finales completos, comprueba enlaces/diff/ignorados, actualiza solo fuentes afectadas y guarda commit local por incremento. Entrega ubicación,SHA,acceso/subida real ypendientes. Usa plantillas00: INICIO una vez, CONTINUACIÓN alretomar, FIN solo cierre real; registro01 yprompt completo revisado. No inventes resultados ni amplíes MVP1.

ENTREGABLES: incremento integrado comprobado y evidencia por caso02 §16.4; fallos/límites/pendientes físicos explícitos. La continuidad horaria del004 quedó desactivada al cerrarlo; no hay automatización005 creada ni acceso futuro garantizado.
```

## 8. Resultado de cleanup

Solicitud del usuario13-10: todo Git, archivo único por función, pasos/lectura/prompts simples y avance visible. Historial antiguo del estado y lecturas se conserva en 7a0ec5a, no repetido aquí. Fuentes/instrucciones/código bajo Git local; Git es historial. Cleanup no acredita M1 ni pruebas nuevas de negocio. SHA final/verificaciones en entrega.

Verificación del cleanup: generación DBML/DDL y YAML/JSON/Swagger válida; contratos/tipos generados y typecheck API/cliente pasaron. ESLint del generador modificado pasó; no nueva prueba de negocio/integración/performance. Derivados existentes conservan contenido, no reaparece JSON duplicado ni se sobrescribe índiceAPI. Eliminados31archivos redundantes/reservas; recuperables en7a0ec5a. Secretos/dependencias/builds ignorados, originales sincronizados intactos. Acta en tests/results/cleanup-git.json; Git conserva historial, no nuevo paqueteZIP. Descriptor comercial/marca/dominio/cuentas siguen propuestos o no verificados.

## 9. Revisión tras interrupción por créditos —13-10-2026

Git comprobado: el corte dejó limpieza staged/modificada, sin commit final; solo7a0ec5a existía. No describir limpieza como finalizada hasta guardar y comprobar el commit.

Xcode actual: /Applications/Xcode.app/Contents/Developer, versión27.0/build27A266a. xcodebuild -checkFirstLaunchStatus exit0; simctl list runtimes/devices available exit0 conlistas vacías después de permiso de entorno. Primera consulta simctl falló por sandbox, no por ausencia comprobada deXcode. No descargar runtimes ni acreditar build/recorrido físico por esta consulta. La dependencia previa de licencia bloqueando herramientas es histórica, superada por comprobación inicial actual; no afirmar revisión legal de términos.

M1 significa acceso y cuenta. Código comprobado delega OTP/verifyOtp/refreshSession/updateUser yMFA a @supabase/supabase-js; no genera motor de identidad propio. APIMarleva conserva permisos por recurso, sesiones/revocación propias y coordinación de avisos. Usuario solicita reducir retrabajo/delegar; revisar qué controles propios son necesarios antes de continuar refactor, sin eliminarlos a ciegas.

Google es alternativa/propuesta, no aprobación de cambioC15 ni autorización de cuentas externas. [Supabase Google](https://supabase.com/docs/guides/auth/social-login/auth-google) documenta web/nativo/Expo y configuraciónGoogleCloud/OAuth conclientID/secret/callback; [correo sin contraseña](https://supabase.com/docs/guides/auth/auth-email-passwordless) ya cubreOTP. Consulta puntual, no proveedor productivo contratado. Propuesta: mantener SupabaseAuth, reducir capa propia a requisitos necesarios y evaluar Google adicional sin excluir correo/noGoogle. Sustituir método/recuperación requiere decisión del usuario y coherencia contratos/datos/pruebas.

Para cerrar el tema de orden/documentación de004: (1) commit de limpieza e inventario/enlaces comprobados; (2) pendiente de estrategia de acceso ya registrado como MAR-TODO-AUTH-001 de alta prioridad; entregar cierre y prompt de005 para implementación/pruebas con alcance intacto. No esperar M1 completa para cerrar un chat de preparación/corrección; tampoco presentar el cierre delchat comoM1terminada. M1 restante: contratos/ramas, migración/refactor integrado, pruebas de seguridad/concurrencia/caídas/avisos/archivos/recuperación/performance, builds/plataformas/accesibilidad y restauración/repetibilidad. No porcentaje ni fecha fiable sin cerrar estrategia y comprobar estas dependencias.

## 10. Cierre documental de004 —13-10-2026,14:25 America/Merida

Resultado: orden/lectura/proceso numerados, fuentes/instrucciones/código enGit único,31redundancias retiradas conhistorial preservado, prompt completo yTO DO prioritario registrados. Commits72b79a8/76b34b5 comprobados, árbol limpio antes de registrar cierre. Generación/contratos/tipado ylint delgenerador pasaron; originales preservados/enlaces locales comprobados. No nuevas pruebas de negocio/performance/builds/restauración. Base/M1 incompleta; se transfiere a005 propuesto, no chat creado.

Continuidad horaria continuar-marleva-base-m1 desactivada para estechat cerrado: herramienta confirmó PAUSED. No abandono de autorización niM1completa; no continuación005 automática creada. Archivos locales, sinsubida ni remoto. Estado/licenciaXcode anterior es histórico; datos actuales enapartado9. Siguiente paso: abrir005 conprompt anterior ycontinuar tareas independientes delTO DO.

## Incremento UC008 de 005 — resultado histórico anterior a B09

Motivo: continuar el encargo, primero con UC008, independiente de la estrategia de acceso. Acceso a raíz, HEAD inicial538c351 y cierre004 comprobados. README, AGENTS,00–03, protocolo y matriz leídos completos. La lectura general restante es parcial por volumen y formatos; registro por archivo en [inventario](../../marleva-local/repositorio/docs/proceso/inventario-auditoria.json). N no significa leído. Fuentes sincronizadas y antecedentes Git no acreditados completos; dependencias, herramientas, secretos y binarios de tercero excluidos. No se infiere contenido ausente. Los cambios sincronizados de AGENTS/sources ya existían al abrir y quedan fuera del commit propio.

| Estado | Resultado y límite |
|---|---|
| Diseñado | Query, cursor, ramas SMTP y lease trazados en SEQ008, matriz y YAML0.3.0 antes del código. |
| Implementado | API009 con página24/máximo50, cursor de cuenta con microsegundos e índice nuevo. Casos ListNotices y DeliverOutbox, puertos, repositorios y SMTP separados. OTP/Google no refactorizados. |
| Probado |16 unitarias;11 SQL en PG17 aislado, incluida migración sobre002 y rollback;12 API/Auth/PG/correo;4 integraciones de outbox y una medición proporcional del trabajador. Typecheck API/cliente, generación y lint/formato de archivos nuevos pasaron. No cobertura completa M1. |
| Rendimiento observado | Repositorio PG17:100 cuentas ficticias,34990 avisos,10/50/1000 por cuenta;10s de calentamiento y60s a1/5/10 consultas concurrentes. Cero errores/páginas incorrectas; p95 a5 entre1.62 y1.67ms. No incluye HTTP/Auth/frontend. CPU/RAM son muestras posteriores, no picos continuos. Trabajador:30 tareas ficticias, dos trabajadores y SMTP real; medición proporcional sin compromiso productivo. |
| Cliente | Chrome: regresión de acceso/cuenta/cookie/foco/salida pasó. Ninguna pantalla modificada. Botón de página siguiente, lectores, Safari y builds nativos no acreditados. |
| Calidad restante | Lint global8 errores previos fuera del incremento; formato general y separación completa todavía pendientes. No se apagaron reglas. |

Actas: [unitarias](../../marleva-local/repositorio/tests/results/notices-unit.json), [SQL aislado](../../marleva-local/repositorio/tests/results/notices-migration.json), [migración local](../../marleva-local/repositorio/tests/results/notices-migration-local.json), [integración API](../../marleva-local/repositorio/tests/results/notices-integration.json), [outbox/SMTP](../../marleva-local/repositorio/tests/results/notices-outbox.json), [rendimiento de consulta](../../marleva-local/repositorio/tests/results/notices-performance.json) y [medición del trabajador](../../marleva-local/repositorio/tests/results/notices-worker-performance.json). Fechas, comandos, versiones, resultados y límites del incremento en [acta conjunta](../../marleva-local/repositorio/tests/results/notices-increment.json).

Fallos y correcciones: primera unitaria cursor12/13 por orden JSON; codificación canónica corregida. Primera integración11/12 por UUID ficticio de forma distinta; ahora usa gen_random_uuid del esquema. Primera medición no alcanzó PG aislado; escucha interna corregida, puerto publicado solo en localhost. Reportes iniciales conservados. El arranque CLI con carpeta equivocada creó un entorno local llamado supabase; se detuvo con volúmenes conservados, sin reset al original. El arranque válido usa infra/local, proyecto marleva-m1 y red marleva-private, con puertos127.0.0.1.

SMTP puede aceptar un correo antes de una caída que impida guardar la confirmación. Se probó una sola tarea y ausencia de repetición de negocio; no entrega única garantizada del correo. La nueva migración202610130001_notice_cursor añade solo un índice: conservó el aviso anterior. DATA001 registra ese índice cotejado; las tablas de recuperación/archivos de DATA002 siguen sin aplicar.

Pendientes: panel operativo B08, B09/Recovery/B12, casos restantes, calidad general, Safari/Android/iOS/físicos y revisión visual. MAR-TODO-AUTH-001 permanece PENDIENTE/ALTA; Google no implementado ni aprobado por silencio. M1 incompleta, MAR-CHAT-005 abierto.

Entrega local en esta raíz; vigencia e historial por Git. Remoto y subida a Fuentes no efectuados. Para actualizar Fuentes, reemplazar01 por este archivo estable;00/02/03 no modificados en005. Texto de configuración [INSTRUCCIONES_FINALES_PARA_PEGAR.txt](../INSTRUCCIONES_FINALES_PARA_PEGAR.txt) sin cambios; no sustituirlo por un resumen. Continuidad: prompt completo de§7 y revisión B09 por dependencias del protocolo. Sin FIN ni nuevo ID.

## Instrucciones y commit confirmados —13-10-2026

Incremento UC008 guardado en commitcd0a0193b761f6a4a2108eec0c84377d16e9bbc2: feat(M1/UC008): paginar avisos y asegurar reintentos de correo.57 archivos; AGENTS raíz y sources excluidos. Usuario confirma mantener solo Git local hasta crear repo; no descargar/subir cambios inexistentes. Nuevas reglas oficiales en00 §13: README, instructivo/revisión local, porcentajes con evidencia, commits y calidad/Docker/CIlocal. Actualizar también configuración editable; originales sincronizados intactos. Google/Supabase sigue PENDIENTE; no bloquea B09 ni documentación/pruebas independientes. Flyway/PDM/Sonar propuestos, no adoptados; Prisma continúa dueño de migraciones.

## B09 implementado y probado localmente — 13-10-2026; 005 continúa

La nueva migración 202610130002_private_fixtures se ensayó sobre las migraciones anteriores antes de aplicarse localmente. Añade tres tablas, vínculos de titular/sesión y restricciones. Conservó los registros anteriores. DATA001 refleja 11 tablas de negocio; DATA002 mantiene 13 como objetivo. Roles y recuperación no están aplicados. OpenAPI 0.4.0 incluye 17 operaciones; las siete de recuperación siguen separadas como objetivo.

| Estado | Resultado |
|---|---|
| Implementado | Emitir permiso temporal, leer archivo privado y pedir borrado. Casos, puertos, repositorio Prisma, adaptador Storage y controlador separados. |
| Acceso | Titular, sesión, objeto y permiso se revalidan también después de leer Storage. Permiso de hasta 300 segundos y sesión restante; diez emisiones por minuto y sesión, incluidas las revocadas. |
| Integridad | Texto ficticio de hasta 1 MiB; MIME, tamaño y SHA256 comprobados antes de responder. Sin pantalla de documentos ni expedientes M2. |
| Borrado | Intención y revocación antes del proveedor; reintento durable, lease de 15 segundos y confirmación de ausencia. La obligación no se descarta por vencer. |
| Pruebas | 18 unitarias, 12 SQL aisladas, seis integraciones B09 reales, 12 de regresión API y cinco de regresión outbox pasaron. Tipado API/cliente y lint de cambios pasaron. |
| Medición | 1 KiB y 1 MiB a 1/5/10 concurrentes: seis combinaciones sin errores; p95 aproximado de 30–538 ms. Ensayo corto de repositorio/Storage, sin HTTP/Auth ni capacidad productiva. RAM solo del proceso lector. |

Evidencia: [acta B09](../../marleva-local/repositorio/tests/results/files-increment.json). Fallos preservados: resultado void de Prisma, confirmación NoSuchKey de Storage, ruta incorrecta de salida en el test y cuota real antes de medir. Corregidos y repetidos. Las pruebas adelantan el reloj de leases y el reintento de su fixture; Storage sí se detuvo/reinició realmente. Las colas progresan independientemente. La limpieza conserva registros ficticios con borrado confirmado, sin dejarlos disponibles con un objeto eliminado.

El usuario confirmó que revisará el [instructivo M1](../../marleva-local/repositorio/docs/revision/M1/INSTRUCTIVO_M1.md), con seis capturas reales, y enviará observaciones. La revisión sigue pendiente. M1 está incompleta por recuperación MFA, B12, plataformas, accesibilidad, casos restantes y calidad global. No hay porcentaje fiable hasta auditar los criterios funcionales; no se cuentan archivos o pruebas como funciones completas. M2–M10 no tienen módulos implementados; el simulador no acredita M6.

Las reglas nuevas están en 00 §13; README e instructivo actualizados. Para reemplazar Fuentes: 00, 01 y 03; 02 no cambió. Configuración editable: INSTRUCCIONES_FINALES_PARA_PEGAR.txt. AGENTS raíz y sources son referencias sincronizadas y quedan fuera del commit propio. Solo local, sin subida ni remoto. MAR-CHAT-005 permanece abierto.

Android en005: recompilación debug ARM64 terminó con BUILD SUCCESSFUL, exit0 y APK con hash en tests/results/android-build.json. Autolinking regenerado por ruta anterior; dependencia fijada faltante descargada. No acredita recorrido, iOS, accesibilidad ni dispositivo físico. Chrome repetido pasó; capturas de cuenta y cambio de correo ahora muestran secciones distintas.

## Continuación 14-10-2026 tras interrupción por créditos

HEAD local comprobado: 5c0324093f6117b86d8900c49459f4cb57856c37. B09 y APK guardados. La corrección independiente de cuota OTP quedó sin commit: 19 unitarias y dos integraciones pasaron; tipado API/cliente y lint de archivos nuevos comprobados al retomar. Serializa por origen antes de reservar, calcula ventana móvil30/h y comunica segundos reales. No cambia C15 ni la estrategia Google/Supabase, que sigue pendiente. Otras rutas conservan la brecha de Retry-After documentada.

Servicios locales y emulador comprobados activos. Recorrido Android retomado; no darlo por terminado antes del acta final. B12 solo preparación/dry-run, todavía sin backup/restauración. Revisión visual del usuario pendiente; originales sincronizados preservados.
Resultado del incremento14-10-2026:19UT,12IT API de regresión y2IT cuota pasaron con el compilado final. PF cuota a1/5/10 concurrentes:0 errores inesperados,30 reservas conservadas; p95 aproximado4.90/18.71/28.56ms solo AccountService/PG. Recorrido Android emulado pasó a1080×1920 efectiva: acceso/error/OTP/cuenta, persistencia tras reinicio, salida y reinicio sin sesión revocada. Cinco capturas reales añadidas al instructivo. Actualizar cuenta conserva UI; no acredita renovación del proveedor por sí sola.320×640 y demás flujos/plataformas/accesibilidad siguen pendientes. [Acta y límites](../../marleva-local/repositorio/tests/results/otp-android-increment.md). Preparación B12 continúa; no ensayo acreditado. No cierre de005 ni aceptación visual.
