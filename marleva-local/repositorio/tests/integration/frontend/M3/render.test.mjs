// @vitest-environment jsdom
import { afterEach, it, expect, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
const transport = vi.hoisted(() => {
  const fn = vi.fn();
  globalThis.fetch = fn;
  return fn;
});
import App from '../../../../apps/client/m3/App.tsx';
import { OfferPhotos } from '../../../../apps/client/src/modules/m3/offer-photos.tsx';
import { product, service, sellerId } from '../../../fixtures/m3-fixtures.mjs';
const id = '44444444-4444-4444-8444-444444444444';
const photo = '55555555-5555-4555-8555-555555555555';
const seller = { id: sellerId, name: 'Oferente ficticio' };
const offer = (patch = {}) => ({
  ...product,
  id,
  version_id: id,
  version: 1,
  updated_at: '2026-10-15T12:00:00.000Z',
  seller,
  photos: [{ id: photo, url: 'http://127.0.0.1:3103/v1/catalog/photos/' + photo + '/card' }],
  ...patch,
});
let root, host;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
async function settle(work = () => {}) {
  await act(async () => {
    await work();
    await new Promise((r) => setTimeout(r, 15));
  });
}
async function mount(element) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await settle(() => root.render(element));
}
async function click(label) {
  const b = [...host.querySelectorAll('[role="button"],button')].find(
    (x) => x.textContent === label,
  );
  expect(b, label).toBeTruthy();
  await settle(() => b.click());
}
function network({
  detailFailure = false,
  sellerFailure = false,
  data = offer(),
  empty = false,
} = {}) {
  let details = 0,
    sellers = 0;
  const fetch = transport.mockImplementation(async (input) => {
    const url = new URL(String(input));
    if (url.pathname === '/v1/catalog/offers')
      return {
        status: 200,
        ok: true,
        json: async () => ({ items: empty ? [] : [data], next_cursor: null }),
      };
    if (url.pathname.includes('/sellers/')) {
      sellers++;
      if (sellerFailure && sellers === 1) throw Error('fallo perfil');
      return { status: 200, ok: true, json: async () => seller };
    }
    details++;
    if (detailFailure && details === 1) throw Error('fallo detalle');
    return { status: 200, ok: true, json: async () => data };
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}
afterEach(async () => {
  if (root) await settle(() => root.unmount());
  host?.remove();
  root = null;
  vi.unstubAllGlobals();
});
it('MAR-M3-IT-FE-RENDER-001 | navegación, filtros, detalle y perfil con React Native Web real', async () => {
  const fetch = network();
  await mount(React.createElement(App));
  await click('Filtros');
  await click('Comida y postres');
  await click('Comida y postres');
  await click('Gran Santa Fe I');
  await click('Gran Santa Fe I');
  await click('Entrega');
  await click('Entrega');
  await click('Cerrar filtros');
  await click('Buscar');
  await click('Limpiar filtros');
  await click('Ver oferta');
  expect(host.textContent).toContain('Ingredientes y alérgenos');
  await click('Ver oferente: Oferente ficticio');
  expect(host.textContent).toContain('Perfil público');
  await click('Ver oferta');
  await click('Volver al catálogo');
  expect(fetch).toHaveBeenCalled();
});
it('MAR-M3-IT-FE-RENDER-002 | errores de detalle y perfil permiten reintentar', async () => {
  network({ detailFailure: true, sellerFailure: true });
  await mount(React.createElement(App));
  await click('Ver oferta');
  expect(host.textContent).toContain('No pudimos conectar');
  await click('Volver a intentar');
  await click('Ver oferente: Oferente ficticio');
  expect(host.textContent).toContain('No pudimos conectar');
  await click('Volver a intentar');
  await click('Volver al catálogo');
});
it('MAR-M3-IT-FE-RENDER-003 | servicio, cotización y ausencia de fotos', async () => {
  network({ data: offer({ ...service, photos: [] }) });
  await mount(React.createElement(App));
  expect(host.textContent).toContain('Requiere cotización');
  await click('Ver oferta');
  expect(host.textContent).toContain('El alcance y precio');
  expect(host.querySelectorAll('img')).toHaveLength(0);
});
it('MAR-M3-IT-FE-RENDER-004 | agotado y encargo conservan disponibilidad orientativa', async () => {
  network({ data: offer({ stock: 0, made_to_order: false }) });
  await mount(React.createElement(App));
  expect(host.textContent).toContain('Agotado');
  await click('Ver oferta');
  expect(host.textContent).toContain('Agotado');
  await click('Volver al catálogo');
  network({ data: offer({ made_to_order: true }) });
  await click('Buscar');
  await click('Ver oferta');
  expect(host.textContent).toContain('Por encargo');
});
it('MAR-M3-IT-FE-RENDER-005 | vacío y fallo de imagen no ocultan los datos', async () => {
  network({ empty: true });
  await mount(React.createElement(App));
  expect(host.textContent).toContain('No encontramos ofertas');
  vi.stubGlobal(
    'Image',
    class {
      set src(value) {
        if (value) setTimeout(() => this.onerror?.({}), 0);
      }
    },
  );
  await settle(() =>
    root.render(React.createElement(OfferPhotos, { offer: offer(), detail: true })),
  );
  const image = host.querySelector('img');
  expect(image).toBeTruthy();
  await settle();
  expect(host.textContent).toContain('La foto no está disponible');
});
