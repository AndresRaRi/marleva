// @vitest-environment jsdom
import { afterEach, it, expect, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { randomUUID } from 'node:crypto';
import { ManagementApp } from '../../../../apps/client/src/modules/m3/management-app.tsx';
import { ManagementClient } from '../../../../apps/client/src/modules/m3/management-client.ts';
import { product, sellerId, owner, reviewer } from '../../../fixtures/m3-fixtures.mjs';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, host;
async function settle(work = () => {}) {
  await act(async () => {
    await work();
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}
async function mount(client) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await settle(() => root.render(React.createElement(ManagementApp, { client, back: vi.fn() })));
}
async function click(label) {
  const target = [...host.querySelectorAll('[role="button"],button')].find(
    (el) => el.textContent === label,
  );
  expect(target, label).toBeTruthy();
  await settle(() => target.click());
}
async function fill(label, value) {
  const input = host.querySelector('[aria-label="' + label + '"]');
  expect(input, label).toBeTruthy();
  const prototype =
    input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  await settle(() => {
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
afterEach(async () => {
  if (root) await settle(() => root.unmount());
  host?.remove();
  root = null;
  vi.unstubAllGlobals();
});
function fixture() {
  const state = { offer: null, role: 'owner', failSave: false, expired: false, pages: false };
  const calls = [];
  const response = (data, status = 200) => ({
    ok: status === 200,
    status,
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => JSON.parse(JSON.stringify(data)),
  });
  const transport = vi.fn(async (raw, options) => {
    const url = new URL(raw),
      path = url.pathname,
      method = options.method;
    calls.push({ path, method, options, query: url.search });
    if (state.expired)
      return response({ codigo: 'SESSION', mensaje: 'Inicia sesión para continuar.' }, 401);
    if (path.endsWith('/context'))
      return response({
        actor_id: state.actorId ?? (state.role === 'owner' ? owner : reviewer),
        reviewer: state.role === 'reviewer',
        mfa: state.role === 'reviewer',
        csrf_token: 'fixture-csrf-local',
        sellers: state.role === 'owner' ? [{ id: sellerId, name: 'Oferente ficticio' }] : [],
      });
    if (method === 'GET' && path === '/v1/offers') {
      if (state.listError)
        return response({ codigo: state.listError, mensaje: 'Permiso revocado.' }, 403);
      if (state.listUnavailable)
        return response({ codigo: 'UNAVAILABLE', mensaje: 'Fallo temporal.' }, 503);
      const matches =
        state.role === 'owner' ||
        (url.searchParams.get('scope') === 'review' &&
          state.offer?.versions.at(-1).state === 'pending');
      return response({
        items: state.offer && matches ? [state.offer] : [],
        next_cursor: state.pages && !url.searchParams.has('cursor') ? 'fixture-next' : null,
      });
    }
    if (method === 'GET' && path.includes('/photos/'))
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'image/jpeg' }),
        blob: async () => new Blob([new Uint8Array(10)], { type: 'image/jpeg' }),
      };
    if (method === 'GET') {
      const result = JSON.parse(JSON.stringify(state.offer));
      for (const v of result.versions) {
        if (v.food)
          v.food = {
            storage: v.food.storage,
            allergens: v.food.allergens,
            ingredients: v.food.ingredients,
          };
      }
      return response(result);
    }
    if (method === 'PUT') {
      const id = path.split('/').at(-1);
      state.offer.versions
        .at(-1)
        .photos.push({ id, position: Number(url.searchParams.get('position')) });
      return response({ id, version_id: state.offer.versions.at(-1).id, position: 1 });
    }
    const body = JSON.parse(options.body);
    if (method === 'POST' && path === '/v1/offers') {
      if (state.failSave) {
        state.failSave = false;
        throw Error('lost response');
      }
      state.offer = {
        id: body.id,
        seller_id: body.seller_id,
        revision: 1,
        paused: true,
        public_version_id: null,
        versions: [
          { ...body.data, id: randomUUID(), number: 1, state: 'draft', reason: null, photos: [] },
        ],
      };
    } else if (method === 'PATCH') {
      state.offer.versions.push({
        ...body.data,
        id: randomUUID(),
        number: state.offer.versions.length + 1,
        state: 'draft',
        reason: null,
        photos: [],
      });
      state.offer.revision++;
    } else if (path.endsWith('/submit')) {
      state.offer.versions.at(-1).state = 'pending';
      state.offer.revision++;
    } else if (path.endsWith('/decisions')) {
      const v = state.offer.versions.at(-1);
      v.state = body.decision;
      v.reason = body.reason;
      state.offer.revision++;
      state.offer.paused = body.decision !== 'approved';
      state.offer.public_version_id = body.decision === 'approved' ? v.id : null;
    } else if (path.endsWith('/pause')) {
      state.offer.paused = true;
      state.offer.revision++;
    }
    const version = state.offer.versions.at(-1);
    return response({
      id: state.offer.id,
      revision: state.offer.revision,
      version_id: version.id,
      state: version.state,
    });
  });
  return { state, calls, client: new ManagementClient(undefined, undefined, transport) };
}
async function basics() {
  await click('Nueva oferta');
  await click('Continuar');
  expect(host.textContent).toContain('Completa el título');
  await fill('Título', 'Oferta ficticia del recorrido');
  await fill('Descripción', 'Descripción ficticia para probar el recorrido completo de la oferta.');
  await click('Continuar');
  await click('Gran Santa Fe I');
  await click('Entrega');
  await fill('Precio en pesos MXN', '25.50');
  await click('Continuar');
}
function existing(state, status = 'draft') {
  const id = randomUUID(),
    version = randomUUID();
  state.offer = {
    id,
    seller_id: sellerId,
    revision: 3,
    paused: status !== 'approved',
    public_version_id: status === 'approved' ? version : null,
    versions: [{ ...product, id: version, number: 1, state: status, reason: null, photos: [] }],
  };
}
it('MAR-M3-IT-FE-004-009-005-RENDER | formulario, recuperación, clave estable, foto y envío', async () => {
  const { state, calls, client } = fixture();
  state.failSave = true;
  await mount(client);
  await basics();
  await click('Guardar borrador');
  expect(host.textContent).toContain('Tus datos se conservan');
  expect(host.textContent).toContain('Paso 3 de 3');
  await click('Guardar borrador');
  expect(host.textContent).toContain('Borrador guardado');
  const writes = calls.filter((x) => x.path === '/v1/offers' && x.method === 'POST');
  expect(writes[0].options.headers['Idempotency-Key']).toBe(
    writes[1].options.headers['Idempotency-Key'],
  );
  const picker = host.querySelector('[aria-label="Añadir foto"]');
  const file = new File([new Uint8Array(12)], 'ficticia.png', { type: 'image/png' });
  await settle(() => {
    Object.defineProperty(picker, 'files', { configurable: true, value: [file] });
    picker.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(host.textContent).toContain('1 de 6 fotos');
  await click('Enviar a revisión');
  expect(host.textContent).toContain('Tu oferta se envió a revisión');
  expect(state.offer.versions[0].state).toBe('pending');
  await click('Volver a mis ofertas');
  expect(host.textContent).toContain('En revisión');
});
it('MAR-M3-IT-FE-006-RENDER | motivo obligatorio y decisión de versión exacta', async () => {
  const { state, client, calls } = fixture();
  existing(state, 'pending');
  state.role = 'reviewer';
  await mount(client);
  await click('Por revisar');
  await click('Revisar oferta');
  await click('Aprobar');
  expect(host.textContent).toContain('Explica el motivo');
  await fill('Motivo de la decisión', 'Corrección ficticia: completar los datos declarados.');
  await click('Pedir corrección');
  expect(state.offer.versions[0].state).toBe('correction');
  const sent = calls.find((x) => x.path.endsWith('/decisions'));
  expect(JSON.parse(sent.options.body).version_id).toBe(state.offer.versions[0].id);
  expect(host.textContent).toContain('No hay ofertas pendientes');
});
it('MAR-M3-IT-FE-007-SESSION-RENDER | pausa, edición y limpieza al revocar sesión', async () => {
  const { state, client } = fixture();
  existing(state, 'approved');
  await mount(client);
  await click('Pausar oferta');
  expect(state.offer.paused).toBe(true);
  await click('Abrir oferta');
  await fill('Título', 'Cambio ficticio de título');
  await click('Continuar');
  await click('Continuar');
  state.expired = true;
  await click('Guardar borrador');
  expect(host.textContent).toContain('Inicia sesión');
  expect(host.querySelector('[aria-label="Título"]')).toBeNull();
  expect(host.textContent).not.toContain(product.title);
});
it('MAR-M3-IT-FE-004-SERVICE-RENDER | servicio, comida y paso conservado ante datos incompletos', async () => {
  const { client, state } = fixture();
  await mount(client);
  await click('Nueva oferta');
  await fill('Título', 'Servicio ficticio de comida');
  await fill('Descripción', 'Descripción ficticia suficientemente larga para este servicio.');
  await click('Servicio');
  await click('Comida y postres');
  await click('Continuar');
  expect(host.textContent).toContain('no llevan precio fijo');
  await click('Gran Santa Fe II');
  await click('A domicilio');
  await click('Continuar');
  expect(host.textContent).toContain('Revisa los ingredientes');
  await fill('Ingredientes', 'Harina');
  await fill('Alérgenos', 'Trigo');
  await fill('Conservación', 'Mantener fresco');
  await click('Continuar');
  await click('Guardar borrador');
  expect(state.offer.versions[0]).toMatchObject({
    kind: 'service',
    price_cents: null,
    food: { ingredients: 'Harina' },
  });
});
it('MAR-M3-IT-FE-004-PAGE-RENDER | página deduplicada y retorno sin acceso duplicado', async () => {
  const { state, client } = fixture();
  existing(state);
  state.pages = true;
  await mount(client);
  await click('Ver más ofertas propias');
  expect(host.querySelectorAll('[role="button"]')).toBeTruthy();
  expect(
    [...host.querySelectorAll('[role="button"]')].filter((x) => x.textContent === 'Abrir oferta'),
  ).toHaveLength(1);
  state.expired = true;
  await click('Abrir oferta');
  expect(host.textContent).toContain('Inicia sesión');
});

it('MAR-M3-IT-FE-004-ACTOR-RENDER | cambio de actor descarta datos y cursor incluso si falla la página', async () => {
  const { state, client, calls } = fixture();
  existing(state);
  state.pages = true;
  await mount(client);
  expect(host.textContent).toContain(product.title);
  state.actorId = randomUUID();
  state.listUnavailable = true;
  await click('Ver más ofertas propias');
  expect(host.textContent).not.toContain(product.title);
  const last = calls.filter((x) => x.path === '/v1/offers').at(-1);
  expect(last.query).not.toContain('cursor=');
  expect(host.textContent).not.toContain('Ver más ofertas propias');
});
it('MAR-M3-IT-FE-004-REVOKED-RENDER | permiso revocado entre contexto y lista borra proyección privada', async () => {
  const { state, client } = fixture();
  existing(state);
  state.pages = true;
  await mount(client);
  state.listError = 'NOT_ELIGIBLE';
  await click('Ver más ofertas propias');
  expect(host.textContent).not.toContain(product.title);
  expect(host.textContent).toContain('Permiso revocado');
  expect(host.textContent).not.toContain('Nueva oferta');
});
