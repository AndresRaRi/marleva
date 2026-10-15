export async function cloudMcp(token, organization) {
  let id = 0;
  async function rpc(method, params) {
    const response = await fetch('https://api.sonarcloud.io/mcp', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        SONARQUBE_ORG: organization,
        SONARQUBE_READ_ONLY: 'true',
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) throw new Error('MCP HTTP ' + response.status);
    const message = await response.json();
    if (message.error || !message.result) throw new Error('MCP rechazó ' + method);
    return message.result;
  }
  const server = await rpc('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'marleva-quality', version: '1.0' },
  });
  const catalog = await rpc('tools/list', {});
  async function call(name, args) {
    if (
      !catalog.tools.some((tool) => tool.name === name && tool.annotations?.readOnlyHint === true)
    )
      throw new Error('Herramienta MCP de lectura no disponible: ' + name);
    const result = await rpc('tools/call', { name, arguments: args });
    if (result.isError || !result.structuredContent)
      throw new Error('Respuesta MCP incompleta: ' + name);
    return result.structuredContent;
  }
  async function pages(name, args, field) {
    const all = [];
    const keys = new Set();
    let expected;
    for (let pageIndex = 1; pageIndex <= 100; pageIndex++) {
      const result = await call(name, { ...args, pageIndex, pageSize: 100 });
      const paging = result.paging;
      if (
        !Array.isArray(result[field]) ||
        !Number.isInteger(paging?.total) ||
        paging.pageIndex !== pageIndex ||
        (expected !== undefined && expected !== paging.total)
      )
        throw new Error('Paginación MCP incompleta o cambiante');
      expected = paging.total;
      for (const item of result[field]) {
        if (typeof item.key !== 'string' || keys.has(item.key))
          throw new Error('Inventario MCP duplicado o sin identificador');
        keys.add(item.key);
      }
      all.push(...result[field]);
      if (all.length === expected) return all;
      if (!result[field].length || all.length > expected)
        throw new Error('Inventario MCP incompleto');
    }
    throw new Error('Inventario MCP supera el límite explícito');
  }
  return { server: server.serverInfo, call, pages };
}
