import assert from 'node:assert/strict';
export function proxyTarget(context = 'local') {
  const targets = { local: [8443, 3000], 'b12-source': [8445, 3106], 'b12-target': [8445, 3001] };
  assert.ok(Object.hasOwn(targets, context), 'Contexto HTTPS local desconocido');
  const [port, apiPort] = targets[context];
  return { port, apiPort };
}
