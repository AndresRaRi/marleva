import { it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { create, act } from 'react-test-renderer';
const mock = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('../../../../apps/client/src/api', () => ({ api: mock.api }));
vi.mock('../../../../apps/client/node_modules/react-native', () => ({ Text: 'Text' }));
import { AccountNotices } from '../../../../apps/client/src/modules/m1/components/account-notices';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const styles = { body: {}, error: {} };
const own = {
  id: 'n',
  accountId: 'a',
  kind: 'fixture',
  text: 'Aviso propio',
  createdAt: '2026-10-15T12:00:00Z',
};
afterEach(() => mock.api.mockReset());
async function mount(onSessionExpired = vi.fn()) {
  let tree;
  await act(async () => {
    tree = create(
      React.createElement(AccountNotices, { accountId: 'a', onSessionExpired, styles }),
    );
  });
  return tree;
}
it('MAR-M1-UT-FE-108-R | consulta pendiente no es vacío; muestra la lista propia al responder', async () => {
  let resolve;
  mock.api.mockReturnValue(
    new Promise((r) => {
      resolve = r;
    }),
  );
  const tree = await mount();
  expect(tree.toJSON().children).toEqual(['Consultando avisos…']);
  await act(async () => {
    resolve({ items: [own], next_cursor: null });
  });
  expect(tree.toJSON().children).toEqual(['Aviso propio']);
  await act(async () => tree.unmount());
});
it('MAR-M1-UT-FE-108-S | respuesta vacía confirmada permite mostrar vacío', async () => {
  mock.api.mockResolvedValue({ items: [], next_cursor: null });
  const tree = await mount();
  expect(tree.toJSON().children).toEqual(['Todavía no hay avisos.']);
  await act(async () => tree.unmount());
});
it.each([new Error('Error recuperable'), 'fallo sin formato'])(
  'MAR-M1-UT-FE-108-T | fallo no elimina sesión ni finge vacío: %s',
  async (cause) => {
    mock.api.mockRejectedValue(cause);
    const expired = vi.fn();
    const tree = await mount(expired);
    expect(tree.toJSON().props.accessibilityRole).toBe('alert');
    expect(expired).not.toHaveBeenCalled();
    await act(async () => tree.unmount());
  },
);
it('MAR-M1-UT-FE-108-U | 401 vigente vuelve a acceso', async () => {
  mock.api.mockRejectedValue(Object.assign(new Error('Inicia sesión'), { status: 401 }));
  const expired = vi.fn();
  const tree = await mount(expired);
  expect(expired).toHaveBeenCalledOnce();
  await act(async () => tree.unmount());
});
it('MAR-M1-UT-FE-108-V | desmontaje cancela transporte e ignora 401 tardío', async () => {
  let reject;
  mock.api.mockReturnValue(
    new Promise((_resolve, r) => {
      reject = r;
    }),
  );
  const expired = vi.fn();
  const tree = await mount(expired);
  const signal = mock.api.mock.calls[0][3];
  await act(async () => tree.unmount());
  expect(signal.aborted).toBe(true);
  await act(async () => {
    reject(Object.assign(new Error('Sesión anterior'), { status: 401 }));
  });
  expect(expired).not.toHaveBeenCalled();
});
