# Corrección de licencia y compatibilidad de lint — 15-10-2026

Problema: eslint-plugin-sonarjs 4.2.2 declara LGPL en package.json, pero su licencia incluida es SSAL. El inventario basado únicamente en metadatos no acredita el texto distribuido.

Diseño: conservar las dos reglas activas y ESLint 10.12.0/TypeScript 6.0.3; fijar SonarJS 1.0.4 con licencia LGPL-3.0-only y @eslint/compat 2.1.1 Apache-2.0. Tarballs oficiales verificados mediante SHA512 del registro antes de instalación. No dependencias runtime del plugin. Excepción peer limitada al paquete/versiones exactos; compatibilidad adaptada local, no soporte nativo declarado del plugin. Las licencias instaladas se contrastan por SHA256 en el control obligatorio antes de ejecutar ESLint desde ese control.

Validación local: ocho casos por CLI real, cuatro TS y cuatro TSX con JSX real. Expresiones distintas y ramas distintas pasan; resta idéntica y ramas duplicadas de varias líneas fallan con código1 y la regla exacta. Sin errores de parser admitidos. La igualdad entre identificadores es una excepción deliberada de la regla; ramas de una línea tampoco son una negativa válida para esta distribución. No se afirma equivalencia exhaustiva entre versiones.

Calidad global pasó con cero errores y 19 advertencias preexistentes. Unitarias y cobertura: 173 pruebas correctas en la rama Sonar (incluye sus diez pruebas propias). Esta rama separada desde main conserva las 163 unitarias de aplicación/infraestructura de la base; comprobar sus hooks y CI propios. Instalación frozen offline correcta. Seguridad completa: SBOM/licencias/Gitleaks/compatibilidad correctos; OSV conserva los dos avisos con corrección local comprobada, sin avisos pendientes. Revisión estática independiente sin defectos accionables; observación sobre JSX incorporada en casos reales. CI remoto pendiente al registrar esta evidencia.

No cambia aplicación, SDK, datos, API ni migraciones. No acredita Sonar ni fase3. Artefactos crudos locales ignorados en artifacts/ci/licensing-audit y artifacts/security; informes versionados de seguridad junto a este archivo.

Fuentes primarias: https://registry.npmjs.org/eslint-plugin-sonarjs/1.0.4 ; https://registry.npmjs.org/@eslint%2fcompat/2.1.1 ; https://eslint.org/blog/2024/05/eslint-compatibility-utilities/ ; https://pnpm.io/settings/peer-dependencies .
