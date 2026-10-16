# M1: revisar acceso, cuenta y avisos

Fecha:14-10-2026 America/Merida. Entrega parcial, MAR-CHAT-005. Las capturas son de la aplicación real en Chrome y, en el apartado Android, del emulador, con datos ficticios; no son una maqueta ni una aprobación del diseño. No acreditan iOS, dispositivos físicos, lectores de pantalla o M1 terminada.

## Abrir la aplicación

En este Mac, abrir https://localhost:8443. Correo de prueba: una dirección nueva terminada en @example.test. Los mensajes llegan únicamente al capturador local en http://127.0.0.1:54324. Nunca escribir datos o dinero reales. Si la página no responde, seguir el arranque del [README](../../../README.md); no borrar la base ni desactivar la validación del certificado.

## 1. Entrar por correo

1. Escribir un correo ficticio nuevo.
2. Pulsar Recibir código.
3. Abrir el capturador y localizar ese correo. No publicar ni copiar su código en documentación.
4. Volver a Marleva, escribir el código y pulsar Verificar código.
5. Debe aparecer Tu cuenta. Tener cuenta todavía no permite comprar u ofrecer.

![Pantalla de acceso real](capturas/01-acceso.png)
![Espera del código, campo vacío](capturas/02-codigo-pendiente.png)

Caso:UC001/UC002; secuencias001/002; API001/002. Recorrido Chrome probado. Espera de reenvío60s; código10min; cinco fallos/pausa15min. No se acorta la espera para la revisión.

## 2. Código incorrecto y recuperación del paso

Un código incorrecto debe mostrar el error y conservar el correo/paso. Corregirlo con el código vigente; si venció o se consumió, pedir otro cuando termine la espera. La captura se tomó después de limpiar el valor incorrecto; no muestra un código válido.

![Error real por código inválido](capturas/03-codigo-invalido.png)

Caso:UC002. Error y continuación comprobados en Chrome; fallos/consumo/concurrencia también en pruebas API. No se han comprobado todas las combinaciones web/nativas.

## 3. Consultar cuenta y avisos

Usar Actualizar cuenta. Verificar correo y acciones propias. Avisos de cuenta muestra los avisos disponibles. La API permite páginas de24/máximo50 con cursor y conserva orden exacto. Incremento006, PR #8: pulsar Cargar más avisos para anexar la siguiente página; ante error conservar los avisos y reintentar. El control desaparece al terminar; Actualizar cuenta vuelve a primera página. Chrome con API controlada comprobó55 avisos y503/reintento; no acredita Android/iOS ni aceptación visual. Las capturas siguientes son anteriores al control nuevo.

![Cuenta real con datos ficticios](capturas/04-cuenta.png)

Casos:UC003/UC008; API003/009. API:73avisos con empates/microsegundos, otra cuenta denegada, inserción y frontera borrada comprobadas. Correo caído no pierde la tarea ni repite negocio; SMTP puede repetir una entrega tras resultado incierto.

## 4. Cambiar correo

1. Escribir otra dirección ficticia en Nuevo correo.
2. Pulsar Iniciar cambio.
3. En el capturador, revisar los mensajes dirigidos al correo actual y al nuevo.
4. Confirmar cada buzón con su código; la primera confirmación conserva el correo anterior.
5. Al completar ambos, la cuenta conserva su ID y cierra las sesiones anteriores. Entrar con el correo nuevo.

![Sección real de cambio de correo](capturas/05-cambio-correo.png)

Casos:UC005/UC006; API007/008. Ambos buzones/ID/revocación probados en API; esta captura muestra la sección disponible, no acredita el recorrido completo de cambio por UI. Si pide verificar de nuevo el acceso, cerrar sesión y entrar con otro código antes de iniciar el cambio.

## 5. Salir

Cerrar esta sesión debe devolver al acceso. Cerrar todas las sesiones requiere autenticación reciente y debe invalidar las otras sesiones de la aplicación. Volver al historial del navegador no debe recuperar una sesión revocada.

![Salida real confirmada](capturas/06-sesion-cerrada.png)

Caso:UC004. Salida actual probada en Chrome; actual/total, cookie segura y CSRF en API. Recorrido físico en dos dispositivos pendiente.

## 6. Segundo factor del operador ficticio

Solo las cuentas operadoras ficticias preparadas por el entorno muestran esa sección. Verificar correo reciente, preparar TOTP con un autenticador local y verificar el factor. No guardar capturas del secreto/QR ni compartirlo. El registro normal no concede el rol. Rol/AAL y revocación comprobados por API; instructivo con capturas seguras de ese flujo y pantallas de recuperación administrativa todavía pendientes.

## 7. Pérdida del buzón y sesión vencida

Recuperar el buzón con su proveedor. Un comprobante vecinal no transfiere la cuenta. Si la sesión venció, volver a entrar y consultar el estado antes de repetir una acción. Retomar destinos internos completos, recuperación MFA ya tiene backend probado; pantalla y restauración integral siguen pendientes. Google/Supabase permanece pendiente; no es una función de esta entrega.

## 8. Archivos privados B09

