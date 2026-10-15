import { api } from '../../api';
import type { ApiResponse } from '../../api-response';
import { noticesResponse } from './notices-response';
type Items = ApiResponse<'MAR_M1_API_009'>['items'];
export type NoticePageState = {
  items: Items | null;
  cursor: string | null;
  loading: boolean;
  error: string;
};
export class NoticePages {
  private state: NoticePageState = { items: null, cursor: null, loading: true, error: '' };
  private controller: AbortController | null = null;
  private disposed = false;
  private seen = new Set<string>();
  constructor(
    private accountId: string,
    private publish: (state: NoticePageState) => void,
    private expired: (account: null) => void,
  ) {}
  dispose() {
    this.disposed = true;
    this.controller?.abort();
  }
  async load() {
    if (
      this.disposed ||
      this.controller ||
      (this.state.items !== null && this.state.cursor === null)
    )
      return;
    const cursor = this.state.cursor;
    this.controller = new AbortController();
    this.update({ loading: true, error: '' });
    try {
      const query = cursor === null ? '' : `?cursor=${encodeURIComponent(cursor)}`;
      const response = noticesResponse(
        await api(`/v1/notifications${query}`, 'GET', undefined, this.controller.signal),
        this.accountId,
      );
      if (!this.disposed) this.append(response);
    } catch (cause: unknown) {
      if (!this.disposed) this.fail(cause);
    } finally {
      this.controller = null;
      if (!this.disposed) this.update({ loading: false });
    }
  }
  private append(response: ApiResponse<'MAR_M1_API_009'>) {
    const cursor = response.next_cursor;
    if (cursor !== null && (!cursor || this.seen.has(cursor) || !response.items.length))
      throw new Error(
        'No pudimos avanzar en tus avisos. Actualiza la cuenta para intentar de nuevo.',
      );
    const items = new Map((this.state.items ?? []).map((item) => [item.id, item]));
    for (const item of response.items) if (!items.has(item.id)) items.set(item.id, item);
    if (cursor !== null) this.seen.add(cursor);
    this.update({ items: [...items.values()], cursor });
  }
  private fail(cause: unknown) {
    if (cause instanceof Error && 'status' in cause && cause.status === 401) this.expired(null);
    else
      this.update({
        error: cause instanceof Error ? cause.message : 'No pudimos consultar tus avisos',
      });
  }
  private update(change: Partial<NoticePageState>) {
    this.state = { ...this.state, ...change };
    this.publish(this.state);
  }
}
