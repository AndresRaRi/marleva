# Propuesta visual M3 para revisión

15-10-2026. Estado: propuesta aprobada por el usuario el15-10-2026 mediante «Aprobar esta propuesta visual»; implementación Expo pendiente. Véase [matriz](../../proceso/MATRIZ_CASOS_M3.md) y [preview](propuesta.html).

Paleta propuesta: verde profundo #145544 para acción/texto destacado, crema #FFF9F0 de fondo, coral #C65438 como acento moderado; texto #19352D, errores #9C2525. El contraste se comprobará sobre componentes finales, no se acredita WCAG con esta propuesta. Tipografía del sistema, base16, títulos24/32; sin descarga de fuentes. Componentes: React Native/Expo existentes (View, Text, Pressable, TextInput, FlatList) y React Native Web. Evita añadir una librería de interfaz antes de necesitarla; decisión técnica rutinaria, aspecto pendiente del usuario.

Tres pantallas: explorar (UC001/UI001), detalle (UC002/UI002), perfil público (UC003/UI003). Navegación inferior de exploración/cuenta; cuenta pertenece a M1 y será vínculo futuro, sin copiarla ni modificarla. No favoritos, estrellas, promociones o mapas. Explorar permite buscar, filtrar y abrir oferta; detalle muestra precio MXN o cotización, modalidad, cobertura y disponibilidad orientativa; perfil solo información pública.

Comparación limitada con referentes documentados en03: Airbnb inspira separación explorar/identificarse; Grubhub modalidad visible; DoorDash plazos claros, sin equiparar listo a completado. No se afirma visita o investigación visual nueva de esas apps ni eficacia comercial. La composición es propuesta propia.

Carga, vacío, error/reintento y oferta retirada tienen textos y acciones de recuperación; ningún fallo aparece como catálogo vacío. Campos etiquetados, navegación por teclado, foco visible, controles≥48 y texto escalable; probar lectores/zoom/nativos después de implementar. La maqueta es una revisión de distribución, no prueba de accesibilidad de Expo.

La solicitud de revisión se fundamenta en00§8: «Registrar revisión antes de implementar». No bloquea backend, datos, contratos ni adaptador/estado del cliente. Aprobación registrada; no equivale a aceptación de las pantallas implementadas ni a WCAG comprobado.
