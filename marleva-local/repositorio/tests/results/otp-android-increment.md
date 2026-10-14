# M1: cuota OTP y recorrido Android

MAR-CHAT-005,14-10-2026 America/Merida. Incremento local; no cierre de M1 ni aprobación visual.

## Ajuste OTP: UC001 / SEQ001:S030–S050 / BUG007

La cuota de30 solicitudes por origen/hora ahora se serializa antes de reservar. Calcula el tiempo restante de la ventana móvil y lo comunica igual en el mensaje y Retry-After. Conserva reenvío/pausa y OTP estándar; no adopta Google ni cambia la estrategia Supabase.

Verificación final:19 unitarias,12 integraciones API de regresión y2 integraciones de cuota pasaron; typecheck API/cliente y lint de archivos modificados pasaron. Informes otp-quota-unit.json, otp-api-regression.json y otp-quota-integration.json. Se reinició la API para probar el compilado final, incluida la eliminación de variables sin uso en confirmación de correo. No se declara calidad global ni cobertura total de M1.

PF-BE-101-A:30 reservas ficticias, origen exclusivo,1s de calentamiento/5s de medición por concurrencia1/5/10. Todos los rechazos fueron429 esperados;0 errores inesperados y30 filas conservadas. p95:4.90/18.71/28.56ms. CPU/RAM corresponden al proceso de prueba. AccountService+PG, sin HTTP/envío OTP ni capacidad productiva. Fixtures del ensayo retirados en finally. Informe otp-quota-performance.json.

## Android: UC002/003/004 / IT-FE-102/104-ANDROID-A

APK debug ARM64 compilado previamente, emulador Marleva_API36_ARM64 API36, Metro local8081 y API HTTPS con CA local. Pasaron acceso, código inválido conservando paso, OTP válido/cuenta, cierre del proceso y retorno con sesión persistida, salida y reinicio sin recuperar sesión revocada. Actualizar cuenta se pulsó y mantuvo cuenta visible; no acredita renovación del proveedor por sí solo. Resultado android-test.json y cinco capturas reales incorporadas al instructivo M1, sin códigos válidos/tokens.

Fallos del harness registrados en android-test-failure.json: navegación accidental por coordenadas en controles recortados/Back, demora de arranque y UIAutomator terminado después de escribir XML. Correcciones: guardia de foco, controles completamente visibles, desplazamiento sobre texto, arranque MainActivity con espera y lectura solo de archivo nuevo confirmado/completo. No se reutilizan capturas anteriores para declarar un paso. La salida exitosa corresponde a1080×1920 efectiva;320×640 permanece pendiente. Controles del sistema/desarrollo visibles en capturas; ninguna pantalla de producto modificada.

Pendientes: demás flujos Android, accesibilidad, físicos/iOS/Safari, recuperación MFA, restauración B12 y observaciones visuales del usuario. B12 solo tiene preparación documentada. Google/Supabase permanece pendiente/ALTA. Sin remoto, subida o acción externa.
