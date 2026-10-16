import { it, expect, vi, afterEach } from 'vitest';
const mock = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('../../../../apps/client/src/api', () => ({ api: mock.api }));
import {
  NoticePages,
  type NoticePageState,
} from '../../../../apps/client/src/modules/m1/notice-pages';
const item = (id: string, accountId = 'a') => ({
  id,
  accountId,
  kind: 'fixture',
  text: id,
  createdAt: '2026-10-15T12:00:00Z',
});
const page = (ids: string[], next_cursor: string | null) => ({
  items: ids.map((id) => item(id)),
  next_cursor,
});
function setup() {
  const states: NoticePageState[] = [];
  const expired = vi.fn();
  const pages = new NoticePages('a', (state) => states.push(state), expired);
  return { pages, states, expired };
}
afterEach(() => mock.api.mockReset());
it('MAR-M1-UT-FE-108-P1 | concatena páginas únicas, codifica cursor y termina sin otra petición', async () => {
  mock.api.mockResolvedValueOnce(page(['1'], 'a+/=')).mockResolvedValueOnce(page(['1', '2'], null));
  const { pages, states } = setup();
  await pages.load();
  await pages.load();
  await pages.load();
  expect(mock.api).toHaveBeenCalledTimes(2);
  expect(mock.api.mock.calls[1][0]).toBe('/v1/notifications?cursor=a%2B%2F%3D');
  expect(states.at(-1)?.items?.map((i) => i.id)).toEqual(['1', '2']);
  expect(states.at(-1)?.cursor).toBeNull();
});
it('MAR-M1-UT-FE-108-P2 | error conserva lista y frontera; reintento usa la misma', async () => {
  mock.api
    .mockResolvedValueOnce(page(['1'], 'next'))
    .mockRejectedValueOnce(new Error('Intenta de nuevo'))
    .mockResolvedValueOnce(page(['2'], null));
  const { pages, states } = setup();
  await pages.load();
  await pages.load();
  expect(states.at(-1)).toMatchObject({
    items: [item('1')],
    cursor: 'next',
    loading: false,
    error: 'Intenta de nuevo',
  });
  await pages.load();
  expect(mock.api.mock.calls[1][0]).toBe(mock.api.mock.calls[2][0]);
  expect(states.at(-1)?.error).toBe('');
});
it('MAR-M1-UT-FE-108-P3 | doble acción no duplica petición y desmontaje cancela e ignora resultado', async () => {
  let resolve!: (value: unknown) => void;
  mock.api.mockReturnValue(
    new Promise((r) => {
      resolve = r;
    }),
  );
  const { pages, states } = setup();
  const pending = pages.load();
  await pages.load();
  expect(mock.api).toHaveBeenCalledOnce();
  const signal = mock.api.mock.calls[0][3];
  pages.dispose();
  const count = states.length;
  resolve(page(['1'], null));
  await pending;
  await pages.load();
  expect(signal.aborted).toBe(true);
  expect(states).toHaveLength(count);
});
it.each(['repeated', 'empty', 'foreign', 'cycle'])(
  'MAR-M1-UT-FE-108-P4 | rechaza página %s sin perder lista',
  async (mode) => {
    mock.api.mockResolvedValueOnce(page(['1'], 'next'));
    const { pages, states } = setup();
    await pages.load();
    if (mode === 'cycle') {
      mock.api.mockResolvedValueOnce(page(['2'], 'third'));
      await pages.load();
    }
    const invalid =
      mode === 'foreign'
        ? { items: [item('3', 'b')], next_cursor: null }
        : page(mode === 'empty' ? [] : ['3'], 'next');
    mock.api.mockResolvedValueOnce(invalid);
    await pages.load();
    expect(states.at(-1)?.items?.map((i) => i.id)).toEqual(mode === 'cycle' ? ['1', '2'] : ['1']);
    expect(states.at(-1)?.error).not.toBe('');
  },
);
it('MAR-M1-UT-FE-108-P5 | 401 vigente vuelve a acceso', async () => {
  mock.api.mockRejectedValue(Object.assign(new Error('Acceso'), { status: 401 }));
  const { pages, expired } = setup();
  await pages.load();
  expect(expired).toHaveBeenCalledWith(null);
});
