import { assertCiTarget } from './live-browser-guard.mjs';
assertCiTarget(process.env);
const actualFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const response = await actualFetch(input, options);
  const url = new URL(typeof input === 'string' ? input : (input.url ?? input.href));
  if (url.origin === process.env.SUPABASE_URL && response.status >= 400) {
    // Deliberately omit URL query, bodies, headers and credentials from diagnostics.
    console.error(
      JSON.stringify({
        event: 'ci.provider.failure',
        status: response.status,
        endpoint: url.pathname === '/auth/v1/user' ? 'user' : 'other',
      }),
    );
  }
  return response;
};
await import('../../apps/api/dist/main.js');
