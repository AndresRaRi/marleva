import { spawnSync } from 'node:child_process';
const categories = {
  connectionLimit: /too many (?:connections|clients)|remaining connection slots/i,
  connectionFailure: /connection refused|connection reset|unexpected eof|database is closed/i,
  timeout: /deadline exceeded|context deadline|context canceled|timeout|timed out/i,
  preparedStatement: /prepared statement|cached plan/i,
  permissions: /permission denied|password authentication failed/i,
  missingRelation: /relation .* does not exist/i,
};
const diagnosticWords = new Set(
  'error failed finding loading user session database querying schema sql scan column index cannot null string into storing driver value type unsupported connection already closed busy timeout context canceled unexpected eof prepared statement does not exist duplicate key violates unique constraint permission denied invalid input syntax uuid integer timestamp time zone bad conn broken pipe transaction rollback committed aborted found refused too many clients cached plan must change result'.split(
    ' ',
  ),
);
export function providerErrorShape(line) {
  let message = line;
  try {
    const entry = JSON.parse(line);
    message = typeof entry.error === 'string' ? entry.error : '';
  } catch {
    // PostgreSQL also emits plain text; only the same closed vocabulary can leave memory.
  }
  return (message.toLowerCase().match(/[a-z][a-z0-9_@.-]*/g) ?? [])
    .filter((word) => diagnosticWords.has(word))
    .slice(0, 40)
    .join(' ');
}
export function summarizeProviderLog(log) {
  const result = { errorLines: 0, sqlStates: {}, categories: {}, unclassified: 0, shapes: {} };
  for (const line of log.split('\n')) {
    if (!/error|fatal|panic|SQLSTATE/i.test(line)) continue;
    result.errorLines++;
    let classified = false;
    for (const match of line.matchAll(/\bSQLSTATE[ :]+([0-9A-Z]{5})\b/g)) {
      result.sqlStates[match[1]] = (result.sqlStates[match[1]] ?? 0) + 1;
      classified = true;
    }
    for (const [name, pattern] of Object.entries(categories)) {
      if (!pattern.test(line)) continue;
      result.categories[name] = (result.categories[name] ?? 0) + 1;
      classified = true;
    }
    if (!classified) {
      result.unclassified++;
      const shape = providerErrorShape(line);
      const key =
        shape && (shape in result.shapes || Object.keys(result.shapes).length < 32)
          ? shape
          : 'other';
      result.shapes[key] = (result.shapes[key] ?? 0) + 1;
    }
  }
  return result;
}
export function collectProviderDiagnostics() {
  return Object.fromEntries(
    ['auth', 'db'].map((service) => {
      const result = spawnSync(
        'docker',
        ['logs', '--since', '15m', `supabase_${service}_marleva-ci`],
        {
          encoding: 'utf8',
          timeout: 10000,
          maxBuffer: 16 * 1024 * 1024,
        },
      );
      return [
        service,
        {
          available: result.status === 0,
          ...summarizeProviderLog((result.stdout ?? '') + '\n' + (result.stderr ?? '')),
        },
      ];
    }),
  );
}
