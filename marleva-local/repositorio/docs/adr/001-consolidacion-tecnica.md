# ADR001: conservar las fuentes técnicas y cerrar brechas sobre el proyecto existente

Fecha: 14-10-2026 America/Merida. Estado: aceptado por el usuario al aprobar el plan auditado, manteniendo Prisma y YAML canónico. No equivale a implementación completa del plan.

Problema: el nuevo prompt pide Flyway, OpenAPI desde código, AGENTS raíz único y manuales en otra carpeta; el proyecto ya tiene historial Prisma, contratos YAML, guía 00 y un espejo AGENTS readonly. Aplicar ambas variantes duplicaría reglas, migraciones, contratos o instructivos.

Decisión:

| Tema | Fuente/decisión vigente | Consecuencia |
|---|---|---|
| Migraciones | Prisma para marleva; Supabase para Auth/Storage | No instalar Flyway ni modificar SQL aplicado. Cualquier transición futura exige ADR/ensayo/aprobación |
| Contrato API | docs/apis/M1/openapi.yaml | Generar JSON/tipos/Swagger; probar concordancia con comportamiento. No mantener otro OpenAPI editable desde decoradores |
| Reglas | Guía 00 detallada; AGENTS del código y configuración editable como entradas | Respetar AGENTS raíz/sources readonly; entregar configuración a reemplazar sin afirmar sincronización |
| Manuales | docs/revision/Mn/INSTRUCTIVO_Mn.md | Completar el existente; README referencia, sin segundo manual en docs/manuales |
| Progreso | docs/avance.md | Cálculo por criterios funcionales con evidencia; no contar archivos/commits/tests como funciones |
| Stack y acceso | Nest/Expo/PG/Supabase existentes; C15 OTP | Google pendiente, no nuevo motor Auth ni nuevas cuentas externas |
| Calidad | Completar ESLint/Prettier/pruebas, después cobertura/Sonar/CI | No acreditar puerta global hasta pasar; no apagar reglas |
| Git | Origin configurado al repositorio indicado por el usuario | Aplicar 00 §13: pull con avance rápido al inicio, commit y push de la rama de trabajo al cierre |

Alternativas: reemplazar gestor de migraciones o fuente de OpenAPI ahora añade riesgo sin resolver una función M1. Mantener dos gestores/contratos introduce ambigüedad. La decisión conserva lo probado y dirige el trabajo a brechas reales.

Comprobación: hashes de migraciones aplicadas intactos, generación determinista, pruebas de contrato, enlaces/instructivo únicos, Git sin secretos y evidencia por criterio. Referencias técnicas en 03 y reglas en 00 §§7–9; proceso y pruebas del caso en matriz. Sonar y CI todavía por implementar, no cumplimiento declarado.
