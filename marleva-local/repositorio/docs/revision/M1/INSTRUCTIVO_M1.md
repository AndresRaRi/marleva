# M1: prueba de aceptación en Chrome

Fecha:16-10-2026, America/Merida. MAR-CHAT-009. Esta guía sustituye instrucciones parciales anteriores. Versión integrada de referencia: main 1bb5224, [CI propio completo aprobado](https://github.com/AndresRaRi/marleva/actions/runs/38984321194). Los resultados actuales y sus límites se consultan en la tabla vigente de la matriz M1. La aceptación corresponde al usuario. Android permanece aplazado y apagado; el usuario reanudó iOS y su prueba acotada figura al final. Safari no forma parte de esta revisión. No equivale a publicar Marleva ni a habilitar compras.

## Abrir y preparar la prueba

Abrir [Marleva local](https://localhost:8443) en Chrome y el [capturador local](http://127.0.0.1:54324) en otra pestaña. Usar una dirección nueva, por ejemplo `prueba-vecino-01@example.test`. Si ya existe un ensayo con ese correo, cambiar el número. Los correos solo llegan al capturador; no usar datos reales. Si los servicios están apagados, seguir el arranque conservando datos del [README del código](../../../README.md#arranque-de-este-entorno-preparado). No arrancar emuladores para esta revisión.

## 1. Acceso y error recuperable

1. Escribir el correo ficticio y pulsar **Recibir código**.
2. Escribir un código incorrecto: debe aparecer el error y conservarse el paso y el correo.
3. Buscar el mensaje correcto en el capturador y escribir su código vigente.
4. Pulsar **Verificar código**: debe aparecer **Tu cuenta** con el correo propio.
5. Recargar Chrome: la cuenta debe seguir abierta. Registrar el correo utilizado para las siguientes pruebas.

Espera de reenvío60s; código10min; cinco fallos bloquean15min. No acelerar cuotas ni relojes de la aplicación. Una cuenta normal no recibe permisos de operador ni pertenencia vecinal aprobada.

![Acceso real de Chrome](capturas/01-acceso.png)
![Error real, código retirado](capturas/03-codigo-invalido.png)

## 2. Cuenta, avisos y ayuda

Cambiar entre **Cuenta**, **Avisos** y **Ayuda**: deben cambiar el contenido y la pestaña seleccionada. **Actualizar cuenta** consulta de nuevo; **Cargar más avisos** añade la página siguiente y desaparece al terminar. Una cuenta nueva puede no tener avisos: debe mostrarse el vacío confirmado. Tras cambiar correo habrá un aviso propio. El ensayo automatizado prepara55avisos propios y comprueba tres páginas; no hay que insertar datos manualmente para aceptar el vacío de una cuenta nueva.

Si falla la conexión, conservar el paso y usar la acción de consulta/reintento. Si terminó la sesión, volver por OTP; una intención interna pertenece a esa cuenta y nunca debe ejecutarse con otra identidad ni repetir automáticamente una modificación.

![Cuenta real de Chrome](capturas/04-cuenta.png)

## 3. Cambiar el correo

1. En **Cuenta**, escribir otra dirección ficticia en **Nuevo correo** y pulsar **Iniciar cambio**.
2. Buscar en el capturador los mensajes del buzón anterior y del nuevo.
3. En **Buzón que estás verificando** y **Código del cambio**, confirmar el primer buzón mediante **Confirmar buzón**.
4. Recargar: el cambio pendiente debe recuperarse. Un código incorrecto debe permitir corregirlo sin iniciar otro cambio.
5. Confirmar el otro buzón. Solo entonces se completa el cambio, se conserva la identidad de cuenta y se cierran sus sesiones anteriores.
6. Entrar por OTP al correo nuevo. Revisar el aviso de cambio. Para el ensayo, abrir previamente otra sesión del mismo correo en una ventana de incógnito; después del cambio tampoco debe conservar acceso.

Si la respuesta fue incierta, pulsar **Consultar cambio de correo** antes de repetir la acción. Si exige acceso reciente, iniciar sesión con un OTP nuevo. No cambiar el correo del usuario real.

![Sección de cambio de correo](capturas/05-cambio-correo.png)

## 4. Salida actual y salida total

**Cerrar esta sesión** devuelve al acceso. Recargar y volver por el historial no debe recuperar esa sesión. Para probar **Cerrar todas las sesiones**, entrar con el mismo correo ficticio también en incógnito, esperar60s si corresponde y usar un OTP nuevo. Ambas ventanas deben funcionar antes de la prueba. Pulsar la salida total desde una autenticación reciente; al consultar o recargar, ambas deben pedir acceso nuevamente.

![Salida real confirmada](capturas/06-sesion-cerrada.png)

## 5. Operador y segundo factor

Esta prueba usa exclusivamente un operador ficticio ya preparado y un autenticador local; una cuenta normal no se convierte en operador por escribir un correo especial. No conceder roles para probar una pantalla ni compartir claves del autenticador.

En **Cuenta**, sección **Acceso de operador ficticio**: comprobar que entrar solo por correo no permite operar; si no tiene un factor configurado, usar **Preparar segundo factor**, añadir la clave privadamente al autenticador y verificar **Código del segundo factor**. Si ya existe un factor, usar su autenticador vigente. **Comprobar permiso de operador** solo debe aprobar después de verificar el factor. La clave privada debe desaparecer después de verificar o salir; no guardarla en capturas.

## 6. Recuperación del operador

El recorrido completo ya tiene evidencia Chrome con dos operadores ficticios en un destino B12 restaurado. No repetir la retirada de factores en otros entornos: la autorización de borrado está limitada al factor ficticio perdido de ese ensayo.

Para revisar el comportamiento, usar esta secuencia y el [resultado integral](../../../tests/results/recovery-integral-1792167720153-browser-1792168307453.json):

| Paso | Resultado esperado |
|---|---|
| Titular: Ayuda → Motivo de recuperación → Solicitar recuperación | Solicitud en revisión y referencia propia |
| Intentar revisar la propia solicitud | Denegación; no conceder permiso por ser titular |
| Otro revisor autorizado con segundo factor: consultar referencia y aprobar | Aprobación por persona distinta y rol vigente |
| Trabajador retira exclusivamente el factor perdido autorizado | Sesión anterior termina; caída conserva proceso pendiente |
| Titular entra por OTP y vuelve a Ayuda | Recuperación propia y estado vigente, sin repetir solicitud |
| Solicitar autorización temporal → Preparar nuevo factor → Completar recuperación | Capacidad limitada a esa sesión, nuevo autenticador verificado y sesiones revocadas |
| Entrar otra vez por OTP y verificar nuevo factor | OTP solo no habilita operación; factor nuevo sí |

Los rechazos, caducidad, capacidad ligada, rol actual y caída/reinicio también tienen [pruebas backend](../../../tests/results/recovery-api.json). La recuperación del buzón corresponde a su proveedor; domicilio/nombre no transfieren cuentas. Google no es una función de esta entrega.

## 7. Teclado, lectura y ampliación

Repetir acceso, Cuenta/Avisos/Ayuda y salida sin ratón: Tab/Mayús+Tab y Enter. El foco debe ser visible, alcanzar controles y permitir corregir errores. Ampliar Chrome al200% y comprobar texto/controles sin desbordamiento horizontal. Revisar nombres de campos, mensajes y selección de pestañas con el lector de pantalla que utilice el tester. Las auditorías Axe/árbol accesible/teclado no sustituyen esa revisión humana ni acreditan WCAG completa.

![Teclado y ampliación200% comprobados en Chrome](capturas/07-teclado-zoom.png)

## 8. Base sin pantalla de usuario

B09 es soporte de archivos privados ficticios, no un formulario de documentos M2. Su [contrato](../../apis/M1/CONTRATO_B09_ARCHIVOS_PRIVADOS.md) y [acta](../../../tests/results/files-increment.json) comprueban permisos e integridad. No borrar archivos para esta aceptación. UC012 es un simulador aislado; no hay compras, cobros ni reembolsos reales.

B12 esencial Chrome está probado y repetido desde el mismo backup: datos/Auth/Storage, atributos/hashes/relaciones, borrado autorizado reaplicado, revocación, cola, OTP/retorno, MFA y recuperación Prisma. [Procedimiento y actas](../../proceso/RECUPERACION_B12_M1.md). Tiempos de etapas no son un RTO; no se promete pérdida máxima, operación productiva ni pruebas de plataformas aplazadas.

## Registrar la aceptación

La [lista finita C01–C06](../../proceso/MATRIZ_CASOS_M1.md#lista-finita-para-aceptar-y-cerrar-m1--16-10-2026) distingue qué prueba falta, quién puede hacerla y qué está aplazado. El cierre web para revisión no completa M1 multiplataforma. No hace falta repetir recorridos que ya aceptó el usuario; registrar el alcance de esa aceptación y sus observaciones.

Recorrer1–4 y7 con una cuenta ficticia propia. Revisar5–6 con la evidencia del ensayo autorizado; no provocar otra pérdida de factor. Informar flujo/paso, esperado/obtenido y captura sin códigos o claves. Registrar cada recorrido como aprobado, con observaciones o no probado. La aceptación nunca se deduce del silencio. El [avance](../../avance.md) conserva implementación y aceptación separadas; [01](../../../../../entregables/fuentes_finales/01_ESTADO_Y_DECISIONES_MARLEVA.md) registra continuidad y límites. Android/iOS y revisión humana con lector permanecen identificados hasta probarlos. Para revisar soporte sin provocar borrados, aceptar los resultados existentes de B09, UC012 y B12 por su alcance; no convertirlos en operación real ni pedir otro retiro de factor.

## Revisar en Android emulado

APK debug ARM64 en apps/client/android/app/build/outputs/apk/debug/app-debug.apk, ignorado en Git; [acta de compilación](../../../tests/results/android-build.json). Requiere Metro local en8081. El emulador Marleva_API36_ARM64, API36, comprobó el mismo flujo de los pasos1,2,3 y5: OTP, error, cuenta, reinicio conservando sesión y salida seguida de reinicio sin recuperar sesión. [Resultado](../../../tests/results/android-test.json). Actualizar cuenta se pulsó y conservó la pantalla; no prueba por sí sola renovación del proveedor.

![Acceso Android](capturas/android/01-acceso.png)
![Código pendiente Android, campo vacío](capturas/android/02-codigo-pendiente.png)
![Error Android, código retirado](capturas/android/03-codigo-invalido.png)
![Cuenta Android](capturas/android/04-cuenta.png)
![Salida Android](capturas/android/05-sesion-cerrada.png)

Capturas reales a1080×1920, configuración efectiva del ensayo; tamaño físico del AVD320×640. El intento en320×640 quedó incompleto y no se acredita con estas capturas. Se ven controles del sistema/cliente de desarrollo; no forman parte del diseño aprobado. Cambio de correo/MFA completos, accesibilidad, dispositivo físico e iOS quedaban pendientes en ese ensayo histórico. El AVD existente está en la carpeta de Android del usuario; no se afirma que todo el emulador esté dentro del repositorio.


## Revisar acceso y sesión en iOS Simulator

Prueba real16-10-2026: iPhone18Pro/iOS27.0, Release ARM64 con JavaScript incorporado, sin Metro. [Acta](../../../tests/results/ios-test.json). Se usa HTTPS con CA local y almacenamiento seguro del sistema. Android permanece apagado.

1. En Marleva, pedir y verificar el código de una cuenta ficticia@example.test; obtenerlo del capturador local. Debe aparecer Tu cuenta con ese correo.
2. Terminar solamente el proceso de Marleva y abrirlo de nuevo, sin reinstalar ni borrar datos. Debe aparecer la misma cuenta sin otro código.
3. Pulsar Cerrar esta sesión. Debe aparecer Sesión cerrada.
4. Terminar y reabrir Marleva otra vez. Debe aparecer Accede a tu cuenta, sin recuperar los datos privados de la sesión cerrada.

Los cuatro pasos pasaron. La captura de cuenta se tomó después del primer relanzamiento; la última muestra el acceso después de salir y relanzar. No contiene códigos ni credenciales.

![iOS: misma cuenta después de reabrir](capturas/08-ios-sesion-conservada.png)
![iOS: salida confirmada](capturas/09-ios-sesion-cerrada.png)
![iOS: no restaura la sesión cerrada al reabrir](capturas/10-ios-salida-tras-relanzar.png)

Esto acredita acceso y conservación/salida de sesión en el simulador. El cambio de correo completo se comprobó después y figura en el siguiente apartado. MFA/recuperación, accesibilidad y dispositivo físico iOS permanecen separados; no equivale a aceptación integral de M1.


## iOS: cambio de correo, aviso y retorno comprobados

Continuación del 16-10-2026 sobre la misma compilación Release. Se utilizó la cuenta ficticia del ensayo anterior y se cambió únicamente su correo mediante la app. No se modificó la base para completar el cambio.

1. En Cuenta, iniciar cambio a otro buzón ficticio. Código inválido: conserva el proceso y permite corregir.
2. Confirmar el buzón actual; terminar y reabrir Marleva. El segundo buzón debe seguir pendiente y el código debe estar vacío.
3. Confirmar el segundo buzón. La app debe volver al acceso; el ID de cuenta se conserva y sus sesiones anteriores quedan revocadas.
4. Entrar con el correo nuevo y abrir Avisos. Debe aparecer el aviso propio de cambio y cierre de sesiones.
5. Desde una segunda sesión ficticia de la misma cuenta, cerrar todas. Al consultar desde iOS debe pedir código y ocultar datos privados. Entrar por OTP de la misma identidad: retoma Cuenta y permite consultar otra vez el aviso propio.

Los cinco pasos pasaron. El retorno observado fue a Cuenta; no se acredita aquí retorno a todos los destinos ni otra identidad. Paginación nativa, segundo factor/recuperación y accesibilidad se registran por separado; no se deducen de este flujo. [Acta extendida](../../../tests/results/ios-test.json).

![Primer buzón confirmado, segundo pendiente](capturas/11-ios-primer-buzon.png)
![Cambio completado y acceso requerido](capturas/12-ios-correo-completado.png)
![Aviso propio después de recuperar acceso](capturas/13-ios-avisos-tras-retorno.png)


### iOS: segundo factor comprobado — 16 de octubre de 2026

Con el operador ficticio local, consultar permiso antes de verificar el factor fue rechazado. Preparar y verificar el factor desde la interfaz nativa permitió después comprobar el permiso. La captura [14-ios-permiso-mfa.png](capturas/14-ios-permiso-mfa.png) muestra los controles con los campos privados vacíos. La recuperación posterior se describe abajo; el ensayo básico y el reemplazo no se confunden. La captura muestra controles sin claves; la aprobación del permiso se observó en el árbol accesible.


### iOS: recuperación MFA híbrida comprobada — 16 de octubre de 2026

El usuario autorizó el rol local de revisor para operator2@example.test y retirar exclusivamente el factor ficticio nuevo de operator1. Solicitud, OTP/MFA del revisor y aprobación se ejecutaron por API real; la autorrevisión fue rechazada. No se atribuyen esos pasos a la interfaz nativa.

1. Desde Ayuda en iOS, consultar la solicitud. La sesión anterior se rechaza y vuelve al acceso.
2. Entrar por OTP con la misma cuenta: regresa a Ayuda y muestra que se puede configurar el nuevo factor. Una sesión sin acceso reciente exige ingresar de nuevo; no se omite este control.
3. Solicitar autorización temporal y preparar nuevo factor desde iOS. Mantener la clave privada fuera de capturas y registros.
4. Verificar el código del factor nuevo y completar. Resultado: [recuperación completada y nueva entrada requerida](capturas/15-ios-recuperacion-completada.png).
5. Volver a entrar por OTP. Consultar permiso todavía exige segundo factor; verificar el nuevo código y consultar permiso permite operar. [Cuenta después de recuperar el acceso](capturas/16-ios-acceso-recuperado.png); confirmación del permiso observada en el árbol accesible.

La lectura final del proveedor confirma que desapareció únicamente el factor autorizado y existe un reemplazo verificado; la recuperación está completed y su capacidad consumida. Se conservaron cuentas, roles restantes, datos, archivos y migraciones. Solicitud/revisión por interfaz nativa, lector de pantalla, iPhone físico y combinaciones restantes siguen pendientes en la matriz; este ensayo no acredita aceptación integral.
