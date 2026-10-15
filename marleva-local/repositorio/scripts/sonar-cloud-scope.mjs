export function cloudScope(log, expected) {
  const indexed = /\b(\d+) files indexed\b/.exec(log);
  const hit = /Hit the cache for (\d+) out of (\d+)/.exec(log);
  const miss = /Miss the cache for (\d+) out of (\d+)/.exec(log);
  if (!indexed || !hit || !miss) throw new Error('Scanner sin inventario de lenguaje completo');
  const result = {
    indexedFiles: Number(indexed[1]),
    cachedFiles: Number(hit[1]),
    uncachedFiles: Number(miss[1]),
    languageFiles: Number(hit[2]),
  };
  if (
    !Number.isInteger(expected) ||
    expected < 1 ||
    result.indexedFiles !== expected ||
    result.languageFiles !== expected ||
    Number(miss[2]) !== expected ||
    result.cachedFiles + result.uncachedFiles !== expected
  )
    throw new Error('Inventario de lenguaje incompleto');
  return result;
}
