import { it, expect, vi } from 'vitest';
import { cloudMcp } from '../../../../scripts/sonar-cloud-mcp.mjs';

async function fixture(page, action) {
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, options) => {
    const request = JSON.parse(options.body);
    let result;
    if (request.method === 'initialize') result = { serverInfo: { name: 'fixture', version: '1' } };
    else if (request.method === 'tools/list')
      result = {
        tools: [
          { name: 'read', annotations: { readOnlyHint: true } },
          { name: 'write', annotations: { readOnlyHint: false } },
        ],
      };
    else result = { structuredContent: page(request.params.arguments), isError: false };
    return { ok: true, json: async () => ({ result }) };
  });
  try {
    return await action(await cloudMcp('fixture-token', 'fixture-org'));
  } finally {
    fetch.mockRestore();
  }
}
it('Cloud MCP | conserva todas las páginas y bloquea mutaciones', async () => {
  await fixture(
    ({ pageIndex }) => ({
      paging: { total: 2, pageIndex },
      issues: [{ key: String(pageIndex) }],
    }),
    async (mcp) => {
      expect(await mcp.pages('read', {}, 'issues')).toEqual([{ key: '1' }, { key: '2' }]);
      await expect(mcp.call('write', {})).rejects.toThrow('lectura');
    },
  );
});
it('Cloud MCP | página repetida, vacía o cambiante impide verde', async () => {
  for (const page of [
    ({ pageIndex }) => ({ paging: { total: 2, pageIndex }, issues: [{ key: 'same' }] }),
    ({ pageIndex }) => ({ paging: { total: 2, pageIndex }, issues: [] }),
    ({ pageIndex }) => ({
      paging: { total: pageIndex + 1, pageIndex },
      issues: [{ key: String(pageIndex) }],
    }),
  ]) {
    await fixture(page, (mcp) => expect(mcp.pages('read', {}, 'issues')).rejects.toThrow());
  }
});
it('Cloud MCP | error HTTP o respuesta incompleta no equivalen a cero incidencias', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 503 });
  try {
    await expect(cloudMcp('fixture-token', 'fixture-org')).rejects.toThrow('HTTP 503');
  } finally {
    fetch.mockRestore();
  }
  await fixture(
    () => ({}),
    (mcp) => expect(mcp.pages('read', {}, 'issues')).rejects.toThrow(),
  );
});
