import { describe, it, expect } from 'vitest';
import { proxyTarget } from '../../../../scripts/proxy-target.mjs';
describe('Destinos HTTPS cerrados', () => {
  it('conserva desarrollo y separa origen/destino B12', () => {
    expect(proxyTarget()).toEqual({ port: 8443, apiPort: 3000 });
    expect(proxyTarget('b12-source')).toEqual({ port: 8445, apiPort: 3106 });
    expect(proxyTarget('b12-target')).toEqual({ port: 8445, apiPort: 3001 });
  });
  it.each(['__proto__', 'constructor', 'https://example.test', 'ci', ''])(
    'rechaza %s',
    (context) => {
      expect(() => proxyTarget(context)).toThrow();
    },
  );
});
