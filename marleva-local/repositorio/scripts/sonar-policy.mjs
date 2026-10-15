import { readFileSync } from 'node:fs';
import path from 'node:path';
export function fingerprint(issue, root, project) {
  const file = issue.component?.slice(project.length + 1);
  const line = issue.line ?? issue.textRange?.startLine;
  const rule = issue.rule ?? issue.securityCategory;
  if (
    !issue.component?.startsWith(project + ':') ||
    !file?.startsWith('apps/') ||
    !rule ||
    typeof issue.message !== 'string' ||
    !Number.isInteger(line) ||
    line < 1
  )
    throw new Error('Incidencia Sonar incompleta');
  const absolute = path.resolve(root, file);
  if (!absolute.startsWith(path.resolve(root) + path.sep)) throw new Error('Ruta Sonar ajena');
  const lines = readFileSync(absolute, 'utf8').split('\n');
  if (line > lines.length) throw new Error('Línea Sonar ajena');
  return JSON.stringify([rule, file, issue.message, lines[line - 1].trim()]);
}
export function introduced(base, head) {
  if (
    !Array.isArray(base) ||
    !Array.isArray(head) ||
    [...base, ...head].some((item) => typeof item !== 'string')
  )
    throw new Error('Inventarios Sonar inválidos');
  const remaining = new Map();
  for (const key of base) remaining.set(key, (remaining.get(key) ?? 0) + 1);
  return head.filter((key) => {
    const count = remaining.get(key) ?? 0;
    if (!count) return true;
    remaining.set(key, count - 1);
    return false;
  });
}
