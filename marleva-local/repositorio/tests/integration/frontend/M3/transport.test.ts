import { it, expect } from 'vitest';
import { CatalogClient } from '../../../../apps/client/src/modules/m3/catalog-client';
import { CatalogStore } from '../../../../apps/client/src/modules/m3/catalog-store';
it('MAR-M3-IT-FE-001 | transporte real a M3 propio, página y detalle', async () => {
  if (process.env.MARLEVA_M3_CHECK !== '1') throw Error('API M3 propia requerida.');
  const client = new CatalogClient();
  const store = new CatalogStore(client);
  await store.load({ q: 'Pan' });
  expect(store.state.phase).toBe('ready');
  expect(store.state.items.length).toBeGreaterThan(0);
  const offer = await client.detail(store.state.items[0].id, new AbortController().signal);
  expect(offer.kind).toBe('product');
  const seller = await client.seller(offer.seller.id, new AbortController().signal);
  expect(seller.id).toBe(offer.seller.id);
  store.dispose();
});
