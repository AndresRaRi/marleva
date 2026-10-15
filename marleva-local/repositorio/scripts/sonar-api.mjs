export function sonarApi(url, credential) {
  return async (route, params = {}, method = 'GET') => {
    const query = new URLSearchParams(params);
    const headers = { Authorization: credential() };
    if (method === 'POST') headers['Content-Type'] = 'application/x-www-form-urlencoded';
    const response = await fetch(url + route + (method === 'GET' ? '?' + query : ''), {
      method,
      headers,
      body: method === 'POST' ? query : undefined,
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Sonar ${route}: HTTP ${response.status}`);
    return response.status === 204 ? {} : response.json();
  };
}
export async function waitSonar(read, accepted, attempts = 180) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const result = await read();
    if (accepted(result)) return result;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error('Sonar agotó el tiempo permitido');
}
export async function allPages(api, route, params, field) {
  const items = [];
  let total;
  const seen = new Set();
  for (let page = 1; page <= 100; page++) {
    const result = await api(route, { ...params, p: String(page), ps: '500' });
    const count = result.paging?.total ?? result.total;
    if (!Number.isInteger(count) || count < 0 || !Array.isArray(result[field]))
      throw new Error('Paginación Sonar inválida');
    if (total !== undefined && total !== count) throw new Error('Inventario Sonar cambió');
    total = count;
    for (const item of result[field]) {
      const key = typeof item === 'string' ? item : item?.key;
      if (typeof key !== 'string' || seen.has(key))
        throw new Error('Inventario Sonar duplicado o inválido');
      seen.add(key);
      items.push(item);
    }
    if (items.length === total) return items;
    if (items.length > total || result[field].length === 0) break;
  }
  throw new Error('Inventario Sonar incompleto');
}
