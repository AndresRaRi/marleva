import { spawnSync } from 'node:child_process';
const categories = {
  connectionLimit: /too many (?:connections|clients)|remaining connection slots/i,
  connectionFailure: /connection refused|connection reset|unexpected eof|database is closed/i,
  timeout: /deadline exceeded|context deadline|context canceled|timeout|timed out/i,
  preparedStatement: /prepared statement|cached plan/i,
  permissions: /permission denied|password authentication failed/i,
  missingRelation: /relation .* does not exist/i,
};
export function summarizeProviderLog(log) {
  const result = { errorLines: 0, sqlStates: {}, categories: {}, unclassified: 0 };
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
    if (!classified) result.unclassified++;
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
