import { appendFileSync, readFileSync } from 'node:fs';
const [stage, outcome] = process.argv.slice(2);
let detail;
try {
  detail = JSON.parse(readFileSync(`artifacts/ci/${stage}.json`, 'utf8'));
} catch {
  detail = { failed: 'Preparación o ejecución incompleta' };
}
const success = outcome === 'success';
const text = `### ${stage}\n\n${success ? 'Las comprobaciones de la etapa terminaron correctamente. El resultado final también incluye la preparación y guardado de caché.' : 'La etapa falló; no integrar todavía.'}\n\n${success ? 'Siguiente: revisar las otras etapas.' : `Revisar el registro de ${detail.failed || stage}, corregir y repetir el mismo comando local.`}\n`;
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
else console.log(text);