No hay formulario de documentos M2. B09 trabaja con texto ficticio privado. Revisión de su contrato en [YAML](../../apis/M1/openapi-objetivo-archivos.yaml) y [especificación](../../apis/M1/CONTRATO_B09_ARCHIVOS_PRIVADOS.md); Ya hay tres operaciones backend: emitir permiso temporal, leer y pedir borrado. Se probaron dos cuentas, otra sesión, caducidad/reemisión, cuota, contenido alterado, borrado idempotente, caída/reinicio de Storage y trabajadores concurrentes. Ver [acta B09](../../../tests/results/files-increment.json). No existe pantalla de archivos y este ensayo no acredita expedientes M2 ni restauración B12. Puede revisarse el contrato en un IDE; el Swagger local muestra las operaciones y no ejecuta solicitudes.

## Qué revisa cada parte

| Parte | Función | Cómo localizarla |
|---|---|---|
| Frontend | Presenta correo/código/cuenta, errores y acciones | apps/client/app/index.tsx; adaptador src/api.ts; pruebas tests/integration/frontend/M1 |
| Backend | Autoriza cuenta/sesión, guarda transiciones, lista avisos y entrega correo durable | apps/api/src; casos/puertos/repositorios de modules/m1; OpenAPI/Swagger en docs/apis/M1 |
| Datos | Conserva registros privados e historial de migraciones | Prisma en apps/api/prisma; DBML/DDL en docs/modelado-datos |
| Evidencia | Resultado esperado, obtenido y límites | tests/results/notices-increment.json y files-increment.json; matriz docs/proceso/MATRIZ_CASOS_M1.md |

Para reportar un fallo: indicar flujo, paso, qué se hizo, qué se esperaba y qué apareció. Añadir captura sin códigos, tokens ni datos reales. UC/SEQ/API permite rastrear el cambio y su prueba.

## Estado de la revisión

Usuario confirmó que revisará este instructivo y dará observaciones. Revisión/aceptación siguen pendientes; no hay aceptación por silencio. M1 no se declara terminada hasta cerrar casos, integración, accesibilidad, plataformas y recuperación. El [estado01](../../../../../entregables/fuentes_finales/01_ESTADO_Y_DECISIONES_MARLEVA.md) conserva continuidad y porcentajes cuando exista base comprobada.

## Revisar en Android emulado

APK debug ARM64 en apps/client/android/app/build/outputs/apk/debug/app-debug.apk, ignorado en Git; [acta de compilación](../../../tests/results/android-build.json). Requiere Metro local en8081. El emulador Marleva_API36_ARM64, API36, comprobó el mismo flujo de los pasos1,2,3 y5: OTP, error, cuenta, reinicio conservando sesión y salida seguida de reinicio sin recuperar sesión. [Resultado](../../../tests/results/android-test.json). Actualizar cuenta se pulsó y conservó la pantalla; no prueba por sí sola renovación del proveedor.

![Acceso Android](capturas/android/01-acceso.png)
![Código pendiente Android, campo vacío](capturas/android/02-codigo-pendiente.png)
![Error Android, código retirado](capturas/android/03-codigo-invalido.png)
![Cuenta Android](capturas/android/04-cuenta.png)
![Salida Android](capturas/android/05-sesion-cerrada.png)

Capturas reales a1080×1920, configuración efectiva del ensayo; tamaño físico del AVD320×640. El intento en320×640 quedó incompleto y no se acredita con estas capturas. Se ven controles del sistema/cliente de desarrollo; no forman parte del diseño aprobado. Cambio de correo/MFA completos, accesibilidad, dispositivo físico e iOS siguen pendientes. El AVD existente está en la carpeta de Android del usuario; no se afirma que todo el emulador esté dentro del repositorio.

## 9. Revisar recuperación de operadores en el IDE

El backend está disponible localmente; todavía no hay pantalla nueva aprobada. Abrir docs/apis/M1/swagger.html para ver las siete operaciones y sus entradas/respuestas. Este visor no envía solicitudes ni concede permisos. El [resultado real](../../../tests/results/recovery-api.json) registra el recorrido probado con dos operadores ficticios; el [contrato explicado](../../apis/M1/CONTRATO_RECUPERACION_MFA.md) detalla controles y límites.

| Paso | Quién | Qué sucede |
|---|---|---|
| 1. Solicitar | Titular, correo recién verificado | POST /v1/auth/mfa-recoveries; recibe ID y estado |
| 2. Consultar | Titular o administrador autorizado con segundo factor | GET /v1/auth/mfa-recoveries/{id}; muestra estado y versión |
| 3. Revisar | Otro administrador vigente, acceso reciente y segundo factor | POST .../{id}/approvals o .../{id}/rejections; nunca autorrevisión |
| 4. Recuperar proveedor | Trabajador del backend | Revoca accesos y elimina solo el factor perdido; ante caída conserva tarea pendiente |
| 5. Entrar de nuevo | Titular | Verifica mismo buzón; POST .../{id}/capabilities obtiene permiso temporal ligado a esta sesión |
| 6. Preparar factor | Titular con capacidad | POST .../{id}/enrollments; configurar autenticador sin guardar captura de secreto/QR |
| 7. Completar | Titular con capacidad y código actual | POST .../{id}/verifications; completa, consume capacidad y cierra sesiones |
| 8. Volver a operar | Titular | Entra nuevamente por correo y verifica nuevo factor; correo solo no habilita al operador |

Si el proveedor sigue pendiente por una credencial antigua, entrar nuevamente por correo y reenviar la solicitud continúa el mismo proceso. Capacidad vencida, cinco códigos fallidos o recuperación vencida no conceden acceso. La revisión visual y capturas de esta pantalla se harán después de aprobar su diseño; las capturas existentes no acreditan este flujo nuevo.
